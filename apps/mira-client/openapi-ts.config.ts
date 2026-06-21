import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input:
    process.env.OPENAPI_INPUT ??
    process.env.OPENAPI_MERGED_OUTPUT ??
    ".openapi/api-docs.json",
  output: {
    path: "src/api/generated",
    clean: true,
  },
  client: "@hey-api/client-fetch",
});
