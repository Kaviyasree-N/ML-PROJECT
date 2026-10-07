# PhishGuard — Real-Time Phishing URL & Email Spam Detection

**PhishGuard** is an intelligent, dual-engine cybersecurity platform that detects zero-hour phishing URLs and deceptive spam emails in real time. It pairs fast Machine Learning classifiers with live Google Safe Browsing threat intelligence to provide transparent security assessments in under 50 milliseconds.

---

## 🚀 Run in a Single Command

After cloning the repository from GitHub:

```bash
git clone https://github.com/kaviyasreen251207/phishguard.git
cd phishguard
```

### Option A: The Easiest Way (Auto-setup & Run)
Run the all-in-one startup script:
```bash
./start.sh
```
*(On Windows or Unix systems where `npm` is preferred)*:
```bash
npm install && npm start
```

That's it! Open your browser at:
👉 **`http://localhost:3000`**

- All dependencies are configured automatically.
- Both the web dashboard and prediction engines launch simultaneously.
- If Python/pip is not present on your system, PhishGuard automatically runs its built-in mathematical ML classifiers so you never face dependency roadblocks.

---

## ☁️ Deployment (Cloud & Production)

PhishGuard is configured for instant cloud deployment on any host:

### 1. Docker Deployment (1 Command)
```bash
docker build -t phishguard .
docker run -p 3000:3000 phishguard
```

### 2. PaaS / Cloud Platforms (Render, Railway, Heroku, Cloud Run)
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- A pre-configured `Procfile` and `Dockerfile` are included in the repository.
- The server dynamically binds to `process.env.PORT` (defaults to 3000).

### 3. Optional: Live Threat Intelligence API Key
To enable live Google Safe Browsing lookups, set this environment variable in your deployment dashboard or local `.env`:
```env
GOOGLE_SAFE_BROWSING_API_KEY=your_google_api_key_here
```
*(If omitted, the machine learning models continue to run independently with graceful fallback).*

---

## 🛡️ Key Features

- **Phishing URL Detection:** Analyzes 9 lexical and structural features (character entropy, domain hyphens, path length, suspicious extensions) using a trained **Logistic Regression** model (**95.52% Accuracy**, **98.04% Precision**).
- **Email Spam Classification:** Cleans and normalizes email text using TF-IDF representation (15,000 terms) and a **Multinomial Naive Bayes** classifier (**96.99% Accuracy**, **97.25% Precision**).
- **Live Threat Intelligence:** Verifies URLs against the **Google Safe Browsing Lookup API v4** for active malware and social engineering threats.
- **Explainable Results:** Provides plain-language explanations of identified risk indicators and statistical confidence scores.
- **Browser Extension:** Manifest V3 extension for Chrome, Brave, and Edge for single-click tab security auditing.

---

## 🧩 Browser Extension Setup

1. Open **Google Chrome** (or Edge / Brave) and go to `chrome://extensions`.
2. Toggle **ON** **Developer mode** in the top-right corner.
3. Click **Load unpacked** (top-left) and select the **`extension`** folder from this project.
4. Pin **PhishGuard** to your browser toolbar to inspect any active website.

---

## 📊 Model Benchmark Summary

| Detection Engine | Algorithm | Dataset | Accuracy | Precision | F1-Score | Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **URL Scanner** | Logistic Regression (`StandardScaler`) | 101,219 URLs | **95.52%** | **98.04%** | **95.39%** | ~1.2 ms |
| **Email Scanner** | Multinomial Naive Bayes (`TF-IDF`) | 5,809 Emails | **96.99%** | **97.25%** | **94.78%** | ~2.8 ms |

---

## 👥 Project Team

Developed under the Department of Computer Science and Engineering at **Chennai Institute of Technology (CIT), Chennai** (Autonomous, Affiliated to Anna University):

- **KAVIYA SREE N** (`Reg. No: 2104251040422`) — URL Lexical Analysis, Logistic Regression Model & Backend Architecture
- **MINHU P** (`Reg. No: 2104251040566`) — Email NLP Preprocessing, Naive Bayes Model, Web Interface & Extension
- **Faculty Mentor:** **Ms. KALPANA A**, Assistant Professor, Dept. of CSE, Chennai Institute of Technology

---

## 📄 License
This project is open-source under the MIT License.
