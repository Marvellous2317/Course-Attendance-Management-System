package handlers

import (
	"cms/models"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"gorm.io/gorm"
)

// RoleResponse is the public representation of a role.
type RoleResponse struct {
	ID          uint       `json:"id" example:"1"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	DeletedAt   *time.Time `json:"deletedAt,omitempty"`
	Name        string     `json:"name" example:"instructor"`
	Description string     `json:"description,omitempty" example:"Teaches courses"`
}

// RoleListResponse is returned by GetAllRoles.
type RoleListResponse struct {
	Message string         `json:"message" example:"Request successful"`
	Data    []RoleResponse `json:"data"`
	Meta    PaginationMeta `json:"meta"`
}

// RoleDataResponse is returned by GetRole, CreateRole and UpdateRole.
type RoleDataResponse struct {
	Message string       `json:"message" example:"Request successful"`
	Data    RoleResponse `json:"data"`
}

// CreateRoleRequest is the payload accepted by CreateRole.
type CreateRoleRequest struct {
	Name        string `json:"name" example:"instructor"`
	Description string `json:"description" example:"Teaches courses"`
}

// UpdateRoleRequest is the payload accepted by UpdateRole. Empty fields are left unchanged.
type UpdateRoleRequest struct {
	Name        string `json:"name" example:"instructor"`
	Description string `json:"description" example:"Teaches courses"`
}

func toRoleResponse(role models.Role) RoleResponse {
	var deletedAt *time.Time
	if role.DeletedAt.Valid {
		deletedAt = &role.DeletedAt.Time
	}

	return RoleResponse{
		ID:          role.ID,
		CreatedAt:   role.CreatedAt,
		UpdatedAt:   role.UpdatedAt,
		DeletedAt:   deletedAt,
		Name:        role.Name,
		Description: role.Description,
	}
}

// GetAllRoles godoc
// @Summary      List roles
// @Description  Returns all roles, newest first.
// @Tags         roles
// @Produce      json
// @Success      200  {object}  RoleListResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/roles [get]
func (h *Handler) GetAllRoles(w http.ResponseWriter, r *http.Request) {
	showDeleted, _ := strconv.ParseBool(r.URL.Query().Get("isDeleted"))
	search := r.URL.Query().Get("search")

	page, perPage, offset := parsePagination(r)

	scope := func() *gorm.DB {
		q := h.DB.Model(&models.Role{})
		if showDeleted {
			q = q.Unscoped()
		}
		if search != "" {
			like := "%" + search + "%"
			q = q.Where("name ILIKE ? OR description ILIKE ?", like, like)
		}
		return q
	}

	var totalRecords int64

	if err := scope().Count(&totalRecords).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	var roles []models.Role

	if err := scope().Order("id DESC").Limit(perPage).Offset(offset).Find(&roles).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	response := make([]RoleResponse, 0, len(roles))
	for _, role := range roles {
		response = append(response, toRoleResponse(role))
	}

	writeJSON(w, http.StatusOK, RoleListResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(totalRecords, page, perPage),
	})
}

// GetRole godoc
// @Summary      Get a role
// @Description  Returns a single role by ID.
// @Tags         roles
// @Produce      json
// @Param        id  path  int  true  "Role ID"
// @Success      200  {object}  RoleDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/roles/{id} [get]
func (h *Handler) GetRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid role ID"})
		return
	}

	var role models.Role

	result := h.DB.First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Role not found"})
		return
	}

	writeJSON(w, http.StatusOK, RoleDataResponse{
		Message: "Request successful",
		Data:    toRoleResponse(role),
	})
}

// CreateRole godoc
// @Summary      Create a role
// @Description  Creates a new role.
// @Tags         roles
// @Accept       json
// @Produce      json
// @Param        request  body  CreateRoleRequest  true  "Role payload"
// @Success      201  {object}  RoleDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/roles [post]
func (h *Handler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var input CreateRoleRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	role := models.Role{
		Name:        input.Name,
		Description: input.Description,
	}

	result := h.DB.Create(&role)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, RoleDataResponse{
		Message: "Request successful",
		Data:    toRoleResponse(role),
	})

}

// UpdateRole godoc
// @Summary      Update a role
// @Description  Updates a role's name and/or description. Empty fields are left unchanged.
// @Tags         roles
// @Accept       json
// @Produce      json
// @Param        id       path  int                true  "Role ID"
// @Param        request  body  UpdateRoleRequest  true  "Fields to update"
// @Success      200  {object}  RoleDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/roles/{id} [patch]
func (h *Handler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid role ID"})
		return
	}

	var input UpdateRoleRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var role models.Role

	result := h.DB.First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Role not found"})
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
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, RoleDataResponse{
		Message: "Request successful",
		Data:    toRoleResponse(role),
	})
}

// DeleteRole godoc
// @Summary      Delete a role
// @Description  Soft-deletes a role. Fails with 409 while any user still has the role. Use the restore endpoint to undo.
// @Tags         roles
// @Produce      json
// @Param        id  path  int  true  "Role ID"
// @Success      204  "No Content"
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      409  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/roles/{id} [delete]
func (h *Handler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid role ID"})
		return
	}

	var role models.Role

	result := h.DB.First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Role not found"})
		return
	}

	existingUsers := make([]models.User, 0)

	result = h.DB.Where("role_id = ?", id).Find(&existingUsers)

	if len(existingUsers) > 0 {
		writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Role is in use by users"})
		return
	}

	result = h.DB.Delete(&role)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusNoContent, nil)
}

// RestoreRole godoc
// @Summary      Restore a role
// @Description  Clears the soft-delete timestamp of a role.
// @Tags         roles
// @Produce      json
// @Param        id  path  int  true  "Role ID"
// @Success      200  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/roles/{id}/restore [patch]
func (h *Handler) RestoreRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid role ID"})
		return
	}

	var role models.Role

	result := h.DB.Unscoped().First(&role, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Role not found"})
		return
	}

	result = h.DB.Unscoped().Model(&role).Update("DeletedAt", nil)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to restore role"})
		return
	}

	writeJSON(w, http.StatusOK, MessageResponse{Message: "Role restored successfully"})
}
