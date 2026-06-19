import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: process.env.OPENAPI_INPUT ?? "http://localhost:8080/v3/api-docs",
  output: {
    path: "src/api/generated",
    clean: true,
  },
  client: "@hey-api/client-fetch",
});
