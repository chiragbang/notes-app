const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const setupSocket = require('./socket'); // We'll implement this next

dotenv.config();

const app = express();
const server = http.createServer(app); // Important: wrap Express with HTTP server

// ✅ Initialize Socket.IO with CORS config
const io = new Server(server, {
  cors: {
    origin: '*', // Set this to your frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
   transports: ['websocket', 'polling'],
});

// ✅ Apply middleware
app.use(cors({
  origin: 'http://localhost:3000', // Same as above
  credentials: true,
}));
app.use(express.json());

// ✅ API routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// ✅ Socket setup
setupSocket(io); // You’ll create this in `socket.js`

// ✅ MongoDB connection and server start
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
