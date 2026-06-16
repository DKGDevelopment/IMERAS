# Stornoway Partner Portal

Static website for the Stornoway / DKG Development partner portal — the
development portfolio across Athens and Piraeus, maintained for referral
and brokerage partners. Built as plain HTML/CSS so it can be hosted on
GitHub Pages with no build step.

## Pages

| File | Page |
|---|---|
| `index.html` | Home — hero + 4 category link cards |
| `residential.html` | Residential — 4 asset cards |
| `golden-visa.html` | Golden Visa — 4 asset cards |
| `yielding-assets.html` | Yielding Assets — 3 asset cards |
| `commercial.html` | Commercial — 3 asset cards |
| `cooperation.html` | Cooperation Agreement |
| `register-a-lead.html` | Registration procedure + lead form |
| `styles.css` | All shared styles, linked by every page |

All internal links are relative (`residential.html`, etc.) so the site
works whether it is served from a domain root or a project subpath such
as `https://<user>.github.io/imeras/`.

## Deploying on GitHub Pages

A workflow at `.github/workflows/deploy.yml` publishes the site
automatically on every push to `main`.

1. Push this repository to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or run the workflow manually from the **Actions** tab).
   The site URL appears in the workflow run and on the Pages settings page.

To preview locally, just open `index.html` in a browser, or run a static
server from the project root:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Things to finish before going live

- Replace every `Уточняется` placeholder with real data (location, units,
  price, yield, etc.) per asset.
- Replace `info@dkg-development.com` everywhere if a different address
  should receive partner inquiries and lead registrations.
- The inquiry modal (category pages) and the lead form (Register a Lead)
  use `mailto:` links, which open the visitor's email client. To capture
  submissions server-side instead, swap them for a hosted form service
  (e.g. Formspree, Google Forms) — no other change to the markup is needed.
