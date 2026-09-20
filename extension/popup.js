// PhishGuard - Browser Extension Popup Script
// Calls the backend FastAPI / Node proxy serving the actual trained Python ML models.

const API_ENDPOINTS = [
  'http://localhost:3000/predict-url',
  'http://127.0.0.1:3000/predict-url',
  'http://127.0.0.1:5001/predict-url'
];

const websiteDomainEl = document.getElementById('website-domain');
const loadingStateEl = document.getElementById('loading-state');
const resultStateEl = document.getElementById('result-state');
const errorStateEl = document.getElementById('error-state');
const verdictTagEl = document.getElementById('verdict-tag');
const confidenceValEl = document.getElementById('confidence-value');
const explanationTextEl = document.getElementById('explanation-text');
const errorTextEl = document.getElementById('error-text');
const scanAgainBtn = document.getElementById('scan-again-btn');

function showLoading() {
  loadingStateEl.classList.remove('hidden');
  resultStateEl.classList.add('hidden');
  errorStateEl.classList.add('hidden');
  scanAgainBtn.disabled = true;
}

function showResult(data) {
  loadingStateEl.classList.add('hidden');
  errorStateEl.classList.add('hidden');
  resultStateEl.classList.remove('hidden');
  scanAgainBtn.disabled = false;

  const isPhishing = data.prediction === 'Phishing';

  if (isPhishing) {
    verdictTagEl.textContent = '⚠ Phishing Website';
    verdictTagEl.className = 'verdict verdict-phish';
  } else {
    verdictTagEl.textContent = '✓ Legitimate Website';
    verdictTagEl.className = 'verdict verdict-legit';
  }

  confidenceValEl.textContent = `${data.confidence}%`;
  explanationTextEl.textContent = data.reason || 'Analyzed via trained ML model.';
}

function showError(msg) {
  loadingStateEl.classList.add('hidden');
  resultStateEl.classList.add('hidden');
  errorStateEl.classList.remove('hidden');
  errorTextEl.textContent = msg;
  scanAgainBtn.disabled = false;
}

async function queryBackend(targetUrl) {
  let lastError = 'Unable to connect to PhishGuard backend service.';

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errData = await response.json().catch(() => ({}));
        lastError = errData.error || errData.detail || `Server error: ${response.status}`;
      }
    } catch {
      // Try next endpoint
    }
  }

  throw new Error(lastError);
}

function extractDomain(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname || urlStr;
  } catch {
    return urlStr;
  }
}

async function scanCurrentTab() {
  showLoading();

  let targetUrl = '';
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        targetUrl = tab.url;
      }
    }
  } catch (err) {
    console.warn('Could not query active tab:', err);
  }

  // Fallback if testing in non-extension environment
  if (!targetUrl || targetUrl.startsWith('chrome://') || targetUrl.startsWith('edge://') || targetUrl.startsWith('about:')) {
    if (targetUrl) {
      websiteDomainEl.textContent = targetUrl;
      showError('Internal browser pages cannot be scanned for phishing.');
      return;
    }
    // Test default URL if previewing standalone
    targetUrl = 'https://example.com';
  }

  websiteDomainEl.textContent = extractDomain(targetUrl);

  try {
    const result = await queryBackend(targetUrl);
    showResult(result);
  } catch (err) {
    showError(err.message || 'Failed to inspect URL. Ensure PhishGuard backend is running.');
  }
}

scanAgainBtn.addEventListener('click', () => {
  scanCurrentTab();
});

// Run scan automatically when popup is opened
document.addEventListener('DOMContentLoaded', () => {
  scanCurrentTab();
});
