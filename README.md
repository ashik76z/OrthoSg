# OrthoSG public website

This repository contains the sole canonical OrthoSG public website at <https://ortho-sg.vercel.app/>.

It is a static HTML, CSS and JavaScript site with no build step, package dependencies, tracking or internal data collection. The homepage links directly to the OrthoSG custom GPT, the Google feedback form and OpenAI Voice documentation.

## Files

```text
index.html       Canonical landing page and GPT practice launcher
about.html       Evidence, review, limitations and change log
404.html         Branded not-found page returning visitors to the homepage
styles.css       Shared visual system and responsive styles
script.js        Motion controls and prompt-copy behaviour
favicon.svg      Browser icon
og.png           Social preview image
sitemap.xml      Canonical public URLs
robots.txt       Search crawler configuration
```

## Local preview

Serve this directory with any static HTTP server. Opening files directly is insufficient for route and missing-asset checks.

## Hosting and redirects

Vercel is the current host. Do not add redirect-stub HTML files to this repository.

## Release boundary

Do not push or deploy without explicit authorisation. Before release, verify responsive layout, internal navigation, prompt copying, protected external destinations, browser-console errors and missing assets. Deleted files remain recoverable from Git history.
