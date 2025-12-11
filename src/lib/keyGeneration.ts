"use client";

import { getPublicKey, utils, hashes } from "@noble/ed25519";
import { customAlphabet } from "nanoid";
// Static import - Turbopack should resolve this at build time
import { sha512 } from "./sha512-wrapper";

// Configure SHA-512 immediately if in browser
if (typeof window !== "undefined") {
  hashes.sha512 = sha512;
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Browser-compatible base64url encoding
function bytesToBase64url(bytes: Uint8Array): string {
  // Convert to base64
  const base64 = btoa(String.fromCharCode(...bytes));
  // Convert to base64url (replace + with -, / with _, remove padding =)
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Generate Ed25519 key pair
export async function generateEd25519KeyPair(): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  // Ensure we're in browser environment
  if (!isBrowser) {
    throw new Error("Key generation must be performed in the browser");
  }

  // Ensure SHA-512 is configured
  if (!hashes.sha512) {
    throw new Error("SHA-512 hash function is not configured. This should not happen in the browser.");
  }

  // Use synchronous version which doesn't require crypto.subtle
  const privateKeyBytes = utils.randomSecretKey();
  const publicKeyBytes = getPublicKey(privateKeyBytes);

  // Convert to base64url (URL-safe base64) for single-line storage
  const privateKey = bytesToBase64url(privateKeyBytes);
  const publicKey = bytesToBase64url(publicKeyBytes);

  return { privateKey, publicKey };
}

// Generate API key with sentinel_ prefix
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const generateId = customAlphabet(alphabet, 32);

export function generateApiKey(): string {
  return `sentinel_${generateId()}`;
}

