package main

//go:generate go run github.com/swaggo/swag/cmd/swag init -g main.go -o docs --parseDependency

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"cms/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// @title           Course Attendance Management API
// @version         1.0
// @description     API for managing roles, courses, teachers, students, course offerings and attendance.
// @host            localhost:8080
// @BasePath        /api
// @schemes         http

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter "Bearer" followed by a space and the access token returned by POST /api/login.

// @tag.name auth
// @tag.description Login, registration, token refresh and profile
// @tag.name roles
// @tag.description Role administration
// @tag.name courses
// @tag.description Course administration
// @tag.name teachers
// @tag.description Teacher administration
// @tag.name students
// @tag.description Student administration
func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DATABASE_URL")

	var err error

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}

	err = DB.AutoMigrate(&models.User{}, &models.Role{}, &models.Course{}, &models.CourseOffering{}, &models.ClassSession{}, &models.Attendance{}, &models.SessionToken{})

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	fmt.Println("Database connected successfully")

	router := setupRouter()
	allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}
	handler := corsMiddleware(allowedOrigin, router)

	fmt.Println("Server is running on http://localhost:8080...")

	if err := http.ListenAndServe(":8080", handler); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
	}

}
