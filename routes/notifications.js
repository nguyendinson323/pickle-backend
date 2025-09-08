const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notificationController')
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')

router.use(authenticate)

router.get('/', notificationController.getNotifications)
router.get('/unread-count', notificationController.getUnreadCount)
router.patch('/mark-all-read', notificationController.markAllAsRead)

router.patch('/:id/read', notificationController.markAsRead)
router.delete('/:id', notificationController.deleteNotification)

router.post('/tournament', authorize('admin', 'state', 'club', 'partner'), notificationController.sendTournamentNotification)
router.post('/match', authorize('admin', 'state', 'club', 'partner', 'coach'), notificationController.sendMatchNotification)
router.post('/court-reservation', authorize('admin', 'club', 'partner'), notificationController.sendCourtReservationNotification)
router.post('/match-request', authorize('admin', 'player'), notificationController.sendPlayerMatchRequestNotification)
router.post('/payment', authorize('admin'), notificationController.sendPaymentNotification)

module.exports = router