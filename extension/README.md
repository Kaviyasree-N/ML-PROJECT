# PhishGuard - Browser Extension

A simple, privacy-focused Chrome / Chromium browser extension (Manifest V3) that automatically inspects the current browser tab URL using PhishGuard's trained machine learning backend.

## Features
- **Automatic Current Tab Inspection**: Immediately reads the current tab URL and checks it against the trained model.
- **Direct Backend Integration**: Connects directly to the FastAPI server (`models/phishing_logistic_model.pkl` + `models/url_scaler.pkl`) with no duplicate client-side models.
- **Clear User Explanations**: Displays whether the site is Legitimate or Phishing, with exact model confidence and a simple, understandable explanation.
- **Safe & Privacy Preserving**: Only requires `activeTab` permission. Does not record browsing history or store personal data.

## How to Install in Chrome / Chromium Browsers

1. Open Google Chrome (or Chromium, Brave, Edge).
2. Navigate to `chrome://extensions` in your address bar.
3. Enable **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked**.
5. Select this `extension/` directory.
6. Click the **PhishGuard** extension icon in your toolbar to scan the current website!
