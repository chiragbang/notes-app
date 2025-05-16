const mongoose = require('mongoose'); // Ensure this line is present
const Note = require('../models/Note');

module.exports = function (requiredPermission) {
  return async function (req, res, next) {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log(`accessCheck: userId=${userId}, noteId=${id}, requiredPermission=${requiredPermission}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('accessCheck: Invalid note ID');
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const note = await Note.findById(id);
    if (!note) {
      console.log('accessCheck: Note not found');
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log(`accessCheck: createdBy=${note.createdBy}, collaborators=${JSON.stringify(note.collaborators)}`);

    if (note.createdBy.equals(userId)) {
      console.log('accessCheck: User is owner, proceeding');
      return next();
    }

    const collaborator = note.collaborators.find((c) => c.userId.equals(userId));
    if (!collaborator) {
      console.log('accessCheck: User is not a collaborator');
      return res.status(403).json({ error: 'Forbidden: Not a collaborator' });
    }

    if (requiredPermission === 'write' && collaborator.permission !== 'write') {
      console.log('accessCheck: User lacks write permission');
      return res.status(403).json({ error: 'Forbidden: Write access required' });
    }

    console.log('accessCheck: User has required permission, proceeding');
    next();
  };
};