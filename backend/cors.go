package main

import (
	"net/http"
	"strings"
)

func corsMiddleware(allowedOriginsStr string, next http.Handler) http.Handler {
	rawOrigins := strings.Split(allowedOriginsStr, ",")
	origins := make([]string, 0, len(rawOrigins))
	for _, o := range rawOrigins {
		cleaned := strings.TrimSpace(strings.TrimRight(o, "/"))
		if cleaned != "" {
			origins = append(origins, cleaned)
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimRight(r.Header.Get("Origin"), "/")
		w.Header().Add("Vary", "Origin")

		isAllowed := false
		for _, o := range origins {
			if o == "*" || (origin != "" && o == origin) {
				isAllowed = true
				break
			}
		}

		if isAllowed && origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
