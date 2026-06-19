# Mira Client

Desktop launcher and lobby client for Mira.

## Stack

- Tauri 2
- React 19
- TypeScript
- Vite 8

## Commands

```bash
npm install
npm run generate:api
npm run build
npm run tauri dev
npm run dev:desktop
```

`npm run tauri dev` starts Vite for frontend hot reload. Use
`npm run dev:desktop` when you want to run only the desktop client without the
separate Vite web dev server.

## Backend API

The client is wired for the Spring backend on `http://localhost:8080`.
Override it for local development with:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_KEYCLOAK_BASE_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=mira
VITE_KEYCLOAK_CLIENT_ID=mira-bevy
VITE_KEYCLOAK_PASSWORD_CLIENT_ID=mira-e2e
```

OpenAPI client code is generated into `src/api/generated`:

```bash
npm run generate:api
```

By default, generation reads `http://localhost:8080/v3/api-docs`. The backend
must expose that endpoint, for example with Springdoc OpenAPI. If the backend is
running somewhere else, override the input URL:

```bash
OPENAPI_INPUT=http://localhost:8080/v3/api-docs npm run generate:api
```

Import generated endpoints through `src/api/client.ts` so the configured base
URL is applied in one place.

Email/password login uses Keycloak's password grant with
`VITE_KEYCLOAK_PASSWORD_CLIENT_ID`. Google login uses
`VITE_KEYCLOAK_CLIENT_ID` with the authorization-code flow, PKCE, and
`kc_idp_hint=google`. The authorization-code client must allow the Tauri dev
redirect URL, for example `http://localhost:1420/*`. The password client must
have Direct Access Grants enabled.

## Linux Prerequisites

Tauri needs the native WebKitGTK development packages. If `npm run tauri dev` or
`cargo check --manifest-path src-tauri/Cargo.toml` fails with missing
`webkit2gtk-4.1` or `javascriptcoregtk-4.1`, install the Tauri Linux
prerequisites for your distribution first:

https://v2.tauri.app/start/prerequisites/

## Workspace Note

`src-tauri` is excluded from the root Cargo workspace. That keeps the existing
game/server `cargo check` from requiring desktop WebKit system libraries.
