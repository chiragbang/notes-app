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
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({
      $or: [
        { createdBy: userId },
        { 'collaborators.userId': userId },
      ],
    }).sort({ lastUpdated: -1 });

    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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

// ✅ UPDATE a note (write access required)
// router.put('/:id', accessCheck('write'), async (req, res) => {
//   try {
//     const note = await Note.findByIdAndUpdate(
//       req.params.id,
//       { ...req.body, lastUpdated: new Date() },
//       { new: true }
//     );

//     if (!note) return res.status(404).json({ error: 'Note not found' });

//     notify(note); // Optional: Socket emit or DB logging
//     res.json(note);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });
router.put('/:id', accessCheck('write'), async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Incoming PUT request for note ID:', id);
    console.log('Request body:', req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('PUT /notes/:id: Invalid note ID');
      return res.status(400).json({ error: 'Invalid note ID' });
    }

    const note = await Note.findByIdAndUpdate(
      id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!note) {
      console.log('PUT /notes/:id: Note not found');
      return res.status(404).json({ error: 'Note not found' });
    }

    console.log('PUT /notes/:id: Updated note=', note);
    res.status(200).json(note);
  } catch (err) {
    console.error('PUT /notes/:id: Error=', err);
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
router.post('/:id/share', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (!note.createdBy.equals(req.user.userId)) {
      return res.status(403).json({ error: 'Only the owner can share notes' });
    }

    const { email, permission } = req.body;

    if (!['read', 'write'].includes(permission)) {
      return res.status(400).json({ error: 'Invalid permission. Use "read" or "write".' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ error: 'User not found' });

    const existing = note.collaborators.find(c =>
      c.userId.equals(userToAdd._id)
    );

    if (existing) {
      existing.permission = permission; // Update permission
    } else {
      note.collaborators.push({ userId: userToAdd._id, permission });
    }

    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
