export const KEYCLOAK_BASE_URL =
  import.meta.env.VITE_KEYCLOAK_BASE_URL ?? "http://localhost:8081";

export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM ?? "mira";

export const KEYCLOAK_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? "mira-bevy";

export const KEYCLOAK_PASSWORD_CLIENT_ID =
  import.meta.env.VITE_KEYCLOAK_PASSWORD_CLIENT_ID ?? "mira-e2e";

export const KEYCLOAK_ISSUER_URL = `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}`;

export const KEYCLOAK_AUTH_URL = `${KEYCLOAK_ISSUER_URL}/protocol/openid-connect/auth`;

export const KEYCLOAK_TOKEN_URL = `${KEYCLOAK_ISSUER_URL}/protocol/openid-connect/token`;

export const REDIRECT_URI = window.location.origin + window.location.pathname;
