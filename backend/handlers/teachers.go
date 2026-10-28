package handlers

import (
	"cms/models"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// TeacherResponse is the public representation of a teacher.
// Courses is only populated on the single-teacher endpoint; list endpoints
// return AssignedCourseCount instead so they stay lightweight.
type TeacherResponse struct {
	ID                  uint             `json:"id" example:"12"`
	CreatedAt           time.Time        `json:"createdAt"`
	UpdatedAt           time.Time        `json:"updatedAt"`
	DeletedAt           *time.Time       `json:"deletedAt,omitempty"`
	FirstName           string           `json:"firstName" example:"Grace"`
	LastName            string           `json:"lastName" example:"Hopper"`
	Email               string           `json:"email" example:"grace@example.com"`
	RoleID              uint             `json:"roleID" example:"2"`
	Role                models.Role      `json:"Role"`
	Courses             []CourseResponse `json:"courses,omitempty"`
	AssignedCourseCount int64            `json:"assignedCourseCount" example:"3"`
}

// TeacherListResponse is returned by GetAllTeachers.
type TeacherListResponse struct {
	Message string            `json:"message" example:"Request successful"`
	Data    []TeacherResponse `json:"data"`
	Meta    PaginationMeta    `json:"meta"`
}

// TeacherDataResponse is returned by GetTeacher.
type TeacherDataResponse struct {
	Message string          `json:"message" example:"Request successful"`
	Data    TeacherResponse `json:"data"`
}

// CreateTeacherRequest is the payload accepted by CreateTeacher.
type CreateTeacherRequest struct {
	FirstName string `json:"firstName" example:"Grace"`
	LastName  string `json:"lastName" example:"Hopper"`
	Email     string `json:"email" example:"grace@example.com"`
	Password  string `json:"password" example:"secret123"`
	RoleID    uint   `json:"roleId" example:"2"`
}

// UpdateTeacherRequest is the payload accepted by UpdateTeacher. Empty fields are left unchanged.
type UpdateTeacherRequest struct {
	FirstName string `json:"firstName" example:"Grace"`
	LastName  string `json:"lastName" example:"Hopper"`
	RoleID    uint   `json:"roleId" example:"2"`
}

// TeacherEmailData contains the teacher's email.
type TeacherEmailData struct {
	Email string `json:"email" example:"grace@example.com"`
}

// TeacherEmailResponse is returned by CreateTeacher and UpdateTeacher.
type TeacherEmailResponse struct {
	Message string           `json:"message" example:"Request successful"`
	Data    TeacherEmailData `json:"data"`
}

// CourseAssignmentRequest is the payload accepted by AssignCourses and UnassignCourses.
type CourseAssignmentRequest struct {
	CourseIDs []uint `json:"courseIds" example:"1,2,3"`
}

// CourseAssignmentData describes the teacher's course assignment after the change.
type CourseAssignmentData struct {
	Email     string `json:"email" example:"grace@example.com"`
	CourseIDs []uint `json:"courseIds" example:"1,2,3"`
}

// CourseAssignmentResponse is returned by AssignCourses and UnassignCourses.
type CourseAssignmentResponse struct {
	Message string               `json:"message" example:"Request successful"`
	Data    CourseAssignmentData `json:"data"`
}

// isInstructorRoleName reports whether a role name grants teacher-level access.
// Mirrors IsInstructorMiddleware, which accepts both "instructor" and "teacher".
func isInstructorRoleName(name string) bool {
	switch strings.ToLower(strings.TrimSpace(name)) {
	case "instructor", "teacher":
		return true
	}

	return false
}

func toTeacherResponse(teacher models.User) TeacherResponse {
	var deletedAt *time.Time
	if teacher.DeletedAt.Valid {
		deletedAt = &teacher.DeletedAt.Time
	}

	// Assigned courses are preloaded by the single-teacher handler. List handlers
	// leave the relation empty and fill AssignedCourseCount with withCourseCounts.
	courses := make([]CourseResponse, 0, len(teacher.AssignedCourses))
	for _, course := range teacher.AssignedCourses {
		courses = append(courses, toCourseResponse(course))
	}

	return TeacherResponse{
		ID:                  teacher.ID,
		CreatedAt:           teacher.CreatedAt,
		UpdatedAt:           teacher.UpdatedAt,
		DeletedAt:           deletedAt,
		FirstName:           teacher.FirstName,
		LastName:            teacher.LastName,
		Email:               teacher.Email,
		RoleID:              teacher.RoleID,
		Role:                teacher.Role,
		Courses:             courses,
		AssignedCourseCount: int64(len(courses)),
	}
}

// preloadTeacherRelations adds the associations a single-teacher response needs.
func preloadTeacherRelations(q *gorm.DB) *gorm.DB {
	return q.Preload("Role").Preload("AssignedCourses.CreatedByUser")
}

// assignedCourseCounts returns the number of active courses assigned to each
// teacher, in a single grouped query, so list endpoints avoid an N+1 preload.
func (h *Handler) assignedCourseCounts(teacherIDs []uint) (map[uint]int64, error) {
	counts := make(map[uint]int64, len(teacherIDs))

	if len(teacherIDs) == 0 {
		return counts, nil
	}

	var rows []struct {
		UserID uint
		Total  int64
	}

	err := h.DB.Table("course_teachers").
		Select("course_teachers.user_id AS user_id, COUNT(*) AS total").
		Joins("JOIN courses ON courses.id = course_teachers.course_id AND courses.deleted_at IS NULL").
		Where("course_teachers.user_id IN ?", teacherIDs).
		Group("course_teachers.user_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		counts[row.UserID] = row.Total
	}

	return counts, nil
}

// toTeacherListResponse converts teacher rows and fills their assignment counts.
func (h *Handler) toTeacherListResponse(teachers []models.User) ([]TeacherResponse, error) {
	ids := make([]uint, 0, len(teachers))
	for _, teacher := range teachers {
		ids = append(ids, teacher.ID)
	}

	counts, err := h.assignedCourseCounts(ids)
	if err != nil {
		return nil, err
	}

	response := make([]TeacherResponse, 0, len(teachers))
	for _, teacher := range teachers {
		item := toTeacherResponse(teacher)
		item.AssignedCourseCount = counts[teacher.ID]
		response = append(response, item)
	}

	return response, nil
}

// GetAllTeachers godoc
// @Summary      List teachers
// @Description  Returns paginated teachers (role_id 2), newest first, each with assignedCourseCount. Set isDeleted=true to include soft-deleted teachers.
// @Tags         teachers
// @Produce      json
// @Param        page       query  int   false  "Page number"              default(1)
// @Param        perPage    query  int   false  "Items per page (max 50)"  default(20)
// @Param        isDeleted  query  bool  false  "Include deleted teachers"
// @Success      200  {object}  TeacherListResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers [get]
func (h *Handler) GetAllTeachers(w http.ResponseWriter, r *http.Request) {
	var teachers []models.User

	page, perPage, offset := parsePagination(r)

	showDeleted, _ := strconv.ParseBool(r.URL.Query().Get("isDeleted"))
	search := r.URL.Query().Get("search")

	scope := func() *gorm.DB {
		q := h.DB.Model(&models.User{}).Where("role_id = ?", 2)
		if showDeleted {
			q = q.Unscoped()
		}
		if search != "" {
			like := "%" + search + "%"
			q = q.Where("first_name ILIKE ? OR last_name ILIKE ? OR email ILIKE ?", like, like, like)
		}
		return q
	}

	var totalRecords int64

	if err := scope().Count(&totalRecords).Error; err != nil {
		log.Printf("count teachers: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to count teachers"})
		return
	}

	if err := scope().Preload("Role").Order("id DESC").Limit(perPage).Offset(offset).Find(&teachers).Error; err != nil {
		log.Printf("fetch teachers: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch teachers"})
		return
	}

	response, err := h.toTeacherListResponse(teachers)
	if err != nil {
		log.Printf("count teacher courses: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch teachers"})
		return
	}

	writeJSON(w, http.StatusOK, TeacherListResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(totalRecords, page, perPage),
	})
}

