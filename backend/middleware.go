package main

import (
	cmscontext "cms/context"
	"cms/models"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

type Middleware func(http.HandlerFunc) http.HandlerFunc

func writeJSONError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func chain(h http.HandlerFunc, mws ...Middleware) http.HandlerFunc {
	for i := len(mws) - 1; i >= 0; i-- {
		h = mws[i](h)
	}
	return h
}

func LoggingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("[LOG] Incoming request: %s %s\n", r.Method, r.URL.Path)
		next(w, r)
	}
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeJSONError(w, http.StatusUnauthorized, "Missing authorization token")
			return
		}

		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || string(parts[0]) != "Bearer" {
			writeJSONError(w, http.StatusUnauthorized, "Invalid authorization format. Use: Bearer <token>")
			return
		}

		token := parts[1]

		sessionToken := strings.Split(token, "|")

		var session models.SessionToken

		validSession := DB.Where("token = ? AND expires_at > NOW()", sessionToken[1]).First(&session)

		if validSession.Error != nil {
			writeJSONError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		var user models.User

		validUser := DB.Preload("Role").Where("id = ?", session.UserID).First(&user)

		if validUser.Error != nil {
			writeJSONError(w, http.StatusUnauthorized, "Invalid or expired token")
			return
		}

		updateSession := map[string]interface{}{
			"last_used_at": time.Now(),
		}

		result := DB.Model(&models.SessionToken{}).Where("id = ? AND user_id = ?", session.ID, user.ID).Updates(updateSession)

		if result.Error != nil {
			writeJSONError(w, http.StatusInternalServerError, "Failed to update user session")
			return
		}

		if result.RowsAffected == 0 {
			writeJSONError(w, http.StatusNotFound, "User session not found")
			return
		}

		ctx := cmscontext.WithUser(r.Context(), &user)

		next(w, r.WithContext(ctx))
	}
}

func IsAdminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := cmscontext.UserFrom(r.Context())
		if user == nil || user.Role.Name != "admin" {
			writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
			return
		}
		next(w, r)
	}
}

func IsStudentMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := cmscontext.UserFrom(r.Context())
		if user == nil || user.Role.Name != "student" {
			writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
			return
		}
		next(w, r)
	}
}

func IsInstructorMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := cmscontext.UserFrom(r.Context())
		if user == nil || user.Role.Name != "instructor" {
			writeJSONError(w, http.StatusUnauthorized, "Unauthorized")
			return
		}
		next(w, r)
	}
}
