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
	mux.HandleFunc("POST /api/register", chain(h.RegisterUser, public...))
	mux.HandleFunc("GET /api/profile", chain(h.LoginUser, user...))

	// role routes
	mux.HandleFunc("GET /api/admin/roles", chain(h.GetAllRoles, admin...))
	mux.HandleFunc("POST /api/admin/roles", chain(h.CreateRole, admin...))
	mux.HandleFunc("GET /api/admin/roles/{id}", chain(h.GetRole, admin...))
	mux.HandleFunc("PATCH /api/admin/roles/{id}", chain(h.UpdateRole, admin...))
	mux.HandleFunc("DELETE /api/admin/roles/{id}", chain(h.DeleteRole, admin...))

	return mux
}
