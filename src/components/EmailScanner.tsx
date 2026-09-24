import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { predictEmail } from '../ml-models';

interface ScanResult {
  isSpam: boolean;
  confidence: number;
  modelProbability: string;
  reason: string;
  reasons: string[];
  recommendedAction: string;
}

export const EmailScanner: React.FC = () => {
  const [subject, setSubject] = useState<string>('');
  const [body, setBody] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() && !body.trim()) {
      setErrorMsg('Please enter an email subject or message body to analyze.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Call the Python model API endpoint
      const response = await fetch('/api/predict/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          isSpam: data.prediction === 'Spam',
          confidence: data.confidence,
          modelProbability: data.modelProbability || `${data.confidence}%`,
          reason: data.reason || 'Analyzed via trained Naive Bayes model.',
          reasons: data.reasons || [data.reason || 'Analyzed via trained Naive Bayes model.'],
          recommendedAction: data.recommendedAction || (data.prediction === 'Spam'
            ? 'Do not reply to this email, click any included links, or download attachments.'
            : 'This email appears normal, but exercise standard caution if unexpected requests for sensitive information are made.')
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
    <div className="w-full max-w-xl mx-auto">
      {/* Centered Scanner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check an Email</h2>
          <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
            Enter the email subject and message to check whether it appears to be spam.
          </p>
        </div>

        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="email-subject-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject
            </label>
            <input
              id="email-subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-4 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email-body-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Body
            </label>
            <textarea
              id="email-body-input"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste the email message here"
              className="w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-y"
              disabled={isLoading}
            />
          </div>

          {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

          <button
            id="check-email-submit"
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Email...</span>
              </>
            ) : (
              <span>Check Email</span>
            )}
          </button>
        </form>

        {/* Explainable Result Card */}
        {result && !isLoading && (
          <div className="mt-8 pt-8 border-t border-slate-100">
            {result.isSpam ? (
              <div
                id="email-result-spam"
                className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-6 text-left space-y-5"
              >
                {/* Header: Prediction & Model Probability */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-amber-200/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Prediction</p>
                      <h3 className="text-lg font-bold text-amber-950">Spam Email</h3>
                    </div>
                  </div>
                  <div className="bg-amber-100/90 px-3.5 py-2 rounded-xl text-left sm:text-right border border-amber-200/60">
                    <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Model probability</p>
                    <p className="text-base font-bold text-amber-950">{result.modelProbability}</p>
                  </div>
                </div>

                {/* Section: Why this result? */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Why this result?</h4>
                  <p className="text-sm text-amber-900/90 leading-relaxed">
                    {result.reason}
                  </p>
                </div>

                {/* Section: Recommended action */}
                <div className="pt-3 border-t border-amber-200/70 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Recommended action</h4>
                  <p className="text-sm text-amber-900/95 leading-relaxed font-medium">
                    {result.recommendedAction}
                  </p>
                </div>
              </div>
            ) : (
              <div
                id="email-result-legitimate"
                className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-6 text-left space-y-5"
              >
                {/* Header: Prediction & Model Probability */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-emerald-200/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Prediction</p>
                      <h3 className="text-lg font-bold text-emerald-950">Legitimate Email</h3>
                    </div>
                  </div>
                  <div className="bg-emerald-100/90 px-3.5 py-2 rounded-xl text-left sm:text-right border border-emerald-200/60">
                    <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Model probability</p>
                    <p className="text-base font-bold text-emerald-950">{result.modelProbability}</p>
                  </div>
                </div>

                {/* Section: Why this result? */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Why this result?</h4>
                  <p className="text-sm text-emerald-900/90 leading-relaxed">
                    {result.reason}
                  </p>
                </div>

                {/* Section: Recommended action */}
                <div className="pt-3 border-t border-emerald-200/70 space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Recommended action</h4>
                  <p className="text-sm text-emerald-900/95 leading-relaxed font-medium">
                    {result.recommendedAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
