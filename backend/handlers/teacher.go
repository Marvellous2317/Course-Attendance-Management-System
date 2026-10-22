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
)

// CourseCollectionResponse is returned by GetTeacherCourses.
type CourseCollectionResponse struct {
	Message string           `json:"message" example:"Request successful"`
	Data    []CourseResponse `json:"data"`
	Meta    PaginationMeta   `json:"meta"`
}

// UserSummary is the public summary of a user embedded in other responses.
type UserSummary struct {
	ID        uint   `json:"id" example:"12"`
	FirstName string `json:"firstName" example:"Grace"`
	LastName  string `json:"lastName" example:"Hopper"`
	Email     string `json:"email" example:"grace@example.com"`
}

// OfferingResponse is the public representation of a course offering (one scheduled batch of a course).
type OfferingResponse struct {
	ID           uint           `json:"id" example:"5"`
	ClassDate    time.Time      `json:"classDate"`
	StartTime    time.Time      `json:"startTime"`
	Duration     int            `json:"duration" example:"90"`
	Sessions     int            `json:"sessions" example:"12"`
	BatchCode    string         `json:"batchCode" example:"GO101-A"`
	CourseID     uint           `json:"courseId" example:"7"`
	Course       CourseResponse `json:"course"`
	InstructorID uint           `json:"instructorId" example:"12"`
	Instructor   UserSummary    `json:"instructor"`
}

// OfferingListResponse is returned by offering list endpoints.
type OfferingListResponse struct {
	Message string             `json:"message" example:"Request successful"`
	Data    []OfferingResponse `json:"data"`
	Meta    PaginationMeta     `json:"meta"`
}

// OfferingDataResponse is returned by CreateOffering.
type OfferingDataResponse struct {
	Message string           `json:"message" example:"Request successful"`
	Data    OfferingResponse `json:"data"`
}

// OfferingStudentsResponse is returned by GetOfferingStudents.
type OfferingStudentsResponse struct {
	Message string            `json:"message" example:"Request successful"`
	Data    []StudentResponse `json:"data"`
	Meta    PaginationMeta    `json:"meta"`
}

// CreateOfferingRequest is the payload accepted by CreateOffering.
// Duration is in minutes and Sessions is the number of class sessions in the batch.
type CreateOfferingRequest struct {
	ClassDate time.Time `json:"classDate" example:"2026-11-02T00:00:00Z"`
	StartTime time.Time `json:"startTime" example:"2026-11-02T09:00:00Z"`
	Duration  int       `json:"duration" example:"90"`
	Sessions  int       `json:"sessions" example:"12"`
	BatchCode string    `json:"batchCode" example:"GO101-A"`
}

func toOfferingResponse(offering models.CourseOffering) OfferingResponse {
	return OfferingResponse{
		ID:           offering.ID,
		ClassDate:    offering.ClassDate,
		StartTime:    offering.StartTime,
		Duration:     offering.Duration,
		Sessions:     offering.Sessions,
		BatchCode:    offering.BatchCode,
		CourseID:     offering.CourseID,
		Course:       toCourseResponse(offering.Course),
		InstructorID: offering.InstructorID,
		Instructor: UserSummary{
			ID:        offering.Instructor.ID,
			FirstName: offering.Instructor.FirstName,
			LastName:  offering.Instructor.LastName,
			Email:     offering.Instructor.Email,
		},
	}
}

// teachesCourse reports whether the user created the course or is assigned to teach it.
func (h *Handler) teachesCourse(userID uint, courseID uint) (bool, error) {
	var count int64

	err := h.DB.Model(&models.Course{}).
		Where("courses.id = ?", courseID).
		Where("(courses.created_by = ? OR courses.id IN (SELECT course_id FROM course_teachers WHERE user_id = ?))", userID, userID).
		Count(&count).Error

	return count > 0, err
}

// CreateTeacherCourse godoc
// @Summary      Create a course
// @Description  Creates a course owned by the authenticated teacher.
// @Tags         teacher
// @Accept       json
// @Produce      json
// @Param        request  body  CreateCourseRequest  true  "Course payload"
// @Success      201  {object}  CourseDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/courses [post]
func (h *Handler) CreateTeacherCourse(w http.ResponseWriter, r *http.Request) {
	h.CreateCourse(w, r)
}

// GetTeacherCourses godoc
// @Summary      List my courses
// @Description  Returns the courses the authenticated teacher created or is assigned to, newest first.
// @Tags         teacher
// @Produce      json
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  CourseCollectionResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/courses [get]
func (h *Handler) GetTeacherCourses(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	page, perPage, offset := parsePagination(r)

	scope := h.DB.Model(&models.Course{}).
		Where("(courses.created_by = ? OR courses.id IN (SELECT course_id FROM course_teachers WHERE user_id = ?))", user.ID, user.ID)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count teacher courses: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch courses"})
		return
	}

	var courses []models.Course

	if err := scope.Preload("CreatedByUser").Order("courses.id DESC").Limit(perPage).Offset(offset).Find(&courses).Error; err != nil {
		log.Printf("fetch teacher courses: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch courses"})
		return
	}

	response := make([]CourseResponse, 0, len(courses))
	for _, course := range courses {
		response = append(response, toCourseResponse(course))
	}

	writeJSON(w, http.StatusOK, CourseCollectionResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(total, page, perPage),
	})
}

