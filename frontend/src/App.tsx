import React, { useState } from 'react';
import { Shield, Link2, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UrlScanner } from './components/UrlScanner';
import { EmailScanner } from './components/EmailScanner';

type ViewMode = 'home' | 'url' | 'email';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              PhishGuard
            </span>
          </button>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
            <button
              id="nav-home"
              type="button"
              onClick={() => setCurrentView('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              id="nav-url"
              type="button"
              onClick={() => setCurrentView('url')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === 'url'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              URL Scanner
            </button>
            <button
              id="nav-email"
              type="button"
              onClick={() => setCurrentView('email')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                currentView === 'email'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Email Scanner
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center justify-center">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center space-y-12">
            {/* Hero Section */}
            <div className="space-y-4 max-w-xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Stay Safe from Phishing & Spam
              </h1>
              <p className="text-base sm:text-lg text-slate-600">
                Check suspicious URLs and emails using machine learning.
              </p>

              {/* Primary Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <button
                  id="hero-check-url-btn"
                  type="button"
                  onClick={() => setCurrentView('url')}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Check URL</span>
                </button>
                <button
                  id="hero-check-email-btn"
                  type="button"
                  onClick={() => setCurrentView('email')}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Check Email</span>
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {/* Card 1: Phishing URL Detection */}
              <button
                type="button"
                onClick={() => setCurrentView('url')}
                className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100/60 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Link2 className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Phishing URL Detection</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </h2>
                <p className="text-sm text-slate-600">
                  Analyze a URL for suspicious patterns.
                </p>
              </button>

              {/* Card 2: Spam Email Detection */}
              <button
                type="button"
                onClick={() => setCurrentView('email')}
                className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all text-left group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100/60 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Spam Email Detection</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </h2>
                <p className="text-sm text-slate-600">
                  Check an email for common spam patterns.
                </p>
              </button>
            </div>

            {/* ABOUT / HOW IT WORKS */}
            <div className="w-full pt-8 border-t border-slate-200/80">
              <h2 className="text-xl font-bold text-slate-900 mb-6">How PhishGuard Works</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">Enter</h3>
                  <p className="text-xs text-slate-600">Enter a URL or email.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">Analyze</h3>
                  <p className="text-xs text-slate-600">The machine learning model analyzes the input.</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-2xs">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">Protect</h3>
                  <p className="text-xs text-slate-600">View the prediction and confidence.</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-6 max-w-lg mx-auto">
                PhishGuard uses machine learning models for phishing URL and spam email detection.
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: URL SCANNER */}
        {currentView === 'url' && (
          <div className="w-full">
            <div className="mb-6 max-w-xl mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
            <UrlScanner />
          </div>
        )}

        {/* VIEW 3: EMAIL SCANNER */}
        {currentView === 'email' && (
          <div className="w-full">
            <div className="mb-6 max-w-xl mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← Back to Home
              </button>
            </div>
            <EmailScanner />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center">
        <p className="text-xs text-slate-500">
          PhishGuard — Machine Learning based Phishing & Spam Detection
        </p>
      </footer>
    </div>
  );
}
