const express = require('express')
const router = express.Router()
const courtController = require('../controllers/courtController')
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')

router.get('/', optionalAuthenticate, courtController.getAllCourts)
router.get('/search', optionalAuthenticate, courtController.searchNearbyCourts)
router.get('/:id', optionalAuthenticate, courtController.getCourt)
router.get('/:id/available-slots', optionalAuthenticate, courtController.getAvailableSlots)
router.get('/:id/reservations', optionalAuthenticate, courtController.getReservationsByDate)
router.get('/:id/maintenance', optionalAuthenticate, courtController.getMaintenanceSchedule)

router.use(authenticate)

router.post('/', authorize('club', 'partner'), courtController.createCourt)
router.get('/my/courts', authorize('club', 'partner'), courtController.getMyCourts)

router.put('/:id', authorize('admin', 'club', 'partner'), courtController.updateCourt)
router.put('/:id/schedule', authorize('admin', 'club', 'partner'), courtController.updateCourtSchedule)

router.post('/reservations', authorize('player'), courtController.createReservation)
router.get('/reservations/my', authorize('player'), courtController.getMyReservations)
router.delete('/reservations/:id', authorize('admin', 'club', 'partner', 'player'), courtController.cancelReservation)

router.post('/maintenance', authorize('admin', 'club', 'partner'), courtController.scheduleMaintenance)
router.put('/maintenance/:id', authorize('admin', 'club', 'partner'), courtController.updateMaintenance)

module.exports = router