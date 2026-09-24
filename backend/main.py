import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from url_predictor import url_predictor
from email_predictor import email_predictor
from threat_intel import check_google_safe_browsing, combine_url_assessment

app = FastAPI(
    title="Phishing & Spam ML Detection API",
    description="Backend API serving predictions using trained scikit-learn models from models/ directory.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

class EmailRequest(BaseModel):
    subject: Optional[str] = ""
    body: Optional[str] = ""
    urls: Optional[str] = ""

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ML-PROJECT Backend"}

@app.post("/predict-url")
@app.post("/api/predict/url")
def predict_url_endpoint(req: URLRequest):
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    
    # 1. Run the existing PhishGuard Logistic Regression model (unchanged)
    ml_result = url_predictor.predict(req.url)

    # 2. Perform separate threat-intelligence lookup using Google Safe Browsing
    threat_intel = check_google_safe_browsing(req.url)

    # 3. Combine the two independent results into a clear security assessment
    security_assessment = combine_url_assessment(ml_result, threat_intel)

    return {
        **ml_result,
        "threatIntel": threat_intel,
        "securityAssessment": security_assessment
    }

@app.post("/predict-email")
@app.post("/api/predict/email")
def predict_email_endpoint(req: EmailRequest):
    if not req.subject and not req.body:
        raise HTTPException(status_code=400, detail="Subject or body must be provided")
    return email_predictor.predict(req.subject or "", req.body or "", req.urls or "")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