// GetTeacher godoc
// @Summary      Get a teacher
// @Description  Returns a single teacher (role_id 2) by ID, including the courses assigned to them.
// @Tags         teachers
// @Produce      json
// @Param        id  path  int  true  "Teacher ID"
// @Success      200  {object}  TeacherDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers/{id} [get]
func (h *Handler) GetTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Teacher not found"})
		return
	}

	var teacher models.User

	result := preloadTeacherRelations(h.DB).Where("role_id = ?", 2).First(&teacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Teacher not found"})
		return
	}

	writeJSON(w, http.StatusOK, TeacherDataResponse{
		Message: "Request successful",
		Data:    toTeacherResponse(teacher),
	})
}

// CreateTeacher godoc
// @Summary      Create a teacher
// @Description  Creates a user with the given role_id. The password is hashed with bcrypt.
// @Tags         teachers
// @Accept       json
// @Produce      json
// @Param        request  body  CreateTeacherRequest  true  "Teacher payload"
// @Success      201  {object}  TeacherEmailResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      409  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers [post]
func (h *Handler) CreateTeacher(w http.ResponseWriter, r *http.Request) {
	var input CreateTeacherRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	var existingTeacher models.User

	if err := h.DB.Where("LOWER(email) = ?", input.Email).First(&existingTeacher).Error; err == nil {
		writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Teacher already exists"})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	newTeacher := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		RoleID:    input.RoleID,
		Password:  string(hashPassword),
	}

	if err := h.DB.Create(&newTeacher).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, TeacherEmailResponse{
		Message: "Request successful",
		Data:    TeacherEmailData{Email: newTeacher.Email},
	})
}

