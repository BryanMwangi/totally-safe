import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { logger } from "../Logs/logs.js";

const ecnryption_method = process.env.ENCRYPTION_METHOD;
const DecryptKey = Buffer.from(process.env.ENCRYPTION_KEY);

const keyFile = path.join(`${process.env.STORAGE_PATH}Keys/.key`);
//load JSON
const loadKeys = async () => {
  try {
    const keyFileContent = await fs.readFile(keyFile, "utf-8");

    if (!keyFileContent.trim()) {
      // If the file is empty or contains only whitespace characters
      logger.error(
        `Key file '${keyFile}' is empty. Initializing new key store.`
      );
      return {}; // Return an empty object
    }

    const decryptedJSON = await decryptJSON(keyFileContent, DecryptKey);
    return decryptedJSON;
  } catch (error) {
    if (error.code === "ENOENT") {
      // If the file does not exist
      logger.error(
        `Key file '${keyFile}' not found. Initializing new key store.`
      );
      return {}; // Return an empty object
    } else {
      logger.error(`Error reading key file: ${error.message}`);
      throw error;
    }
  }
};
const generateKey = async () => {
  // Generate key for AES-256-CBC encryption
  const key = crypto.randomBytes(16).toString("hex"); // 16 bytes -> 32 hex characters
  const keyId = crypto.randomBytes(8).toString("hex"); // 8 bytes -> 16 hex characters

  // Save key after encryption
  await saveKeyToLocalFile(keyId, key);
  return { key: key, keyId: keyId };
};

const saveKeyToLocalFile = async (keyId, key) => {
  if (key && keyId && key.length === 32 && keyId.length === 16) {
    try {
      const keys = await loadKeys();
      const data = {
        ...keys,
        [keyId]: key,
      };
      // Encrypt the data
      const encryptedJSON = await encryptJSON(data, DecryptKey);
      // Save the encrypted data to a file
      await fs.writeFile(keyFile, encryptedJSON);
    } catch (err) {
      logger.error(`Error saving key to file: ${err}`);
      throw err;
    }
  } else {
    logger.error(`Invalid key or keyId: ${key} ${keyId}`);
    throw new Error("Invalid key or keyId");
  }
};

const getSavedKey = async (keyId) => {
  const keys = await loadKeys();
  const hexKey = keys[keyId];
  return hexKey ? hexKey : null;
};

const encryptJSON = async (data, key) => {
  if (data) {
    try {
      const jsonData = JSON.stringify(data);

      const encryptionIV = crypto.randomBytes(parseInt(process.env.IV_LENGTH));
      const cipher = crypto.createCipheriv(
        ecnryption_method,
        key,
        encryptionIV
      );

      // Encrypt the JSON data
      let encrypted = cipher.update(jsonData, "utf8", "hex");
      encrypted += cipher.final("hex");

      // Combine IV and encrypted data
      const combinedData = encryptionIV.toString("hex") + ":" + encrypted;

      return combinedData;
    } catch (error) {
      logger.error(`Error encrypting JSON data: ${error.message}`);
      throw error;
    }
  } else {
    throw new Error("Data argument is required for encryption.");
  }
};

const decryptJSON = (encryptedData, key) => {
  if (encryptedData) {
    const [ivHex, encryptedHex] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(ecnryption_method, key, iv);

    // Decrypt the encrypted data
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    // Parse JSON string to object
    const decryptedData = JSON.parse(decrypted);

    // Return decrypted data
    return decryptedData;
  }
};

export { generateKey, getSavedKey };
