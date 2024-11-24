import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AtomDB } from '../distributed/AtomDB';
import { Logger } from '../cogutil/Logger';
import { OpenCogIntegration } from '../opencog/core/OpenCogIntegration';

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "*",
  methods: ["GET", "POST"],
  credentials: true
}));

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize OpenCog
const opencog = OpenCogIntegration.getInstance();
const atomDB = new AtomDB('server-atomspace');

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

io.on('connection', (socket) => {
  Logger.info('Client connected:', socket.id);

  socket.on('join', (nodeId: string) => {
    socket.data.nodeId = nodeId;
    socket.broadcast.emit('peerJoined', nodeId);
    Logger.info(`Node ${nodeId} joined the network`);
  });

  socket.on('addAtom', async (atomData: any) => {
    try {
      await atomDB.saveAtom(atomData);
      socket.broadcast.emit('atomAdded', atomData);
      Logger.info(`Atom ${atomData.id} added to the network`);
    } catch (error) {
      Logger.error('Error saving atom:', error);
      socket.emit('error', { message: 'Failed to save atom' });
    }
  });

  socket.on('disconnect', () => {
    if (socket.data.nodeId) {
      socket.broadcast.emit('peerLeft', socket.data.nodeId);
      Logger.info(`Node ${socket.data.nodeId} left the network`);
    }
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  Logger.info('SIGTERM received. Shutting down gracefully...');
  await opencog.shutdown();
  httpServer.close(() => {
    Logger.info('Server closed');
    process.exit(0);
  });
});

httpServer.listen(port, () => {
  Logger.info(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
});