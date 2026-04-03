const express = require('express');
const router = express.Router();
const UAParser = require('ua-parser-js');
const Link = require('../models/Link');
const Click = require('../models/Click');

// GET /:code - Serve funnel landing page
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Skip API routes and static files
    if (code.startsWith('api') || code.startsWith('admin') || code.includes('.')) {
      return res.status(404).json({ error: 'Not found' });
    }

    const link = await Link.findOne({
      $or: [{ shortCode: code }, { customAlias: code }]
    });

    if (!link) {
      return res.status(404).send(getErrorPage('Link Not Found', 'This short link does not exist or has been removed.'));
    }

    if (!link.isActive) {
      return res.status(410).send(getErrorPage('Link Disabled', 'This link has been disabled by the owner.'));
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      return res.status(410).send(getErrorPage('Link Expired', 'This short link has expired.'));
    }

    // Track the click
    const parser = new UAParser(req.headers['user-agent']);
    const deviceResult = parser.getDevice();
    const browserResult = parser.getBrowser();
    const osResult = parser.getOS();

    let deviceType = 'desktop';
    if (deviceResult.type === 'mobile') deviceType = 'mobile';
    else if (deviceResult.type === 'tablet') deviceType = 'tablet';

    await Click.create({
      linkId: link._id,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || '',
      device: deviceType,
      browser: browserResult.name || 'unknown',
      os: osResult.name || 'unknown',
      referer: req.headers.referer || ''
    });

    // Increment click counter
    await Link.findByIdAndUpdate(link._id, { $inc: { clicks: 1 } });

    // Add randomized delay variation (0-2 extra seconds)
    const extraDelay = Math.random() * 2;
    const totalDelay = (link.redirectDelay ?? 3) + extraDelay;

    // Serve the funnel landing page
    res.send(getFunnelPage(link, totalDelay));
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send(getErrorPage('Error', 'Something went wrong.'));
  }
});

function getFunnelPage(link, delay) {
  const delayMs = Math.round(delay * 1000);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(link.title || 'Continue to your destination')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      text-align: center;
    }
    .icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg { width: 32px; height: 32px; fill: white; }
    h1 {
      font-size: 24px;
      color: #1a1a2e;
      margin-bottom: 12px;
      line-height: 1.3;
    }
    .description {
      color: #555;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .content {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      color: #444;
      font-size: 14px;
      line-height: 1.7;
      text-align: left;
    }
    .progress-bar {
      width: 100%;
      height: 4px;
      background: #e9ecef;
      border-radius: 2px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2px;
      width: 0%;
      transition: width ${delayMs}ms linear;
    }
    .btn {
      display: inline-block;
      padding: 14px 48px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-size: 16px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      opacity: 0.5;
      pointer-events: none;
    }
    .btn.active {
      opacity: 1;
      pointer-events: auto;
    }
    .btn.active:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102,126,234,0.4);
    }
    .timer {
      color: #888;
      font-size: 13px;
      margin-top: 16px;
    }
    .ad-space {
      margin-top: 32px;
      padding: 16px;
      background: #f0f0f0;
      border-radius: 8px;
      color: #999;
      font-size: 12px;
    }
    @media (max-width: 480px) {
      .card { padding: 24px; }
      h1 { font-size: 20px; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <svg viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
    </div>
    <h1>${escapeHtml(link.title || 'Continue to your destination')}</h1>
    <p class="description">${escapeHtml(link.description || 'Click the button below to proceed to the page.')}</p>
    ${link.funnelContent ? `<div class="content">${escapeHtml(link.funnelContent)}</div>` : ''}
    <div class="progress-bar">
      <div class="progress-fill" id="progress"></div>
    </div>
    <a href="${escapeHtml(link.originalUrl)}" class="btn" id="continueBtn" rel="noopener noreferrer">
      Continue
    </a>
    <p class="timer" id="timer">Please wait <span id="countdown">${Math.ceil(delay)}</span> seconds...</p>
    <div class="ad-space">Advertisement Space</div>
  </div>
  <script>
    (function() {
      var delay = ${delayMs};
      var btn = document.getElementById('continueBtn');
      var progress = document.getElementById('progress');
      var timer = document.getElementById('timer');
      var countdown = document.getElementById('countdown');
      var remaining = Math.ceil(delay / 1000);

      // Simulate human-like scroll behavior
      setTimeout(function() { window.scrollTo(0, 0); }, Math.random() * 500);

      // Start progress bar
      requestAnimationFrame(function() {
        progress.style.width = '100%';
      });

      // Countdown
      var interval = setInterval(function() {
        remaining--;
        if (remaining <= 0) {
          clearInterval(interval);
          btn.classList.add('active');
          timer.textContent = 'Ready! Click continue to proceed.';
        } else {
          countdown.textContent = remaining;
        }
      }, 1000);
    })();
  </script>
</body>
</html>`;
}

function getErrorPage(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }
    h1 { font-size: 24px; color: #e74c3c; margin-bottom: 12px; }
    p { color: #555; font-size: 16px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

module.exports = router;
