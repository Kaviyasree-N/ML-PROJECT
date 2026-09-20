import os
import math
import warnings
import joblib
import numpy as np

warnings.filterwarnings('ignore')

# Path to models directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')

SCALER_PATH = os.path.join(MODELS_DIR, 'url_scaler.pkl')
MODEL_PATH = os.path.join(MODELS_DIR, 'phishing_logistic_model.pkl')

class URLPredictor:
    def __init__(self):
        self.scaler = None
        self.model = None
        self.feature_names = [
            'url_length',
            'url_entropy',
            'subdomain_count',
            'query_param_count',
            'path_length',
            'has_hyphen_in_domain',
            'tld_popularity',
            'suspicious_file_extension',
            'domain_name_length'
        ]
        self._load_models()

    def _load_models(self):
        try:
            if os.path.exists(SCALER_PATH) and os.path.exists(MODEL_PATH):
                self.scaler = joblib.load(SCALER_PATH)
                self.model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load pickled models directly: {e}")

    def extract_features(self, url: str) -> dict:
        url = (url or '').strip()
        url_length = len(url)

        # URL Shannon entropy
        url_entropy = 0.0
        if url_length > 0:
            char_counts = {}
            for c in url:
                char_counts[c] = char_counts.get(c, 0) + 1
            for count in char_counts.values():
                p = count / url_length
                if p > 0:
                    url_entropy -= p * math.log2(p)

        # Domain extraction
        if '://' in url:
            domain = url.split('/')[2] if len(url.split('/')) > 2 else ''
        else:
            domain = url.split('/')[0]

        domain_parts = domain.split('.')
        subdomain_count = len(domain_parts) - 2 if len(domain_parts) > 2 else 0

        # Query param count
        query_param_count = 0
        if '?' in url:
            query_part = url.split('?')[1]
            if query_part.strip():
                query_param_count = len(query_part.split('&'))

        # Path length
        path = ''
        if '://' in url:
            parts = url.split('/')
            if len(parts) >= 4:
                path = '/' + '/'.join(parts[3:])
        else:
            parts = url.split('/')
            if len(parts) >= 2:
                path = '/' + '/'.join(parts[1:])
        path_length = len(path)

        has_hyphen_in_domain = 1 if '-' in domain else 0
        tld = domain_parts[-1] if domain_parts else ''
        tld_popularity = len(tld)

        suspicious_extensions = ['.exe', '.zip', '.js', '.php', '.scr']
        lower_url = url.lower()
        suspicious_file_extension = 1 if any(lower_url.endswith(ext) for ext in suspicious_extensions) else 0
        domain_name_length = len(domain)

        return {
            'url_length': url_length,
            'url_entropy': round(url_entropy, 4),
            'subdomain_count': subdomain_count,
            'query_param_count': query_param_count,
            'path_length': path_length,
            'has_hyphen_in_domain': has_hyphen_in_domain,
            'tld_popularity': tld_popularity,
            'suspicious_file_extension': suspicious_file_extension,
            'domain_name_length': domain_name_length,
            'domain': domain,
            'path': path
        }

    def predict(self, url: str) -> dict:
        features_dict = self.extract_features(url)
        raw_vector = [features_dict[k] for k in self.feature_names]

        # Must use actual trained Version 1 models
        if self.scaler is None or self.model is None:
            raise RuntimeError("Version 1 models (url_scaler.pkl and phishing_logistic_model.pkl) are not loaded.")

        scaled_vector = self.scaler.transform([raw_vector])
        proba = self.model.predict_proba(scaled_vector)[0]
        # ClassLabel: 0 = Phishing, 1 = Legitimate
        p_phishing = float(proba[0])
        p_legit = float(proba[1])

        is_phishing = p_phishing >= p_legit
        prediction = "Phishing" if is_phishing else "Legitimate"
        confidence = round((p_phishing if is_phishing else p_legit) * 100, 1)
        risk_score = round(p_phishing * 100)

        if is_phishing:
            reasons = []
            if features_dict.get("suspicious_file_extension", 0) == 1:
                reasons.append("suspicious file extension")
            if features_dict.get("has_hyphen_in_domain", 0) == 1:
                reasons.append("suspicious domain pattern")
            if features_dict.get("subdomain_count", 0) >= 2:
                reasons.append(f"suspicious subdomains ({features_dict['subdomain_count']})")
            if features_dict.get("url_entropy", 0) > 4.2:
                reasons.append("unusual URL characters")
            if features_dict.get("url_length", 0) > 60:
                reasons.append("unusually long URL")
            if features_dict.get("domain_name_length", 0) > 25:
                reasons.append("unusual domain structure")

            if reasons:
                reason = "Suspicious URL structure and domain patterns were detected (" + ", ".join(reasons) + ")."
            else:
                reason = "Suspicious URL structure and domain patterns were detected."
        else:
            reason = "No strong suspicious URL patterns were detected."

        return {
            "url": url,
            "prediction": prediction,
            "confidence": confidence,
            "reason": reason,
            "riskScore": risk_score,
            "probabilities": {
                "phishing": round(p_phishing, 4),
                "legitimate": round(p_legit, 4)
            },
            "extractedMetrics": features_dict
        }

url_predictor = URLPredictor()
