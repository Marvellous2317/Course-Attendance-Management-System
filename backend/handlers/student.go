package handlers

import (
	cmscontext "cms/context"
	"cms/models"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"gorm.io/gorm"
)

// GetOfferingCatalogue godoc
// @Summary      Browse course offerings
// @Description  Returns every active course offering with its course and instructor, newest first. Use the enrollments endpoint to enroll.
// @Tags         student
// @Produce      json
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  OfferingListResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /student/offerings [get]
func (h *Handler) GetOfferingCatalogue(w http.ResponseWriter, r *http.Request) {
	page, perPage, offset := parsePagination(r)

	scope := h.DB.Model(&models.CourseOffering{}).
		Joins("JOIN courses ON courses.id = course_offerings.course_id AND courses.deleted_at IS NULL")

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count offering catalogue: %v", err)
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
		log.Printf("fetch offering catalogue: %v", err)
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

// GetStudentEnrollments godoc
// @Summary      List my enrollments
// @Description  Returns the course offerings the authenticated student is enrolled in, newest first.
// @Tags         student
// @Produce      json
// @Param        page     query  int  false  "Page number"              default(1)
// @Param        perPage  query  int  false  "Items per page (max 50)"  default(20)
// @Success      200  {object}  OfferingListResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /student/enrollments [get]
func (h *Handler) GetStudentEnrollments(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	page, perPage, offset := parsePagination(r)

	scope := h.DB.Model(&models.CourseOffering{}).
		Joins("JOIN enrollments ON enrollments.course_offering_id = course_offerings.id").
		Where("enrollments.user_id = ?", user.ID)

	var total int64

	if err := scope.Count(&total).Error; err != nil {
		log.Printf("count student enrollments: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch enrollments"})
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
		log.Printf("fetch student enrollments: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to fetch enrollments"})
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

// EnrollStudent godoc
// @Summary      Enroll in course offerings
// @Description  Adds the authenticated student to the given offerings. Existing enrollments are kept.
// @Tags         student
// @Accept       json
// @Produce      json
// @Param        request  body  AssignOfferingsRequest  true  "Course offering IDs"
// @Success      200  {object}  OfferingAssignmentResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /student/enrollments [post]
func (h *Handler) EnrollStudent(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	var input AssignOfferingsRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if len(input.OfferingIDs) == 0 {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "offeringIds is required"})
		return
	}

	offeringIDs := dedupeIDs(input.OfferingIDs)

	var offerings []models.CourseOffering

	if err := h.DB.Where("id IN ?", offeringIDs).Find(&offerings).Error; err != nil {
		log.Printf("find offerings to enroll: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to enroll"})
		return
	}

	if len(offerings) != len(offeringIDs) {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "One or more course offerings not found"})
		return
	}

	// Append keeps the student's existing enrollments.
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		return tx.Model(user).Association("CourseOffered").Append(offerings)
	})

	if err != nil {
		log.Printf("enroll student: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to enroll"})
		return
	}

	writeJSON(w, http.StatusOK, OfferingAssignmentResponse{
		Message: "Request successful",
		Data: OfferingAssignmentData{
			Email:       user.Email,
			OfferingIDs: offeringIDs,
		},
	})
}

// DropEnrollment godoc
// @Summary      Drop a course offering
// @Description  Removes the authenticated student's enrollment in an offering. The offering and any attendance already recorded are kept.
// @Tags         student
// @Produce      json
// @Param        offeringId  path  int  true  "Course offering ID"
// @Success      200  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /student/enrollments/{offeringId} [delete]
func (h *Handler) DropEnrollment(w http.ResponseWriter, r *http.Request) {
	user := cmscontext.UserFrom(r.Context())

	offeringID, err := strconv.Atoi(r.PathValue("offeringId"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid offering ID"})
		return
	}

	var offering models.CourseOffering

	if err := h.DB.First(&offering, offeringID).Error; err != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Course offering not found"})
		return
	}

	var enrolled int64

	if err := h.DB.Table("enrollments").Where("user_id = ? AND course_offering_id = ?", user.ID, offering.ID).Count(&enrolled).Error; err != nil {
		log.Printf("check enrollment: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to drop enrollment"})
		return
	}

	if enrolled == 0 {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Enrollment not found"})
		return
	}

	// Many2many Delete removes the enrollments join row only; the offering itself is kept.
	if err := h.DB.Model(user).Association("CourseOffered").Delete(&offering); err != nil {
		log.Printf("drop enrollment: %v", err)
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: "Failed to drop enrollment"})
		return
	}

	writeJSON(w, http.StatusOK, MessageResponse{Message: "Enrollment dropped successfully"})
}
