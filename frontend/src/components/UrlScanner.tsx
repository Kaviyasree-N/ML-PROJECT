import React, { useState } from 'react';
import { Globe, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { predictUrl } from '../ml-models';

interface ScanResult {
  url: string;
  isPhishing: boolean;
  confidence: number;
  reason: string;
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
      // Call the real Python model API endpoint
      const response = await fetch('/api/predict/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          url: cleanUrl,
          isPhishing: data.prediction === 'Phishing',
          confidence: data.confidence,
          reason: data.reason || 'Analyzed via trained Logistic Regression model.'
        });
      } else {
        const err = await response.json().catch(() => ({}));
        setErrorMsg(err.detail || 'Python ML model service is currently unavailable. Please try again.');
      }
    } catch {
      setErrorMsg('Unable to connect to the Python ML inference service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Centered Scanner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check a URL</h2>
          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
            Enter a website URL to check whether it appears legitimate or suspicious.
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
                <span>Scanning URL...</span>
              </>
            ) : (
              <span>Scan URL</span>
            )}
          </button>
        </form>

        {/* Result Card */}
        {result && !isLoading && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            {result.isPhishing ? (
              <div
                id="url-result-phishing"
                className="bg-amber-50/60 border border-amber-200 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-amber-900">Phishing URL Detected</h3>
                <div className="mt-2">
                  <span className="text-xs font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
                    Confidence: {result.confidence}%
                  </span>
                </div>
                <p className="text-sm text-amber-800 mt-3 max-w-md mx-auto">
                  {result.reason}
                </p>
              </div>
            ) : (
              <div
                id="url-result-legitimate"
                className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-emerald-900">Legitimate URL</h3>
                <div className="mt-2">
                  <span className="text-xs font-semibold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full">
                    Confidence: {result.confidence}%
                  </span>
                </div>
                <p className="text-sm text-emerald-800 mt-3 max-w-md mx-auto">
                  {result.reason}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
