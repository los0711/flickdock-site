# FlickDock website

This repository contains only the public FlickDock website. It does not contain
the Windows or macOS application, account service, or installation packages.

Edit `source/public/` and run `npm run build` to produce the three files in
`dist/` for Retiehe static hosting. The SVG assets are bundled into `site.js`
because the hosted site permits only a small number of files.

Retiehe's official CLI generates the deployment configuration and GitHub
workflow. Create an API key in the Retiehe dashboard, then run the following
from this repository's root after installing Deno 2.8 or newer:

```sh
deno -Ar https://host.retiehe.com/cli init
```

Choose the existing `flickdock.rth1.xyz` site, `npm run build` as the build
command, and `dist` as the output directory. Store the API key in the GitHub
Actions secret `RTH_API_KEY`, never in this repository. Publish only from the
`main` branch after the site build succeeds.
