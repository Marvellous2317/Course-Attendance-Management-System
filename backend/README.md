https://documenter.getpostman.com/view/33948032/2sBYB2q7NE

go build -o cms.exe

## CORS

The API allows the frontend origin configured by `CORS_ALLOWED_ORIGIN`. For local
development, it defaults to `http://localhost:3000`. Set this variable in the
backend `.env` file to the frontend's exact origin when it runs elsewhere, for
example `CORS_ALLOWED_ORIGIN=https://app.example.com`.

The middleware supports credentialed requests and allows the `Content-Type` and
`Authorization` headers.