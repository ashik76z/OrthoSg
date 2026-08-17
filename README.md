# OrthoSG Finals Coach — public website

Static site built to the Growth and Product Optimisation Brief. No build step, no dependencies,
no tracking. Open `index.html` or upload the folder to any static host.

```
index.html                Home — hero, 5 practice modes, how it works, evidence standard, FAQ
voice-viva.html           Entry page (feature-flagged, see below)
part-b-osce.html          Entry page
orthopaedic-xrays.html    Entry page
sba.html                  Entry page
weak-areas.html           Entry page
feedback.html             Two-minute survey + detailed issue report
assets/config.js          ← the only file you edit
assets/styles.css
assets/site.js
```

## Configuration

| Key | Purpose |
|---|---|
| `gptUrl` | Where every "Start practising" button points |
| `version` / `updated` | Rendered in the footer |
| `features.voiceViva` | Voice Viva promotion — **currently false** |
| `feedbackFormUrl` | Opens an external form in a new tab |
| `feedbackEmail` | Opens the user's mail app with the report pre-filled |

Set one of the two feedback options. With neither, the form still validates, composes the report and
offers *Copy as text* — and says plainly that nothing was transmitted. It never fakes a submission.

## Voice Viva is behind a flag, deliberately

Brief §3 and §8 make Voice Viva the flagship secondary CTA. The brief's own open question notes the
GPT has not yet been QA'd against the §3 behaviour spec or the §15 instruction changes.

Advertising a voice viva that interrupts, coaches mid-station or gives answers before the student
commits breaks the §2 promise of an excellent first 30 seconds — for exactly the students most worth
keeping. So `features.voiceViva` ships `false`.

**With the flag off:** no Voice Viva in the nav, hero, practice grid or footer. The hero secondary CTA
falls back to "Choose a practice mode". `voice-viva.html` still exists, unlinked, with an
"in preparation" notice at the top.

**With the flag on:** Voice Viva appears everywhere as the flagship, and the notice disappears.

Flip it after the §3 behaviour spec (10 points) and QA checklist (10 items) pass, and §15 is live.
One line, no rebuild.

## Copy & start

Every prompt has two buttons. **Copy** puts it on the clipboard. **Copy & start** copies it *and*
opens OrthoSG in a new tab, so the student lands in the chat with the prompt ready to paste.

The ordering in `site.js` is deliberate and fragile if changed:

1. `window.open` fires **synchronously** inside the click handler. Move it after any `await` and
   mobile popup blockers kill it.
2. The clipboard write uses the legacy `execCommand` path first, because it is also synchronous and
   needs no permission prompt. `navigator.clipboard` runs afterwards as a best-effort upgrade.
3. If both copy paths fail, the prompt is rendered inline below the button for manual copying, and
   the toast says so.
4. If the popup is blocked but the copy succeeded, the toast tells the student to open OrthoSG and
   paste — it does not silently claim success.

The link does **not** instruct the GPT by itself. There is no URL prefill in this build: a `?q=`
parameter on custom GPT links is unverified and may prefill, auto-send, or be dropped at the login
redirect. Test it yourself before relying on it. If it works and *prefills*, adding it is a small
change. If it *auto-sends*, do not use it — a student who clicks "Try a Voice Viva" while browsing
has not yet chosen to be examined, and the attempt-first loop depends on that choice being theirs.

## What the site does and does not claim

Never claims: university affiliation, real examination questions, examination prediction, guaranteed
passes, official marking schemes, clinical competence from scores, or clinical validation of all
generated material.

The Evidence Standard section states the two in-progress items honestly — `CONTEXTUAL` thresholds and
`LOCAL CHECK` dependencies are marked amber, not green. Legacy content is described as carrying
partial quality assurance. Keep it that way when editing copy.

## Adding the research study later

```
python3 install-research.py /path/to/this/site
```

The research module ships separately. It patches nav, footer, FAQ and the closing section at the
`<!-- RESEARCH-*-SLOT -->` comments already present in these pages. Do not delete those comments.
`--remove` reverses it cleanly.

## Not built, on purpose

Brief §14 allocates 5% of effort to the website. These were considered and skipped as infrastructure
without demonstrated need: analytics dashboards, accounts, a version-history page, per-body-region
entry pages (/shoulder, /knee, /trauma). Add them if usage data justifies it, not before.
