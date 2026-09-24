package handlers

import (
	cmscontext "cms/context"
	"cms/models"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type courseResponse struct {
	Title       string     `json:"title"`
	Description string     `json:"description,omitempty"`
	Code        string     `json:"code"`
	ID          uint       `json:"id"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	DeletedAt   *time.Time `json:"deletedAt,omitempty"`
}

func toCourseResponse(course models.Course) courseResponse {
	var deletedAt *time.Time
	if course.DeletedAt.Valid {
		deletedAt = &course.DeletedAt.Time
	}

	return courseResponse{
		Title:       course.Title,
		Description: course.Description,
		Code:        course.Code,
		DeletedAt:   deletedAt,
		ID:          course.ID,
		CreatedAt:   course.CreatedAt,
		UpdatedAt:   course.UpdatedAt,
	}
}

func (h *Handler) GetAllCourses(w http.ResponseWriter, r *http.Request) {
	var courses []models.Course

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
	if err := h.DB.Model(&models.Course{}).Count(&totalRecords).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	if err := h.DB.Order("id DESC").Limit(perPage).Offset(offset).Find(&courses).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	response := make([]courseResponse, 0, len(courses))
	for _, course := range courses {
		response = append(response, toCourseResponse(course))
	}

	totalPages := int((totalRecords + int64(perPage) - 1) / int64(perPage))

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    response,
		"meta": map[string]interface{}{
			"totalRecords": totalRecords,
			"totalPages":   totalPages,
			"page":         page,
			"perPage":      perPage,
		},
	})
}

func (h *Handler) GetCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid course ID"})
		return
	}

	var course models.Course

	result := h.DB.Preload("CreatedBy").First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Course not found"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    toCourseResponse(course),
	})
}

func (h *Handler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Code        string `json:"code"`
	}

	user := cmscontext.UserFrom(r.Context())

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
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
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Request successful",
		"data":    toCourseResponse(course),
	})
}

func (h *Handler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid course ID"})
		return
	}

	var input struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Code        string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	var course models.Course

	result := h.DB.First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Course not found"})
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
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    toCourseResponse(course),
	})
}

func (h *Handler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid course ID"})
		return
	}

	var course models.Course

	result := h.DB.First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Course not found"})
		return
	}

	var courseOfferings []models.CourseOffering

	result = h.DB.Where("course_id = ?", course.ID).Find(&courseOfferings)

	if len(courseOfferings) > 0 {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "Course is already offered"})
		return
	}

	result = h.DB.Delete(&course)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Course deleted successfully"})
}

func (h *Handler) RestoreCourse(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid course ID"})
		return
	}

	var course models.Course

	result := h.DB.Unscoped().First(&course, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Course not found"})
		return
	}

	result = h.DB.Unscoped().Model(&course).Update("DeletedAt", nil)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to restore course"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Course restored successfully"})
}
