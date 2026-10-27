# FlickDock website

This repository contains only the public FlickDock website. It does not contain
the Windows or macOS application, account service, or installation packages.

Edit `source/public/` and run `npm run build` to produce the three files in
`dist/` for Retiehe static hosting. The SVG assets are bundled into `site.js`
because the hosted site permits only a small number of files.

Every push to `main` builds the three hosted files and makes them available
as the `flickdock-retiehe-site` GitHub Actions artifact. The current Retiehe
account requires a Premium plan for Git auto deployment. Until that is enabled,
upload the three artifact files to the existing site without editing code in
the browser.

When Git auto deployment is available, Retiehe's official CLI can generate
the deployment configuration. Create an API key in the Retiehe dashboard,
then run the following from this repository's root with Deno 2.8 or newer:

```sh
deno -Ar https://host.retiehe.com/cli init
```

Choose the existing `flickdock.rth1.xyz` site, `npm run build` as the build
command, and `dist` as the output directory. Store the API key in the GitHub
Actions secret `RTH_API_KEY`, never in this repository. Publish only from the
`main` branch after the site build succeeds.
