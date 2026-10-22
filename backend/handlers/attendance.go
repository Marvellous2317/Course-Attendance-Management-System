package handlers

import (
	cmscontext "cms/context"
	"cms/models"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm/clause"
)

// SessionResponse is the public representation of a class session.
type SessionResponse struct {
	ID         uint      `json:"id" example:"31"`
	OfferingID uint      `json:"offeringId" example:"5"`
	Topic      string    `json:"topic" example:"Week 1: Introduction"`
	StartTime  time.Time `json:"startTime"`
	EndTime    time.Time `json:"endTime"`
}

// SessionDataResponse is returned by CreateSession.
type SessionDataResponse struct {
	Message string          `json:"message" example:"Request successful"`
	Data    SessionResponse `json:"data"`
}

// SessionListResponse is returned by ListSessions.
type SessionListResponse struct {
	Message string            `json:"message" example:"Request successful"`
	Data    []SessionResponse `json:"data"`
	Meta    PaginationMeta    `json:"meta"`
}

// CreateSessionRequest is the payload accepted by CreateSession.
type CreateSessionRequest struct {
	Topic     string    `json:"topic" example:"Week 1: Introduction"`
	StartTime time.Time `json:"startTime" example:"2026-11-02T09:00:00Z"`
	EndTime   time.Time `json:"endTime" example:"2026-11-02T10:30:00Z"`
}

// AttendanceMark is one student's attendance for a session.
type AttendanceMark struct {
	StudentID uint `json:"studentId" example:"42"`
	Present   bool `json:"present" example:"true"`
}

// MarkAttendanceRequest is the payload accepted by MarkAttendance. Students not listed keep their current status.
type MarkAttendanceRequest struct {
	Records []AttendanceMark `json:"records"`
}

// AttendanceRosterEntry is an enrolled student with their status for one session.
// Present is null until attendance has been marked for that student.
type AttendanceRosterEntry struct {
	StudentID uint   `json:"studentId" example:"42"`
	FirstName string `json:"firstName" example:"Ada"`
	LastName  string `json:"lastName" example:"Lovelace"`
	Email     string `json:"email" example:"ada@example.com"`
	Present   *bool  `json:"present"`
}

// AttendanceRosterResponse is returned by GetSessionAttendance and MarkAttendance.
type AttendanceRosterResponse struct {
	Message string                  `json:"message" example:"Request successful"`
	Data    []AttendanceRosterEntry `json:"data"`
	Meta    PaginationMeta          `json:"meta"`
}

// AttendanceRecord is one class session in a student's attendance history.
// Present is null when attendance was not marked for that session.
type AttendanceRecord struct {
	SessionID uint      `json:"sessionId" example:"31"`
	Topic     string    `json:"topic" example:"Week 1: Introduction"`
	StartTime time.Time `json:"startTime"`
	Present   *bool     `json:"present"`
}

// OfferingAttendance summarises a student's attendance in one course offering.
// Percentage counts only sessions where attendance was marked and is null if none were.
type OfferingAttendance struct {
	OfferingID  uint               `json:"offeringId" example:"5"`
	BatchCode   string             `json:"batchCode" example:"GO101-A"`
	CourseTitle string             `json:"courseTitle" example:"Introduction to Go"`
	Marked      int                `json:"marked" example:"6"`
	Attended    int                `json:"attended" example:"5"`
	Percentage  *float64           `json:"percentage" example:"83.33"`
	Records     []AttendanceRecord `json:"records"`
}

// MyAttendanceResponse is returned by GetMyAttendance.
type MyAttendanceResponse struct {
	Message string               `json:"message" example:"Request successful"`
	Data    []OfferingAttendance `json:"data"`
	Meta    PaginationMeta       `json:"meta"`
}

