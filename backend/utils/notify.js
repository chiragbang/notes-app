// utils/notify.js
const { getIO } = require('../socket');

function notify(note) {
  const io = getIO();
  io.to(note._id.toString()).emit('noteUpdated', {
    noteId: note._id,
    updatedAt: note.lastUpdated,
  });
}

module.exports = notify;
