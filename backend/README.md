https://documenter.getpostman.com/view/33948032/2sBYB2q7NE

go mod init todo && go build -o todo.exe

go mod init todo && go build -o todo.exe

go build -o cms.exe

## CORS

The API allows the local frontend at `http://localhost:3000` by default. Set
`CORS_ALLOWED_ORIGINS` to a comma-separated list of exact frontend origins when
deploying, for example `https://app.example,https://admin.example`. The API
supports credentialed requests from those origins.