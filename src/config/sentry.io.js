global.Sentry = require("@sentry/node");
Sentry.init({
  dsn:
    "https://ec5499aa80c242508c4b36d1766e57ce@o459444.ingest.sentry.io/5458599",
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
