const mongoose = require('mongoose');
const Note = require('../models/Note');

module.exports = function(requiredPermission) {
  return async function(req, res, next) {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const note = await Note.findById(id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Owner bypasses permission check
    if (note.createdBy.equals(userId)) return next();

    const collaborator = note.collaborators.find(c => c.userId.equals(userId));
    if (!collaborator) {
      return res.status(403).json({ error: 'Forbidden: Not a collaborator' });
    }

    if (requiredPermission === 'write' && collaborator.permission !== 'write') {
      return res.status(403).json({ error: 'Forbidden: Write access required' });
    }

    next();
  };
};
