// Loaded first from server.ts. Empty SENTRY_DSN disables reporting.
import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN || undefined;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.NODE_ENV === "production" ? "production" : "development",
  // Request bodies, cookies, headers, and inferred user info stay off. This app holds leadership data.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: { deny: ["cookie", "token", "code", "email", "state", "session"] },
    databaseQueryData: false,
    stackFrameVariables: false,
  },
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  beforeSend(event) {
    const url = event.request?.url ?? "";
    if (url.includes("/health")) return null;
    if (event.request) {
      delete event.request.cookies;
      delete event.request.data;
      const headers = event.request.headers;
      if (headers) {
        delete headers.cookie;
        delete headers.authorization;
      }
    }
    return event;
  },
});
