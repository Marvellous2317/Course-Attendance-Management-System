package handlers

import (
	"cms/models"
	"net/http"
	"time"
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

	if err := h.DB.Preload("Role").Order("-ID").Where("role_id = ?", 2).Find(&teachers).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
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
