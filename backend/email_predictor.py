import os
import re
import math
import warnings
import joblib

warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')

VECTORIZER_PATH = os.path.join(MODELS_DIR, 'email_tfidf_vectorizer.pkl')
MODEL_PATH = os.path.join(MODELS_DIR, 'email_naive_bayes_model.pkl')

def clean_text(text: str) -> str:
    """Exact clean_text function from Email_detection.ipynb"""
    text = str(text).lower()
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    # Replace URLs with ' URL '
    text = re.sub(r'https?://\S+|www\.\S+', ' URL ', text)
    # Replace email addresses with ' EMAIL '
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', ' EMAIL ', text)
    # Replace numbers with ' NUMBER '
    text = re.sub(r'\b\d+\b', ' NUMBER ', text)
    # Keep only letters and spaces
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

class EmailPredictor:
    def __init__(self):
        self.vectorizer = None
        self.model = None
        self._load_models()

    def _load_models(self):
        try:
            if os.path.exists(VECTORIZER_PATH) and os.path.exists(MODEL_PATH):
                self.vectorizer = joblib.load(VECTORIZER_PATH)
                self.model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load pickled email models directly: {e}")

    def predict(self, subject: str, body: str, urls: str = '') -> dict:
        # Match Email_detection.ipynb: email_text = str(subject) + " " + str(body)
        email_text = f"{subject} {body}"
        if urls and urls.strip():
            email_text += f" {urls}"
        cleaned = clean_text(email_text)

        # Must use actual trained Version 1 models
        if self.vectorizer is None or self.model is None:
            raise RuntimeError("Version 1 models (email_tfidf_vectorizer.pkl and email_naive_bayes_model.pkl) are not loaded.")

        features = self.vectorizer.transform([cleaned])
        proba = self.model.predict_proba(features)[0]
        # ClassLabel: 0 = Legitimate (ham), 1 = Spam
        p_legit = float(proba[0])
        p_spam = float(proba[1])

        is_spam = p_spam >= 0.5
        prediction = "Spam" if is_spam else "Legitimate"
        confidence = round((p_spam if is_spam else p_legit) * 100, 1)

        if is_spam:
            reason = "Spam-like patterns were detected in the email content."
        else:
            reason = "No strong spam patterns were detected."

        return {
            "subject": subject,
            "body": body,
            "cleanedText": cleaned,
            "prediction": prediction,
            "confidence": confidence,
            "reason": reason,
            "spamProbability": round(p_spam, 4),
            "legitimateProbability": round(p_legit, 4)
        }

email_predictor = EmailPredictor()
