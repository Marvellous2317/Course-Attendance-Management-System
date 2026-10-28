package handlers

import (
	cmscontext "cms/context"
	"cms/models"
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

// ExportStudentAttendance godoc
// @Summary      Export my attendance as CSV
// @Description  Downloads the authenticated student's full attendance history as a CSV file.
// @Tags         student
// @Produce      text/csv
// @Success      200  {file}  file
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /student/attendance/export [get]
func (h *Handler) ExportStudentAttendance(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	var records []models.Attendance

	err := h.DB.
		Preload("ClassSession.CourseOffering.Course").
		Where("user_id = ?", user.ID).
		Order("id DESC").
		Find(&records).Error

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition",
		fmt.Sprintf(`attachment; filename="attendance_%d_%s.csv"`, user.ID, time.Now().Format("20060102")))

	cw := csv.NewWriter(w)

	cw.Write([]string{"Course Code", "Course Title", "Batch Code", "Session Topic", "Session Date", "Recorded At"})

	for _, a := range records {
		session := a.ClassSession
		offering := session.CourseOffering
		course := offering.Course

		cw.Write([]string{
			course.Code,
			course.Title,
			offering.BatchCode,
			session.Topic,
			session.StartTime.Format(time.RFC3339),
			a.CreatedAt.Format(time.RFC3339),
		})
	}

	cw.Flush()
}

// ExportTeacherStudents godoc
// @Summary      Export my students as CSV
// @Description  Downloads a CSV of every student enrolled across the authenticated teacher's course offerings.
// @Tags         teacher
// @Produce      text/csv
// @Success      200  {file}  file
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/students/export [get]
func (h *Handler) ExportTeacherStudents(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	var offerings []models.CourseOffering

	err := h.DB.
		Preload("Course").
		Preload("Students").
		Where("instructor_id = ?", user.ID).
		Find(&offerings).Error

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition",
		fmt.Sprintf(`attachment; filename="students_%d_%s.csv"`, user.ID, time.Now().Format("20060102")))

	cw := csv.NewWriter(w)

	cw.Write([]string{"Course Code", "Course Title", "Batch Code", "Student ID", "First Name", "Last Name", "Email"})

	for _, o := range offerings {
		for _, s := range o.Students {
			cw.Write([]string{
				o.Course.Code,
				o.Course.Title,
				o.BatchCode,
				strconv.FormatUint(uint64(s.ID), 10),
				s.FirstName,
				s.LastName,
				s.Email,
			})
		}
	}

	cw.Flush()
}

// GetAdminStudentEnrollments godoc
// @Summary      View a student's enrolled courses
// @Description  Returns the course offerings (with course and instructor info) that a given student is enrolled in. Admin only.
// @Tags         students
// @Produce      json
// @Param        id  path  int  true  "Student ID"
// @Success      200  {object}  OfferingListResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students/{id}/enrollments [get]
func (h *Handler) GetAdminStudentEnrollments(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Student ID"})
		return
	}

	var student models.User

	result := h.DB.Where("role_id = ?", studentRoleID).First(&student, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Student not found"})
		return
	}

	var offerings []models.CourseOffering

	err = h.DB.
		Preload("Course.CreatedByUser").
		Preload("Instructor").
		Joins("JOIN enrollments ON enrollments.course_offering_id = course_offerings.id").
		Where("enrollments.user_id = ?", student.ID).
		Order("course_offerings.id DESC").
		Find(&offerings).Error

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	response := make([]OfferingResponse, 0, len(offerings))
	for _, offering := range offerings {
		response = append(response, toOfferingResponse(offering))
	}

	total := int64(len(response))
	pp := len(response)
	if pp == 0 {
		pp = 1
	}

	writeJSON(w, http.StatusOK, OfferingListResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(total, 1, pp),
	})
}