// findOwnedSession returns the class session if it belongs to an offering the user instructs.
func (h *Handler) findOwnedSession(sessionID uint, userID uint) (models.ClassSession, error) {
	var session models.ClassSession

	err := h.DB.
		Select("class_sessions.*").
		Joins("JOIN course_offerings ON course_offerings.id = class_sessions.course_offering_id AND course_offerings.deleted_at IS NULL").
		Where("class_sessions.id = ? AND course_offerings.instructor_id = ?", sessionID, userID).
		First(&session).Error

	return session, err
}

// buildRoster lists the students enrolled in the session's offering with their status for that session.
func (h *Handler) buildRoster(session models.ClassSession) ([]AttendanceRosterEntry, error) {
	var students []models.User

	err := h.DB.
		Joins("JOIN enrollments ON enrollments.user_id = users.id").
		Where("enrollments.course_offering_id = ?", session.CourseOfferingID).
		Order("users.last_name ASC, users.first_name ASC").
		Find(&students).Error

	if err != nil {
		return nil, err
	}

	var rows []models.Attendance

	if err := h.DB.Where("class_session_id = ?", session.ID).Find(&rows).Error; err != nil {
		return nil, err
	}

	presentByStudent := make(map[uint]bool, len(rows))
	for _, row := range rows {
		presentByStudent[row.UserID] = row.Present
	}

	roster := make([]AttendanceRosterEntry, 0, len(students))
	for _, student := range students {
		entry := AttendanceRosterEntry{
			StudentID: student.ID,
			FirstName: student.FirstName,
			LastName:  student.LastName,
			Email:     student.Email,
		}

		if present, ok := presentByStudent[student.ID]; ok {
			entry.Present = &present
		}

		roster = append(roster, entry)
	}

	return roster, nil
}

// CreateSession godoc
// @Summary      Create a class session
// @Description  Adds a class session to one of the teacher's offerings.
// @Tags         teacher
// @Accept       json
// @Produce      json
// @Param        id       path  int                  true  "Offering ID"
// @Param        request  body  CreateSessionRequest  true  "Session payload"
// @Success      201  {object}  SessionDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/offerings/{id}/sessions [post]
func (h *Handler) CreateSession(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	offeringID, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid offering ID"})
		return
	}

	var offering models.CourseOffering

	if err := h.DB.Where("instructor_id = ?", user.ID).First(&offering, offeringID).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Offering not found"})
		return
	}

	var input CreateSessionRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	input.Topic = strings.TrimSpace(input.Topic)

	switch {
	case input.Topic == "":
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "topic is required"})
		return
	case input.StartTime.IsZero() || input.EndTime.IsZero():
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "startTime and endTime are required"})
		return
	case !input.EndTime.After(input.StartTime):
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "endTime must be after startTime"})
		return
	}

	session := models.ClassSession{
		Topic:            input.Topic,
		StartTime:        input.StartTime,
		EndTime:          input.EndTime,
		CourseOfferingID: offering.ID,
	}

	if err := h.DB.Create(&session).Error; err != nil {
		log.Printf("create class session: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to create session"})
		return
	}

	writeJSON(w, http.StatusCreated, SessionDataResponse{
		Message: "Request successful",
		Data: SessionResponse{
			ID:         session.ID,
			OfferingID: session.CourseOfferingID,
			Topic:      session.Topic,
			StartTime:  session.StartTime,
			EndTime:    session.EndTime,
		},
	})
}

