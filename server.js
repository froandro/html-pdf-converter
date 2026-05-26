const express = require('express');
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const app = express();

const ALLOWED_API_KEYS = (process.env.API_KEYS || '').split(',').filter(Boolean);
const PORT = process.env.PORT || 8080;

// --- Security middleware ---

app.use(express.json({ limit: '5mb' }));

app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, try again later' },
}));

app.use('/api', (req, res, next) => {
  if (ALLOWED_API_KEYS.length === 0) return next();
  const key = req.headers['x-api-key'];
  if (!key || !ALLOWED_API_KEYS.includes(key)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

app.use(express.static(__dirname));

// --- Browser setup ---

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
];

function findBrowser() {
  if (fs.existsSync(EDGE_PATH)) return EDGE_PATH;
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// --- URL validation ---

function isPrivateIP(hostname) {
  const parts = hostname.split('.');
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const nums = parts.map(Number);
    if (nums[0] === 10) return true;
    if (nums[0] === 172 && nums[1] >= 16 && nums[1] <= 31) return true;
    if (nums[0] === 192 && nums[1] === 168) return true;
    if (nums[0] === 127) return true;
  }
  return false;
}

function isValidTargetUrl(url) {
  let parsed;
  try { parsed = new URL(url); }
  catch { return false; }

  if (!['http:', 'https:'].includes(parsed.protocol)) return false;
  if (['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(parsed.hostname)) return false;
  if (parsed.hostname.endsWith('.local')) return false;
  if (isPrivateIP(parsed.hostname)) return false;

  return true;
}

// --- API ---

app.post('/api/pdf', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidTargetUrl(url)) {
    return res.status(400).json({
      error: 'Invalid URL: only public HTTP(S) URLs allowed. Private/internal URLs are blocked.'
    });
  }

  let browser;
  try {
    const executablePath = findBrowser();
    if (!executablePath) {
      return res.status(500).json({ error: 'No browser found' });
    }

    browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    );

    await page.setViewport({ width: 1280, height: 800 });
    await page.setJavaScriptEnabled(true);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});

    for (let i = 0; i < 30; i++) {
      const hasContent = await page.evaluate(() => {
        const root = document.getElementById('root');
        if (!root) return false;
        return root.children.length > 0 || root.innerText.trim().length > 3;
      }).catch(() => false);
      if (hasContent) break;
      await new Promise(r => setTimeout(r, 1000));
    }

    await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    await page.emulateMediaType('screen');
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `html, body, #root { background-color: #ffffff !important; }`;
      document.head.appendChild(style);
    });

    await new Promise(r => setTimeout(r, 500));

    const pdf = await page.pdf({
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      timeout: 30000,
    });

    await browser.close();

    const fileName = url.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40) + '.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdf);
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    console.error('PDF error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  const browserPath = findBrowser();
  if (browserPath) {
    console.log(`Using browser: ${browserPath}`);
  }
  if (ALLOWED_API_KEYS.length > 0) {
    console.log('API key required: X-Api-Key header');
  } else {
    console.log('WARNING: No API keys configured — set API_KEYS env var for production');
  }
});
