package handlers

import (
	"net/http"
	"strconv"
)

// parsePagination reads page and perPage from the query string with the same defaults and limits as the existing list endpoints.
func parsePagination(r *http.Request) (page int, perPage int, offset int) {
	page, _ = strconv.Atoi(r.URL.Query().Get("page"))

	if page <= 0 {
		page = 1
	}

	perPage, _ = strconv.Atoi(r.URL.Query().Get("perPage"))

	switch {
	case perPage <= 0:
		perPage = 20
	case perPage > 50:
		perPage = 50
	}

	return page, perPage, (page - 1) * perPage
}

// newPaginationMeta builds the meta block for a paginated list.
func newPaginationMeta(total int64, page int, perPage int) PaginationMeta {
	return PaginationMeta{
		TotalRecords: total,
		TotalPages:   int((total + int64(perPage) - 1) / int64(perPage)),
		Page:         page,
		PerPage:      perPage,
	}
}

// pageOf returns one page of an in-memory slice, for lists that are built before they are paginated.
func pageOf[T any](items []T, page int, perPage int, offset int) ([]T, PaginationMeta) {
	meta := newPaginationMeta(int64(len(items)), page, perPage)

	if offset >= len(items) {
		return []T{}, meta
	}

	end := min(offset+perPage, len(items))

	return items[offset:end], meta
}
