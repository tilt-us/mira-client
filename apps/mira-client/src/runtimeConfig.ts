import { invoke, isTauri } from "@tauri-apps/api/core";
import { applyApiRuntimeConfig, type ApiRuntimeConfig } from "./api/config";
import {
  applyKeycloakRuntimeConfig,
  type KeycloakRuntimeConfig,
} from "./auth/config";

export type ClientRuntimeConfig = ApiRuntimeConfig & KeycloakRuntimeConfig;

export async function loadRuntimeConfig() {
  if (!isTauri()) {
    return;
  }

  const config = await invoke<ClientRuntimeConfig>("client_config");
  applyApiRuntimeConfig(config);
  applyKeycloakRuntimeConfig(config);
}