// UpdateTeacher godoc
// @Summary      Update a teacher
// @Description  Updates a teacher's names and/or role. Empty names are left unchanged; roleId must be 1–3 to take effect.
// @Tags         teachers
// @Accept       json
// @Produce      json
// @Param        id       path  int                   true  "Teacher ID"
// @Param        request  body  UpdateTeacherRequest  true  "Fields to update"
// @Success      200  {object}  TeacherEmailResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers/{id} [patch]
func (h *Handler) UpdateTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Teacher not found"})
		return
	}

	var input UpdateTeacherRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var existingTeacher models.User

	result := h.DB.Where("role_id = ?", 2).First(&existingTeacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Teacher not found"})
		return
	}

	if input.FirstName != "" {
		existingTeacher.FirstName = input.FirstName
	}

	if input.LastName != "" {
		existingTeacher.LastName = input.LastName
	}

	if input.RoleID > 0 && input.RoleID < 4 {
		existingTeacher.RoleID = input.RoleID
	}

	result = h.DB.Save(&existingTeacher)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, TeacherEmailResponse{
		Message: "Request successful",
		Data:    TeacherEmailData{Email: existingTeacher.Email},
	})
}

// DeleteTeacher godoc
// @Summary      Delete a teacher
// @Description  Soft-deletes a teacher. Use the restore endpoint to undo.
// @Tags         teachers
// @Produce      json
// @Param        id  path  int  true  "Teacher ID"
// @Success      204  "No Content"
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers/{id} [delete]
func (h *Handler) DeleteTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Teacher ID"})
		return
	}

	var existingTeacher models.User

	result := h.DB.Where("role_id = ?", 2).First(&existingTeacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Teacher not found"})
		return
	}

	result = h.DB.Delete(&existingTeacher)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusNoContent, nil)
}

// RestoreTeacher godoc
// @Summary      Restore a teacher
// @Description  Clears the soft-delete timestamp of a teacher.
// @Tags         teachers
// @Produce      json
// @Param        id  path  int  true  "Teacher ID"
// @Success      200  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers/{id}/restore [patch]
func (h *Handler) RestoreTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Teacher ID"})
		return
	}

	var existingTeacher models.User

	result := h.DB.Where("role_id = ?", 2).Unscoped().First(&existingTeacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Teacher not found"})
		return
	}

	result = h.DB.Unscoped().Model(&existingTeacher).Update("DeletedAt", nil)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, MessageResponse{Message: "Teacher restored successfully"})
}

