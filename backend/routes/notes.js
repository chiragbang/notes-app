const express = require('express');
const Note = require('../models/Note');
const User = require('../models/User');
const auth = require('../middleware/auth');
const accessCheck = require('../middleware/accessCheck');
const notify = require('../utils/notify');
const router = express.Router();
const mongoose = require('mongoose');

router.use(auth);

// ✅ GET all notes the user has access to (owned or shared)
// router.get('/', async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const notes = await Note.find({
//       $or: [
//         { createdBy: userId },
//         { 'collaborators.userId': userId },
//       ],
//     }).sort({ lastUpdated: -1 });

//     res.json(notes);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// router.get('/', async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { page = 1, limit = 10 } = req.query;

//     console.log(`GET /notes: userId=${userId}, page=${page}, limit=${limit}`);

//     const notes = await Note.find({
//       $or: [
//         { createdBy: userId },
//         { 'collaborators.userId': userId },
//       ],
//     })
//       .sort({ lastUpdated: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .populate('createdBy', 'name email')
//       .populate('collaborators.userId', 'name email');

//     const total = await Note.countDocuments({
//       $or: [
//         { createdBy: userId },
//         { 'collaborators.userId': userId },
//       ],
//     });

//     res.status(200).json({
//       notes,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     console.error('GET /notes: Error=', err);
//     res.status(500).json({ error: err.message || 'Server error' });
//   }
// });

router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    console.log(`GET /notes: userId=${userId}, page=${page}, limit=${limit}`);

    const notes = await Note.find({
      $or: [
        { createdBy: userId },
        { 'collaborators.userId': userId },
      ],
    })
      .sort({ lastUpdated: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('collaborators.userId', 'name email');

    const total = await Note.countDocuments({
      $or: [
        { createdBy: userId },
        { 'collaborators.userId': userId },
      ],
    });

    console.log(`GET /notes: Returning ${notes.length} notes, total=${total}`);

    res.status(200).json({
      notes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('GET /notes: Error=', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// ✅ GET a specific note (with access control)
router.get('/:id', accessCheck('read'), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ CREATE a new note
router.post('/', async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      createdBy: req.user.userId,
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// router.put('/:id', accessCheck('write'), async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log('Incoming PUT request for note ID:', id);
//     console.log('Request body:', req.body);

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       console.log('PUT /notes/:id: Invalid note ID');
//       return res.status(400).json({ error: 'Invalid note ID' });
//     }

//     const note = await Note.findByIdAndUpdate(
//       id,
//       { ...req.body, lastUpdated: new Date() },
//       { new: true, runValidators: true }
//     );

//     if (!note) {
//       console.log('PUT /notes/:id: Note not found');
//       return res.status(404).json({ error: 'Note not found' });
//     }

//     console.log('PUT /notes/:id: Updated note=', note);
//     res.status(200).json(note);
//   } catch (err) {
//     console.error('PUT /notes/:id: Error=', err);
//     res.status(500).json({ error: err.message || 'Server error' });
//   }
// });


router.put('/:id', accessCheck('write'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    console.log('Incoming PUT request for note ID:', id);
    console.log('Request body:', req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Notify collaborators
    const notifications = note.collaborators
      .filter((c) => !c.userId.equals(userId))
      .map((c) => ({
        userId: c.userId,
        noteId: note._id,
        message: `Note "${note.title}" was updated by ${req.user.name || 'a user'}`,
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      notifications.forEach((n) => {
        io.to(n.noteId.toString()).emit('noteUpdated', {
          noteId: n.noteId,
          message: n.message,
          updatedNote: note,
        });
      });
    }

    res.status(200).json(note);
  } catch (err) {
    console.error('Error while updating note:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});


// ✅ DELETE a note (write access required)
router.delete('/:id', accessCheck('write'), async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ SHARE a note (only owner can share)
router.post('/:id/share', accessCheck('write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, permission } = req.body;

    console.log(`POST /notes/:id/share: noteId=${id}, email=${email}, permission=${permission}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    if (!['read', 'write'].includes(permission)) {
      return res.status(400).json({ error: 'Invalid permission. Use "read" or "write"' });
    }

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user._id;
    if (note.createdBy.equals(userId)) {
      return res.status(400).json({ error: 'Cannot share with the note owner' });
    }

    const collaboratorExists = note.collaborators.some((c) => c.userId.equals(userId));
    if (collaboratorExists) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    note.collaborators.push({ userId, permission });
    await note.save();

    res.status(200).json(note);
  } catch (err) {
    console.error('POST /notes/:id/share: Error=', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
