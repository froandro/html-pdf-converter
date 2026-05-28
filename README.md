# HTML to PDF Converter

Client-side and server-side HTML-to-PDF converter. Three conversion modes:

- **URL to PDF** — renders via [Browserless.io](https://www.browserless.io/) (serverless or local Puppeteer), falls back to CORS proxy + html2canvas
- **HTML file to PDF** — drag & drop `.html` files, converted client-side with jsPDF + html2canvas
- **HTML code to PDF** — paste raw HTML, get a PDF client-side

Supports A4, Letter, Legal, and one-long-page formats; portrait/landscape; configurable margins.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/froandro/html-pdf-converter)

1. Click the button above or import your GitHub repo in Vercel dashboard
2. Add environment variable: `BROWSERLESS_TOKEN` = your [Browserless.io](https://www.browserless.io/) API key
3. Deploy — done

Vercel serves `index.html` as static and `api/pdf.js` as a serverless function.

## Local Usage

### Option A — Static files only (client-side conversion)

```bash
npx serve .
```

Open `http://localhost:3000/index.html`. URL rendering, file upload, and raw HTML code all work client-side via jsPDF + html2canvas.

### Option B — With Puppeteer (URL → PDF via local browser)

```bash
npm install
node server.js
```

Requires Chromium or Edge installed. Serves the UI at `http://localhost:8080` and provides a `/api/pdf` endpoint that renders URLs to PDF with Puppeteer.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `BROWSERLESS_TOKEN` | Yes (Vercel, for URL tab) | Browserless.io API key |
| `API_KEYS` | No (local server) | Comma-separated API keys for `/api/pdf` auth |
| `PORT` | No (local server) | Server port (default: 8080) |

Get a free Browserless key at [browserless.io](https://www.browserless.io/).
