# FlickDock website

This repository contains only the public FlickDock website. It does not contain
the Windows or macOS application, account service, or installation packages.

Edit `source/public/` and run `npm run build` to produce the three files in
`dist/` for Cloudflare Workers Static Assets. The SVG assets are bundled into
`site.js` by the existing build pipeline, so the site deploys as three files.

The current layout is based on the supplied website HTML. Production source
adds keyboard tabs, persistent appearance selection, a pause control,
reduced-motion and reduced-transparency support, and mobile layouts. The
illustrations are explicitly labelled as demonstrations and do not access
local files. The website does not require any third-party runtime CDN.

The original one-time import is preserved for provenance; running the importer
again replaces subsequent manual production refinements.
`scripts/import-reference.mjs <design.html>` preserves its markup, styles and
animation functions, substitutes the original FlickDock logo and live download
links, and moves event bindings into the external script.
Run `npm ci` before the first build.

Release download links must only point to published and verified assets. Keep
the three explicit Windows x64, Mac Apple silicon and Mac Intel choices; a
website redesign is not evidence that a new application binary is available.

The current production target is the existing Worker `flickdock-site`:
https://flickdock-site.roger000416.workers.dev/

The user has retired the Retiehe publishing target. Do not publish changes to
that service. The static builder's historical `build-retiehe.mjs` filename is
retained to avoid changing the tested asset-bundling implementation.

Deploy using an authorized local Cloudflare session:

```sh
npm ci
npm run deploy
```

`wrangler.jsonc` binds the built `dist/` directory to that Worker. Credentials
must remain in the authorized Wrangler session or environment, never source.
Every push to `main` builds the site and saves a `flickdock-worker-site` GitHub
Actions artifact. It also deploys the existing Worker when the repository has
a scoped `CLOUDFLARE_API_TOKEN` Actions secret. `CLOUDFLARE_ACCOUNT_ID` can be
provided as an additional secret when needed by the account configuration.
Without a token, the workflow explicitly skips production deployment and
reports that configuration is missing in the run summary. It never falls back
to Retiehe. Local `npm run deploy` continues to use the authorized Wrangler
session. No deployment token is stored in this repository.
