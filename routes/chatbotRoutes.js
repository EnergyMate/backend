// -----------------------------------------------------------------------------
// Rute untuk Endpoint Chatbot
// -----------------------------------------------------------------------------

const express = require('express');
const { handleChat } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// /api/chatbot/
router.post('/', protect, handleChat);

module.exports = router;
