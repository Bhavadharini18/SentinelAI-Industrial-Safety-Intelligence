const http = require('http');
const socketio = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = require('./app');
const server = http.createServer(app);

// Initialize Socket.io
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Bind io to app instance for controllers access
app.set('io', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
  
  // Custom demo trigger event
  socket.on('ping_sensor', (data) => {
    console.log('[Socket.io] Sensor ping received:', data);
    socket.emit('pong_sensor', { status: 'acknowledged', time: new Date() });
  });
});

// Start telemetry background simulator
const { startTelemetrySimulation } = require('./sockets/simulator');
startTelemetrySimulation(io);

// Listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] SentinelAI API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
