const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Required on Next.js 14 for instrumentation.ts to run (stable by
    // default from Next.js 15 onward — this flag can be removed then).
    instrumentationHook: true,
    // Sentry's server SDK pulls in ESM-only tracing packages
    // (@apm-js-collab/tracing-hooks) that Next's webpack bundler can't
    // statically resolve, which crashes every route that touches
    // sentry.server.config.ts. Excluding these from bundling lets Node's
    // native require/import handle them correctly instead.
    serverComponentsExternalPackages: [
      "@sentry/node",
      "@sentry/nextjs",
      "@sentry/server-utils",
      "@apm-js-collab/tracing-hooks",
    ],
  },
};

// Wraps the config to upload source maps and tag builds with a release,
// but only actually does anything once SENTRY_DSN / SENTRY_AUTH_TOKEN are
// set — with no auth token configured this is a harmless no-op wrapper.
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Don't try to upload source maps until a real auth token is set.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});