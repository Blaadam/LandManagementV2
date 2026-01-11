import * as Sentry from "@sentry/node";

const SAMPLE_RATE_STR = process.env.SENTRY_TRACES_SAMPLE_RATE || "1.0";
const SAMPLE_RATE = parseFloat(SAMPLE_RATE_STR);

// Ensure to call this before requiring any other modules!
Sentry.init({
    beforeSendSpan(span) {
        span.data = {
            ...span.data,
            "bot.version": process.env.npm_package_version,
        }

        return span;
    },

  dsn: process.env.SENTRY_DSN || "",
  environment: process.env.NODE_ENV || "development",
  release: `csd-bot@${process.env.npm_package_version}`,

  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  tracesSampleRate: SAMPLE_RATE,

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
  enableLogs: true,
});