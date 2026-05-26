# HTML to PDF Converter

Client-side HTML-to-PDF converter with a local Puppeteer backend for perfect URL rendering.

## Features

- **URL to PDF** — local Puppeteer server renders pages exactly as in browser (JS, CSS, fonts included), falls back to CORS proxies
- **HTML file to PDF** — drag & drop or select local `.html` files
- **HTML code to PDF** — paste raw HTML, get a PDF
- Multiple page sizes (A4, Letter, etc.), portrait/landscape, custom margins

## Tech Stack

- **Frontend**: jsPDF + html2canvas + DOMPurify (vanilla JS, no framework)
- **Backend**: Express + Puppeteer-core (uses installed Edge/Chrome)

## Quick Start

```bash
npm install
node server.js
```

Open `http://localhost:8080/1.html`.

## Production

```bash
# Rate limit: 10 req/min per IP. Set API key for auth:
API_KEYS=secret1,secret2 node server.js
```

The API key is sent via the `X-Api-Key` header. Without it, the API is open (rate-limited only).

### API

`POST /api/pdf`

```json
{ "url": "https://example.com" }
```

Returns a PDF file.

### Security

- Only public HTTP(S) URLs allowed (blocks localhost, private IPs, `file://`)
- `--no-sandbox` required for Puppeteer, but `--disable-web-security` is NOT used
- Rate limited, body size capped at 5 MB
- Optional API key authentication
