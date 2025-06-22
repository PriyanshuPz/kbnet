import * as crypto from "crypto";

type EncryptionKeys = {
  [key: number]: string | undefined;
};

type EncryptedData = {
  encrypted: string;
  iv: string;
  authTag: string;
  keyVersion: number;
};

const config = {
  ENCRYPTION_KEY_1: process.env.ENCRYPTION_KEY_1 || "",
};

const ENCRYPTION_KEYS: EncryptionKeys = {
  1: config.ENCRYPTION_KEY_1, // Current key (latest)
};

const CURRENT_KEY_VERSION = 1; // Set in an env variable or config

function encryptConfig(data: string): EncryptedData {
  const currentKey = ENCRYPTION_KEYS[CURRENT_KEY_VERSION];
  if (!currentKey) {
    throw new Error(
      `Missing current encryption key (version ${CURRENT_KEY_VERSION})`
    );
  }
  // 🔥 Decode from Base64 to ensure it's exactly 32 bytes
  const keyBuffer = Buffer.from(currentKey, "base64");

  if (keyBuffer.length !== 32) {
    throw new Error(
      `Invalid encryption key length: expected 32 bytes, got ${keyBuffer.length}`
    );
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag,
    keyVersion: CURRENT_KEY_VERSION,
  };
}

function decryptConfig(
  encryptedText: string,
  iv: string,
  authTag: string,
  keyVersion: number
): string {
  const key = ENCRYPTION_KEYS[keyVersion];
  if (!key) {
    throw new Error(`Missing encryption key for version ${keyVersion}`);
  }

  // Match the same base64 decoding that's used in encryptConfig
  const keyBuffer = Buffer.from(key, "base64");

  if (keyBuffer.length !== 32) {
    throw new Error(
      `Invalid encryption key length: expected 32 bytes, got ${keyBuffer.length}`
    );
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    keyBuffer,
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export { encryptConfig, decryptConfig };
