const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/tts.controller');

// POST /api/tts/save - Save speech record
router.post('/save', ttsController.saveSpeech);

// GET /api/tts/history - Get speech history
router.get('/history', ttsController.getSpeechHistory);

// GET /api/tts/statistics - Get statistics
router.get('/statistics', ttsController.getStatistics);

// DELETE /api/tts/:id - Delete a speech record
router.delete('/:id', ttsController.deleteSpeech);

module.exports = router;
