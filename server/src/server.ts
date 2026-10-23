import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { setupSocketIO } from './socket';

dotenv.config();

const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketIO(io);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 Roomly API Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO listening on port ${PORT}`);
  console.log(`🩺 Health check at http://localhost:${PORT}/api/health`);
});
