package handlers

import (
	"cms/models"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const studentRoleID uint = 3

// RoleSummary is the role information included in user responses.
type RoleSummary struct {
	ID          uint   `json:"id" example:"3"`
	Name        string `json:"name" example:"student"`
	Description string `json:"description,omitempty" example:"Student role"`
}

// StudentResponse is the public representation of a student.
type StudentResponse struct {
	ID        uint        `json:"id" example:"42"`
	CreatedAt time.Time   `json:"createdAt"`
	UpdatedAt time.Time   `json:"updatedAt"`
	DeletedAt *time.Time  `json:"deletedAt,omitempty"`
	FirstName string      `json:"firstName" example:"Ada"`
	LastName  string      `json:"lastName" example:"Lovelace"`
	Email     string      `json:"email" example:"ada@example.com"`
	RoleID    uint        `json:"roleID" example:"3"`
	Role      RoleSummary `json:"role"`
}

// PaginationMeta describes the pagination state of a list response.
type PaginationMeta struct {
	TotalRecords int64 `json:"totalRecords" example:"128"`
	TotalPages   int   `json:"totalPages" example:"7"`
	Page         int   `json:"page" example:"1"`
	PerPage      int   `json:"perPage" example:"20"`
}

// StudentListResponse is returned by GetAllStudents.
type StudentListResponse struct {
	Message string            `json:"message" example:"Request successful"`
	Data    []StudentResponse `json:"data"`
	Meta    PaginationMeta    `json:"meta"`
}

// StudentDataResponse is returned by GetStudent.
type StudentDataResponse struct {
	Message string          `json:"message" example:"Request successful"`
	Data    StudentResponse `json:"data"`
}

// CreateStudentRequest is the payload accepted by CreateStudent.
type CreateStudentRequest struct {
	FirstName string `json:"firstName" example:"Ada"`
	LastName  string `json:"lastName" example:"Lovelace"`
	Email     string `json:"email" example:"ada@example.com"`
	Password  string `json:"password" example:"secret123"`
}

// CreateStudentData is the data returned after creating a student.
type CreateStudentData struct {
	ID    uint   `json:"id" example:"42"`
	Email string `json:"email" example:"ada@example.com"`
}

// CreateStudentResponse is returned by CreateStudent.
type CreateStudentResponse struct {
	Message string            `json:"message" example:"Request successful"`
	Data    CreateStudentData `json:"data"`
}

// UpdateStudentRequest is the payload accepted by UpdateStudent.
type UpdateStudentRequest struct {
	FirstName string `json:"firstName" example:"Ada"`
	LastName  string `json:"lastName" example:"Lovelace"`
}

// StudentEmailData contains the student's email.
type StudentEmailData struct {
	Email string `json:"email" example:"ada@example.com"`
}

// StudentEmailResponse is returned by UpdateStudent.
type StudentEmailResponse struct {
	Message string           `json:"message" example:"Request successful"`
	Data    StudentEmailData `json:"data"`
}

// AssignOfferingsRequest is the payload accepted by the enrollment endpoints.
type AssignOfferingsRequest struct {
	OfferingIDs []uint `json:"offeringIds" example:"1,2,3"`
}

// OfferingAssignmentData describes the student's current enrollment assignment.
type OfferingAssignmentData struct {
	Email       string `json:"email" example:"ada@example.com"`
	OfferingIDs []uint `json:"offeringIds" example:"1,2,3"`
}

// OfferingAssignmentResponse is returned by AssignOfferings and UnassignOfferings.
type OfferingAssignmentResponse struct {
	Message string                 `json:"message" example:"Request successful"`
	Data    OfferingAssignmentData `json:"data"`
}

// MessageResponse is a generic success message.
type MessageResponse struct {
	Message string `json:"message" example:"Operation successful"`
}

// ErrorResponse is the standard error envelope used by the API.
type ErrorResponse struct {
	Error string `json:"error" example:"Student not found"`
}

func toStudentResponse(student models.User) StudentResponse {
	var deletedAt *time.Time
	if student.DeletedAt.Valid {
		deletedAt = &student.DeletedAt.Time
	}

	return StudentResponse{
		ID:        student.ID,
		CreatedAt: student.CreatedAt,
		UpdatedAt: student.UpdatedAt,
		DeletedAt: deletedAt,
		FirstName: student.FirstName,
		LastName:  student.LastName,
		Email:     student.Email,
		RoleID:    student.RoleID,
		Role: RoleSummary{
			ID:          student.Role.ID,
			Name:        student.Role.Name,
			Description: student.Role.Description,
		},
	}
}

func dedupeIDs(ids []uint) []uint {
	seen := make(map[uint]struct{}, len(ids))
	result := make([]uint, 0, len(ids))

	for _, id := range ids {
		if _, ok := seen[id]; ok {
			continue
		}

		seen[id] = struct{}{}
		result = append(result, id)
	}

	return result
}

// GetAllStudents godoc
// @Summary      List students
// @Description  Returns paginated students (role_id 3). Set isDeleted=true to list only soft-deleted students.
// @Tags         students
// @Produce      json
// @Param        page       query  int  false  "Page number"               default(1)
// @Param        perPage    query  int  false  "Items per page (max 50)"   default(20)
// @Param        isDeleted  query  bool false  "Only return deleted students"
// @Success      200  {object}  StudentListResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students [get]
func (h *Handler) GetAllStudents(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))

	if page <= 0 {
		page = 1
	}

	perPage, _ := strconv.Atoi(r.URL.Query().Get("perPage"))

	switch {
	case perPage <= 0:
		perPage = 20
	case perPage > 50:
		perPage = 50
	}

	offset := (page - 1) * perPage
	onlyDeleted := r.URL.Query().Get("isDeleted") == "true"

	countQuery := h.DB.Model(&models.User{}).Where("role_id = ?", studentRoleID)
	findQuery := h.DB.Preload("Role").Where("role_id = ?", studentRoleID)

	if onlyDeleted {
		countQuery = countQuery.Unscoped().Where("deleted_at IS NOT NULL")
		findQuery = findQuery.Unscoped().Where("deleted_at IS NOT NULL")
	}

	var totalRecords int64

	if err := countQuery.Count(&totalRecords).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	var students []models.User

	if err := findQuery.Order("-ID").Limit(perPage).Offset(offset).Find(&students).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	response := make([]StudentResponse, 0, len(students))
	for _, student := range students {
		response = append(response, toStudentResponse(student))
	}

	totalPages := int((totalRecords + int64(perPage) - 1) / int64(perPage))

	writeJSON(w, http.StatusOK, StudentListResponse{
		Message: "Request successful",
		Data:    response,
		Meta: PaginationMeta{
			TotalRecords: totalRecords,
			TotalPages:   totalPages,
			Page:         page,
			PerPage:      perPage,
		},
	})
}

