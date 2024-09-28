package Config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	PRODUCTION = true
	SERVER_URL string
	API_KEY    string
)

func GoDotEnvVariable(key string) string {
	if PRODUCTION {
		return GetValuesInProd(key)
	}

	// Load .env file for local development
	err := godotenv.Load(".env")
	if err != nil {
		log.Println("Error loading .env file")
		// Handle the error, e.g., use default values or terminate the application
	}
	// Return the value of the environment variable

	return os.Getenv(key)
}

func GetValuesInProd(key string) string {
	switch key {
	case "SERVER_URL":
		return ``
	case "API_KEY":
		return ``
	}
	return ""
}
