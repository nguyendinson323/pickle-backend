const express = require('express')
const router = express.Router()
const tournamentController = require('../controllers/tournamentController')
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')

router.get('/', optionalAuthenticate, tournamentController.getAllTournaments)
router.get('/:id', optionalAuthenticate, tournamentController.getTournament)
router.get('/:id/registrations', optionalAuthenticate, tournamentController.getTournamentRegistrations)
router.get('/:id/matches', optionalAuthenticate, tournamentController.getTournamentMatches)

router.use(authenticate)

router.post('/', authorize('admin', 'state', 'club', 'partner'), tournamentController.createTournament)

router.put('/:id', authorize('admin', 'state', 'club', 'partner'), tournamentController.updateTournament)

router.post('/:id/register', authorize('player'), tournamentController.registerForTournament)
router.delete('/:id/withdraw', authorize('player'), tournamentController.withdrawFromTournament)

router.post('/:id/categories', authorize('admin', 'state', 'club', 'partner'), tournamentController.createTournamentCategory)
router.post('/:id/generate-brackets', authorize('admin', 'state', 'club', 'partner'), tournamentController.generateTournamentBrackets)

router.post('/matches', authorize('admin', 'state', 'club', 'partner'), tournamentController.createMatch)
router.put('/matches/:id', authorize('admin', 'state', 'club', 'partner', 'coach'), tournamentController.updateMatch)

module.exports = router