// GetTeacherCourse godoc
// @Summary      Get one of my courses
// @Description  Returns a course the authenticated teacher created or is assigned to.
// @Tags         teacher
// @Produce      json
// @Param        id  path  int  true  "Course ID"
// @Success      200  {object}  CourseDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/courses/{id} [get]
func (h *Handler) GetTeacherCourse(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	allowed, err := h.teachesCourse(user.ID, uint(id))

	if err != nil {
		log.Printf("check course access: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch course"})
		return
	}

	if !allowed {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	var course models.Course

	if err := h.courseWithCreator().First(&course, id).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	writeJSON(w, http.StatusOK, CourseDataResponse{
		Message: "Request successful",
		Data:    toCourseResponse(course),
	})
}

// CreateOffering godoc
// @Summary      Create a course offering
// @Description  Schedules a batch of one of the teacher's courses. The authenticated teacher becomes the instructor. Students enroll in offerings, not courses.
// @Tags         teacher
// @Accept       json
// @Produce      json
// @Param        id       path  int                   true  "Course ID"
// @Param        request  body  CreateOfferingRequest  true  "Offering payload"
// @Success      201  {object}  OfferingDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      409  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/courses/{id}/offerings [post]
func (h *Handler) CreateOffering(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	courseID, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid course ID"})
		return
	}

	allowed, err := h.teachesCourse(user.ID, uint(courseID))

	if err != nil {
		log.Printf("check course access: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to create offering"})
		return
	}

	if !allowed {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course not found"})
		return
	}

	var input CreateOfferingRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	input.BatchCode = strings.TrimSpace(input.BatchCode)

	switch {
	case input.BatchCode == "" || len(input.BatchCode) > 10:
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "batchCode is required and must be at most 10 characters"})
		return
	case input.ClassDate.IsZero() || input.StartTime.IsZero():
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "classDate and startTime are required"})
		return
	case input.Duration <= 0:
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "duration must be greater than 0"})
		return
	case input.Sessions <= 0:
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "sessions must be greater than 0"})
		return
	}

	// batch_code is unique across soft-deleted rows too, so check without the deleted_at scope.
	var existing models.CourseOffering

	if err := h.DB.Unscoped().Where("batch_code = ?", input.BatchCode).First(&existing).Error; err == nil {
		writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Batch code already exists"})
		return
	}

	offering := models.CourseOffering{
		ClassDate:    input.ClassDate,
		StartTime:    input.StartTime,
		Duration:     input.Duration,
		Sessions:     input.Sessions,
		BatchCode:    input.BatchCode,
		CourseID:     uint(courseID),
		InstructorID: user.ID,
	}

	if err := h.DB.Create(&offering).Error; err != nil {
		log.Printf("create offering: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to create offering"})
		return
	}

	if err := h.DB.Preload("Course.CreatedByUser").Preload("Instructor").First(&offering, offering.ID).Error; err != nil {
		log.Printf("reload offering: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to load offering"})
		return
	}

	writeJSON(w, http.StatusCreated, OfferingDataResponse{
		Message: "Request successful",
		Data:    toOfferingResponse(offering),
	})
}

// GetTeacherOfferings godoc
// @Summary      List my offerings
// @Description  Returns the course offerings the authenticated teacher instructs, newest first.
// @Tags         teacher
// @Produce      json
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  OfferingListResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/offerings [get]
func (h *Handler) GetTeacherOfferings(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	page, perPage, offset := parsePagination(r)

	scope := h.DB.Model(&models.CourseOffering{}).Where("course_offerings.instructor_id = ?", user.ID)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count teacher offerings: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch offerings"})
		return
	}

	var offerings []models.CourseOffering

	err := scope.
		Preload("Course.CreatedByUser").
		Preload("Instructor").
		Order("course_offerings.id DESC").
		Limit(perPage).
		Offset(offset).
		Find(&offerings).Error

	if err != nil {
		log.Printf("fetch teacher offerings: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch offerings"})
		return
	}

	response := make([]OfferingResponse, 0, len(offerings))
	for _, offering := range offerings {
		response = append(response, toOfferingResponse(offering))
	}

	writeJSON(w, http.StatusOK, OfferingListResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(total, page, perPage),
	})
}

// GetOfferingStudents godoc
// @Summary      List students enrolled in my offering
// @Description  Returns the students enrolled in an offering the authenticated teacher instructs.
// @Tags         teacher
// @Produce      json
// @Param        id       path   int  true   "Offering ID"
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  OfferingStudentsResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /teacher/offerings/{id}/students [get]
func (h *Handler) GetOfferingStudents(w http.ResponseWriter, r *http.Request) {
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

	scope := h.DB.Model(&models.User{}).
		Joins("JOIN enrollments ON enrollments.user_id = users.id").
		Where("enrollments.course_offering_id = ?", offering.ID)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count offering students: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch students"})
		return
	}

	var students []models.User

	err = scope.
		Preload("Role").
		Order("users.id DESC").
		Limit(perPage).
		Offset(pageOffset).
		Find(&students).Error

	if err != nil {
		log.Printf("fetch offering students: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch students"})
		return
	}

	response := make([]StudentResponse, 0, len(students))
	for _, student := range students {
		response = append(response, toStudentResponse(student))
	}

	writeJSON(w, http.StatusOK, OfferingStudentsResponse{
		Message: "Request successful",
		Data:    response,
		Meta:    newPaginationMeta(total, page, perPage),
	})
}
