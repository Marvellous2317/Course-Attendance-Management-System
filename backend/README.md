https://documenter.getpostman.com/view/33948032/2sBYB2q7NE

go build -o cms.exe

## API documentation (Swagger)

The OpenAPI spec is generated with [swag](https://github.com/swaggo/swag) from
annotations in `main.go` and `handlers/`. The UI is disabled unless
`ENABLE_SWAGGER=true`:

```sh
ENABLE_SWAGGER=true go run .
```

Then open <http://localhost:8080/swagger/index.html>. Use the **Authorize**
button with `Bearer <sessionID>|<token>` from `POST /api/login`.

Regenerate the spec after changing handlers or annotations:

```sh
go generate ./...
```

This runs `swag init -g main.go -o docs` and updates the generated files in
`docs/`.

## CORS

The API allows the local frontend at `http://localhost:3000` by default. Set
`CORS_ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins when
deploying, for example `https://app.example,https://admin.example`. The API
supports credentialed requests from those origins.