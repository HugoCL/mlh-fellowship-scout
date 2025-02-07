// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://5072430b9d7535ff66633c49603bd917@o4508756214743040.ingest.us.sentry.io/4508756216053760',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
