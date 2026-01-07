import * as Sentry from "@sentry/node";

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

  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],

  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring

  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
  enableLogs: true,
});