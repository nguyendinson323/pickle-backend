const express = require('express')
const router = express.Router()
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware')
const tournamentBrowseController = require('../controllers/tournamentBrowseController')

// GET /api/tournament-browse - Search tournaments (public with optional auth)
router.get('/', optionalAuthenticate, tournamentBrowseController.searchTournaments)

// GET /api/tournament-browse/:id - Get tournament details (public with optional auth)
router.get('/:id', optionalAuthenticate, tournamentBrowseController.getTournamentDetails)

// Protected routes (require authentication)
router.use(authenticate)

// GET /api/tournament-browse/registrations - Get user's tournament registrations
router.get('/registrations', tournamentBrowseController.getUserRegistrations)

// POST /api/tournament-browse/:tournamentId/register - Register for a tournament
router.post('/:tournamentId/register', tournamentBrowseController.registerForTournament)

// PUT /api/tournament-browse/registrations/:id/withdraw - Withdraw from tournament
router.put('/registrations/:id/withdraw', tournamentBrowseController.withdrawFromTournament)

module.exports = router