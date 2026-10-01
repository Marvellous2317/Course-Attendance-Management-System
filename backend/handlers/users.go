package handlers

import (
	cmscontext "cms/context"
	"cms/models"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"

	"net/http"
	"strconv"
	"strings"
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
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
		Email     string `json:"email"`
		RoleID    uint   `json:"roleId"`
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

func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {

	var input struct {
		RefreshToken string `json:"refreshToken"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	refreshToken := strings.Split(input.RefreshToken, "|")

	var activeSession models.SessionToken

	result := h.DB.Where("refresh_token = ? AND refresh_token_expires_at > NOW()", refreshToken[1]).First(&activeSession)

	if result.Error != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid refresh token"})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("id = ?", activeSession.UserID).First(&existingUser).Error; err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	now := time.Now()

	activeSession.Token = generateToken()
	activeSession.RefreshToken = generateToken()
	activeSession.ExpiresAt = now.Add(30 * time.Minute)
	activeSession.RefreshTokenExpiresAt = now.Add(5 * time.Hour)

	result = h.DB.Save(&activeSession)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Token refreshed",
		"data": map[string]interface{}{
			"accessToken":  strconv.FormatUint(uint64(activeSession.ID), 10) + "|" + activeSession.Token,
			"refreshToken": strconv.FormatUint(uint64(activeSession.ID), 10) + "|" + activeSession.RefreshToken,
		},
	})

}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var input struct {
		OldPassword     string `json:"oldPassword"`
		NewPassword     string `json:"newPassword"`
		ConfirmPassword string `json:"confirmPassword"`
	}

	user := cmscontext.UserFrom(r.Context())

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	if input.NewPassword != input.ConfirmPassword {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "Passwords do not match"})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	existingUser.Password = string(hashedPassword)

	result := h.DB.Save(&existingUser)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Password changed",
	})

}
