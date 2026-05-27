# HTML to PDF Converter

Client-side HTML-to-PDF converter. URL-to-PDF via [Browserless.io](https://www.browserless.io/), with CORS proxy fallback.

## Features

- **URL to PDF** — renders via Browserless.io (Puppeteer in the cloud), falls back to CORS proxy
- **HTML file to PDF** — drag & drop or select local `.html` files
- **HTML code to PDF** — paste raw HTML, get a PDF
- Page sizes (A4, Letter), portrait/landscape

## Deployment (Vercel)

This is a **pure static site** — no server needed.

1. Push `1.html` (and any assets) to a GitHub repo
2. Import repo in Vercel dashboard
3. Deploy — done

## Local Usage

```bash
npx serve .
```

Open `http://localhost:3000/1.html`.

## Local Server (alternative)

If you prefer running Puppeteer locally instead of using Browserless:

```bash
npm install
node server.js
```

Then open `http://localhost:8080/1.html`.
