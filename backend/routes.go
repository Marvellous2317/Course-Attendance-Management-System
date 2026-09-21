package main

import (
	"cms/handlers"
	"net/http"
)

var (
	public = []Middleware{
		LoggingMiddleware,
	}
	user = []Middleware{
		LoggingMiddleware, AuthMiddleware,
	}
	admin = []Middleware{
		LoggingMiddleware, AuthMiddleware, IsAdminMiddleware,
	}
	instructor = []Middleware{
		LoggingMiddleware, AuthMiddleware, IsInstructorMiddleware,
	}
	student = []Middleware{
		LoggingMiddleware, AuthMiddleware, IsStudentMiddleware,
	}
)

func setupRouter() *http.ServeMux {
	mux := http.NewServeMux()

	h := handlers.New(DB)

	// auth routes
	mux.HandleFunc("POST /api/login", chain(h.LoginUser, public...))
	mux.HandleFunc("GET /api/profile", chain(h.LoginUser, user...))

	// role routes
	mux.HandleFunc("GET /api/roles", chain(h.GetAllRoles, admin...))
	mux.HandleFunc("GET /api/roles/{id}", chain(h.GetRole, admin...))
	mux.HandleFunc("POST /api/roles/{id}", chain(h.GetRole, admin...))
	mux.HandleFunc("PATCH /api/roles/{id}", chain(h.GetRole, admin...))
	mux.HandleFunc("DELETE /api/roles/{id}", chain(h.GetRole, admin...))

	return mux
}
