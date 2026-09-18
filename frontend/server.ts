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

  app.post('/api/predict/url', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid url string' });
      }

      // 1. First attempt to predict using the real Python backend
      try {
        const pyRes = await fetch(`${PYTHON_API_URL}/api/predict/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          return res.json(pyData);
        }
      } catch {
        // Python server not ready or down, trigger auto-recovery and fall through to fallback
        ensurePythonBackend();
      }

      // 2. High-fidelity math mirror fallback
      const result = predictUrl(url);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'URL prediction failed' });
    }
  });

  app.post('/api/predict/email', async (req, res) => {
    try {
      const { subject = '', body = '', urls = '' } = req.body;
      if (!subject && !body) {
        return res.status(400).json({ error: 'Please provide at least a subject or body' });
      }

      // 1. First attempt to predict using the real Python backend
      try {
        const pyRes = await fetch(`${PYTHON_API_URL}/api/predict/email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, body, urls })
        });
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          return res.json(pyData);
        }
      } catch {
        // Python server not ready or down, trigger auto-recovery and fall through to fallback
        ensurePythonBackend();
      }

      // 2. High-fidelity math mirror fallback
      const result = predictEmail(subject, body, urls);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Email prediction failed' });
    }
  });

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
