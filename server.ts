import http from 'http';
import path from 'path';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import apiRoutes from './src/server/routes';
import { loadDatabase } from './src/server/db';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS & headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Initialize DB & Seed Data immediately
  loadDatabase();

  // Mount API router
  app.use('/api', apiRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      station: 'AI-Powered Adaptive Smart Learning Station',
      version: '2.4.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Create HTTP server
  const server = http.createServer(app);

  // Create WebSocket Server for Real-Time Station Telemetry & Assessment Events
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    // Send immediate initial handshake
    ws.send(
      JSON.stringify({
        type: 'STATION_HANDSHAKE',
        message: 'Connected to AI Smart Learning Station Real-Time Telemetry',
        timestamp: new Date().toISOString(),
      })
    );

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch (e) {
        // ignore
      }
    });
  });

  // Periodically broadcast hardware telemetry pulse to all connected clients
  setInterval(() => {
    if (wss.clients.size > 0) {
      const payload = JSON.stringify({
        type: 'HARDWARE_PULSE',
        cpuTemp: +(42.0 + Math.random() * 2.5).toFixed(1),
        cpuUsage: +(14.0 + Math.random() * 8.0).toFixed(1),
        timestamp: new Date().toISOString(),
      });
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  }, 5000);

  // Mount Vite or static dist
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Learning Station server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 WebSocket server listening on ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
