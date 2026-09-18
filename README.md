# ML-PROJECT: Phishing URL & Email Spam Detection Suite

Dual-pipeline machine learning security engine with web dashboard, Python backend, and Chrome browser extension.

## Target Project Structure

```
ML-PROJECT/
│
├── models/
│   ├── phishing_logistic_model.pkl    # Trained Logistic Regression model
│   ├── url_scaler.pkl                 # StandardScaler parameters for 9 URL features
│   ├── email_naive_bayes_model.pkl    # Multinomial Naive Bayes model
│   └── email_tfidf_vectorizer.pkl     # TF-IDF text vectorizer
│
├── notebooks/
│   ├── Phishing_Detect_Model.ipynb    # URL feature engineering & training
│   └── Email_detection.ipynb          # Spam text cleaning, TF-IDF & training
│
├── backend/
│   ├── main.py                        # FastAPI REST service
│   ├── url_predictor.py               # Feature extractor & logistic predictor
│   ├── email_predictor.py             # NLP tokenizer & naive bayes predictor
│   └── requirements.txt               # Python dependencies
│
├── frontend/
│   ├── package.json                   # Frontend dependencies & build scripts
│   ├── src/                           # React UI application components
│   ├── public/                        # Static assets & icons
│   ├── server.ts                      # Full-stack Express + Vite integration server
│   ├── vite.config.ts                 # Vite build configuration
│   └── tsconfig.json                  # TypeScript compiler settings
│
├── extension/
│   ├── manifest.json                  # Manifest V3 browser extension configuration
│   ├── popup.html                     # Extension popup interface
│   ├── popup.css                      # Extension styles
│   ├── popup.js                       # Active tab URL inspection & risk scoring
│   └── README.md                      # Installation instructions for Chrome/Brave/Edge
│
├── README.md
└── .gitignore
```

## Machine Learning Architecture

### 1. Phishing URL Detection
- **Algorithm**: Logistic Regression with `StandardScaler`
- **Trained Performance**: 95.52% Accuracy, 98.04% Precision, 95.39% F1 Score, 5-Fold Cross Validation Avg F1 = 0.9578
- **Extracted Features (9 dimensions)**:
  1. `url_length`: Total URL character length
  2. `url_entropy`: Character Shannon entropy
  3. `subdomain_count`: Number of nested subdomains
  4. `query_param_count`: Number of dynamic GET parameters
  5. `path_length`: Length of resource path
  6. `has_hyphen_in_domain`: Presence of hyphens in hostname
  7. `tld_popularity`: TLD extension length
  8. `suspicious_file_extension`: Presence of `.exe`, `.zip`, `.js`, `.php`, `.scr`
  9. `domain_name_length`: Length of hostname

### 2. Email Spam Classification
- **Algorithm**: Multinomial Naive Bayes with TF-IDF Vectorization
- **Dataset**: SpamAssassin Corpus (5,809 emails)
- **Trained Performance**: 96.99% Accuracy, 97.25% Precision, 92.44% Recall, 94.78% F1 Score
- **NLP Preprocessing Pipeline**:
  - HTML tag removal
  - URL token masking (`URL`)
  - Email address token masking (`EMAIL`)
  - Number token masking (`NUMBER`)
  - Case normalization & non-alphabetic filtering
  - Spam and Legitimate n-gram evidence scoring

## Running the Web Frontend

```bash
# Run web application (Express + Vite on port 3000)
npm run dev

# Build for production
npm run build
```

## Running the Python Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

## Chrome Extension Installation
1. Navigate to `chrome://extensions` in Chromium-based browsers.
2. Enable **Developer Mode**.
3. Click **Load Unpacked** and select the `extension/` folder.

