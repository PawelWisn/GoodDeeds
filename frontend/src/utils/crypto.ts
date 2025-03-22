import { Base64 } from "js-base64";

export async function generateKeys(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyBase64: string;
}> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey,
  );
  const publicKeyBase64 = Base64.fromUint8Array(new Uint8Array(exportedKey));

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    publicKeyBase64,
  };
}

export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const keyBuffer = Base64.toUint8Array(base64Key);
  return await window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
}

export async function encryptMessage(
  message: string,
  publicKey: CryptoKey,
): Promise<string> {
  const encodedMessage = new TextEncoder().encode(message);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedMessage,
  );

  return Base64.fromUint8Array(new Uint8Array(encryptedBuffer));
}

export async function decryptMessage(
  encryptedBase64: string,
  privateKey: CryptoKey,
): Promise<string> {
  try {
    const encryptedBuffer = Base64.toUint8Array(encryptedBase64);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedBuffer,
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.log("Failed to decrypt message:", error);
    return "<encrypted>";
  }
}
