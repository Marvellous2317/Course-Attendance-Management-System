package models

import (
	"time"

	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	Name        string `json:"name" gorm:"unique,not null,size:30"`
	Description string `json:"description,omitempty" gorm:"size:100"`
	Users       []User
}

type User struct {
	gorm.Model
	FirstName             string           `json:"first_name" gorm:"not null,size:150"`
	LastName              string           `json:"last_name" gorm:"not null,size:150"`
	Email                 string           `json:"email" gorm:"unique,not null,size:150,index"`
	RoleID                uint             `json:"role_id" gorm:"not null,index"`
	Role                  Role             `json:"role" gorm:"foreignKey:RoleID"`
	Password              string           `json:"-" gorm:"not null"`
	CourseCreated         []Course         `gorm:"foreignKey:CreatedBy"`
	CourseOffered         []CourseOffering `gorm:"many2many:enrollments"`
	Attendance            []Attendance
	Tokens                []SessionToken
	RequirePasswordChange bool `json:"require_password_change" gorm:"not null,default:true"`
}

type Course struct {
	gorm.Model
	Title         string `json:"title" gorm:"not null,size:150"`
	Description   string `json:"description,omitempty" gorm:"size:500"`
	Code          string `json:"code" gorm:"not null,size:10,unique"`
	CreatedBy     uint   `json:"created_by" gorm:"not null"`
	CreatedByUser User   `json:"created_by_user" gorm:"foreignKey:CreatedBy"`
}

type CourseOffering struct {
	gorm.Model
	ClassDate     time.Time `json:"class_date" gorm:"not null"`
	StartTime     time.Time `json:"start_time" gorm:"not null"`
	Duration      int       `json:"duration" gorm:"not null"`
	Sessions      int       `json:"sessions" gorm:"not null"`
	BatchCode     string    `json:"batch_code" gorm:"not null,size:10,unique"`
	CourseID      uint      `json:"course_id" gorm:"not null"`
	Course        Course    `json:"course" gorm:"foreignKey:CourseID"`
	InstructorID  uint      `json:"instructor_id" gorm:"not null"`
	Instructor    User      `json:"instructor" gorm:"foreignKey:InstructorID"`
	Students      []User    `gorm:"many2many:enrollments"`
	ClassSessions []ClassSession
}

type ClassSession struct {
	gorm.Model
	StartTime        time.Time      `json:"start_time" gorm:"not null"`
	EndTime          time.Time      `json:"end_time" gorm:"not null"`
	Topic            string         `json:"topic" gorm:"not null"`
	CourseOfferingID uint           `json:"course_offering_id" gorm:"not null"`
	CourseOffering   CourseOffering `json:"course_offering" gorm:"foreignKey:CourseOfferingID"`
	Attendance       []Attendance
}

type Attendance struct {
	gorm.Model
	UserID         uint         `json:"user_id" gorm:"not null"`
	User           User         `json:"user" gorm:"foreignKey:UserID"`
	ClassSessionID uint         `json:"class_session_id" gorm:"not null"`
	ClassSession   ClassSession `json:"class_session" gorm:"foreignKey:ClassSessionID"`
}

type SessionToken struct {
	gorm.Model
	Token                 string    `json:"token" gorm:"not null,size:255"`
	RefreshToken          string    `json:"refresh_token" gorm:"not null,size:255"`
	UserID                uint      `json:"user_id" gorm:"not null"`
	User                  User      `json:"user" gorm:"foreignKey:UserID"`
	LastUsedAt            time.Time `json:"last_used_at" gorm:"not null"`
	ExpiresAt             time.Time `json:"expires_at" gorm:"not null"`
	RefreshTokenExpiresAt time.Time `json:"refresh_token_expires_at" gorm:"not null"`
}
