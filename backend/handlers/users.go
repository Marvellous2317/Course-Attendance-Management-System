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

// RegisterRequest is the payload accepted by RegisterUser.
type RegisterRequest struct {
	FirstName string `json:"firstName" example:"Ada"`
	LastName  string `json:"lastName" example:"Lovelace"`
	Email     string `json:"email" example:"ada@example.com"`
	RoleID    uint   `json:"roleId" example:"3"`
	Password  string `json:"password" example:"secret123"`
}

// LoginRequest is the payload accepted by LoginUser.
type LoginRequest struct {
	Email    string `json:"email" example:"ada@example.com"`
	Password string `json:"password" example:"secret123"`
}

// LoginUser is the user summary returned on login.
type LoginUser struct {
	Email string `json:"email" example:"ada@example.com"`
	ID    uint   `json:"id" example:"42"`
}

// LoginData contains the issued tokens and the logged-in user.
type LoginData struct {
	AccessToken  string    `json:"accessToken" example:"1|f3a9c0..."`
	RefreshToken string    `json:"refreshToken" example:"1|9b2d7e..."`
	User         LoginUser `json:"user"`
}

// LoginResponse is returned by LoginUser.
type LoginResponse struct {
	Message string    `json:"message" example:"Login successful"`
	Data    LoginData `json:"data"`
}

// RefreshRequest is the payload accepted by RefreshToken.
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" example:"1|9b2d7e..."`
}

// TokenData contains a refreshed token pair.
type TokenData struct {
	AccessToken  string `json:"accessToken" example:"1|f3a9c0..."`
	RefreshToken string `json:"refreshToken" example:"1|9b2d7e..."`
}

// RefreshResponse is returned by RefreshToken.
type RefreshResponse struct {
	Message string    `json:"message" example:"Token refreshed"`
	Data    TokenData `json:"data"`
}

// ChangePasswordRequest is the payload accepted by ChangePassword.
type ChangePasswordRequest struct {
	OldPassword     string `json:"oldPassword" example:"oldsecret"`
	NewPassword     string `json:"newPassword" example:"newsecret"`
	ConfirmPassword string `json:"confirmPassword" example:"newsecret"`
}

// ProfileRole is the role summary included in the profile.
type ProfileRole struct {
	ID   uint   `json:"id" example:"3"`
	Name string `json:"name" example:"student"`
}

// ProfileData describes the authenticated user.
type ProfileData struct {
	ID        uint        `json:"id" example:"42"`
	Email     string      `json:"email" example:"ada@example.com"`
	FirstName string      `json:"firstName" example:"Ada"`
	LastName  string      `json:"lastName" example:"Lovelace"`
	Role      ProfileRole `json:"role"`
}

// ProfileResponse is returned by Profile.
type ProfileResponse struct {
	Message string      `json:"message" example:"Request successful"`
	Data    ProfileData `json:"data"`
}

func generateToken() string {
	bytes := make([]byte, 48)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// RegisterUser godoc
// @Summary      Register a user
// @Description  Creates a user with the given role. No authentication is required.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body  RegisterRequest  true  "Registration payload"
// @Success      201  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      409  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Router       /register [post]
func (h *Handler) RegisterUser(w http.ResponseWriter, r *http.Request) {
	var input RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		writeJSON(w, http.StatusConflict, ErrorResponse{Error: "User already exists"})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
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
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, MessageResponse{Message: "Registration successful"})
}