// GetStudent godoc
// @Summary      Get a student
// @Description  Returns a single student by ID.
// @Tags         students
// @Produce      json
// @Param        id  path  int  true  "Student ID"
// @Success      200  {object}  StudentDataResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students/{id} [get]
func (h *Handler) GetStudent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Student ID"})
		return
	}

	var student models.User

	result := h.DB.Preload("Role").Where("role_id = ?", studentRoleID).First(&student, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Student not found"})
		return
	}

	writeJSON(w, http.StatusOK, StudentDataResponse{
		Message: "Request successful",
		Data:    toStudentResponse(student),
	})
}

// CreateStudent godoc
// @Summary      Create a student
// @Description  Creates a user with role_id 3. The password is hashed with bcrypt.
// @Tags         students
// @Accept       json
// @Produce      json
// @Param        request  body  CreateStudentRequest  true  "Student payload"
// @Success      201  {object}  CreateStudentResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      409  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students [post]
func (h *Handler) CreateStudent(w http.ResponseWriter, r *http.Request) {
	var input CreateStudentRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	input.FirstName = strings.TrimSpace(input.FirstName)
	input.LastName = strings.TrimSpace(input.LastName)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Password = strings.TrimSpace(input.Password)

	if input.FirstName == "" || input.LastName == "" || input.Email == "" || input.Password == "" {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "firstName, lastName, email and password are required"})
		return
	}

	var existingStudent models.User

	if err := h.DB.Unscoped().Where("LOWER(email) = ?", input.Email).First(&existingStudent).Error; err == nil {
		writeJSON(w, http.StatusConflict, ErrorResponse{Error: "Student already exists"})
		return
	}

	hashPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	newStudent := models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		RoleID:    studentRoleID,
		Password:  string(hashPassword),
	}

	if err := h.DB.Create(&newStudent).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, CreateStudentResponse{
		Message: "Request successful",
		Data: CreateStudentData{
			ID:    newStudent.ID,
			Email: newStudent.Email,
		},
	})
}

// UpdateStudent godoc
// @Summary      Update a student
// @Description  Updates a student's first and/or last name. The role cannot be changed through this endpoint.
// @Tags         students
// @Accept       json
// @Produce      json
// @Param        id       path  int                   true  "Student ID"
// @Param        request  body  UpdateStudentRequest  true  "Fields to update"
// @Success      200  {object}  StudentEmailResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students/{id} [patch]
func (h *Handler) UpdateStudent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Student ID"})
		return
	}

	var input UpdateStudentRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var existingStudent models.User

	result := h.DB.Where("role_id = ?", studentRoleID).First(&existingStudent, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Student not found"})
		return
	}

	if input.FirstName != "" {
		existingStudent.FirstName = strings.TrimSpace(input.FirstName)
	}

	if input.LastName != "" {
		existingStudent.LastName = strings.TrimSpace(input.LastName)
	}

	result = h.DB.Save(&existingStudent)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, StudentEmailResponse{
		Message: "Request successful",
		Data:    StudentEmailData{Email: existingStudent.Email},
	})
}

