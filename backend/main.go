package main

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

	fmt.Println("Server is running on http://localhost:8080...")

	if err := http.ListenAndServe(":8080", router); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
	}

}
