import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { predictUrl, predictEmail, getModelMetrics } from './src/ml-models.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_PORT = 5001;
const PYTHON_API_URL = `http://127.0.0.1:${PYTHON_PORT}`;

function ensurePythonBackend() {
  fetch(`${PYTHON_API_URL}/api/health`)
    .catch(() => {
      const projectRoot = path.resolve(__dirname, '..');
      const pyProcess = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', String(PYTHON_PORT)], {
        cwd: projectRoot,
        stdio: 'inherit',
        detached: false
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

  const handlePredictUrl = async (req: express.Request, res: express.Response) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({ error: 'Please provide a valid url string' });
      }

      const pyData = await callPythonWithRetry('/predict-url', { url: url.trim() });
      if (pyData) {
        return res.json(pyData);
      }

      return res.status(503).json({
        error: 'Python ML inference service is currently starting. Please retry in a few moments.'
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

      return res.status(503).json({
        error: 'Python ML inference service is currently starting. Please retry in a few moments.'
      });
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