// LoginUser godoc
// @Summary      Log in
// @Description  Exchanges email and password for an access token and a refresh token. The access token expires after 30 minutes and the refresh token after 5 hours.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body  LoginRequest  true  "Credentials"
// @Success      200  {object}  LoginResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      401  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Router       /login [post]
func (h *Handler) LoginUser(w http.ResponseWriter, r *http.Request) {

	var input LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("email = ?", input.Email).First(&existingUser).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(input.Password)); err != nil {
		writeJSON(w, http.StatusUnauthorized, ErrorResponse{Error: "Invalid credentials"})
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
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to create session"})
		return
	}

	writeJSON(w, http.StatusOK, LoginResponse{
		Message: "Login successful",
		Data: LoginData{
			AccessToken:  strconv.FormatUint(uint64(sessionToken.ID), 10) + "|" + sessionToken.Token,
			RefreshToken: strconv.FormatUint(uint64(sessionToken.ID), 10) + "|" + sessionToken.RefreshToken,
			User: LoginUser{
				Email: existingUser.Email,
				ID:    existingUser.ID,
			},
		},
	})

}

// RefreshToken godoc
// @Summary      Refresh tokens
// @Description  Issues a new access and refresh token pair from a valid refresh token. The old refresh token is replaced.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body  RefreshRequest  true  "Refresh token"
// @Success      200  {object}  RefreshResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      401  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Router       /refresh [post]
func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {

	var input RefreshRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	refreshToken := strings.Split(input.RefreshToken, "|")

	if len(refreshToken) != 2 {
		writeJSON(w, http.StatusUnauthorized, ErrorResponse{Error: "Invalid refresh token"})
		return
	}

	var activeSession models.SessionToken

	result := h.DB.Where("refresh_token = ? AND refresh_token_expires_at > NOW()", refreshToken[1]).First(&activeSession)

	if result.Error != nil {
		writeJSON(w, http.StatusUnauthorized, ErrorResponse{Error: "Invalid refresh token"})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("id = ?", activeSession.UserID).First(&existingUser).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "User not found"})
		return
	}

	now := time.Now()

	activeSession.Token = generateToken()
	activeSession.RefreshToken = generateToken()
	activeSession.ExpiresAt = now.Add(30 * time.Minute)
	activeSession.RefreshTokenExpiresAt = now.Add(5 * time.Hour)

	result = h.DB.Save(&activeSession)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, RefreshResponse{
		Message: "Token refreshed",
		Data: TokenData{
			AccessToken:  strconv.FormatUint(uint64(activeSession.ID), 10) + "|" + activeSession.Token,
			RefreshToken: strconv.FormatUint(uint64(activeSession.ID), 10) + "|" + activeSession.RefreshToken,
		},
	})

}

// ChangePassword godoc
// @Summary      Change password
// @Description  Sets a new password for the authenticated user. oldPassword must match the current password and newPassword must match confirmPassword.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        request  body  ChangePasswordRequest  true  "Password change payload"
// @Success      200  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      401  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /change-password [post]
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	var input ChangePasswordRequest

	user := cmscontext.UserFrom(r.Context())

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if input.NewPassword != input.ConfirmPassword {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Passwords do not match"})
		return
	}

	var existingUser models.User

	if err := h.DB.Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(input.OldPassword)); err != nil {
		writeJSON(w, http.StatusUnauthorized, ErrorResponse{Error: "Old password is incorrect"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	existingUser.Password = string(hashedPassword)

	result := h.DB.Save(&existingUser)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, MessageResponse{Message: "Password changed"})

}

// Profile godoc
// @Summary      Get profile
// @Description  Returns the authenticated user's profile and role.
// @Tags         auth
// @Produce      json
// @Success      200  {object}  ProfileResponse
// @Failure      404  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /profile [get]
func (h *Handler) Profile(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	var existingUser models.User

	if err := h.DB.Where("email = ?", user.Email).First(&existingUser).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "User not found"})
		return
	}

	var userRole models.Role

	if err := h.DB.Where("id = ?", user.RoleID).First(&userRole).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Role not found"})
		return
	}

	writeJSON(w, http.StatusOK, ProfileResponse{
		Message: "Request successful",
		Data: ProfileData{
			ID:        existingUser.ID,
			Email:     existingUser.Email,
			FirstName: existingUser.FirstName,
			LastName:  existingUser.LastName,
			Role: ProfileRole{
				ID:   userRole.ID,
				Name: userRole.Name,
			},
		},
	})
}
