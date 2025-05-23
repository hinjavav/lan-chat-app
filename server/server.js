const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enable socket.io
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'chat_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'chat_app',
  waitForConnections: true,
  connectionLimit: 10
});
global.db = pool;

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ticketsRoutes = require('./routes/tickets');
app.use('/api/tickets', ticketsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// Serve React static build
app.use(express.static(path.join(__dirname, '../client/build')));

// Fallback: serve React frontend for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Socket.IO handlers (basic example)
io.on('connection', (socket) => {
  console.log('🔌 New client connected');

  socket.emit('welcome', 'Welcome to LAN Chat Server 🎉');

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
