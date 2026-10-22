package handlers

import (
	cmscontext "cms/context"
	"cms/models"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"gorm.io/gorm"
)

// CourseResponse is the public representation of a course.
type CourseResponse struct {
	Title       string      `json:"title" example:"Introduction to Go"`
	Description string      `json:"description,omitempty" example:"Basics of the Go language"`
	Code        string      `json:"code" example:"GO101"`
	ID          uint        `json:"id" example:"7"`
	CreatedAt   time.Time   `json:"createdAt"`
	UpdatedAt   time.Time   `json:"updatedAt"`
	DeletedAt   *time.Time  `json:"deletedAt,omitempty"`
	CreatedBy   UserSummary `json:"createdBy"`
}

// CourseListResponse is returned by GetAllCourses.
type CourseListResponse struct {
	Message string           `json:"message" example:"Request successful"`
	Data    []CourseResponse `json:"data"`
	Meta    PaginationMeta   `json:"meta"`
}

// CourseDataResponse is returned by GetCourse, CreateCourse and UpdateCourse.
type CourseDataResponse struct {
	Message string         `json:"message" example:"Request successful"`
	Data    CourseResponse `json:"data"`
}

// CourseTeachersResponse is returned by GetCourseTeachers.
type CourseTeachersResponse struct {
	Message string            `json:"message" example:"Request successful"`
	Data    []TeacherResponse `json:"data"`
	Meta    PaginationMeta    `json:"meta"`
}

// CourseStudentsResponse is returned by GetCourseStudents.
type CourseStudentsResponse struct {
	Message string            `json:"message" example:"Request successful"`
	Data    []StudentResponse `json:"data"`
	Meta    PaginationMeta    `json:"meta"`
}

// CreateCourseRequest is the payload accepted by CreateCourse.
type CreateCourseRequest struct {
	Title       string `json:"title" example:"Introduction to Go"`
	Description string `json:"description" example:"Basics of the Go language"`
	Code        string `json:"code" example:"GO101"`
}

// UpdateCourseRequest is the payload accepted by UpdateCourse. Empty fields are left unchanged.
type UpdateCourseRequest struct {
	Title       string `json:"title" example:"Introduction to Go"`
	Description string `json:"description" example:"Basics of the Go language"`
	Code        string `json:"code" example:"GO101"`
}

// courseWithCreator preloads the teacher who created the course, which the response needs.
func (h *Handler) courseWithCreator() *gorm.DB {
	return h.DB.Preload("CreatedByUser")
}

func toCourseResponse(course models.Course) CourseResponse {
	var deletedAt *time.Time
	if course.DeletedAt.Valid {
		deletedAt = &course.DeletedAt.Time
	}

	return CourseResponse{
		Title:       course.Title,
		Description: course.Description,
		Code:        course.Code,
		DeletedAt:   deletedAt,
		ID:          course.ID,
		CreatedAt:   course.CreatedAt,
		UpdatedAt:   course.UpdatedAt,
		CreatedBy: UserSummary{
			ID:        course.CreatedByUser.ID,
			FirstName: course.CreatedByUser.FirstName,
			LastName:  course.CreatedByUser.LastName,
			Email:     course.CreatedByUser.Email,
		},
	}
}

// GetAllCourses godoc
// @Summary      List courses
// @Description  Returns paginated courses, newest first. Set isDeleted=true to include soft-deleted courses.
// @Tags         courses
// @Produce      json
// @Param        page       query  int   false  "Page number"              default(1)
// @Param        perPage    query  int   false  "Items per page (max 50)"  default(20)
// @Param        isDeleted  query  bool  false  "Include deleted courses"
// @Success      200  {object}  CourseListResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses [get]
func (h *Handler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
	var courses []models.Course

	showDeleted, _ := strconv.ParseBool(r.URL.Query().Get("isDeleted"))

	page, perPage, offset := parsePagination(r)

	// GORM's soft-delete scope hides rows with deleted_at set unless Unscoped is used,
	// so deleted courses are only visible when explicitly requested.
	scope := func() *gorm.DB {
		q := h.DB.Model(&models.Course{})
		if showDeleted {
			q = q.Unscoped()
		}
		return q
	}

	var totalRecords int64

	if err := scope().Count(&totalRecords).Error; err != nil {
		log.Printf("count courses: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to count courses"})
		return
	}

	if err := scope().Preload("CreatedByUser").Order("id DESC").Limit(perPage).Offset(offset).Find(&courses).Error; err != nil {
		log.Printf("fetch courses: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch courses"})
		return
	}

	response := make([]CourseResponse, 0, len(courses))
	for _, course := range courses {
		response = append(response, toCourseResponse(course))
	}

	writeJSON(w, http.StatusOK, CourseListResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(totalRecords, page, perPage),
	})
}

// GetCourse godoc
// @Summary      Get a course
// @Description  Returns a single course by ID.
// @Tags         courses
// @Produce      json
// @Param        id  path  int  true  "Course ID"
// @Success      200  {object}  CourseDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses/{id} [get]
func (h *Handler) GetCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	var course models.Course

	result := h.courseWithCreator().First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	writeJSON(w, http.StatusOK, CourseDataResponse{
		Message: "Request successful",
		Data:    toCourseResponse(course),
	})
}

