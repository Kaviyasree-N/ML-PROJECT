import React from 'react';
import { BarChart3, Database, Cpu, Award, CheckCircle2 } from 'lucide-react';
import { getModelMetrics } from '../ml-models';

export const ModelBenchmarking: React.FC = () => {
  const metrics = getModelMetrics();

  const urlFeaturesRanked = [
    { name: 'URL Length', coef: -8.468, impact: 'High Phishing Indicator' },
    { name: 'Suspicious Extension', coef: -4.256, impact: 'Executable/Script Indicator' },
    { name: 'Domain Name Length', coef: +3.567, impact: 'Legitimate Domain Stability' },
    { name: 'Path Length', coef: +2.454, impact: 'Deep Resource Path' },
    { name: 'TLD Popularity', coef: +1.391, impact: 'Standard TLD Length' },
    { name: 'Query Param Count', coef: +1.168, impact: 'Legitimate Query Parameter' },
    { name: 'Subdomain Count', coef: -0.785, impact: 'Excess Subdomains Flag' },
    { name: 'URL Entropy', coef: -0.310, impact: 'Character Randomness' },
    { name: 'Hyphen In Domain', coef: -0.121, impact: 'Brand Spoofing Flag' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Cpu className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{metrics.urlModel.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{metrics.urlModel.algorithm}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
              9 Features
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Accuracy</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.urlModel.accuracy}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Precision</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.urlModel.precision}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Recall</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.urlModel.recall}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">F1 Score</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.urlModel.f1Score}%
              </span>
            </div>
          </div>

          {/* Cross Validation */}
          <div className="p-3 bg-blue-50/60 rounded-lg text-xs flex items-center justify-between border border-blue-100">
            <span className="text-blue-900 font-medium">5-Fold Cross Validation Average F1</span>
            <span className="font-mono font-bold text-blue-900">{metrics.urlModel.crossValidationF1}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Database className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-slate-900">{metrics.emailModel.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{metrics.emailModel.algorithm}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">
              15k Vocab
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Accuracy</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.emailModel.accuracy}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Precision</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.emailModel.precision}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">Recall</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.emailModel.recall}%
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg">
              <span className="text-[11px] text-slate-500 block">F1 Score</span>
              <span className="text-lg font-black text-slate-900 font-mono">
                {metrics.emailModel.f1Score}%
              </span>
            </div>
          </div>

          {/* Dataset info */}
          <div className="p-3 bg-indigo-50/60 rounded-lg text-xs flex items-center justify-between border border-indigo-100">
            <span className="text-indigo-900 font-medium">Corpus: {metrics.emailModel.dataset}</span>
            <span className="font-mono font-bold text-indigo-900">
              {metrics.emailModel.trainingEmails} Train / {metrics.emailModel.testingEmails} Test
            </span>
          </div>
        </div>
      </div>

      {/* Confusion Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Confusion Matrix */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Email Model Confusion Matrix (1,162 Test Samples)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Direct output from cell 17 of <code className="font-mono text-slate-700">email_detection.ipynb</code>.
          </p>

          <div className="max-w-xs mx-auto text-xs font-mono">
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-2"></div>
              <div className="p-2 font-bold text-slate-600">Pred: Legit</div>
              <div className="p-2 font-bold text-slate-600">Pred: Spam</div>

              <div className="p-2 font-bold text-slate-600 text-right">Actual Legit</div>
              <div className="p-3.5 bg-emerald-100 text-emerald-900 font-bold rounded-lg border border-emerald-300">
                <span className="text-base block">{metrics.emailModel.confusionMatrix.tn}</span>
                <span className="text-[10px] text-emerald-700">True Negative</span>
              </div>
              <div className="p-3.5 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                <span className="text-base block">{metrics.emailModel.confusionMatrix.fp}</span>
                <span className="text-[10px] text-rose-600">False Positive</span>
              </div>

              <div className="p-2 font-bold text-slate-600 text-right">Actual Spam</div>
              <div className="p-3.5 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                <span className="text-base block">{metrics.emailModel.confusionMatrix.fn}</span>
                <span className="text-[10px] text-rose-600">False Negative</span>
              </div>
              <div className="p-3.5 bg-indigo-100 text-indigo-900 font-bold rounded-lg border border-indigo-300">
                <span className="text-base block">{metrics.emailModel.confusionMatrix.tp}</span>
                <span className="text-[10px] text-indigo-700">True Positive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Top Influential URL Features (Logistic Regression)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Coefficients directly extracted from <code className="font-mono text-slate-700">phishing_logistic_model.pkl</code>.
          </p>

          <div className="space-y-2 text-xs">
            {urlFeaturesRanked.map((feat, idx) => {
              const absVal = Math.abs(feat.coef);
              const maxAbs = 8.5;
              const barWidth = Math.min(100, Math.round((absVal / maxAbs) * 100));
              const isNegative = feat.coef < 0;

              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-32 truncate font-medium text-slate-700">{feat.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${
                        isNegative ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="w-14 text-right font-mono font-bold text-slate-900">
                    {feat.coef > 0 ? `+${feat.coef.toFixed(2)}` : feat.coef.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Methodology and Pipeline Notes */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs text-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Migration Fidelity & Mathematical Preservation
        </h4>
        <p className="text-slate-600 leading-relaxed">
          Both machine learning pipelines have been translated into high-performance TypeScript algorithms running inside this application.
          The <strong>URL Phishing Detector</strong> reproduces the exact 9-dimensional standardization matrices (mean & scale) and logistic linear regression weights.
          The <strong>Email Spam Detector</strong> maintains the identical preprocessing pipeline (regular expressions for HTML tags, URLs, email addresses, and number tokens) and classification decision criteria trained on the SpamAssassin corpus.
        </p>
      </div>
    </div>
  );
};
