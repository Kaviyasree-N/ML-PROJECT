export interface UrlFeatureBreakdown {
  name: string;
  key: string;
  rawValue: number | string;
  standardizedValue: number;
  weight: number;
  contribution: number;
  description: string;
  isSuspicious: boolean;
}

export interface ThreatIntelligenceResult {
  status: 'unsafe' | 'not_found' | 'unavailable';
  verdict: 'Known unsafe URL detected' | 'No matching unsafe resource found' | 'Threat intelligence unavailable';
  provider: string;
  matches: string[];
  details: string;
  disclaimer: string;
}

export interface SecurityAssessmentResult {
  finalAssessment: 'Known unsafe resource' | 'Phishing indicators detected' | 'No strong suspicious indicators detected' | string;
  assessmentLevel: 'danger' | 'warning' | 'safe';
  summary: string;
  recommendedAction: string;
}

export interface UrlPredictionResult {
  url: string;
  prediction: 'Phishing' | 'Legitimate';
  confidence: number;
  modelProbability?: string;
  reason?: string;
  reasons?: string[];
  recommendedAction?: string;
  threatIntel?: ThreatIntelligenceResult;
  securityAssessment?: SecurityAssessmentResult;
  riskScore: number; // 0 - 100
  probabilities: {
    phishing: number;
    legitimate: number;
  };
  features?: UrlFeatureBreakdown[];
  extractedMetrics: {
    url_length: number;
    url_entropy: number;
    subdomain_count: number;
    query_param_count: number;
    path_length: number;
    has_hyphen_in_domain: number;
    tld_popularity: number;
    suspicious_file_extension: number;
    domain_name_length: number;
    domain: string;
    path: string;
  };
}

export interface EmailPredictionResult {
  subject: string;
  body: string;
  urls?: string;
  cleanedText: string;
  prediction: 'Spam' | 'Legitimate';
  confidence: number;
  modelProbability?: string;
  reason?: string;
  reasons?: string[];
  recommendedAction?: string;
  spamProbability: number;
  legitimateProbability: number;
  detectedSpamSignals?: string[];
  detectedLegitSignals?: string[];
  tokenStats?: {
    totalWords: number;
    urlsFound: number;
    emailsFound: number;
    numbersFound: number;
  };
}

export interface ModelMetrics {
  urlModel: {
    name: string;
    algorithm: string;
    datasetSize: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    crossValidationF1: number;
    featuresCount: number;
    confusionMatrix: {
      tp: number;
      fp: number;
      fn: number;
      tn: number;
    };
  };
  emailModel: {
    name: string;
    algorithm: string;
    dataset: string;
    totalEmails: number;
    trainingEmails: number;
    testingEmails: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    vocabSize: number;
    confusionMatrix: {
      tn: number;
      fp: number;
      fn: number;
      tp: number;
    };
  };
}
