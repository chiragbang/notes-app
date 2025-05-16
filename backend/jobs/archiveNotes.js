const cron = require('node-cron');
const Note = require('../models/Note');

const archiveOldNotes = () => {
  cron.schedule('0 0 * * *', async () => { // Run daily at midnight
    try {
      console.log('Running note archive job');
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await Note.updateMany(
        { lastUpdated: { $lt: thirtyDaysAgo }, archived: { $ne: true } },
        { $set: { archived: true } }
      );
      console.log('Old notes archived');
    } catch (err) {
      console.error('Archive job error:', err);
    }
  });
};

module.exports = archiveOldNotes;