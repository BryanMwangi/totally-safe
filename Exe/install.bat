@echo off

REM Ensure Go environment variables are set
set GOOS=windows  
set GOARCH=amd64   

REM Load environment variables (optional)


REM Build Go binary
go build -o ..\build\bin\myapp.exe ..\src\main.go

REM Additional commands if needed
REM ...

