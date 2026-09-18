import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, ShieldAlert, Sparkles, ArrowRight, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { predictEmail } from '../ml-models';
import { EmailPredictionResult } from '../types';

const TEST_EMAILS = [
  {
    title: 'Test 1: Lottery / Prize (Spam)',
    subject: 'Congratulations! You have won a $1,000,000 prize',
    body: `You have been selected as the lucky winner.
Click the link below immediately to claim your prize.
Send your personal information to receive the money.`,
    urls: 'http://claim-prize-funds.org/verify',
    expected: 'Spam'
  },
  {
    title: 'Test 2: Team Meeting (Legitimate)',
    subject: 'Meeting scheduled for tomorrow',
    body: `Hi team,
Our project meeting is scheduled for tomorrow at 10 AM in the conference room.
Please bring your project updates.
Thanks.`,
    urls: '',
    expected: 'Legitimate'
  },
  {
    title: 'Test 3: Suspended Account (Spam)',
    subject: 'Your account has been suspended',
    body: `Your account will be permanently closed.
Verify your account immediately by clicking the link below and entering your password.`,
    urls: 'https://verify-portal-security-check.net/login',
    expected: 'Spam'
  }
];

export const EmailDetector: React.FC = () => {
  const [subject, setSubject] = useState<string>(TEST_EMAILS[0].subject);
  const [body, setBody] = useState<string>(TEST_EMAILS[0].body);
  const [urls, setUrls] = useState<string>(TEST_EMAILS[0].urls);
  const [result, setResult] = useState<EmailPredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCleaner, setShowCleaner] = useState<boolean>(false);

  const handlePredict = (sub: string, bdy: string, u: string) => {
    if (!sub.trim() && !bdy.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      const pred = predictEmail(sub, bdy, u);
      setResult(pred);
      setIsLoading(false);
    }, 150);
  };

  useEffect(() => {
    handlePredict(subject, body, urls);
  }, []);

  const loadSample = (sample: typeof TEST_EMAILS[0]) => {
    setSubject(sample.subject);
    setBody(sample.body);
    setUrls(sample.urls);
    handlePredict(sample.subject, sample.body, sample.urls);
  };

  return (
    <div className="space-y-6">
      {/* Email Input Form */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Email Spam & Phishing Classification
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Multinomial Naive Bayes model trained on SpamAssassin corpus (96.99% Accuracy, 97.25% Precision).
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            Multinomial Naive Bayes + TF-IDF
          </span>
        </div>

        {/* Test sample quick buttons */}
        <div className="mb-4 pt-1">
          <span className="text-xs text-slate-500 font-medium block mb-2">Notebook Benchmark Samples:</span>
          <div className="flex flex-wrap gap-2">
            {TEST_EMAILS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadSample(sample)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                  sample.expected === 'Spam'
                    ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePredict(subject, body, urls);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email-subject-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Subject Line
            </label>
            <input
              id="email-subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Congratulations! You won a prize..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email-body-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Email Body
            </label>
            <textarea
              id="email-body-input"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste email text content here..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors font-sans"
            />
          </div>

          <div>
            <label htmlFor="email-urls-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Attached Links / URLs <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              id="email-urls-input"
              type="text"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="e.g. http://login.verify.com/token"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-mono transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowCleaner(!showCleaner)}
              className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {showCleaner ? 'Hide Text Preprocessing' : 'View Preprocessing Pipeline'}
            </button>

            <button
              id="analyze-email-btn"
              type="submit"
              disabled={isLoading || (!subject.trim() && !body.trim())}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-medium text-sm rounded-lg transition-colors shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Classifying...
                </>
              ) : (
                <>
                  Classify Email
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preprocessing Inspector */}
      {showCleaner && result && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Notebook NLP Pipeline: clean_text(subject + " " + body)
            </span>
            <span>Tokens: {result.tokenStats.totalWords} words</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block text-[11px]">Normalized & Masked Text Representation:</span>
            <p className="bg-slate-950 p-3 rounded-md text-emerald-300 border border-slate-800 leading-relaxed font-mono">
              {result.cleanedText || '(empty text)'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="bg-slate-800/80 p-2 rounded-md">
              <span className="text-slate-400 block">URLs Replaced</span>
              <span className="font-bold text-white text-sm">{result.tokenStats.urlsFound}</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-md">
              <span className="text-slate-400 block">Emails Replaced</span>
              <span className="font-bold text-white text-sm">{result.tokenStats.emailsFound}</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-md">
              <span className="text-slate-400 block">Numbers Replaced</span>
              <span className="font-bold text-white text-sm">{result.tokenStats.numbersFound}</span>
            </div>
            <div className="bg-slate-800/80 p-2 rounded-md">
              <span className="text-slate-400 block">Word Tokens</span>
              <span className="font-bold text-white text-sm">{result.tokenStats.totalWords}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Classification Banner */}
          <div
            className={`p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
              result.prediction === 'Spam'
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl ${
                  result.prediction === 'Spam'
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {result.prediction === 'Spam' ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      result.prediction === 'Spam' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-600">
                    Naive Bayes Result
                  </span>
                </div>
                <h3
                  className={`text-2xl font-black mt-1 ${
                    result.prediction === 'Spam' ? 'text-rose-950' : 'text-emerald-950'
                  }`}
                >
                  {result.prediction === 'Spam' ? 'SPAM / PHISHING EMAIL DETECTED' : 'LEGITIMATE EMAIL VERIFIED'}
                </h3>
                <p className="text-sm text-slate-600 mt-1 max-w-xl font-medium">
                  {result.prediction === 'Spam'
                    ? 'High probability of unsolicited commercial marketing, fake lottery, or credential phishing solicitation.'
                    : 'Corresponds with legitimate personal or work communication patterns without suspicious urgency triggers.'}
                </p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-end gap-3 w-full md:w-auto justify-between md:justify-center border-t md:border-t-0 border-slate-200/80 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <span className="text-xs font-semibold text-slate-500 block">Posterior Confidence</span>
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  {result.confidence.toFixed(1)}%
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">Spam vs Legit Probability</span>
                <span className="text-xs font-mono font-semibold text-slate-700">
                  Spam: {(result.spamProbability * 100).toFixed(1)}% | Legit: {(result.legitimateProbability * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Signals Analysis Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Detected SpamAssassin Indicator Patterns
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-rose-50/50 border border-rose-100">
                <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs mb-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Spam Trigger Signals ({result.detectedSpamSignals.length})
                </div>
                {result.detectedSpamSignals.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.detectedSpamSignals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-rose-200 text-rose-700 rounded-md text-xs font-mono font-medium shadow-2xs"
                      >
                        "{sig}"
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No strong spam trigger n-grams detected.</p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Legitimate Signals ({result.detectedLegitSignals.length})
                </div>
                {result.detectedLegitSignals.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.detectedLegitSignals.map((sig, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-md text-xs font-mono font-medium shadow-2xs"
                      >
                        "{sig}"
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No formal legitimate business keywords detected.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