// DeleteStudent godoc
// @Summary      Delete a student
// @Description  Soft-deletes a student. Use the restore endpoint to undo.
// @Tags         students
// @Produce      json
// @Param        id  path  int  true  "Student ID"
// @Success      204  "No Content"
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students/{id} [delete]
func (h *Handler) DeleteStudent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Student ID"})
		return
	}

	var existingStudent models.User

	result := h.DB.Where("role_id = ?", studentRoleID).First(&existingStudent, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Student not found"})
		return
	}

	result = h.DB.Delete(&existingStudent)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusNoContent, nil)
}

// RestoreStudent godoc
// @Summary      Restore a student
// @Description  Clears the soft-delete timestamp of a student.
// @Tags         students
// @Produce      json
// @Param        id  path  int  true  "Student ID"
// @Success      200  {object}  MessageResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students/{id}/restore [patch]
func (h *Handler) RestoreStudent(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Student ID"})
		return
	}

	var existingStudent models.User

	result := h.DB.Unscoped().Where("role_id = ?", studentRoleID).First(&existingStudent, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Student not found"})
		return
	}

	result = h.DB.Unscoped().Model(&existingStudent).Update("DeletedAt", nil)

	if result.Error != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: result.Error.Error()})
		return
	}

	writeJSON(w, http.StatusOK, MessageResponse{Message: "Student restored successfully"})
}

// AssignOfferings godoc
// @Summary      Enroll a student in course offerings
// @Description  Replaces the student's current enrollments with the supplied course offering IDs. Send an empty array to clear all enrollments.
// @Tags         students
// @Accept       json
// @Produce      json
// @Param        id       path  int                      true  "Student ID"
// @Param        request  body  AssignOfferingsRequest  true  "Course offering IDs"
// @Success      200  {object}  OfferingAssignmentResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students/{id}/offerings [patch]
func (h *Handler) AssignOfferings(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Student ID"})
		return
	}

	var input AssignOfferingsRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	var existingStudent models.User

	result := h.DB.Where("role_id = ?", studentRoleID).First(&existingStudent, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Student not found"})
		return
	}

	offeringIDs := dedupeIDs(input.OfferingIDs)

	var offerings []models.CourseOffering

	if len(offeringIDs) > 0 {
		if err := h.DB.Where("id IN ?", offeringIDs).Find(&offerings).Error; err != nil {
			writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
			return
		}

		if len(offerings) != len(offeringIDs) {
			writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "One or more course offerings not found"})
			return
		}
	}

	err = h.DB.Transaction(func(tx *gorm.DB) error {
		return tx.Model(&existingStudent).Association("CourseOffered").Replace(offerings)
	})

	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, OfferingAssignmentResponse{
		Message: "Request successful",
		Data: OfferingAssignmentData{
			Email:       existingStudent.Email,
			OfferingIDs: offeringIDs,
		},
	})
}

// UnassignOfferings godoc
// @Summary      Unenroll a student from course offerings
// @Description  Removes the supplied course offering IDs from the student's enrollments. The offerings and courses are not deleted.
// @Tags         students
// @Accept       json
// @Produce      json
// @Param        id       path  int                      true  "Student ID"
// @Param        request  body  AssignOfferingsRequest  true  "Course offering IDs"
// @Success      200  {object}  OfferingAssignmentResponse
// @Failure      400  {object}  ErrorResponse
// @Failure      404  {object}  ErrorResponse
// @Failure      500  {object}  ErrorResponse
// @Security     BearerAuth
// @Router       /admin/students/{id}/offerings [delete]
func (h *Handler) UnassignOfferings(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(r.PathValue("id"))

	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid Student ID"})
		return
	}

	var input AssignOfferingsRequest

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: err.Error()})
		return
	}

	if len(input.OfferingIDs) == 0 {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "offeringIds is required"})
		return
	}

	var existingStudent models.User

	result := h.DB.Where("role_id = ?", studentRoleID).First(&existingStudent, id)

	if result.Error != nil {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "Student not found"})
		return
	}

	offeringIDs := dedupeIDs(input.OfferingIDs)

	var offerings []models.CourseOffering

	if err := h.DB.Where("id IN ?", offeringIDs).Find(&offerings).Error; err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	if len(offerings) != len(offeringIDs) {
		writeJSON(w, http.StatusNotFound, ErrorResponse{Error: "One or more course offerings not found"})
		return
	}

	// Many2many Delete removes the enrollments join rows only; it does not delete offerings.
	if err := h.DB.Model(&existingStudent).Association("CourseOffered").Delete(offerings); err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, OfferingAssignmentResponse{
		Message: "Request successful",
		Data: OfferingAssignmentData{
			Email:       existingStudent.Email,
			OfferingIDs: offeringIDs,
		},
	})
}
