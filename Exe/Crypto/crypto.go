package Crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"fmt"
	"io"
)

func EncryptData(EncrypKey string, Data []byte) ([]byte, error) {
	keyBytes := []byte(EncrypKey)

	if len(keyBytes) != 32 {
		return nil, fmt.Errorf("encryption key must be 32 bytes long")
	}
	block, err := aes.NewCipher(keyBytes)
	if err != nil {
		return nil, err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	cipherText := gcm.Seal(nonce, nonce, Data, nil)

	return cipherText, nil
}