// ListSessions godoc
// @Summary      List class sessions
// @Description  Returns the class sessions of one of the teacher's offerings, in chronological order.
// @Tags         teacher
// @Produce      json
// @Param        id       path   int  true   "Offering ID"
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  SessionListResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/offerings/{id}/sessions [get]
func (h *Handler) ListSessions(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	offeringID, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid offering ID"})
		return
	}

	var offering models.CourseOffering

	if err := h.DB.Where("instructor_id = ?", user.ID).First(&offering, offeringID).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Offering not found"})
		return
	}

	page, perPage, pageOffset := parsePagination(r)

	scope := h.DB.Model(&models.ClassSession{}).Where("course_offering_id = ?", offering.ID)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count class sessions: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch sessions"})
		return
	}

	var sessions []models.ClassSession

	if err := scope.Order("start_time ASC").Limit(perPage).Offset(pageOffset).Find(&sessions).Error; err != nil {
		log.Printf("list class sessions: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch sessions"})
		return
	}

	response := make([]SessionResponse, 0, len(sessions))
	for _, session := range sessions {
		response = append(response, SessionResponse{
			ID:         session.ID,
			OfferingID: session.CourseOfferingID,
			Topic:      session.Topic,
			StartTime:  session.StartTime,
			EndTime:    session.EndTime,
		})
	}

	writeJSON(w, http.StatusOK, SessionListResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(total, page, perPage),
	})
}

// GetSessionAttendance godoc
// @Summary      Get attendance for a session
// @Description  Returns every student enrolled in the session's offering with their attendance status. Present is null if not yet marked.
// @Tags         teacher
// @Produce      json
// @Param        id       path   int  true   "Session ID"
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  AttendanceRosterResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/sessions/{id}/attendance [get]
func (h *Handler) GetSessionAttendance(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	sessionID, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid session ID"})
		return
	}

	session, err := h.findOwnedSession(uint(sessionID), user.ID)

	if err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Session not found"})
		return
	}

	roster, err := h.buildRoster(session)

	if err != nil {
		log.Printf("build attendance roster: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch attendance"})
		return
	}

	page, perPage, pageOffset := parsePagination(r)
	data, meta := pageOf(roster, page, perPage, pageOffset)

	writeJSON(w, http.StatusOK, AttendanceRosterResponse{
		Message: "Request successful",
		Data:    data,
		Meta:    meta,
	})
}

// MarkAttendance godoc
// @Summary      Mark attendance
// @Description  Sets present or absent for enrolled students in a session the teacher instructs. Re-marking a student overwrites their status. Students not in the list are left unchanged.
// @Tags         teacher
// @Accept       json
// @Produce      json
// @Param        id       path  int                   true  "Session ID"
// @Param        request  body  MarkAttendanceRequest  true  "Attendance records"
// @Success      200  {object}  AttendanceRosterResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/sessions/{id}/attendance [put]
func (h *Handler) MarkAttendance(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	sessionID, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid session ID"})
		return
	}

	session, err := h.findOwnedSession(uint(sessionID), user.ID)

	if err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Session not found"})
		return
	}

	var input MarkAttendanceRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if len(input.Records) == 0 {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "records is required"})
		return
	}

	// If a student appears twice, the last entry wins.
	presentByStudent := make(map[uint]bool, len(input.Records))
	studentIDs := make([]uint, 0, len(input.Records))

	for _, record := range input.Records {
		if _, seen := presentByStudent[record.StudentID]; !seen {
			studentIDs = append(studentIDs, record.StudentID)
		}
		presentByStudent[record.StudentID] = record.Present
	}

	var enrolledIDs []uint

	err = h.DB.Table("enrollments").
		Where("course_offering_id = ? AND user_id IN ?", session.CourseOfferingID, studentIDs).
		Pluck("user_id", &enrolledIDs).Error

	if err != nil {
		log.Printf("check enrollments for attendance: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to mark attendance"})
		return
	}

	if len(enrolledIDs) != len(studentIDs) {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "One or more students are not enrolled in this offering"})
		return
	}

	rows := make([]models.Attendance, 0, len(studentIDs))
	for _, studentID := range studentIDs {
		rows = append(rows, models.Attendance{
			UserID:         studentID,
			ClassSessionID: session.ID,
			Present:        presentByStudent[studentID],
		})
	}

	err = h.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "class_session_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"present", "updated_at"}),
	}).Create(&rows).Error

	if err != nil {
		log.Printf("save attendance: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to mark attendance"})
		return
	}

	roster, err := h.buildRoster(session)

	if err != nil {
		log.Printf("build attendance roster: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch attendance"})
		return
	}

	page, perPage, pageOffset := parsePagination(r)
	data, meta := pageOf(roster, page, perPage, pageOffset)

	writeJSON(w, http.StatusOK, AttendanceRosterResponse{
		Message: "Request successful",
		Data:    data,
		Meta:    meta,
	})
}

