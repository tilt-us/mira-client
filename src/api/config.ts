const DEFAULT_API_BASE_URL = "http://localhost:8080";
const DEFAULT_LIVE_API_BASE_URL = "http://localhost:8082";
const DEFAULT_MATCHMAKING_API_BASE_URL = "http://localhost:8083";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const LIVE_API_BASE_URL =
  import.meta.env.VITE_LIVE_API_BASE_URL ?? DEFAULT_LIVE_API_BASE_URL;

export const MATCHMAKING_API_BASE_URL =
  import.meta.env.VITE_MATCHMAKING_API_BASE_URL ??
  DEFAULT_MATCHMAKING_API_BASE_URL;
