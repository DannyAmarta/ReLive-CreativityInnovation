"use client";

const OPENROUTER_VERIFIER_KEY = "openrouter.pkce.verifier";
const OPENROUTER_STATE_KEY = "openrouter.pkce.state";
const OPENROUTER_CALLBACK_PATH = "/profile/openrouter/callback";
const OPENROUTER_AUTH_URL = "https://openrouter.ai/auth";

export async function beginOpenRouterConnection() {
  const verifier = createPkceVerifier();
  const state = createPkceVerifier();
  const challenge = await createPkceChallenge(verifier);
  const callbackUrl = new URL(OPENROUTER_CALLBACK_PATH, window.location.origin);
  const authUrl = new URL(OPENROUTER_AUTH_URL);

  sessionStorage.setItem(OPENROUTER_VERIFIER_KEY, verifier);
  sessionStorage.setItem(OPENROUTER_STATE_KEY, state);
  authUrl.searchParams.set("callback_url", callbackUrl.toString());
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  window.location.assign(authUrl.toString());
}

export function readOpenRouterVerifier() {
  return sessionStorage.getItem(OPENROUTER_VERIFIER_KEY);
}

export function readOpenRouterState() {
  return sessionStorage.getItem(OPENROUTER_STATE_KEY);
}

export function clearOpenRouterVerifier() {
  sessionStorage.removeItem(OPENROUTER_VERIFIER_KEY);
  sessionStorage.removeItem(OPENROUTER_STATE_KEY);
}

function createPkceVerifier() {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
}

async function createPkceChallenge(verifier: string) {
  const digest = await window.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );

  return toBase64Url(new Uint8Array(digest));
}

function toBase64Url(bytes: Uint8Array) {
  const raw = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
