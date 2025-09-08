const express = require('express');
const router = express.Router();
const playerMessagesController = require('../controllers/playerMessagesController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get all conversations for the current user (protected)
router.get('/conversations', authenticate, playerMessagesController.getConversations);

// Get messages for a specific conversation (protected)
router.get('/conversations/:conversationId/messages', authenticate, playerMessagesController.getMessages);

// Start a new conversation (protected)
router.post('/conversations', authenticate, playerMessagesController.startConversation);

// Send a new message (protected)
router.post('/send', authenticate, playerMessagesController.sendMessage);

// Search for players to message (protected)
router.get('/search', authenticate, playerMessagesController.searchPlayers);

// Get player contacts (protected)
router.get('/contacts', authenticate, playerMessagesController.getContacts);

// Mark messages as read (protected)
router.put('/conversations/:conversationId/mark-read', authenticate, playerMessagesController.markMessagesAsRead);

// Delete a message (protected)
router.delete('/messages/:messageId', authenticate, playerMessagesController.deleteMessage);

// Update online status (protected)
router.put('/status', authenticate, playerMessagesController.updateOnlineStatus);

module.exports = router;