// GetCourseTeachers godoc
// @Summary      List teachers of a course
// @Description  Returns the teachers who created the course, are assigned to it, or instruct one of its offerings.
// @Tags         courses
// @Produce      json
// @Param        id       path   int  true   "Course ID"
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  CourseTeachersResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses/{id}/teachers [get]
func (h *Handler) GetCourseTeachers(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	if !h.courseExists(uint(id)) {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	page, perPage, offset := parsePagination(r)

	scope := h.DB.Model(&models.User{}).
		Joins("JOIN roles ON roles.id = users.role_id AND roles.deleted_at IS NULL AND roles.name = ?", "instructor").
		Where(`(users.id IN (SELECT user_id FROM course_teachers WHERE course_id = ?)
			OR users.id IN (SELECT instructor_id FROM course_offerings WHERE course_id = ? AND deleted_at IS NULL)
			OR users.id IN (SELECT created_by FROM courses WHERE id = ? AND deleted_at IS NULL))`, id, id, id)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count course teachers: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch teachers"})
		return
	}

	var teachers []models.User

	if err := scope.Preload("Role").Order("users.id DESC").Limit(perPage).Offset(offset).Find(&teachers).Error; err != nil {
		log.Printf("fetch course teachers: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch teachers"})
		return
	}

	response := make([]TeacherResponse, 0, len(teachers))
	for _, teacher := range teachers {
		response = append(response, toTeacherResponse(teacher))
	}

	writeJSON(w, http.StatusOK, CourseTeachersResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(total, page, perPage),
	})
}

// GetCourseStudents godoc
// @Summary      List students of a course
// @Description  Returns the students enrolled in any offering of the course. A student enrolled in several batches appears once.
// @Tags         courses
// @Produce      json
// @Param        id       path   int  true   "Course ID"
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  CourseStudentsResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses/{id}/students [get]
func (h *Handler) GetCourseStudents(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	if !h.courseExists(uint(id)) {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	page, perPage, offset := parsePagination(r)

	scope := h.DB.Model(&models.User{}).
		Where(`users.id IN (
			SELECT enrollments.user_id FROM enrollments
			JOIN course_offerings ON course_offerings.id = enrollments.course_offering_id AND course_offerings.deleted_at IS NULL
			WHERE course_offerings.course_id = ?)`, id)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count course students: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch students"})
		return
	}

	var students []models.User

	if err := scope.Preload("Role").Order("users.id DESC").Limit(perPage).Offset(offset).Find(&students).Error; err != nil {
		log.Printf("fetch course students: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch students"})
		return
	}

	response := make([]StudentResponse, 0, len(students))
	for _, student := range students {
		response = append(response, toStudentResponse(student))
	}

	writeJSON(w, http.StatusOK, CourseStudentsResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(total, page, perPage),
	})
}

// courseExists reports whether an active course with the given ID exists.
func (h *Handler) courseExists(id uint) bool {
	var count int64

	if err := h.DB.Model(&models.Course{}).Where("id = ?", id).Count(&count).Error; err != nil {
		return false
	}

	return count > 0
}

// CreateCourse godoc
// @Summary      Create a course
// @Description  Creates a course owned by the authenticated admin.
// @Tags         courses
// @Accept       json
// @Produce      json
// @Param        request  body  CreateCourseRequest  true  "Course payload"
// @Success      201  {object}  CourseDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses [post]
func (h *Handler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var input CreateCourseRequest

	user := cmscontext.UserFrom(r.Context())

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	course := models.Course{
		Title:       input.Title,
		Description: input.Description,
		Code:        input.Code,
		CreatedBy:   user.ID,
	}

	result := h.DB.Create(&course)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	if err := h.courseWithCreator().First(&course, course.ID).Error; err != nil {
		log.Printf("reload created course: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to load course"})
		return
	}

	writeJSON(w, http.StatusCreated, CourseDataResponse{
		Message: "Request successful",
		Data:    toCourseResponse(course),
	})
}

// UpdateCourse godoc
// @Summary      Update a course
// @Description  Updates a course's title, description and/or code. Empty fields are left unchanged.
// @Tags         courses
// @Accept       json
// @Produce      json
// @Param        id       path  int                  true  "Course ID"
// @Param        request  body  UpdateCourseRequest  true  "Fields to update"
// @Success      200  {object}  CourseDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses/{id} [patch]
func (h *Handler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	var input UpdateCourseRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var course models.Course

	result := h.DB.First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	if input.Title != "" {
		course.Title = input.Title
	}

	if input.Description != "" {
		course.Description = input.Description
	}

	if input.Code != "" {
		course.Code = input.Code
	}

	result = h.DB.Save(&course)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	if err := h.courseWithCreator().First(&course, course.ID).Error; err != nil {
		log.Printf("reload updated course: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to load course"})
		return
	}

	writeJSON(w, http.StatusOK, CourseDataResponse{
		Message: "Request successful",
		Data:    toCourseResponse(course),
	})
}

// DeleteCourse godoc
// @Summary      Delete a course
// @Description  Soft-deletes a course. Fails with 409 if the course has any offerings. Use the restore endpoint to undo.
// @Tags         courses
// @Produce      json
// @Param        id  path  int  true  "Course ID"
// @Success      200  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      409  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses/{id} [delete]
func (h *Handler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	var course models.Course

	result := h.DB.First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	var courseOfferings []models.CourseOffering

	result = h.DB.Where("course_id = ?", course.ID).Find(&courseOfferings)

	if len(courseOfferings) > 0 {
		writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Course is already offered"})
		return
	}

	result = h.DB.Delete(&course)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, MessageResponse{Message: "Course deleted successfully"})
}

// RestoreCourse godoc
// @Summary      Restore a course
// @Description  Clears the soft-delete timestamp of a course.
// @Tags         courses
// @Produce      json
// @Param        id  path  int  true  "Course ID"
// @Success      200  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/courses/{id}/restore [patch]
func (h *Handler) RestoreCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	var course models.Course

	result := h.DB.Unscoped().First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	result = h.DB.Unscoped().Model(&course).Update("DeletedAt", nil)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to restore course"})
		return
	}

	writeJSON(w, http.StatusOK, MessageResponse{Message: "Course restored successfully"})
}
