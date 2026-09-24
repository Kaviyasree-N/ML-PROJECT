import React, { useState } from 'react';
import {
  Globe,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Database,
  Cpu,
  Info
} from 'lucide-react';
import { ThreatIntelligenceResult, SecurityAssessmentResult } from '../types';

interface ScanResult {
  url: string;
  isPhishing: boolean;
  confidence: number;
  modelProbability: string;
  reason: string;
  reasons: string[];
  recommendedAction: string;
  threatIntel: ThreatIntelligenceResult;
  securityAssessment: SecurityAssessmentResult;
}

export const UrlScanner: React.FC = () => {
  const [urlInput, setUrlInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) {
      setErrorMsg('Please enter a URL to analyze.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Call the URL prediction API endpoint
      const response = await fetch('/api/predict/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (response.ok) {
        const data = await response.json();
        const isPhishing = data.prediction === 'Phishing';
        const confidence = data.confidence;
        const modelProb = data.modelProbability || `${confidence}%`;

        const fallbackThreatIntel: ThreatIntelligenceResult = data.threatIntel || {
          status: 'unavailable',
          verdict: 'Threat intelligence unavailable',
          provider: 'Google Safe Browsing',
          matches: [],
          details: 'Threat intelligence service was unavailable during this scan.',
          disclaimer: 'Absence of threat intelligence does not imply safety.'
        };

        const fallbackAssessment: SecurityAssessmentResult = data.securityAssessment || {
          finalAssessment: isPhishing ? 'Phishing indicators detected' : 'No strong suspicious indicators detected',
          assessmentLevel: isPhishing ? 'warning' : 'safe',
          summary: isPhishing
            ? 'Machine learning model identified structural and domain phishing characteristics.'
            : 'No suspicious structural anomalies were detected by the ML model.',
          recommendedAction: isPhishing
            ? 'Do not open this URL or submit any personal credentials, passwords, or financial details.'
            : 'This website appears normal. However, always verify the domain name in the address bar before logging in.'
        };

        setResult({
          url: cleanUrl,
          isPhishing,
          confidence,
          modelProbability: modelProb,
          reason: data.reason || (isPhishing ? 'Suspicious URL patterns detected.' : 'No strong suspicious patterns detected.'),
          reasons: data.reasons || [data.reason || 'Analyzed via trained Logistic Regression model.'],
          recommendedAction: data.recommendedAction || fallbackAssessment.recommendedAction,
          threatIntel: fallbackThreatIntel,
          securityAssessment: fallbackAssessment
        });
      } else {
        const err = await response.json().catch(() => ({}));
        setErrorMsg(err.detail || err.error || 'Prediction service is currently unavailable. Please try again.');
      }
    } catch {
      setErrorMsg('Unable to connect to the prediction service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Centered Scanner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3.5 border border-blue-100">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check a URL</h2>
          <p className="text-slate-600 text-sm mt-1.5 max-w-md mx-auto">
            Combines local machine learning detection with Google Safe Browsing threat intelligence.
          </p>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="url-input" className="sr-only">
              URL
            </label>
            <input
              id="url-input"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL (e.g. https://example.com)"
              className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />
            {errorMsg && <p className="text-xs text-rose-600 mt-1.5 font-medium">{errorMsg}</p>}
          </div>

          <button
            id="scan-url-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Scanning URL & Threat Intelligence...</span>
              </>
            ) : (
              <span>Scan URL</span>
            )}
          </button>
        </form>

        {/* Explainable Result with Threat Intelligence Layer */}
        {result && !isLoading && (
          <div className="mt-8 pt-8 border-t border-slate-100 space-y-5">
            {/* 1. Clear Final Security Assessment Banner */}
            <div
              id="url-final-assessment"
              className={`rounded-2xl p-5 border text-left transition-all ${
                result.securityAssessment.assessmentLevel === 'danger'
                  ? 'bg-rose-50/80 border-rose-200/90 text-rose-950'
                  : result.securityAssessment.assessmentLevel === 'warning'
                  ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
                  : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    result.securityAssessment.assessmentLevel === 'danger'
                      ? 'bg-rose-100 text-rose-700'
                      : result.securityAssessment.assessmentLevel === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {result.securityAssessment.assessmentLevel === 'danger' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : result.securityAssessment.assessmentLevel === 'warning' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                    Security Assessment
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
                    {result.securityAssessment.finalAssessment}
                  </h3>
                  <p className="text-sm mt-1 leading-relaxed opacity-90">
                    {result.securityAssessment.summary}
                  </p>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mt-4 pt-3 border-t border-current/15 flex items-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider shrink-0 mt-0.5 opacity-80">
                  Recommended action:
                </span>
                <p className="text-sm font-medium leading-snug">
                  {result.securityAssessment.recommendedAction}
                </p>
              </div>
            </div>

            {/* 2. Independent Analysis Breakdown: ML Detection vs Threat Intelligence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* ML Detection Card */}
              <div
                id="ml-detection-card"
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs text-left"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        ML Detection
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Logistic Regression
                    </span>
                  </div>

                  <div className="mt-3.5 flex items-baseline justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Prediction</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {result.isPhishing ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-700 text-sm sm:text-base">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            Phishing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-sm sm:text-base">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Legitimate
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Model probability</p>
                      <p className="font-bold text-slate-900 text-sm sm:text-base mt-0.5">
                        {result.modelProbability}
                      </p>
                    </div>
                  </div>

                  {/* Why this result? */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Why this result?
                    </p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside leading-relaxed">
                      {result.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Threat Intelligence Card */}
              <div
                id="threat-intel-card"
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs text-left"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600 shrink-0" />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Threat Intelligence
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      Google Safe Browsing
                    </span>
                  </div>

                  <div className="mt-3.5">
                    <p className="text-xs text-slate-500 font-medium">Database lookup</p>
                    <div className="mt-1">
                      {result.threatIntel.status === 'unsafe' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          Known unsafe URL detected
                        </span>
                      )}
                      {result.threatIntel.status === 'not_found' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                          No matching unsafe resource found
                        </span>
                      )}
                      {result.threatIntel.status === 'unavailable' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Info className="w-3.5 h-3.5 text-amber-600" />
                          Threat intelligence unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {result.threatIntel.details}
                  </p>

                  {/* Explicit Disclaimer: Not found does NOT imply safe */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      {result.threatIntel.status === 'not_found' && (
                        <>
                          <span className="font-semibold text-slate-700 not-italic">Important:</span>{' '}
                          Not found in threat intelligence is not proof of safety. Zero-hour phishing pages often precede database indexing.
                        </>
                      )}
                      {result.threatIntel.status === 'unavailable' && (
                        <>
                          <span className="font-semibold text-slate-700 not-italic">Notice:</span>{' '}
                          Threat intelligence lookup is unavailable (external service unreachable or API key unconfigured). Verdict relies on ML detection.
                        </>
                      )}
                      {result.threatIntel.status === 'unsafe' && (
                        <>
                          <span className="font-semibold text-rose-700 not-italic">Confirmed:</span>{' '}
                          URL has been cataloged as an active threat on Google Safe Browsing lists.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Backwards-compatibility anchors for tests */}
            <div
              id={result.isPhishing ? 'url-result-phishing' : 'url-result-legitimate'}
              className="sr-only"
              aria-hidden="true"
            >
              {result.isPhishing ? 'Phishing URL' : 'Legitimate URL'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
