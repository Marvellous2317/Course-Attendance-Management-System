package handlers

import (
	cmscontext "cms/context"
	"cms/models"
	"log"
	"net/http"
	"time"

	"gorm.io/gorm"
)

// AdminDashboard holds system-wide totals for the admin overview.
type AdminDashboard struct {
	TotalTeachers        int64    `json:"totalTeachers" example:"12"`
	TotalStudents        int64    `json:"totalStudents" example:"240"`
	TotalCourses         int64    `json:"totalCourses" example:"8"`
	TotalOfferings       int64    `json:"totalOfferings" example:"14"`
	TotalEnrollments     int64    `json:"totalEnrollments" example:"512"`
	AttendanceMarked     int64    `json:"attendanceMarked" example:"900"`
	AttendancePresent    int64    `json:"attendancePresent" example:"810"`
	AttendancePercentage *float64 `json:"attendancePercentage" example:"90"`
}

// AdminDashboardResponse is returned by GetAdminDashboard.
type AdminDashboardResponse struct {
	Message string         `json:"message" example:"Request successful"`
	Data    AdminDashboard `json:"data"`
}

// TeacherDashboard holds the totals for the teacher's own courses and sessions.
type TeacherDashboard struct {
	TotalCourses         int64    `json:"totalCourses" example:"3"`
	TotalOfferings       int64    `json:"totalOfferings" example:"4"`
	TotalStudents        int64    `json:"totalStudents" example:"38"`
	TotalSessions        int64    `json:"totalSessions" example:"24"`
	AttendanceMarked     int64    `json:"attendanceMarked" example:"300"`
	AttendancePresent    int64    `json:"attendancePresent" example:"270"`
	AttendancePercentage *float64 `json:"attendancePercentage" example:"90"`
}

// TeacherDashboardResponse is returned by GetTeacherDashboard.
type TeacherDashboardResponse struct {
	Message string           `json:"message" example:"Request successful"`
	Data    TeacherDashboard `json:"data"`
}

// StudentDashboard holds the totals for the student's own enrollments and attendance.
type StudentDashboard struct {
	EnrolledOfferings    int64    `json:"enrolledOfferings" example:"3"`
	UpcomingSessions     int64    `json:"upcomingSessions" example:"5"`
	AttendanceMarked     int64    `json:"attendanceMarked" example:"18"`
	AttendancePresent    int64    `json:"attendancePresent" example:"16"`
	AttendancePercentage *float64 `json:"attendancePercentage" example:"88.89"`
}

// StudentDashboardResponse is returned by GetStudentDashboard.
type StudentDashboardResponse struct {
	Message string           `json:"message" example:"Request successful"`
	Data    StudentDashboard `json:"data"`
}

// attendancePercentage returns present/marked as a percentage, or nil when nothing has been marked.
func attendancePercentage(present int64, marked int64) *float64 {
	if marked == 0 {
		return nil
	}

	percentage := float64(present) / float64(marked) * 100

	return &percentage
}

// GetAdminDashboard godoc
// @Summary      Admin dashboard
// @Description  Returns system-wide totals for teachers, students, courses, offerings, enrollments and attendance.
// @Tags         admin
// @Produce      json
// @Success      200  {object}  AdminDashboardResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/dashboard [get]
func (h *Handler) GetAdminDashboard(w http.ResponseWriter, r *http.Request) {
	var dashboard AdminDashboard

	countRole := func(roleName string) (int64, error) {
		var total int64
		err := h.DB.Model(&models.User{}).
			Joins("JOIN roles ON roles.id = users.role_id AND roles.deleted_at IS NULL").
			Where("roles.name = ?", roleName).
			Count(&total).Error
		return total, err
	}

	var err error

	if dashboard.TotalTeachers, err = countRole("instructor"); err != nil {
		h.dashboardError(w, "admin teachers", err)
		return
	}

	if dashboard.TotalStudents, err = countRole("student"); err != nil {
		h.dashboardError(w, "admin students", err)
		return
	}

	if err = h.DB.Model(&models.Course{}).Count(&dashboard.TotalCourses).Error; err != nil {
		h.dashboardError(w, "admin courses", err)
		return
	}

	if err = h.DB.Model(&models.CourseOffering{}).Count(&dashboard.TotalOfferings).Error; err != nil {
		h.dashboardError(w, "admin offerings", err)
		return
	}

	if err = h.DB.Table("enrollments").Count(&dashboard.TotalEnrollments).Error; err != nil {
		h.dashboardError(w, "admin enrollments", err)
		return
	}

	if err = h.DB.Model(&models.Attendance{}).Count(&dashboard.AttendanceMarked).Error; err != nil {
		h.dashboardError(w, "admin attendance", err)
		return
	}

	if err = h.DB.Model(&models.Attendance{}).Where("present = ?", true).Count(&dashboard.AttendancePresent).Error; err != nil {
		h.dashboardError(w, "admin attendance present", err)
		return
	}

	dashboard.AttendancePercentage = attendancePercentage(dashboard.AttendancePresent, dashboard.AttendanceMarked)

	writeJSON(w, http.StatusOK, AdminDashboardResponse{
		Message: "Request successful",
		Data:    dashboard,
	})
}

