import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Globe, ArrowRight, RefreshCw, AlertTriangle, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';
import { predictUrl } from '../ml-models';
import { UrlPredictionResult } from '../types';

const SAMPLE_URLS = [
  {
    label: 'LeetCode (Legitimate)',
    url: 'https://leetcode.com/',
    type: 'Legitimate'
  },
  {
    label: 'Spoofed Site (Phishing)',
    url: 'https://keraekken-loagginnusa.godaddysites.com/',
    type: 'Phishing'
  },
  {
    label: 'Spotify Tool (Phishing)',
    url: 'http://djtool-for-spotify.com/',
    type: 'Phishing'
  },
  {
    label: 'Google Docs (Legitimate)',
    url: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
    type: 'Legitimate'
  },
  {
    label: 'Suspicious Subdomain & Script',
    url: 'http://secure-login.bank-update.account-verify.info/login.php?session=982348',
    type: 'Phishing'
  }
];

export const UrlDetector: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>('https://leetcode.com/');
  const [result, setResult] = useState<UrlPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'features' | 'technical'>('features');

  const handlePredict = (urlToTest: string) => {
    if (!urlToTest.trim()) return;
    setIsLoading(true);
    // Instant local evaluation with the exact model parameters
    setTimeout(() => {
      const pred = predictUrl(urlToTest);
      setResult(pred);
      setIsLoading(false);
    }, 150);
  };

  useEffect(() => {
    handlePredict(inputUrl);
  }, []);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              URL Phishing Analysis
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Evaluates 9 lexical & structural URL features using StandardScaler + Logistic Regression (95.52% Accuracy).
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Logistic Regression
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePredict(inputUrl);
          }}
          className="space-y-3"
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                id="url-input"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter URL to inspect (e.g., https://example.com/login)..."
                className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono transition-colors"
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold px-1"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              id="analyze-url-btn"
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze URL
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Sample quick picks */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-slate-500 font-medium">Test Notebook Samples:</span>
            {SAMPLE_URLS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputUrl(sample.url);
                  handlePredict(sample.url);
                }}
                className={`text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                  sample.type === 'Phishing'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Verdict Banner */}
          <div
            className={`p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              result.prediction === 'Phishing'
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl ${
                  result.prediction === 'Phishing'
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {result.prediction === 'Phishing' ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      result.prediction === 'Phishing' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-600">
                    Model Classification
                  </span>
                </div>
                <h3
                  className={`text-2xl font-black mt-1 ${
                    result.prediction === 'Phishing' ? 'text-rose-950' : 'text-emerald-950'
                  }`}
                >
                  {result.prediction === 'Phishing' ? 'PHISHING THREAT DETECTED' : 'LEGITIMATE URL VERIFIED'}
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-xl font-mono text-xs break-all">
                  {result.url}
                </p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-end gap-3 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 border-slate-200/80 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <span className="text-xs font-semibold text-slate-500 block">Model Confidence</span>
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {result.confidence.toFixed(1)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">Phishing Risk Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        result.riskScore > 50 ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${result.riskScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold font-mono text-slate-700">
                    {result.riskScore}/100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Extracted Feature Vector & Standardized Weights
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order preserved from original training pipeline (<code className="font-mono text-slate-700">url_detect_model.ipynb</code>).
                </p>
              </div>

              <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('features')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'features' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Feature Inspector
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('technical')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'technical' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mathematical Formula
                </button>
              </div>
            </div>

            {activeTab === 'features' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Feature Name</th>
                      <th className="py-3 px-4">Raw Value</th>
                      <th className="py-3 px-4">Standardized (Z-Score)</th>
                      <th className="py-3 px-4">Model Weight (Coef)</th>
                      <th className="py-3 px-4">Log-Odds Impact</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                    {result.features.map((feat) => {
                      const impactColor =
                        feat.contribution > 0
                          ? 'text-emerald-700 bg-emerald-50'
                          : feat.contribution < 0
                          ? 'text-rose-700 bg-rose-50'
                          : 'text-slate-600 bg-slate-50';

                      return (
                        <tr key={feat.key} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-sans font-medium text-slate-900">
                            <div>{feat.name}</div>
                            <div className="text-[11px] text-slate-500 font-normal font-sans">
                              {feat.description}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {String(feat.rawValue)}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {feat.standardizedValue > 0 ? `+${feat.standardizedValue}` : feat.standardizedValue}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {feat.weight > 0 ? `+${feat.weight}` : feat.weight}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-sm font-semibold ${impactColor}`}>
                              {feat.contribution > 0 ? `+${feat.contribution}` : feat.contribution}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-sans">
                            {feat.isSuspicious ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[11px]">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Suspicious Flag
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 space-y-4 text-sm text-slate-700 font-sans">
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
                  <div className="text-slate-400 mb-1">// Logistic Regression Decision Function</div>
                  <div>z = intercept + &Sigma; (coef_i &times; (x_i - mean_i) / scale_i)</div>
                  <div className="text-emerald-400 mt-2">intercept = -3.5142</div>
                  <div className="text-slate-300 mt-1">P(Legitimate) = 1 / (1 + e^(-z))</div>
                  <div className="text-rose-400">P(Phishing) = 1 - P(Legitimate)</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Target Class Encoding</span>
                    <p className="text-slate-600">
                      ClassLabel 0 = Phishing, ClassLabel 1 = Legitimate. The logistic model was fit with balanced class weights on 20,000 balanced sample URLs from Phishing_dataset.csv.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">Cross-Validation Accuracy</span>
                    <p className="text-slate-600">
                      5-Fold Cross Validation yielded an average F1 score of 0.9578 with 95.52% test accuracy on 3,995 test instances.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
