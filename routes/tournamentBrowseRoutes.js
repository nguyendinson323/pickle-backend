const express = require('express')
const router = express.Router()
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware')
const tournamentBrowseController = require('../controllers/tournamentBrowseController')

// POST /api/tournament-browse/search - Search tournaments (public with optional auth)
router.post('/search', optionalAuthenticate, tournamentBrowseController.searchTournaments)

// GET /api/tournament-browse/tournaments/:id - Get tournament details (public with optional auth)
router.get('/tournaments/:id', optionalAuthenticate, tournamentBrowseController.getTournamentDetails)

// Protected routes (require authentication)
router.use(authenticate)

// GET /api/tournament-browse/registrations - Get user's tournament registrations
router.get('/registrations', tournamentBrowseController.getUserRegistrations)

// POST /api/tournament-browse/register - Register for a tournament
router.post('/register', tournamentBrowseController.registerForTournament)

// PUT /api/tournament-browse/registrations/:id/withdraw - Withdraw from tournament
router.put('/registrations/:id/withdraw', tournamentBrowseController.withdrawFromTournament)

module.exports = router