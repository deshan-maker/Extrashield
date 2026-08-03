// This file configures the initialization of Sentry on the client (browser).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Send 10% of transactions for performance monitoring. Turn this up
  // while debugging, or down further once traffic grows, to control cost.
  tracesSampleRate: 0.1,

  // Capture a small sample of ordinary sessions plus every session that
  // hits an error, so you get real repro recordings without high cost.
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],

  // Quiet by default — flip on locally if Sentry itself seems misbehaving.
  debug: false,
});