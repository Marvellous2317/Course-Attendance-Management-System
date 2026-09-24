package handlers

import (
	"cms/models"
	"net/http"
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

	if err := h.DB.Order("-ID").Find(&courses).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	response := make([]courseResponse, 0, len(courses))
	for _, course := range courses {
		response = append(response, toCourseResponse(course))
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    response,
	})
}
