package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name        string `json:"name"`
	Description string `json:"description"`
}

func (h *Handler) GetAllRoles(w http.ResponseWriter, r *http.Request) {
	var roles []Role

	if err := h.DB.Find(&roles).Error; err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(roles)
}

func (h *Handler) GetRole(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	id, err := strconv.Atoi(idStr)

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid role ID"})
		return
	}

	var role Role

	result := h.DB.First(&role, id)

	if result.Error != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "Role not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(role)
}
