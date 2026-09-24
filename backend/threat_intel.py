import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, List

SAFE_BROWSING_ENDPOINT = "https://safebrowsing.googleapis.com/v4/threatMatches:find"

def _get_api_key() -> str:
    key = os.environ.get("GOOGLE_SAFE_BROWSING_API_KEY") or os.environ.get("SAFE_BROWSING_API_KEY")
    if key and key.strip():
        return key.strip().strip("'\"")

    # Search potential .env locations if environment variable was not directly exported
    search_dirs = [
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        os.path.dirname(os.path.abspath(__file__)),
        os.getcwd(),
        os.path.join(os.getcwd(), "frontend"),
    ]
    for d in search_dirs:
        env_file = os.path.join(d, ".env")
        if os.path.exists(env_file):
            try:
                with open(env_file, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k in ("GOOGLE_SAFE_BROWSING_API_KEY", "SAFE_BROWSING_API_KEY") and v:
                                os.environ[k] = v
                                return v
            except Exception:
                pass
    return ""

def check_google_safe_browsing(url: str) -> Dict[str, Any]:
    """
    Performs a separate threat-intelligence lookup using Google Safe Browsing Lookup API v4.
    
    Returns structured results distinguishing:
    - Known unsafe URL detected ('unsafe')
    - No matching unsafe resource found ('not_found')
    - Threat intelligence unavailable ('unavailable')
    """
    api_key = _get_api_key()

    if not api_key:
        return {
            "status": "unavailable",
            "verdict": "Threat intelligence unavailable",
            "provider": "Google Safe Browsing",
            "matches": [],
            "details": "Threat intelligence service unavailable: API key not configured in environment (GOOGLE_SAFE_BROWSING_API_KEY).",
            "disclaimer": "Absence of threat intelligence does not imply safety."
        }

    target_url = (url or "").strip()
    if not target_url.startswith(("http://", "https://")):
        target_url = "https://" + target_url

    payload = {
        "client": {
            "clientId": "phishguard-scanner",
            "clientVersion": "1.0.0"
        },
        "threatInfo": {
            "threatTypes": [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
                "POTENTIALLY_HARMFUL_APPLICATION"
            ],
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [
                {"url": target_url}
            ]
        }
    }

    req_url = f"{SAFE_BROWSING_ENDPOINT}?key={api_key.strip()}"
    data_bytes = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        req_url,
        data=data_bytes,
        headers={"Content-Type": "application/json", "User-Agent": "PhishGuard/1.0"}
    )

    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            if response.status == 200:
                res_body = response.read().decode("utf-8")
                res_json = json.loads(res_body) if res_body else {}
                matches: List[Dict[str, Any]] = res_json.get("matches", [])

                if matches and len(matches) > 0:
                    threat_types = sorted(list(set(m.get("threatType", "THREAT") for m in matches)))
                    return {
                        "status": "unsafe",
                        "verdict": "Known unsafe URL detected",
                        "provider": "Google Safe Browsing",
                        "matches": threat_types,
                        "details": f"Flagged on Google Safe Browsing blacklist ({', '.join(threat_types)}).",
                        "disclaimer": "Confirmed matching unsafe resource in active threat feeds."
                    }
                else:
                    return {
                        "status": "not_found",
                        "verdict": "No matching unsafe resource found",
                        "provider": "Google Safe Browsing",
                        "matches": [],
                        "details": "URL is not currently cataloged in Google Safe Browsing threat databases.",
                        "disclaimer": "Absence from threat intelligence databases does NOT prove that a website is safe. Newly deployed phishing sites often evade blacklists."
                    }
            else:
                return {
                    "status": "unavailable",
                    "verdict": "Threat intelligence unavailable",
                    "provider": "Google Safe Browsing",
                    "matches": [],
                    "details": f"Google Safe Browsing returned HTTP status {response.status}.",
                    "disclaimer": "Threat intelligence lookup service was unreachable."
                }
    except Exception as e:
        error_msg = str(e)
        if api_key in error_msg:
            error_msg = error_msg.replace(api_key, "[REDACTED]")
        return {
            "status": "unavailable",
            "verdict": "Threat intelligence unavailable",
            "provider": "Google Safe Browsing",
            "matches": [],
            "details": f"Threat intelligence lookup failed or timed out ({error_msg}).",
            "disclaimer": "Threat intelligence service was temporarily unreachable."
        }


def combine_url_assessment(ml_result: Dict[str, Any], threat_intel: Dict[str, Any]) -> Dict[str, Any]:
    """
    Combines the independent ML Detection result and Threat Intelligence result
    into a clear security assessment without inventing any numerical score.
    """
    is_ml_phishing = ml_result.get("prediction") == "Phishing"
    intel_status = threat_intel.get("status", "unavailable")

    if intel_status == "unsafe":
        final_assessment = "Known unsafe resource"
        assessment_level = "danger"
        summary = "Flagged by Google Safe Browsing threat intelligence as an active malicious URL."
        recommended_action = "Do not open this URL or submit credentials. Avoid interacting with the page."
    elif is_ml_phishing:
        final_assessment = "Phishing indicators detected"
        assessment_level = "warning"
        if intel_status == "not_found":
            summary = "Machine learning model identified structural and domain phishing characteristics. Note that newly launched phishing sites frequently precede database indexing."
        else:
            summary = "Machine learning model identified structural and domain phishing characteristics (threat intelligence database was unavailable)."
        recommended_action = "Do not open this URL or submit any personal credentials, passwords, or financial details."
    else:
        final_assessment = "No strong suspicious indicators detected"
        assessment_level = "safe"
        if intel_status == "not_found":
            summary = "No suspicious structural anomalies were detected by the ML model, and no matching records were found in Google Safe Browsing."
        else:
            summary = "No suspicious structural anomalies were detected by the ML model (threat intelligence database was unavailable)."
        recommended_action = "This website appears normal. However, always verify the domain name in the address bar before logging in."

    return {
        "finalAssessment": final_assessment,
        "assessmentLevel": assessment_level,
        "summary": summary,
        "recommendedAction": recommended_action
    }
