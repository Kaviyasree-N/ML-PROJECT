# Phishing URL & Spam Guard - Chrome Extension

A lightweight, high-performance browser extension (Manifest V3) for proactive detection of phishing links, scam domains, and suspicious messages directly inside the browser.

## Features
- **One-Click Active Tab Scanning**: Automatically loads and inspects the active browser tab's URL.
- **Client-Side ML Feature Extraction**: Calculates Shannon character entropy, subdomain nesting depth, suspicious file extensions, and domain token patterns.
- **Email & Message Spam Classifier**: Rapid text parser highlighting phishing trigger terms and scoring probability.
- **Fast & Private**: Zero external telemetry required for core heuristic scoring.

## How to Install in Chrome / Chromium Browsers

1. Open Google Chrome (or Brave, Edge, Opera, Chromium).
2. Navigate to `chrome://extensions` in your address bar.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select this `extension/` directory.
6. The **ML Security Guard** shield icon will appear in your browser extensions toolbar!

## Architecture
- `manifest.json`: Manifest V3 specification with `activeTab`, `tabs`, and `storage` permissions.
- `popup.html`: Browser extension popup view layout.
- `popup.css`: Styling matching the modern security design system.
- `popup.js`: Logic for DOM events, active tab extraction, and logistic regression scoring.
