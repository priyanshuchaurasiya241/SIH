
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/apiRoutes.js';
import { SecureStorage } from './crypto/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const distPath = path.join(__dirname, '..', 'client', 'dist');
const fallbackStaticPath = path.join(__dirname, 'public');
const hasBuiltClient = fs.existsSync(path.join(distPath, 'index.html'));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (hasBuiltClient) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(fallbackStaticPath));
}

// Request logging middleware
app.use((req, res, next) => {
  if (!req.url.startsWith('/app.jsx') && !req.url.startsWith('/index.html')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'SIH 26047 Patient Case Taking API',
    uptimeSeconds: process.uptime(),
    security: 'AES-256-GCM Encrypted Storage Active',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  const indexPath = hasBuiltClient
    ? path.join(distPath, 'index.html')
    : path.join(fallbackStaticPath, 'index.html');

  res.sendFile(indexPath);
});

app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(`🚀 SIH 26047 Patient Case Taking System Live!`);
  console.log(`🌐 Web Application URL : http://localhost:${PORT}`);
  console.log(`🔒 AES-256-GCM Encrypted Storage Active in server/data/`);
  console.log(`============================================================`);
});