// GetMyAttendance godoc
// @Summary      My attendance
// @Description  Returns the authenticated student's attendance for each offering they are enrolled in, including per-session records and an attendance percentage over the sessions that were marked.
// @Tags         student
// @Produce      json
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  MyAttendanceResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /student/attendance [get]
func (h *Handler) GetMyAttendance(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	page, perPage, pageOffset := parsePagination(r)

	scope := h.DB.Model(&models.CourseOffering{}).
		Joins("JOIN enrollments ON enrollments.course_offering_id = course_offerings.id").
		Where("enrollments.user_id = ?", user.ID)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count student offerings for attendance: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch attendance"})
		return
	}

	var offerings []models.CourseOffering

	err := scope.
		Preload("Course").
		Order("course_offerings.id DESC").
		Limit(perPage).
		Offset(pageOffset).
		Find(&offerings).Error

	if err != nil {
		log.Printf("fetch student offerings for attendance: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch attendance"})
		return
	}

	response := make([]OfferingAttendance, 0, len(offerings))
	meta := newPaginationMeta(total, page, perPage)

	if len(offerings) == 0 {
		writeJSON(w, http.StatusOK, MyAttendanceResponse{Message: "Request successful", Data: response, Meta: meta})
		return
	}

	offeringIDs := make([]uint, 0, len(offerings))
	for _, offering := range offerings {
		offeringIDs = append(offeringIDs, offering.ID)
	}

	var sessions []models.ClassSession

	if err := h.DB.Where("course_offering_id IN ?", offeringIDs).Order("start_time ASC").Find(&sessions).Error; err != nil {
		log.Printf("fetch sessions for attendance: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch attendance"})
		return
	}

	sessionIDs := make([]uint, 0, len(sessions))
	for _, session := range sessions {
		sessionIDs = append(sessionIDs, session.ID)
	}

	presentBySession := make(map[uint]bool)

	if len(sessionIDs) > 0 {
		var rows []models.Attendance

		if err := h.DB.Where("user_id = ? AND class_session_id IN ?", user.ID, sessionIDs).Find(&rows).Error; err != nil {
			log.Printf("fetch attendance rows: %v", err)
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch attendance"})
			return
		}

		for _, row := range rows {
			presentBySession[row.ClassSessionID] = row.Present
		}
	}

	recordsByOffering := make(map[uint][]AttendanceRecord)

	for _, session := range sessions {
		record := AttendanceRecord{
			SessionID: session.ID,
			Topic:     session.Topic,
			StartTime: session.StartTime,
		}

		if present, ok := presentBySession[session.ID]; ok {
			record.Present = &present
		}

		recordsByOffering[session.CourseOfferingID] = append(recordsByOffering[session.CourseOfferingID], record)
	}

	for _, offering := range offerings {
		summary := OfferingAttendance{
			OfferingID:  offering.ID,
			BatchCode:   offering.BatchCode,
			CourseTitle: offering.Course.Title,
			Records:     make([]AttendanceRecord, 0),
		}

		for _, record := range recordsByOffering[offering.ID] {
			summary.Records = append(summary.Records, record)

			if record.Present != nil {
				summary.Marked++
				if *record.Present {
					summary.Attended++
				}
			}
		}

		if summary.Marked > 0 {
			percentage := float64(summary.Attended) / float64(summary.Marked) * 100
			summary.Percentage = &percentage
		}

		response = append(response, summary)
	}

	writeJSON(w, http.StatusOK, MyAttendanceResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    meta,
	})
}
