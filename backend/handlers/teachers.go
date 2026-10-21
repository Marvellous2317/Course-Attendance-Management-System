package handlers

import (
	"cms/models"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type teacherResponse struct {
	ID        uint       `json:"id"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
	DeletedAt *time.Time `json:"deletedAt,omitempty"`
	FirstName string     `json:"firstName"`
	LastName  string     `json:"lastName"`
	Email     string     `json:"email"`
	RoleID    uint       `json:"roleID"`
	Role      models.Role
}

func toTeacherResponse(teacher models.User) teacherResponse {
	var deletedAt *time.Time
	if teacher.DeletedAt.Valid {
		deletedAt = &teacher.DeletedAt.Time
	}

	return teacherResponse{
		ID:        teacher.ID,
		CreatedAt: teacher.CreatedAt,
		UpdatedAt: teacher.UpdatedAt,
		DeletedAt: deletedAt,
		FirstName: teacher.FirstName,
		LastName:  teacher.LastName,
		Email:     teacher.Email,
		RoleID:    teacher.RoleID,
		Role:      teacher.Role,
	}
}

func (h *Handler) GetAllTeachers(w http.ResponseWriter, r *http.Request) {
	var teachers []models.User

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))

	if page <= 0 {
		page = 1
	}

	perPage, _ := strconv.Atoi(r.URL.Query().Get("perPage"))

	switch {
	case perPage <= 0:
		perPage = 20
	case perPage > 50:
		perPage = 50
	}

	offset := (page - 1) * perPage

	var totalRecords int64

	showDeleted := r.URL.Query().Get("isDeleted")

	if showDeleted == "true" {
		if err := h.DB.Model(&models.User{}).Where("role_id = ?", 2).Where("deleted_at IS NULL").Count(&totalRecords).Error; err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
	} else {
		if err := h.DB.Model(&models.User{}).Where("role_id = ?", 2).Count(&totalRecords).Error; err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
	}

	if showDeleted == "true" {
		if err := h.DB.Preload("Role").Order("-ID").Where("role_id = ?", 2).Where("deleted_at IS NULL").Limit(perPage).Offset(offset).Find(&teachers).Error; err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
	} else {
		if err := h.DB.Preload("Role").Order("-ID").Where("role_id = ?", 2).Limit(perPage).Offset(offset).Find(&teachers).Error; err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}
	}

	response := make([]teacherResponse, 0, len(teachers))
	for _, teacher := range teachers {
		response = append(response, toTeacherResponse(teacher))
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    response,
	})

}

func (h *Handler) GetTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Teacher not found"})
		return
	}

	var teacher models.User

	result := h.DB.Preload("Role").Where("role_id = ?", 2).First(&teacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Teacher not found"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    toTeacherResponse(teacher),
	})
}

func (h *Handler) CreateTeacher(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		RoleID    uint   `json:"roleId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	var existingTeacher models.User

	if err := h.DB.Where("LOWER(email) = ?", input.Email).First(&existingTeacher).Error; err == nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "Teacher already exists"})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
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
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Request successful",
		"data":    map[string]string{"email": newTeacher.Email},
	})
}

func (h *Handler) UpdateTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Teacher not found"})
		return
	}

	var input struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		RoleID    uint   `json:"roleId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	var existingTeacher models.User

	result := h.DB.Where("role_id = ?", 2).First(&existingTeacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Teacher not found"})
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
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    map[string]string{"email": existingTeacher.Email},
	})
}

func (h *Handler) DeleteTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Teacher ID"})
		return
	}

	var existingTeacher models.User

	result := h.DB.Where("role_id = ?", 2).First(&existingTeacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Teacher not found"})
		return
	}

	result = h.DB.Delete(&existingTeacher)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusNoContent, nil)
}

func (h *Handler) RestoreTeacher(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Teacher ID"})
		return
	}

	var existingTeacher models.User

	result := h.DB.Where("role_id = ?", 2).Unscoped().First(&existingTeacher, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Teacher not found"})
		return
	}

	result = h.DB.Unscoped().Model(&existingTeacher).Update("DeletedAt", nil)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Teacher restored successfully"})
}

func (h *Handler) AssignCourses(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Teacher ID"})
		return
	}

	var input struct {
		CourseIDs []uint `json:"courseIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	var existingTeacher models.User

	result := h.DB.Preload("Role").First(&existingTeacher, id)

	if result.Error != nil || existingTeacher.Role.Name != "instructor" {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Teacher not found"})
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
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
			return
		}

		if len(courses) != len(courseIDs) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "One or more courses not found"})
			return
		}
	}

	err = h.DB.Transaction(func(tx *gorm.DB) error {
		return tx.Model(&existingTeacher).Association("AssignedCourses").Replace(courses)
	})

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data": map[string]interface{}{
			"email":     existingTeacher.Email,
			"courseIds": courseIDs,
		},
	})
}

func (h *Handler) UnassignCourses(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid Teacher ID"})
		return
	}

	var input struct {
		CourseIDs []uint `json:"courseIds"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	if len(input.CourseIDs) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "courseIds is required"})
		return
	}

	var existingTeacher models.User

	result := h.DB.Preload("Role").First(&existingTeacher, id)

	if result.Error != nil || existingTeacher.Role.Name != "instructor" {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Teacher not found"})
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
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	if len(courses) != len(courseIDs) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "One or more courses not found"})
		return
	}

	// Many2many Delete removes the course_teachers join rows only; it does not delete courses.
	if err := h.DB.Model(&existingTeacher).Association("AssignedCourses").Delete(courses); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data": map[string]interface{}{
			"email":     existingTeacher.Email,
			"courseIds": courseIDs,
		},
	})
}
