#!/bin/bash

# Ensure Go environment variables are set
export GOOS=linux   # Target OS for cross-compilation (adjust as needed)
export GOARCH=amd64 # Target architecture for cross-compilation

# Load environment variables (optional)
if [ -f "../.env" ]; then
    source ../.env
fi

# Build Go binary
echo "Building for $GOOS $GOARCH..."
go build -o ../build/bin/myapp ../src/main.go

# Additional commands if needed
# ...

echo "Build completed."
