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

        # Use loaded model if available, otherwise apply calibrated parameters
        if self.scaler is not None and self.model is not None:
            scaled_vector = self.scaler.transform([raw_vector])
            pred_class = self.model.predict(scaled_vector)[0]
            proba = self.model.predict_proba(scaled_vector)[0]
            # ClassLabel 0 = Phishing, 1 = Legitimate
            p_phishing = float(proba[0])
            p_legit = float(proba[1])
        else:
            # Exact parameters extracted from url_scaler.pkl and phishing_logistic_model.pkl
            means = [35.0087, 3.9759, 1.5476, 0.0164, 8.1180, 0.0447, 0.3921, 0.1608, 16.6366]
            scales = [16.6809, 0.3073, 0.6392, 0.2421, 13.0134, 0.2067, 0.4882, 0.3673, 6.0826]
            coefs = [-8.4677, -0.3104, -0.7854, 1.1683, 2.4536, -0.1214, 1.3905, -4.2560, 3.5666]
            intercept = -3.5142

            z = intercept
            for x, m, s, c in zip(raw_vector, means, scales, coefs):
                std_x = (x - m) / s
                z += c * std_x

            clamped_z = max(-45.0, min(45.0, z))
            p_legit = 1.0 / (1.0 + math.exp(-clamped_z))
            p_phishing = 1.0 - p_legit
            pred_class = 1 if p_legit >= p_phishing else 0

        is_phishing = p_phishing >= p_legit
        prediction = "Phishing" if is_phishing else "Legitimate"
        confidence = round((p_phishing if is_phishing else p_legit) * 100, 2)
        risk_score = round(p_phishing * 100)

        if is_phishing:
            reasons = []
            if features_dict.get("suspicious_file_extension", 0) == 1:
                reasons.append("suspicious file extension")
            if features_dict.get("has_hyphen_in_domain", 0) == 1:
                reasons.append("hyphenated domain structure")
            if features_dict.get("subdomain_count", 0) >= 2:
                reasons.append(f"multiple subdomains ({features_dict['subdomain_count']})")
            if features_dict.get("url_entropy", 0) > 4.2:
                reasons.append("high character randomness/entropy")
            if features_dict.get("url_length", 0) > 60:
                reasons.append("excessive URL length")
            if features_dict.get("tld_popularity", 0) == 0:
                reasons.append("uncommon top-level domain")
            
            if reasons:
                reason = "Identified suspicious indicators: " + ", ".join(reasons) + "."
            else:
                reason = "URL lexical structure matches typical phishing URL feature patterns."
        else:
            reason = "Standard domain and path structure with normal entropy and legitimate indicators."

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
