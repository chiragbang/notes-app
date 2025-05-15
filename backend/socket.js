const Note = require('./models/Note');

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a note room (noteId = document ID)
    socket.on('joinNote', (noteId) => {
      socket.join(noteId);
      console.log(`Socket ${socket.id} joined note ${noteId}`);
    });

    // Handle note update and notify others in the room
    socket.on('noteUpdated', ({ noteId, note }) => {
      socket.to(noteId).emit('receiveUpdate', note);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

module.exports = setupSocket;
