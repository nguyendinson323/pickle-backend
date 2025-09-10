const express = require('express')
const router = express.Router()
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware')
const tournamentBrowseController = require('../controllers/tournamentBrowseController')

// GET /api/tournament-browse - Search tournaments (public with optional auth)
router.get('/', optionalAuthenticate, tournamentBrowseController.searchTournaments)

// GET /api/tournament-browse/registrations - Get user's tournament registrations (protected)
router.get('/registrations', authenticate, tournamentBrowseController.getUserRegistrations)

// GET /api/tournament-browse/:id - Get tournament details (public with optional auth)
router.get('/:id', optionalAuthenticate, tournamentBrowseController.getTournamentDetails)

// POST /api/tournament-browse/:tournamentId/register - Register for a tournament (protected)
router.post('/:tournamentId/register', authenticate, tournamentBrowseController.registerForTournament)

// PUT /api/tournament-browse/registrations/:id/withdraw - Withdraw from tournament (protected)
router.put('/registrations/:id/withdraw', authenticate, tournamentBrowseController.withdrawFromTournament)

module.exports = router