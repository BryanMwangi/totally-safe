package Utils

import (
	"encoding/json"
	"fmt"
	"github/BryanMwangi/totally-safe/exe/Config"
	"github/BryanMwangi/totally-safe/exe/Models"
	"io"
	"net/http"
)

var Url = Config.GoDotEnvVariable("SERVER_URL")
var Api_key = Config.GoDotEnvVariable("API_KEY")

func MakeGetRequest(URL string) ([]byte, error) {
	client := &http.Client{}
	req, err := http.NewRequest("GET", URL, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("authorization", Api_key)

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d, response: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

func MakePostRequest(URL string) ([]byte, error) {
	req, err := http.NewRequest("POST", URL, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// Optional: Add headers if needed
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", Api_key)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making POST request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d, response: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

func UnMarshalKey() (Models.KeyResponse, error) {
	getKeyUrl := Url + "generator/key"
	body, err := MakeGetRequest(getKeyUrl)
	if err != nil {
		return Models.KeyResponse{}, err
	}

	var keyResponse Models.KeyResponse
	err = json.Unmarshal(body, &keyResponse)
	if err != nil {
		return Models.KeyResponse{}, err
	}

	return keyResponse, nil
}

func SendSuccessEncrypt(KeyID string) {
	postUrl := fmt.Sprintf(Url + "encryptionSuccess/" + KeyID)
	_, err := MakePostRequest(postUrl)
	if err != nil {
		return
	}
}
