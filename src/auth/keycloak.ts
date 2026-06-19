import {
  KEYCLOAK_AUTH_URL,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_PASSWORD_CLIENT_ID,
  KEYCLOAK_TOKEN_URL,
  REDIRECT_URI,
} from "./config";
import { apiFetch } from "../api/http";
import {
  clearOAuthRequest,
  readOAuthRequest,
  saveOAuthRequest,
  type AuthTokens,
} from "./storage";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
};

function createRandomString(byteLength = 32) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

function base64UrlEncode(bytes: Uint8Array) {
  let value = "";

  for (const byte of bytes) {
    value += String.fromCharCode(byte);
  }

  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

function toAuthTokens(tokenResponse: TokenResponse): AuthTokens {
  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    expiresAt: tokenResponse.expires_in
      ? Date.now() + tokenResponse.expires_in * 1000
      : undefined,
  };
}

async function requestToken(body: URLSearchParams) {
  const response = await apiFetch(KEYCLOAK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const responseText = await response.text();
  const parsedResponse = responseText
    ? (JSON.parse(responseText) as Partial<TokenResponse> & {
        error?: string;
        error_description?: string;
      })
    : {};

  if (!response.ok || !parsedResponse.access_token) {
    throw new Error(
      normalizeKeycloakError(
        parsedResponse.error_description ??
          parsedResponse.error ??
          "Anmeldung fehlgeschlagen.",
      ),
    );
  }

  return toAuthTokens(parsedResponse as TokenResponse);
}

function normalizeKeycloakError(error: string) {
  if (error === "Account is not fully set up") {
    return "Account ist noch nicht vollständig eingerichtet. Bitte Email verifizieren oder Required Actions in Keycloak abschließen.";
  }

  if (error === "Client not allowed for direct access grants") {
    return "Dieser Keycloak-Client erlaubt keinen Login mit Benutzername und Passwort.";
  }

  if (error === "Invalid client or Invalid client credentials") {
    return "Keycloak-Client ist falsch konfiguriert.";
  }

  return error;
}

export async function startGoogleLogin() {
  const state = createRandomString(24);
  const codeVerifier = createRandomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const searchParams = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    kc_idp_hint: "google",
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  saveOAuthRequest(state, codeVerifier);
  window.location.assign(`${KEYCLOAK_AUTH_URL}?${searchParams.toString()}`);
}

export async function completeRedirectLogin() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error_description") ?? url.searchParams.get("error");

  if (error) {
    clearOAuthRequest();
    window.history.replaceState({}, document.title, REDIRECT_URI);
    throw new Error(error);
  }

  if (!code || !state) {
    return undefined;
  }

  const savedRequest = readOAuthRequest();

  if (state !== savedRequest.state || !savedRequest.codeVerifier) {
    clearOAuthRequest();
    window.history.replaceState({}, document.title, REDIRECT_URI);
    throw new Error("OAuth-Antwort konnte nicht validiert werden.");
  }

  const tokens = await requestToken(
    new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      code,
      code_verifier: savedRequest.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  );

  clearOAuthRequest();
  window.history.replaceState({}, document.title, REDIRECT_URI);
  return tokens;
}

export function loginWithPassword(username: string, password: string) {
  return requestToken(
    new URLSearchParams({
      client_id: KEYCLOAK_PASSWORD_CLIENT_ID,
      grant_type: "password",
      password,
      scope: "openid email profile",
      username,
    }),
  );
}
