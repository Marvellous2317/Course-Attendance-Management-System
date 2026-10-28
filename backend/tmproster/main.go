package main

import (
	cmscontext "cms/context"
	"cms/handlers"
	"cms/models"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	_ = godotenv.Load()
	db, err := gorm.Open(postgres.Open(os.Getenv("DATABASE_URL")), &gorm.Config{Logger: logger.Discard})
	if err != nil {
		log.Fatal(err)
	}

	h := handlers.New(db)

	var offerings []models.CourseOffering
	if err := db.Order("id ASC").Find(&offerings).Error; err != nil {
		log.Fatal(err)
	}

	fmt.Printf("total offerings: %d\n", len(offerings))

	for _, offering := range offerings {
		var sessions []models.ClassSession
		db.Where("course_offering_id = ?", offering.ID).Order("start_time ASC").Find(&sessions)

		var enrolled int64
		db.Table("enrollments").Where("course_offering_id = ?", offering.ID).Count(&enrolled)

		var marked int64
		if len(sessions) > 0 {
			ids := make([]uint, 0, len(sessions))
			for _, s := range sessions {
				ids = append(ids, s.ID)
			}
			db.Model(&models.Attendance{}).Where("class_session_id IN ?", ids).Count(&marked)
		}

		fmt.Printf("  offering %d instructor=%d (%s): sessions=%d enrolled=%d attendanceRows=%d\n",
			offering.ID, offering.InstructorID, offering.BatchCode, len(sessions), enrolled, marked)

		if len(sessions) == 0 || enrolled == 0 {
			continue
		}

		teacher := models.User{}
		teacher.ID = offering.InstructorID

		sessionID := sessions[0].ID

		req := httptest.NewRequest(http.MethodGet, "/api/teacher/sessions/"+strconv.Itoa(int(sessionID))+"/attendance?page=1&perPage=50", nil)
		req = req.WithContext(cmscontext.WithUser(req.Context(), &teacher))
		req.SetPathValue("id", strconv.Itoa(int(sessionID)))

		rec := httptest.NewRecorder()
		h.GetSessionAttendance(rec, req)

		body := rec.Body.String()
		if len(body) > 800 {
			body = body[:800] + "..."
		}
		fmt.Printf("    GET session %d attendance [%d]: %s\n", sessionID, rec.Code, body)
		break
	}
}
