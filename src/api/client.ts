import { client } from "./generated/client.gen";
import { API_BASE_URL } from "./config";
import { apiFetch } from "./http";

client.setConfig({
  baseUrl: API_BASE_URL,
  fetch: apiFetch,
});

export function setApiAccessToken(accessToken?: string) {
  client.setConfig({
    baseUrl: API_BASE_URL,
    fetch: apiFetch,
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : null,
    },
  });
}

export { client };
export * from "./generated";
