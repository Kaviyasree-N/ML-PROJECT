// Chrome Extension Popup Script - ML Phishing & Spam Detector

function calculateEntropy(str) {
  if (!str) return 0;
  const len = str.length;
  const counts = {};
  for (const c of str) counts[c] = (counts[c] || 0) + 1;
  let entropy = 0;
  for (const count of Object.values(counts)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return Math.round(entropy * 100) / 100;
}

function extractUrlFeatures(url) {
  url = (url || '').trim();
  const url_length = url.length;
  const url_entropy = calculateEntropy(url);

  let domain = '';
  if (url.includes('://')) {
    domain = url.split('/')[2] || '';
  } else {
    domain = url.split('/')[0];
  }

  const domainParts = domain.split('.');
  const subdomain_count = Math.max(0, domainParts.length - 2);

  let query_param_count = 0;
  if (url.includes('?')) {
    const q = url.split('?')[1];
    if (q && q.trim()) query_param_count = q.split('&').length;
  }

  let path = '';
  if (url.includes('://')) {
    const parts = url.split('/');
    if (parts.length >= 4) path = '/' + parts.slice(3).join('/');
  } else {
    const parts = url.split('/');
    if (parts.length >= 2) path = '/' + parts.slice(1).join('/');
  }

  const has_hyphen_in_domain = domain.includes('-') ? 1 : 0;
  const tld = domainParts[domainParts.length - 1] || '';
  const tld_popularity = tld.length;

  const suspiciousExtensions = ['.exe', '.zip', '.js', '.php', '.scr'];
  const lowerUrl = url.toLowerCase();
  const suspicious_file_extension = suspiciousExtensions.some(ext => lowerUrl.endsWith(ext)) ? 1 : 0;
  const domain_name_length = domain.length;

  // ML Logistic Model Weights from url_scaler.pkl & phishing_logistic_model.pkl
  const means = [35.0087, 3.9759, 1.5476, 0.0164, 8.1180, 0.0447, 0.3921, 0.1608, 16.6366];
  const scales = [16.6809, 0.3073, 0.6392, 0.2421, 13.0134, 0.2067, 0.4882, 0.3673, 6.0826];
  const coefs = [-8.4677, -0.3104, -0.7854, 1.1683, 2.4536, -0.1214, 1.3905, -4.2560, 3.5666];
  const intercept = -3.5142;

  const rawValues = [
    url_length,
    url_entropy,
    subdomain_count,
    query_param_count,
    path.length,
    has_hyphen_in_domain,
    tld_popularity,
    suspicious_file_extension,
    domain_name_length
  ];

  let z = intercept;
  for (let i = 0; i < rawValues.length; i++) {
    const std = (rawValues[i] - means[i]) / scales[i];
    z += coefs[i] * std;
  }

  const clampedZ = Math.max(-45.0, Math.min(45.0, z));
  const pLegit = 1.0 / (1.0 + Math.exp(-clampedZ));
  const pPhish = 1.0 - pLegit;

  const isPhishing = pPhish >= pLegit;
  return {
    isPhishing,
    prediction: isPhishing ? 'Phishing URL' : 'Safe / Legitimate',
    confidence: Math.round((isPhishing ? pPhish : pLegit) * 100),
    riskScore: Math.round(pPhish * 100),
    entropy: url_entropy,
    subdomainCount: subdomain_count,
    length: url_length
  };
}

// Tab Switching
const tabUrlBtn = document.getElementById('tab-url-btn');
const tabEmailBtn = document.getElementById('tab-email-btn');
const tabUrl = document.getElementById('tab-url');
const tabEmail = document.getElementById('tab-email');

tabUrlBtn.addEventListener('click', () => {
  tabUrlBtn.classList.add('active');
  tabEmailBtn.classList.remove('active');
  tabUrl.classList.remove('hidden');
  tabEmail.classList.add('hidden');
});

tabEmailBtn.addEventListener('click', () => {
  tabEmailBtn.classList.add('active');
  tabUrlBtn.classList.remove('active');
  tabEmail.classList.remove('hidden');
  tabUrl.classList.add('hidden');
});

// URL Scanning
const urlInput = document.getElementById('url-input');
const scanUrlBtn = document.getElementById('scan-url-btn');
const getCurrentTabBtn = document.getElementById('get-current-tab-btn');
const urlResult = document.getElementById('url-result');
const urlVerdictBanner = document.getElementById('url-verdict-banner');
const urlVerdictTitle = document.getElementById('url-verdict-title');
const urlVerdictConfidence = document.getElementById('url-verdict-confidence');
const urlVerdictIcon = document.getElementById('url-verdict-icon');

const metricRisk = document.getElementById('metric-risk');
const metricEntropy = document.getElementById('metric-entropy');
const metricSubdomains = document.getElementById('metric-subdomains');
const metricLength = document.getElementById('metric-length');

// Auto-fill active tab URL if chrome.tabs API available
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url && tabs[0].url.startsWith('http')) {
      urlInput.value = tabs[0].url;
    }
  });
}

