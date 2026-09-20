# PhishGuard — AI-Powered Phishing URL & Email Spam Detection

PhishGuard is a lightweight, dual-pipeline machine learning security system that detects malicious phishing URLs and deceptive spam emails in real time. It pairs trained statistical models with human-readable explanations and includes a responsive web application, a FastAPI REST service, and a privacy-preserving Chromium browser extension.

---

## 1. Project Overview

Phishing and email fraud remain the primary entry points for cyber attacks, credential harvesting, and financial scams. Many users fall victim because deceptive URLs and emails mimic trusted brands with high visual fidelity.

PhishGuard bridges this gap by providing an accessible, transparent security assistant. Users can inspect URLs or email text to receive immediate classifications, true statistical confidence ratings, and concise, plain-language explanations of identified risk indicators.

---

## 2. Problem Statement

* **Zero-Day Phishing Attacks:** Traditional static blocklists and domain blacklists are reactive; newly registered malicious domains often bypass them before detection.
* **Complex Deceptive Phrasing:** Modern spam campaigns leverage urgent language, lottery hooks, and spoofed tokens that bypass basic keyword filters.
* **Technical Complexity:** Most cybersecurity tools present log odds, raw feature vectors, or cryptic telemetry that normal end-users cannot interpret.

---

## 3. The Solution

PhishGuard delivers a three-tier defense ecosystem:
1. **Web Scanner Interface:** Clean, focused web application allowing instant analysis of URLs and emails with clear visual verdicts.
2. **Authoritative ML Backend:** Dedicated Python FastAPI service running serialized Scikit-learn pipelines (`.pkl` models) without approximations or hardcoded rules.
3. **ActiveTab Browser Extension:** Lightweight Chrome/Chromium extension (Manifest V3) that checks the active browser tab URL against the backend with a single click.

---

## 4. Key Features

* **Dual Detection Pipelines:** Separate dedicated classifiers optimized specifically for URL lexical structures and email natural language text.
* **Genuine Model Probabilities:** All confidence percentages are directly computed from model class posterior probabilities (`predict_proba`).
* **Short, Understandable Explanations:** Non-technical explanations explain *why* an item was flagged (e.g., suspicious subdomains, unusual domain structures, or spam-like phrasing) without mathematical jargon.
* **Zero-Logging Extension:** Browser extension requires only `activeTab` permission, inspecting only the submitted URL without accessing browsing history or storing user data.
* **Resilient Process Supervision:** Node.js Express gateway provides seamless API proxying, auto-recovery, and process management for the Python microservice.

---

## 5. How It Works

### URL Inspection Workflow
```
Target URL
   │
   ▼
Lexical Feature Extraction (9 numeric attributes)
   │
   ▼
Feature Normalization (StandardScaler: url_scaler.pkl)
   │
   ▼
Logistic Regression Inference (phishing_logistic_model.pkl)
   │
   ▼
Classification Result: "Phishing URL" or "Legitimate URL"
Confidence: Model Probability (%)
Explanation: 1–2 plain-language sentences detailing observed structure
```

### Email Inspection Workflow
```
Email Subject + Body
   │
   ▼
NLP Text Cleaning & Tokenization
(lowercase, HTML removal, URL/EMAIL/NUMBER token replacement)
   │
   ▼
TF-IDF Vectorization (email_tfidf_vectorizer.pkl)
   │
   ▼
Multinomial Naive Bayes Classification (email_naive_bayes_model.pkl)
   │
   ▼
Classification Result: "Spam Email" or "Legitimate Email"
Confidence: Model Probability (%)
Explanation: Concise summary of vocabulary and content patterns
```

---

## 6. URL Detection Model

* **Algorithm:** Logistic Regression with `StandardScaler` normalization.
* **Model File:** `models/phishing_logistic_model.pkl`
* **Scaler File:** `models/url_scaler.pkl`
* **Feature Vector:** Exactly 9 lexical features extracted in sequential order:
  1. `url_length` — Total character count of the URL.
  2. `url_entropy` — Shannon entropy measuring character distribution and randomness.
  3. `subdomain_count` — Count of nested subdomains present in the hostname.
  4. `query_param_count` — Count of dynamic URL parameters (`?key=value`).
  5. `path_length` — Character length of the resource path.
  6. `has_hyphen_in_domain` — Binary indicator for hyphens inside domain name.
  7. `tld_popularity` — Length and prevalence score of the top-level domain.
  8. `suspicious_file_extension` — Binary indicator for high-risk extensions (`.exe`, `.scr`, `.zip`, `.js`, `.php`).
  9. `domain_name_length` — Character length of the registered domain.

---

## 7. Email Spam Detection Model

