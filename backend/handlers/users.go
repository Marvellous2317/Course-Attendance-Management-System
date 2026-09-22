package handlers

import (
	"cms/models"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func generateToken() string {
	bytes := make([]byte, 48)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (h *Handler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		RoleID    uint   `json:"role_id"`
		Password  string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "User already exists"})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	user := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		RoleID:    input.RoleID,
		Password:  string(hashPassword),
	}

	if err := h.DB.Create(&user).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{"message": "Registration successful"})
}

func (h *Handler) LoginUser(w http.ResponseWriter, r *http.Request) {

	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("email = ?", input.Email).First(&existingUser).Error; err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(input.Password)); err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
		return
	}

	accessToken := generateToken()
	refreshToken := generateToken()
	now := time.Now()

	sessionToken := models.SessionToken{
		Token:                 accessToken,
		RefreshToken:          refreshToken,
		UserID:                existingUser.ID,
		LastUsedAt:            now,
		ExpiresAt:             now.Add(30 * time.Minute),
		RefreshTokenExpiresAt: now.Add(5 * time.Hour),
	}

	if err := h.DB.Create(&sessionToken).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create session"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Login successful",
		"data": map[string]interface{}{
			"accessToken":  strconv.FormatUint(uint64(sessionToken.ID), 10) + "|" + sessionToken.Token,
			"refreshToken": strconv.FormatUint(uint64(sessionToken.ID), 10) + "|" + sessionToken.RefreshToken,
			"user": map[string]interface{}{
				"email": existingUser.Email,
				"id":    existingUser.ID,
			},
		},
	})

}

// func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
// 	token := r.Header.Get("Authorization")
// 	tokenID, _ := strconv.ParseUint(token, 10, 64)
// }
