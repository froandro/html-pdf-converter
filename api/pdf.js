module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, options } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const token = process.env.BROWSERLESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'BROWSERLESS_TOKEN not configured' });
  }

  try {
    const { printBackground, landscape, format } = options || {};

    const browserlessOptions = {
      url,
      options: {
        printBackground: true,
        landscape: landscape || false,
        format: format || 'A4',
      },
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