* **Algorithm:** Multinomial Naive Bayes (`MultinomialNB`) with Term Frequency-Inverse Document Frequency (`TfidfVectorizer`).
* **Model File:** `models/email_naive_bayes_model.pkl`
* **Vectorizer File:** `models/email_tfidf_vectorizer.pkl`
* **Text Preprocessing Pipeline:**
  * Lowercase normalization.
  * Removal of HTML tags, entities, and markdown noise.
  * Uniform token replacement: URLs replaced with `URL`, email addresses with `EMAIL`, numbers with `NUMBER`.
  * Stripping of non-alphabetic punctuation and collapse of redundant whitespace.
  * Sparse matrix generation through the fitted TF-IDF vocabulary.

---

## 8. Model Performance

The deployed models reflect the following benchmark metrics from the evaluation datasets:

### URL Phishing Model (Logistic Regression)
| Metric | Value |
| :--- | :--- |
| **Accuracy** | **97.59%** |
| **Phishing Precision** | **99.23%** |
| **Phishing Recall** | **96.92%** |
| **Phishing F1-Score** | **98.06%** |

### Email Spam Model (Multinomial Naive Bayes)
| Metric | Value |
| :--- | :--- |
| **Accuracy** | **96.90%** |
| **Spam Precision** | **97.24%** |
| **Spam Recall** | **92.15%** |
| **Spam F1-Score** | **94.63%** |

> **Important Note on Confidence:** All confidence values presented by the website, API, and extension are derived directly from the model's posterior probability distribution. Confidence indicates the statistical likelihood of the prediction according to learned training distributions; it is not an absolute mathematical guarantee.

---

## 9. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Interfaces                   │
│   React 18 Web UI                Chromium Extension     │
│   (UrlScanner / EmailScanner)    (Manifest V3 activeTab)│
└───────────────┬─────────────────────────────┬───────────┘
                │                             │
                ▼                             │
┌─────────────────────────────────┐           │
│   Express Gateway (Node.js)     │           │
│   Port: 3000                    │           │
│   - Process Supervision         │           │
│   - Static Asset Serving        │           │
│   - API Proxy & Health Probes   │           │
└───────────────┬─────────────────┘           │
                │                             │
                └──────────────┬──────────────┘
                               │ HTTP POST
                               ▼
┌─────────────────────────────────────────────────────────┐
│            Python FastAPI Service (Port: 5001)          │
│   /predict-url                   /predict-email         │
│   ┌────────────────────────┐    ┌────────────────────┐  │
│   │ URLPredictor           │    │ EmailPredictor     │  │
│   │ 9 Lexical Features     │    │ Text Tokenization  │  │
│   │ url_scaler.pkl         │    │ TF-IDF Vectorizer  │  │
│   │ Logistic Regression    │    │ Multinomial NB     │  │
│   └────────────────────────┘    └────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Technology Stack

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Vite
* **Gateway Server:** Node.js, Express, `tsx`
* **Machine Learning & Backend:** Python 3.11, FastAPI, Uvicorn, Scikit-learn, Joblib, NumPy
* **Browser Extension:** Manifest V3 (Vanilla JS, HTML5, CSS3)
* **Model Serialization:** Joblib pickle (`.pkl`) artifacts

---

## 11. Actual Project Structure

```
.
├── backend/
│   ├── email_predictor.py     # NLP preprocessing & MultinomialNB inference
│   ├── main.py                # FastAPI REST application
│   ├── requirements.txt       # Python dependencies
│   └── url_predictor.py       # 9-feature extractor, scaler & Logistic Regression
├── extension/
│   ├── manifest.json          # Manifest V3 extension configuration
│   ├── popup.css              # Clean popup styling
│   ├── popup.html             # Popup layout
│   ├── popup.js               # Tab inspection & API client
│   └── README.md              # Extension installation guide
├── frontend/
│   ├── index.html             # HTML entry point
│   ├── package.json           # Frontend dependencies & scripts
│   ├── server.ts              # Express server + Python supervisor + Vite middleware
│   ├── tsconfig.json          # TypeScript compiler options
│   ├── vite.config.ts         # Vite build configuration
│   └── src/
│       ├── App.tsx            # Main application shell & tab routing
│       ├── index.css          # Tailwind CSS directives
│       ├── main.tsx           # React DOM root render
│       ├── ml-models.ts       # Type definitions & model constants
│       ├── types.ts           # Shared TypeScript interfaces
│       └── components/
│           ├── EmailScanner.tsx  # Email check UI with probability feedback
│           └── UrlScanner.tsx    # URL check UI with probability feedback
├── models/
│   ├── email_naive_bayes_model.pkl  # Trained Multinomial Naive Bayes model
│   ├── email_tfidf_vectorizer.pkl   # Fitted TF-IDF text vectorizer
│   ├── phishing_logistic_model.pkl  # Trained Logistic Regression model
│   └── url_scaler.pkl               # Fitted StandardScaler parameters
├── notebooks/
│   ├── Email_detection.ipynb        # Model exploration & text training pipeline
│   └── Phishing_Detect_Model.ipynb  # Feature engineering & logistic training
├── package.json               # Root build and supervisor scripts
└── README.md                  # Project documentation
```

