# copperlight.app

The website of [Copperlight](https://github.com/ramosrob/copperlight), a free and open source keyboard launcher for
macOS. Static pages: HTML, CSS and a little JavaScript, no framework, no build step, no tracking.

## Run it

```sh
python3 -m http.server 8000   # then open http://localhost:8000
npm test                      # Node 22 or later; no dependencies to install
```

It has to be served over HTTP (the scripts are ES modules), so opening `index.html` as a file won't run the demo.

## What's where

```
index.html            the page
spotlight-alternative/, raycast-alternative/, alfred-alternative/
                      comparison pages, for people searching for another launcher; the homepage names none
404.html              what GitHub Pages shows for an address that doesn't exist
robots.txt, sitemap.xml  for search engines: the sitemap lists every page (tests/seo.test.js checks it)
styles.css            the look: tokens at the top, then each section
demo.js               the hero's live launcher (touring its examples until you type, answers as their cards), sections fading in
match.js, entries.js  what the demo knows and how it matches what's typed (tested in tests/match.test.js)
fonts/                Geist and Geist Mono, self-hosted (SIL Open Font License, fonts/OFL.txt)
mark.svg              the app's mark; favicon-32.png and apple-touch-icon.png come from the app icon
og.png                the image shown when the link is shared; tools/og.html renders it (instructions inside)
```

Everything the demo shows has to be something the app really does in its current release: check the app's
`Sources/Features.swift` before adding a query to `entries.js`.

## Releases

The download buttons link to `https://github.com/ramosrob/copperlight/releases/latest/download/Copperlight.zip`, so
every app release must attach a file named exactly `Copperlight.zip` (the app's `make release` makes it). Only a full
release counts as "latest": one marked pre-release (or a draft) leaves the download link on the previous release, or
a 404 if there is none. The app repo must be public, or nobody else can download its releases. The version and size
next to the bottom download button are written in `index.html`: update them with each release, and the
`softwareVersion` in its structured data (`application/ld+json`) with them; a test checks they match.

## Search engines

Each page has its own title, description, canonical address and structured data, and every question in a page's
FAQ structured data is on the page word for word (the tests check all of it). The comparison pages state facts
about other apps: when one of them changes, update the page, its "Checked" line and its `<lastmod>` in
`sitemap.xml`. They stay fair: no prices, no digs.

## Deploy (GitHub Pages)

1. The repo has to be public for GitHub Pages on a free account. Push to `main`, then in Settings → Pages: Source
   "Deploy from a branch", branch `main`, folder `/ (root)`. The `CNAME` file sets the custom domain to
   `copperlight.app`, and `.nojekyll` makes Pages serve the files as they are.
2. Recommended first: verify `copperlight.app` in your GitHub account (Settings → Pages → Verified domains), so no
   other repository can claim it.
3. At your DNS provider, for `copperlight.app`:
   - `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - optionally `www` as a `CNAME` to `ramosrob.github.io`
4. Wait for the DNS check in Settings → Pages to pass and for GitHub to issue the certificate, then tick
   **Enforce HTTPS**. Browsers only open .app domains over HTTPS, so the site won't load at all until the certificate
   exists (minutes to about an hour after DNS resolves).

## License

GPL-3.0, like the app.
