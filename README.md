# HTML to PDF Converter

Client-side HTML-to-PDF converter. URL-to-PDF via [Browserless.io](https://www.browserless.io/) proxied through a serverless function (token stays server-side).

## Features

- **URL to PDF** — renders via Browserless, falls back to CORS proxy
- **HTML file to PDF** — drag & drop `.html` files
- **HTML code to PDF** — paste raw HTML, get a PDF
- Page sizes (A4, Letter), portrait/landscape

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/froandro/html-pdf-converter)

1. Click the button above or import your GitHub repo in Vercel dashboard
2. Add environment variable: `BROWSERLESS_TOKEN` = your [Browserless.io](https://www.browserless.io/) API key
3. Deploy — done

No build step needed. Vercel automatically serves `1.html` as static and `api/pdf.js` as a serverless function.

## Local Usage

```bash
npx serve .
```

Open `http://localhost:3000/1.html`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BROWSERLESS_TOKEN` | Yes (for URL tab) | Browserless.io API key |

Get a free key at [browserless.io](https://www.browserless.io/).
