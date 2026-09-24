import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { predictUrl, predictEmail, getModelMetrics } from './src/ml-models.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_PORT = 5001;
const PYTHON_API_URL = `http://127.0.0.1:${PYTHON_PORT}`;

function getSafeBrowsingApiKey(): string {
  let key = process.env.GOOGLE_SAFE_BROWSING_API_KEY || process.env.SAFE_BROWSING_API_KEY;
  if (key && key.trim()) {
    return key.trim().replace(/^['"]|['"]$/g, '');
  }

  // Fallback to check potential .env files
  const searchDirs = [
    path.resolve(__dirname, '..'),
    path.resolve(__dirname),
    process.cwd(),
    path.resolve(process.cwd(), 'frontend'),
  ];
  for (const d of searchDirs) {
    const envFile = path.join(d, '.env');
    if (fs.existsSync(envFile)) {
      try {
        const content = fs.readFileSync(envFile, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const k = trimmed.slice(0, idx).trim();
            const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
            if ((k === 'GOOGLE_SAFE_BROWSING_API_KEY' || k === 'SAFE_BROWSING_API_KEY') && v) {
              process.env[k] = v;
              return v;
            }
          }
        }
      } catch {}
    }
  }
  return '';
}

function ensurePythonBackend() {
  getSafeBrowsingApiKey();
  fetch(`${PYTHON_API_URL}/api/health`)
    .catch(() => {
      const projectRoot = path.resolve(__dirname, '..');
      const pyProcess = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', String(PYTHON_PORT)], {
        cwd: projectRoot,
        stdio: 'inherit',
        detached: false,
        env: process.env
      });
      pyProcess.on('error', (err) => {
        console.warn('Could not spawn Python backend:', err.message);
      });
    });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  ensurePythonBackend();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/models/info', (req, res) => {
    try {
      const metrics = getModelMetrics();
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to get model info' });
    }
  });

  async function callPythonWithRetry(endpoint: string, body: any, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const pyRes = await fetch(`${PYTHON_API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (pyRes.ok) {
          return await pyRes.json();
        }
      } catch {
        ensurePythonBackend();
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
    return null;
  }

  async function checkGoogleSafeBrowsing(url: string) {
    const apiKey = getSafeBrowsingApiKey();
    if (!apiKey || !apiKey.trim()) {
      return {
        status: 'unavailable' as const,
        verdict: 'Threat intelligence unavailable' as const,
        provider: 'Google Safe Browsing',
        matches: [],
        details: 'Threat intelligence service unavailable: API key not configured in environment (GOOGLE_SAFE_BROWSING_API_KEY).',
        disclaimer: 'Absence of threat intelligence does not imply safety.'
      };
    }

    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const payload = {
        client: {
          clientId: 'phishguard-scanner',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION'
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: targetUrl }]
        }
      };

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      const safeRes = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey.trim())}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'PhishGuard/1.0' },
          body: JSON.stringify(payload),
          signal: controller.signal
        }
      );
      clearTimeout(timer);

      if (safeRes.ok) {
        const data = (await safeRes.json().catch(() => ({}))) as any;
        const matches = data.matches || [];
        if (matches.length > 0) {
          const threatTypes = Array.from(new Set(matches.map((m: any) => m.threatType || 'THREAT'))) as string[];
          return {
            status: 'unsafe' as const,
            verdict: 'Known unsafe URL detected' as const,
            provider: 'Google Safe Browsing',
            matches: threatTypes,
            details: `Flagged on Google Safe Browsing blacklist (${threatTypes.join(', ')}).`,
            disclaimer: 'Confirmed matching unsafe resource in active threat feeds.'
          };
        } else {
          return {
            status: 'not_found' as const,
            verdict: 'No matching unsafe resource found' as const,
            provider: 'Google Safe Browsing',
            matches: [],
            details: 'URL is not currently cataloged in Google Safe Browsing threat databases.',
            disclaimer: 'Absence from threat intelligence databases does NOT prove that a website is safe. Newly deployed phishing sites often evade blacklists.'
          };
        }
      } else {
        return {
          status: 'unavailable' as const,
          verdict: 'Threat intelligence unavailable' as const,
          provider: 'Google Safe Browsing',
          matches: [],
          details: `Google Safe Browsing returned HTTP status ${safeRes.status}.`,
          disclaimer: 'Threat intelligence lookup service was unreachable.'
        };
      }
    } catch (err: any) {
      const errorMsg = String(err?.message || err);
      return {
        status: 'unavailable' as const,
        verdict: 'Threat intelligence unavailable' as const,
        provider: 'Google Safe Browsing',
        matches: [],
        details: `Threat intelligence lookup failed or timed out (${errorMsg}).`,
        disclaimer: 'Threat intelligence service was temporarily unreachable.'
      };
    }
  }

  function combineUrlAssessment(mlResult: any, threatIntel: any) {
    const isMlPhishing = mlResult.prediction === 'Phishing';
    const intelStatus = threatIntel?.status || 'unavailable';

    let finalAssessment: string;
    let assessmentLevel: 'danger' | 'warning' | 'safe';
    let summary: string;
    let recommendedAction: string;

    if (intelStatus === 'unsafe') {
      finalAssessment = 'Known unsafe resource';
      assessmentLevel = 'danger';
      summary = 'Flagged by Google Safe Browsing threat intelligence as an active malicious URL.';
      recommendedAction = 'Do not open this URL or submit credentials. Avoid interacting with the page.';
    } else if (isMlPhishing) {
      finalAssessment = 'Phishing indicators detected';
      assessmentLevel = 'warning';
      if (intelStatus === 'not_found') {
        summary = 'Machine learning model identified structural and domain phishing characteristics. Note that newly launched phishing sites frequently precede database indexing.';
      } else {
        summary = 'Machine learning model identified structural and domain phishing characteristics (threat intelligence database was unavailable).';
      }
      recommendedAction = 'Do not open this URL or submit any personal credentials, passwords, or financial details.';
    } else {
      finalAssessment = 'No strong suspicious indicators detected';
      assessmentLevel = 'safe';
      if (intelStatus === 'not_found') {
        summary = 'No suspicious structural anomalies were detected by the ML model, and no matching records were found in Google Safe Browsing.';
      } else {
        summary = 'No suspicious structural anomalies were detected by the ML model (threat intelligence database was unavailable).';
      }
      recommendedAction = 'This website appears normal. However, always verify the domain name in the address bar before logging in.';
    }

    return {
      finalAssessment,
      assessmentLevel,
      summary,
      recommendedAction
    };
  }

  const handlePredictUrl = async (req: express.Request, res: express.Response) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'Please provide a valid url string' });
      }

      const pyData = await callPythonWithRetry('/predict-url', { url: url.trim() });
      if (pyData) {
        if (!pyData.threatIntel || pyData.threatIntel.status === 'unavailable') {
          const intel = await checkGoogleSafeBrowsing(url.trim());
          if (intel.status !== 'unavailable' || !pyData.threatIntel) {
            pyData.threatIntel = intel;
            pyData.securityAssessment = combineUrlAssessment(pyData, intel);
          }
        }
        return res.json(pyData);
      }

      // Fallback using exact trained parameters if Python backend is initializing
      const fallbackData = predictUrl(url.trim());
      const fallbackIntel = await checkGoogleSafeBrowsing(url.trim());
      return res.json({
        ...fallbackData,
        threatIntel: fallbackIntel,
        securityAssessment: combineUrlAssessment(fallbackData, fallbackIntel)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'URL prediction failed' });
    }
  };

  const handlePredictEmail = async (req: express.Request, res: express.Response) => {
    try {
      const { subject = '', body = '', urls = '' } = req.body;
      if (!subject && !body) {
        return res.status(400).json({ error: 'Please provide at least a subject or body' });
      }

      const pyData = await callPythonWithRetry('/predict-email', { subject, body, urls });
      if (pyData) {
        return res.json(pyData);
      }

      // Fallback using exact trained model if Python backend is initializing
      const fallbackData = predictEmail(subject, body, urls);
      return res.json(fallbackData);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Email prediction failed' });
    }
  };

  app.post('/predict-url', handlePredictUrl);
  app.post('/api/predict/url', handlePredictUrl);

  app.post('/predict-email', handlePredictEmail);
  app.post('/api/predict/email', handlePredictEmail);

  // Vite middleware for development or static serving for production
  const frontendDir = path.resolve(__dirname);
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: frontendDir,
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(frontendDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ML Detector Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