---

## 12. API Endpoints

### 1. URL Phishing Prediction
* **Method:** `POST`
* **Endpoint:** `/predict-url` (also available via `/api/predict/url`)
* **Request Body:**
  ```json
  {
    "url": "https://paypal-security-update.verify-account-login.com/login.php"
  }
  ```
* **Response:**
  ```json
  {
    "url": "https://paypal-security-update.verify-account-login.com/login.php",
    "prediction": "Phishing",
    "confidence": 93.7,
    "reason": "Suspicious URL structure and domain patterns were detected (suspicious file extension, suspicious domain pattern, unusual URL characters, unusually long URL, unusual domain structure).",
    "riskScore": 94,
    "probabilities": {
      "phishing": 0.937,
      "legitimate": 0.063
    },
    "extractedMetrics": {
      "url_length": 64,
      "url_entropy": 4.3374,
      "subdomain_count": 1,
      "query_param_count": 0,
      "path_length": 10,
      "has_hyphen_in_domain": 1,
      "tld_popularity": 3,
      "suspicious_file_extension": 1,
      "domain_name_length": 47,
      "domain": "paypal-security-update.verify-account-login.com",
      "path": "/login.php"
    }
  }
  ```

### 2. Email Spam Prediction
* **Method:** `POST`
* **Endpoint:** `/predict-email` (also available via `/api/predict/email`)
* **Request Body:**
  ```json
  {
    "subject": "Congratulations! You won $10,000 cash prize",
    "body": "Claim your lottery prize money immediately! Click here to claim your reward."
  }
  ```
* **Response:**
  ```json
  {
    "subject": "Congratulations! You won $10,000 cash prize",
    "body": "Claim your lottery prize money immediately! Click here to claim your reward.",
    "cleanedText": "congratulations you won NUMBER NUMBER cash prize claim your lottery prize money immediately click here to claim your reward",
    "prediction": "Spam",
    "confidence": 77.5,
    "reason": "Spam-like patterns were detected in the email content.",
    "spamProbability": 0.7751,
    "legitimateProbability": 0.2249
  }
  ```

### 3. Service Health Check
* **Method:** `GET`
* **Endpoint:** `/api/health`
* **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-09-20T16:01:06.055Z"
  }
  ```

---

## 13. Installation & Running Steps

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **Python:** v3.10 or higher with `pip`

### Step 1: Clone Repository
```bash
git clone https://github.com/kaviyasreen251207/phishguard.git
cd phishguard
```

### Step 2: Install Node.js Dependencies
```bash
npm install
npm --prefix frontend install
```

### Step 3: Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 4: Run Development Server
```bash
npm run dev
```
* The application runs on **`http://localhost:3000`**.
* The Node server automatically manages and connects to the FastAPI backend on port `5001`.

### Step 5: Build for Production
```bash
npm run build
npm start
```

---

## 14. Browser Extension Setup

1. Open your Chromium-based browser (Google Chrome, Brave, Microsoft Edge).
2. Go to **`chrome://extensions`**.
3. Toggle on **Developer mode** in the upper-right corner.
4. Click **Load unpacked** in the top-left toolbar.
5. Select the **`extension/`** folder from this repository.
6. Pin the **PhishGuard** icon in your toolbar.
7. Click the extension on any active website to inspect its security status in real time.

---

## 15. Limitations

* **Lexical-Only URL Analysis:** The URL classifier assesses structural and lexical features of the URL string itself; it does not render the target website's DOM or execute JavaScript.
* **Text-Based Email Classification:** Image-only spam, embedded QR codes, or heavily obfuscated homoglyph attacks may evade bag-of-words/TF-IDF representations.
* **Probabilistic Scoring:** Machine learning classifications reflect statistical correlations observed during training and do not constitute an infallible security guarantee.

---

## 16. Future Improvements

* **Transformer NLP Integration:** Incorporate modern lightweight transformer models (e.g., DistilBERT) for context-aware email semantic analysis.
* **Live Threat Intelligence Feeds:** Query live DNS reputation lists and WHOIS domain age APIs to augment lexical scores.
* **Content-Aware DOM Scanning:** Enable optional DOM analysis in the browser extension to inspect on-page login forms and SSL certificates.
* **Community Reporting:** Allow users to submit verified false positives or missed phishing samples for continuous dataset refinement.

---

## 17. Author

* **Kaviyasree** — [kaviyasreen251207@gmail.com](mailto:kaviyasreen251207@gmail.com)

---

## 18. Disclaimer

PhishGuard is an educational and auxiliary cybersecurity tool designed to help identify phishing indicators. It is not an absolute replacement for antivirus protection, email gateway filtering, multi-factor authentication, or personal security diligence. The developers accept no liability for any security breaches or damages resulting from reliance on model outputs.
