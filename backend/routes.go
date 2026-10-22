package main

import (
	"cms/handlers"
	"net/http"
	"os"

	_ "cms/docs"

	httpSwagger "github.com/swaggo/http-swagger/v2"
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
	mux.HandleFunc("POST /api/refresh", chain(h.RefreshToken, public...))
	mux.HandleFunc("POST /api/register", chain(h.RegisterUser, public...))
	mux.HandleFunc("GET /api/profile", chain(h.Profile, user...))
	mux.HandleFunc("POST /api/change-password", chain(h.ChangePassword, user...))

	// role routes
	mux.HandleFunc("GET /api/admin/roles", chain(h.GetAllRoles, admin...))
	mux.HandleFunc("POST /api/admin/roles", chain(h.CreateRole, admin...))
	mux.HandleFunc("GET /api/admin/roles/{id}", chain(h.GetRole, admin...))
	mux.HandleFunc("PATCH /api/admin/roles/{id}", chain(h.UpdateRole, admin...))
	mux.HandleFunc("DELETE /api/admin/roles/{id}", chain(h.DeleteRole, admin...))
	mux.HandleFunc("PATCH /api/admin/roles/{id}/restore", chain(h.RestoreRole, admin...))

	// courses routes
	mux.HandleFunc("GET /api/admin/courses", chain(h.GetAllCourses, admin...))
	mux.HandleFunc("POST /api/admin/courses", chain(h.CreateCourse, admin...))
	mux.HandleFunc("GET /api/admin/courses/{id}", chain(h.GetCourse, admin...))
	mux.HandleFunc("GET /api/admin/courses/{id}/teachers", chain(h.GetCourseTeachers, admin...))
	mux.HandleFunc("GET /api/admin/courses/{id}/students", chain(h.GetCourseStudents, admin...))
	mux.HandleFunc("PATCH /api/admin/courses/{id}", chain(h.UpdateCourse, admin...))
	mux.HandleFunc("DELETE /api/admin/courses/{id}", chain(h.DeleteCourse, admin...))
	mux.HandleFunc("PATCH /api/admin/courses/{id}/restore", chain(h.RestoreCourse, admin...))

	// teacher routes
	mux.HandleFunc("GET /api/admin/teachers", chain(h.GetAllTeachers, admin...))
	mux.HandleFunc("POST /api/admin/teachers", chain(h.CreateTeacher, admin...))
	mux.HandleFunc("GET /api/admin/teachers/{id}", chain(h.GetTeacher, admin...))
	mux.HandleFunc("PATCH /api/admin/teachers/{id}", chain(h.UpdateTeacher, admin...))
	mux.HandleFunc("PATCH /api/admin/teachers/{id}/courses", chain(h.AssignCourses, admin...))
	mux.HandleFunc("DELETE /api/admin/teachers/{id}/courses", chain(h.UnassignCourses, admin...))
	mux.HandleFunc("DELETE /api/admin/teachers/{id}", chain(h.DeleteTeacher, admin...))
	mux.HandleFunc("PATCH /api/admin/teachers/{id}/restore", chain(h.RestoreTeacher, admin...))

	// student routes
	mux.HandleFunc("GET /api/admin/students", chain(h.GetAllStudents, admin...))
	mux.HandleFunc("POST /api/admin/students", chain(h.CreateStudent, admin...))
	mux.HandleFunc("GET /api/admin/students/{id}", chain(h.GetStudent, admin...))
	mux.HandleFunc("PATCH /api/admin/students/{id}", chain(h.UpdateStudent, admin...))
	mux.HandleFunc("PATCH /api/admin/students/{id}/offerings", chain(h.AssignOfferings, admin...))
	mux.HandleFunc("DELETE /api/admin/students/{id}/offerings", chain(h.UnassignOfferings, admin...))
	mux.HandleFunc("DELETE /api/admin/students/{id}", chain(h.DeleteStudent, admin...))
	mux.HandleFunc("PATCH /api/admin/students/{id}/restore", chain(h.RestoreStudent, admin...))

	// teacher routes (scoped to the courses and offerings the teacher owns or teaches)
	mux.HandleFunc("POST /api/teacher/courses", chain(h.CreateTeacherCourse, instructor...))
	mux.HandleFunc("GET /api/teacher/courses", chain(h.GetTeacherCourses, instructor...))
	mux.HandleFunc("GET /api/teacher/courses/{id}", chain(h.GetTeacherCourse, instructor...))
	mux.HandleFunc("POST /api/teacher/courses/{id}/offerings", chain(h.CreateOffering, instructor...))
	mux.HandleFunc("GET /api/teacher/offerings", chain(h.GetTeacherOfferings, instructor...))
	mux.HandleFunc("GET /api/teacher/offerings/{id}/students", chain(h.GetOfferingStudents, instructor...))
	mux.HandleFunc("POST /api/teacher/offerings/{id}/sessions", chain(h.CreateSession, instructor...))
	mux.HandleFunc("GET /api/teacher/offerings/{id}/sessions", chain(h.ListSessions, instructor...))
	mux.HandleFunc("GET /api/teacher/sessions/{id}/attendance", chain(h.GetSessionAttendance, instructor...))
	mux.HandleFunc("PUT /api/teacher/sessions/{id}/attendance", chain(h.MarkAttendance, instructor...))
	mux.HandleFunc("GET /api/teacher/dashboard", chain(h.GetTeacherDashboard, instructor...))

	// student routes (scoped to the authenticated student)
	mux.HandleFunc("GET /api/student/offerings", chain(h.GetOfferingCatalogue, student...))
	mux.HandleFunc("GET /api/student/enrollments", chain(h.GetStudentEnrollments, student...))
	mux.HandleFunc("POST /api/student/enrollments", chain(h.EnrollStudent, student...))
	mux.HandleFunc("DELETE /api/student/enrollments/{offeringId}", chain(h.DropEnrollment, student...))
	mux.HandleFunc("GET /api/student/attendance", chain(h.GetMyAttendance, student...))
	mux.HandleFunc("GET /api/student/dashboard", chain(h.GetStudentDashboard, student...))

	// admin dashboard
	mux.HandleFunc("GET /api/admin/dashboard", chain(h.GetAdminDashboard, admin...))

	if os.Getenv("ENABLE_SWAGGER") == "true" {
		mux.Handle("GET /swagger/", httpSwagger.WrapHandler)
	}

	return mux
}
