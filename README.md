# menopaused

A minimal static GitHub Pages site for the race to unpause menopause.

## What this is

This repo is intentionally simple:
- `index.html` — homepage shell
- `styles.css` — site styling
- `app.js` — renders data from JSON
- `data/site-data.json` — source of truth for site content
- `data/site-data.js` — generated browser-friendly mirror of the JSON data
- `.github/ISSUE_TEMPLATE/` — required GitHub issue forms for `[Possible]`, `[Measured]`, `[Studied]`, and `[Surveyed]`
- `.github/workflows/deploy-pages.yml` — GitHub Pages deploy workflow

## How to update the site

Most updates only require editing `data/site-data.json`:
- add a new object to `updates`
- adjust the `scoreboard`
- change `priorityPathways`
- tune `issueTracks`
- tune `diagnosticSignals`, `riskAccelerants`, or `interventionLandscape`
- update `promotionRules`, `researchQuestions`, and `sourceDigest`
- optionally set `repository.url` for non-GitHub-Pages previews
- update the `framingQuote`

Then regenerate `data/site-data.js` from the JSON source of truth.

Simple option:
- `node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('data/site-data.json','utf8')); fs.writeFileSync('data/site-data.js', 'window.SITE_DATA = ' + JSON.stringify(data, null, 2) + ';\\n');"`

Then commit and push.

## Structured issue intake

The site now exposes four issue-entry lanes:
- `[Possible]` — candidate mechanism or intervention lead
- `[Measured]` — observed metric, assay, or data point
- `[Studied]` — paper, preprint, or study worth tracking
- `[Surveyed]` — landscape scan or research sweep

Each lane opens a dedicated GitHub issue form with required fields before submission.

If the site is running on GitHub Pages, the issue links are inferred automatically from the URL.
If you are previewing elsewhere, set `repository.url` in `data/site-data.json` to your GitHub repository URL, then regenerate `data/site-data.js`.

## GitHub Pages setup

1. Create a GitHub repo.
2. Push this folder to that repo.
3. In GitHub, enable **Pages** and select **GitHub Actions** as the source.
4. The included workflow will publish automatically on pushes to `main`.

## Local preview

You can open `index.html` directly because the page loads `data/site-data.js` first.

If you prefer working against the JSON mirror, serving locally is cleaner because browsers can block `fetch()` from `file://` depending on the environment.

Simple option from this folder:
- `python -m http.server 8000`

Then open:
- `http://localhost:8000`

## Editorial rule

Keep claims tighter than hype. Separate:
- mechanism
- evidence
- speculation

If the explanation gets larger than the evidence, shrink the explanation first.
