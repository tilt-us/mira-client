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
npm run build
npm run tauri dev
npm run dev:desktop
```

`npm run tauri dev` starts Vite for frontend hot reload. Use
`npm run dev:desktop` when you want to run only the desktop client without the
separate Vite web dev server.

## Linux Prerequisites

Tauri needs the native WebKitGTK development packages. If `npm run tauri dev` or
`cargo check --manifest-path src-tauri/Cargo.toml` fails with missing
`webkit2gtk-4.1` or `javascriptcoregtk-4.1`, install the Tauri Linux
prerequisites for your distribution first:

https://v2.tauri.app/start/prerequisites/

## Workspace Note

`src-tauri` is excluded from the root Cargo workspace. That keeps the existing
game/server `cargo check` from requiring desktop WebKit system libraries.