// GetTeacherDashboard godoc
// @Summary      Teacher dashboard
// @Description  Returns totals for the authenticated teacher's courses, offerings, enrolled students, sessions and attendance.
// @Tags         teacher
// @Produce      json
// @Success      200  {object}  TeacherDashboardResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/dashboard [get]
func (h *Handler) GetTeacherDashboard(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	var dashboard TeacherDashboard

	// Offerings this teacher instructs, joined to their sessions and enrollments.
	offerings := h.DB.Model(&models.CourseOffering{}).Where("course_offerings.instructor_id = ?", user.ID)

	var err error

	if err = h.DB.Model(&models.Course{}).
		Where("(courses.created_by = ? OR courses.id IN (SELECT course_id FROM course_teachers WHERE user_id = ?))", user.ID, user.ID).
		Count(&dashboard.TotalCourses).Error; err != nil {
		h.dashboardError(w, "teacher courses", err)
		return
	}

	if err = offerings.Count(&dashboard.TotalOfferings).Error; err != nil {
		h.dashboardError(w, "teacher offerings", err)
		return
	}

	if err = h.DB.Table("enrollments").
		Joins("JOIN course_offerings ON course_offerings.id = enrollments.course_offering_id AND course_offerings.deleted_at IS NULL").
		Where("course_offerings.instructor_id = ?", user.ID).
		Distinct("enrollments.user_id").
		Count(&dashboard.TotalStudents).Error; err != nil {
		h.dashboardError(w, "teacher students", err)
		return
	}

	sessions := h.DB.Model(&models.ClassSession{}).
		Joins("JOIN course_offerings ON course_offerings.id = class_sessions.course_offering_id AND course_offerings.deleted_at IS NULL").
		Where("course_offerings.instructor_id = ?", user.ID)

	if err = sessions.Count(&dashboard.TotalSessions).Error; err != nil {
		h.dashboardError(w, "teacher sessions", err)
		return
	}

	teacherMarks := func() *gorm.DB {
		return h.DB.Model(&models.Attendance{}).
			Joins("JOIN class_sessions ON class_sessions.id = attendances.class_session_id AND class_sessions.deleted_at IS NULL").
			Joins("JOIN course_offerings ON course_offerings.id = class_sessions.course_offering_id AND course_offerings.deleted_at IS NULL").
			Where("course_offerings.instructor_id = ?", user.ID)
	}

	if err = teacherMarks().Count(&dashboard.AttendanceMarked).Error; err != nil {
		h.dashboardError(w, "teacher attendance", err)
		return
	}

	if err = teacherMarks().Where("attendances.present = ?", true).Count(&dashboard.AttendancePresent).Error; err != nil {
		h.dashboardError(w, "teacher attendance present", err)
		return
	}

	dashboard.AttendancePercentage = attendancePercentage(dashboard.AttendancePresent, dashboard.AttendanceMarked)

	writeJSON(w, http.StatusOK, TeacherDashboardResponse{
		Message: "Request successful",
		Data:    dashboard,
	})
}

// GetStudentDashboard godoc
// @Summary      Student dashboard
// @Description  Returns totals for the authenticated student's enrollments, upcoming sessions and attendance.
// @Tags         student
// @Produce      json
// @Success      200  {object}  StudentDashboardResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /student/dashboard [get]
func (h *Handler) GetStudentDashboard(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	var dashboard StudentDashboard

	var err error

	if err = h.DB.Table("enrollments").Where("user_id = ?", user.ID).Count(&dashboard.EnrolledOfferings).Error; err != nil {
		h.dashboardError(w, "student enrollments", err)
		return
	}

	if err = h.DB.Model(&models.ClassSession{}).
		Joins("JOIN enrollments ON enrollments.course_offering_id = class_sessions.course_offering_id AND enrollments.user_id = ?", user.ID).
		Where("class_sessions.start_time > ?", time.Now()).
		Count(&dashboard.UpcomingSessions).Error; err != nil {
		h.dashboardError(w, "student upcoming sessions", err)
		return
	}

	studentMarks := func() *gorm.DB {
		return h.DB.Model(&models.Attendance{}).Where("user_id = ?", user.ID)
	}

	if err = studentMarks().Count(&dashboard.AttendanceMarked).Error; err != nil {
		h.dashboardError(w, "student attendance", err)
		return
	}

	if err = studentMarks().Where("present = ?", true).Count(&dashboard.AttendancePresent).Error; err != nil {
		h.dashboardError(w, "student attendance present", err)
		return
	}

	dashboard.AttendancePercentage = attendancePercentage(dashboard.AttendancePresent, dashboard.AttendanceMarked)

	writeJSON(w, http.StatusOK, StudentDashboardResponse{
		Message: "Request successful",
		Data:    dashboard,
	})
}

// dashboardError logs a dashboard query failure and sends a generic 500 response.
func (h *Handler) dashboardError(w http.ResponseWriter, query string, err error) {
	log.Printf("dashboard %s: %v", query, err)
	writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to load dashboard"})
}
