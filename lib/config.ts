export const config = {
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  RENTAL_API_BASE_URL: (process.env.RENTAL_API_BASE_URL || "http://localhost:8000/api.cgi/api").replace(/\/$/, ""),
  RENTAL_CONSENT_URL: process.env.RENTAL_CONSENT_URL || "http://localhost:8000/consent.html",
  RENTAL_API_KEY: process.env.RENTAL_API_KEY || "",
  OAUTH_SIGNING_KEY: process.env.OAUTH_SIGNING_KEY || "",
  OAUTH_BRIDGE_SECRET: process.env.OAUTH_BRIDGE_SECRET || "",
};

