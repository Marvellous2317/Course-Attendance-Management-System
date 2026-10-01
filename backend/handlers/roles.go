package handlers

import (
	"cms/models"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type roleResponse struct {
	ID          uint       `json:"id"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	DeletedAt   *time.Time `json:"deletedAt,omitempty"`
	Name        string     `json:"name"`
	Description string     `json:"description,omitempty"`
}

func toRoleResponse(role models.Role) roleResponse {
	var deletedAt *time.Time
	if role.DeletedAt.Valid {
		deletedAt = &role.DeletedAt.Time
	}

	return roleResponse{
		ID:          role.ID,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
		DeletedAt:   deletedAt,
		Name:        role.Name,
		Description: role.Description,
	}
}

func (h *Handler) GetAllRoles(w http.ResponseWriter, r *http.Request) {
	var roles []models.Role

	if err := h.DB.Order("-ID").Find(&roles).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	response := make([]roleResponse, 0, len(roles))
	for _, role := range roles {
		response = append(response, toRoleResponse(role))
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    response,
	})
}

func (h *Handler) GetRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid role ID"})
		return
	}

	var role models.Role

	result := h.DB.First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Role not found"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    toRoleResponse(role),
	})
}

func (h *Handler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	role := models.Role{
		Name:        input.Name,
		Description: input.Description,
	}

	result := h.DB.Create(&role)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Request successful",
		"data":    toRoleResponse(role),
	})

}

func (h *Handler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid role ID"})
		return
	}

	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	var role models.Role

	result := h.DB.First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Role not found"})
		return
	}

	if input.Name != "" {
		role.Name = input.Name
	}
	if input.Description != "" {
		role.Description = input.Description
	}

	result = h.DB.Save(&role)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Request successful",
		"data":    toRoleResponse(role),
	})
}

func (h *Handler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid role ID"})
		return
	}

	var role models.Role

	result := h.DB.First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Role not found"})
		return
	}

	existingUsers := make([]models.User, 0)

	result = h.DB.Where("role_id = ?", id).Find(&existingUsers)

	if len(existingUsers) > 0 {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "Role is in use by users"})
		return
	}

	result = h.DB.Delete(&role)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusNoContent, nil)
}

func (h *Handler) RestoreRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid role ID"})
		return
	}

	var role models.Role

	result := h.DB.Unscoped().First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Role not found"})
		return
	}

	result = h.DB.Unscoped().Model(&role).Update("DeletedAt", nil)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to restore role"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Role restored successfully"})
}