// AssignCourses godoc
// @Summary      Assign courses to a teacher
// @Description  Replaces the teacher's assigned courses with the given list. Duplicate IDs are ignored. Fails with 404 if any course does not exist.
// @Tags         teachers
// @Accept       json
// @Produce      json
// @Param        id       path  int                     true  "Teacher ID"
// @Param        request  body  CourseAssignmentRequest  true  "Course IDs"
// @Success      200  {object}  CourseAssignmentResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers/{id}/courses [patch]
func (h *Handler) AssignCourses(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Teacher ID"})
		return
	}

	var input CourseAssignmentRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var existingTeacher models.User

	result := h.DB.Preload("Role").First(&existingTeacher, id)

	if result.Error != nil || !isInstructorRoleName(existingTeacher.Role.Name) {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Teacher not found"})
		return
	}

	courseIDs := make([]uint, 0, len(input.CourseIDs))
	seen := make(map[uint]struct{}, len(input.CourseIDs))

	for _, courseID := range input.CourseIDs {
		if _, ok := seen[courseID]; ok {
			continue
		}

		seen[courseID] = struct{}{}
		courseIDs = append(courseIDs, courseID)
	}

	var courses []models.Course

	if len(courseIDs) > 0 {
		if err := h.DB.Where("id IN ?", courseIDs).Find(&courses).Error; err != nil {
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
			return
		}

		if len(courses) != len(courseIDs) {
			writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "One or more courses not found"})
			return
		}
	}

	err = h.DB.Transaction(func(tx *gorm.DB) error {
		return tx.Model(&existingTeacher).Association("AssignedCourses").Replace(courses)
	})

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, CourseAssignmentResponse{
		Message: "Request successful",
		Data: CourseAssignmentData{
			Email:     existingTeacher.Email,
			CourseIDs: courseIDs,
		},
	})
}

// UnassignCourses godoc
// @Summary      Unassign courses from a teacher
// @Description  Removes the given courses from the teacher's assignments. The courses themselves are not deleted. Fails with 404 if any course does not exist.
// @Tags         teachers
// @Accept       json
// @Produce      json
// @Param        id       path  int                     true  "Teacher ID"
// @Param        request  body  CourseAssignmentRequest  true  "Course IDs"
// @Success      200  {object}  CourseAssignmentResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/teachers/{id}/courses [delete]
func (h *Handler) UnassignCourses(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Teacher ID"})
		return
	}

	var input CourseAssignmentRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if len(input.CourseIDs) == 0 {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "courseIds is required"})
		return
	}

	var existingTeacher models.User

	result := h.DB.Preload("Role").First(&existingTeacher, id)

	if result.Error != nil || !isInstructorRoleName(existingTeacher.Role.Name) {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Teacher not found"})
		return
	}

	courseIDs := make([]uint, 0, len(input.CourseIDs))
	seen := make(map[uint]struct{}, len(input.CourseIDs))

	for _, courseID := range input.CourseIDs {
		if _, ok := seen[courseID]; ok {
			continue
		}

		seen[courseID] = struct{}{}
		courseIDs = append(courseIDs, courseID)
	}

	var courses []models.Course

	if err := h.DB.Where("id IN ?", courseIDs).Find(&courses).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	if len(courses) != len(courseIDs) {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "One or more courses not found"})
		return
	}

	// Many2many Delete removes the course_teachers join rows only; it does not delete courses.
	if err := h.DB.Model(&existingTeacher).Association("AssignedCourses").Delete(courses); err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, CourseAssignmentResponse{
		Message: "Request successful",
		Data: CourseAssignmentData{
			Email:     existingTeacher.Email,
			CourseIDs: courseIDs,
		},
	})
}
