import './utils/dns-fallback';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });


import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { apiRouter } from './routes/api';
import { initDb } from './db/init';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Restrict CORS in production via FRONTEND_ORIGIN; open for local dev.
const frontendOrigin = process.env.FRONTEND_ORIGIN;
console.log('CORS FRONTEND_ORIGIN:', frontendOrigin);

app.use(
  cors(
    frontendOrigin
      ? {
          origin: frontendOrigin.split(',').map((s) => s.trim()),
          credentials: true,
        }
      : undefined
  )
);

// Keep payload limit modest; product images should be compressed client-side.
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Database initialization state
let dbReady = false;

// Gate API requests until database is ready
app.use((req, res, next) => {
  if (!dbReady) {
    return res.status(503).json({ success: false, error: 'Database is not ready' });
  }
  next();
});

// API routing
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'PriceTeller API (PostgreSQL)', time: new Date().toISOString() });
});

// Serve client public assets (products, presets, custom uploads)
let clientPublicDir = path.resolve(process.cwd(), 'client', 'public');
if (!fs.existsSync(clientPublicDir)) {
  clientPublicDir = path.resolve(process.cwd(), '..', 'client', 'public');
}
if (fs.existsSync(clientPublicDir)) {
  app.use(express.static(clientPublicDir));
}

// Serve frontend in production build if present
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  const indexPath = path.join(clientDist, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>PriceTeller Server</title></head>
          <body style="font-family:sans-serif;text-align:center;padding:50px;">
            <h1 style="color:#249044;">PriceTeller API Server is Running!</h1>
            <p>Database: PostgreSQL</p>
            <p>Frontend development server runs on <a href="http://localhost:5173">http://localhost:5173</a>.</p>
          </body>
        </html>
      `);
    }
  });
});

// Error handling middleware for invalid JSON or unhandled router errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload in request' });
  }
  console.error('Server Error:', err);
  res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' });
});

// Start server only after database initialization succeeds
async function startServer() {
  try {
    const initialized = await initDb();
    if (initialized === false) {
      throw new Error('Database initialization failed');
    }
    dbReady = true;

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 PriceTeller API Server is live at http://localhost:${PORT}`);
      console.log(`🛒 Testing API at http://localhost:${PORT}/api/products`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${PORT} is already in use by an existing background process.`);
      } else {
        console.error('Server socket error:', err);
      }
    });

    return server;
  } catch (err: any) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

startServer();

export { app, dbReady, startServer };
