import { client } from "./generated/client.gen";
import { API_BASE_URL } from "./config";
import { apiFetch } from "./http";
import { getValidAccessToken } from "../auth/keycloak";

client.setConfig({
  baseUrl: API_BASE_URL,
  fetch: apiFetch,
});

client.interceptors.request.use(async (request) => {
  const accessToken = await getValidAccessToken();

  if (accessToken) {
    request.headers.set("authorization", `Bearer ${accessToken}`);
  } else {
    request.headers.delete("authorization");
  }

  return request;
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
