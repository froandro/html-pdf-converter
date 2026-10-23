// --- URL validation (SSRF guard, mirrors server.js) ---

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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, options } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!isValidTargetUrl(url)) {
    return res.status(400).json({
      error: 'Invalid URL: only public HTTP(S) URLs allowed. Private/internal URLs are blocked.'
    });
  }

  const token = process.env.BROWSERLESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'BROWSERLESS_TOKEN not configured' });
  }

  try {
    const { margin, landscape, format } = options || {};
    const pdfOptions = {
      printBackground: true,
      landscape: landscape || false,
    };
    if (format) pdfOptions.format = format;
    if (margin) pdfOptions.margin = margin;

    const browserlessOptions = {
      url,
      options: pdfOptions,
      gotoOptions: {
        waitUntil: 'networkidle0',
        timeout: 20000,
      },
      emulateMediaType: 'screen',
    };

    const response = await fetch(
      `https://chrome.browserless.io/pdf?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(browserlessOptions),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const buffer = await response.arrayBuffer();
    const fileName = url.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 40) + '.pdf';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