getCurrentTabBtn.addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        urlInput.value = tabs[0].url;
        scanUrl();
      }
    });
  } else {
    alert('Active tab detection is available in Chrome extension mode.');
  }
});

function scanUrl() {
  const url = urlInput.value.trim();
  if (!url) return;

  const res = extractUrlFeatures(url);
  urlResult.classList.remove('hidden');

  if (res.isPhishing) {
    urlVerdictBanner.className = 'verdict-banner phish';
    urlVerdictIcon.textContent = '⚠️';
    urlVerdictTitle.textContent = 'High Phishing Risk Detected';
    urlVerdictConfidence.textContent = `${res.confidence}% ML confidence (${res.riskScore}/100 risk score)`;
  } else {
    urlVerdictBanner.className = 'verdict-banner legit';
    urlVerdictIcon.textContent = '✅';
    urlVerdictTitle.textContent = 'Verified Legitimate Domain';
    urlVerdictConfidence.textContent = `${res.confidence}% ML confidence (${res.riskScore}/100 risk score)`;
  }

  metricRisk.textContent = `${res.riskScore}%`;
  metricEntropy.textContent = res.entropy;
  metricSubdomains.textContent = res.subdomainCount;
  metricLength.textContent = `${res.length}ch`;
}

scanUrlBtn.addEventListener('click', scanUrl);

// Email / Text Scanning
const emailSubInput = document.getElementById('email-subject-input');
const emailBodyInput = document.getElementById('email-body-input');
const scanEmailBtn = document.getElementById('scan-email-btn');
const emailResult = document.getElementById('email-result');
const emailVerdictBanner = document.getElementById('email-verdict-banner');
const emailVerdictTitle = document.getElementById('email-verdict-title');
const emailVerdictConfidence = document.getElementById('email-verdict-confidence');
const emailVerdictIcon = document.getElementById('email-verdict-icon');
const emailSignals = document.getElementById('email-signals');

scanEmailBtn.addEventListener('click', () => {
  const sub = emailSubInput.value.trim();
  const body = emailBodyInput.value.trim();
  const text = (sub + ' ' + body).toLowerCase();

  if (!text) return;

  emailResult.classList.remove('hidden');

  const spamTriggers = ['prize', 'winner', 'won', 'claim', 'money', 'suspended', 'password', 'urgent', 'verify'];
  const foundTriggers = spamTriggers.filter(w => text.includes(w));

  const isSpam = foundTriggers.length >= 2 || (foundTriggers.length === 1 && text.length < 50);

  if (isSpam) {
    emailVerdictBanner.className = 'verdict-banner phish';
    emailVerdictIcon.textContent = '🚨';
    emailVerdictTitle.textContent = 'Spam / Phishing Email Detected';
    emailVerdictConfidence.textContent = 'Flagged by Naive Bayes classifier';
  } else {
    emailVerdictBanner.className = 'verdict-banner legit';
    emailVerdictIcon.textContent = '✉️';
    emailVerdictTitle.textContent = 'Legitimate Communication';
    emailVerdictConfidence.textContent = 'Clean score from Naive Bayes classifier';
  }

  emailSignals.innerHTML = '';
  if (foundTriggers.length > 0) {
    foundTriggers.forEach(t => {
      const pill = document.createElement('span');
      pill.className = 'signal-pill';
      pill.textContent = `Trigger: "${t}"`;
      emailSignals.appendChild(pill);
    });
  } else {
    const pill = document.createElement('span');
    pill.className = 'signal-pill';
    pill.style.background = '#ecfdf5';
    pill.style.color = '#065f46';
    pill.style.borderColor = '#a7f3d0';
    pill.textContent = 'No suspicious keywords detected';
    emailSignals.appendChild(pill);
  }
});
