const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const playerFinderController = require('../controllers/playerFinderController')

// Apply authentication middleware to all routes
router.use(authenticate)

// POST /api/player-finder/search - Search for players based on filters
router.post('/search', playerFinderController.searchPlayers)

// GET /api/player-finder/requests/sent - Get current player's sent match requests
router.get('/requests/sent', playerFinderController.getSentRequests)

// GET /api/player-finder/requests/received - Get current player's received match requests
router.get('/requests/received', playerFinderController.getReceivedRequests)

// POST /api/player-finder/requests - Send a match request
router.post('/requests', playerFinderController.sendMatchRequest)

// PUT /api/player-finder/requests/:id - Respond to or cancel a match request
router.put('/requests/:id', playerFinderController.updateMatchRequest)

module.exports = router