const express = require('express')
const router = express.Router()
const adminUserManagementController = require('../controllers/adminUserManagementController')
const adminMessagingController = require('../controllers/adminMessagingController')
const adminRankingsController = require('../controllers/adminRankingsController')
const adminCourtsController = require('../controllers/adminCourtsController')
const adminTournamentsController = require('../controllers/adminTournamentsController')
const adminMicrositesController = require('../controllers/adminMicrositesController')
const adminReportsController = require('../controllers/adminReportsController')
const adminPaymentsController = require('../controllers/adminPaymentsController')
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')

router.use(authenticate)
router.use(authorize('admin'))

// User Management Routes
router.get('/users', adminUserManagementController.getUsers)
router.get('/users/export', adminUserManagementController.exportUsers)
router.post('/users/bulk-update', adminUserManagementController.bulkUpdateUsers)
router.post('/users/notify', adminUserManagementController.sendUserNotification)

router.get('/users/:id', adminUserManagementController.getUserDetails)
router.put('/users/:id/status', adminUserManagementController.updateUserStatus)
router.put('/users/:id/verification', adminUserManagementController.updateUserVerification)
router.put('/users/:id/premium', adminUserManagementController.updateUserPremium)
router.post('/users/:id/reset-password', adminUserManagementController.resetUserPassword)

// Messaging Routes
router.get('/messaging/templates', adminMessagingController.getTemplates)
router.post('/messaging/templates', adminMessagingController.createTemplate)
router.put('/messaging/templates/:id', adminMessagingController.updateTemplate)
router.delete('/messaging/templates/:id', adminMessagingController.deleteTemplate)

router.get('/messaging/sent', adminMessagingController.getSentMessages)
router.post('/messaging/broadcast', adminMessagingController.sendBroadcastMessage)
router.post('/messaging/preview', adminMessagingController.getMessagePreview)
router.post('/messaging/resend/:id', adminMessagingController.resendFailedMessage)
router.get('/messaging/delivery-report/:id', adminMessagingController.getMessageDeliveryReport)

// Rankings Routes
router.get('/rankings/players', adminRankingsController.getPlayerRankings)
router.get('/rankings/changes', adminRankingsController.getRankingChanges)
router.post('/rankings/adjust', adminRankingsController.adjustRanking)
router.post('/rankings/recalculate', adminRankingsController.recalculateRankings)
router.post('/rankings/freeze', adminRankingsController.freezeRankings)
router.get('/rankings/export', adminRankingsController.exportRankings)
router.get('/rankings/player/:playerId/history', adminRankingsController.getPlayerRankingHistory)

// Courts Routes
router.get('/courts', adminCourtsController.getCourts)
router.get('/courts/reservations', adminCourtsController.getCourtReservations)
router.get('/courts/export', adminCourtsController.exportCourts)
router.get('/courts/utilization', adminCourtsController.getCourtUtilizationReport)
router.get('/courts/:id', adminCourtsController.getCourtDetails)
router.get('/courts/:id/utilization', adminCourtsController.getCourtUtilizationReport)
router.put('/courts/:id/status', adminCourtsController.updateCourtStatus)
router.post('/courts/:id/approve', adminCourtsController.approveCourt)
router.post('/courts/:id/reject', adminCourtsController.rejectCourt)
router.put('/courts/reservations/:id/status', adminCourtsController.updateReservationStatus)
router.post('/courts/reservations/bulk-update', adminCourtsController.bulkUpdateReservations)

// Tournaments Routes
router.get('/tournaments', adminTournamentsController.getTournaments)
router.get('/tournaments/participants', adminTournamentsController.getTournamentParticipants)
router.get('/tournaments/export', adminTournamentsController.exportTournaments)
router.get('/tournaments/:id', adminTournamentsController.getTournamentDetails)
router.get('/tournaments/:id/participants', adminTournamentsController.getTournamentParticipants)
router.get('/tournaments/:id/report', adminTournamentsController.generateTournamentReport)
router.put('/tournaments/:id/status', adminTournamentsController.updateTournamentStatus)
router.post('/tournaments/:id/approve', adminTournamentsController.approveTournament)
router.post('/tournaments/:id/reject', adminTournamentsController.rejectTournament)
router.post('/tournaments/:id/cancel', adminTournamentsController.cancelTournament)
router.post('/tournaments/:id/notify', adminTournamentsController.sendTournamentNotification)
router.put('/tournaments/participants/:id/status', adminTournamentsController.updateParticipantStatus)
router.post('/tournaments/participants/bulk-update', adminTournamentsController.bulkUpdateParticipants)

// Microsites Routes
router.get('/microsites', adminMicrositesController.getMicrosites)
router.get('/microsites/export', adminMicrositesController.exportMicrosites)
router.get('/microsites/:id', adminMicrositesController.getMicrositeDetails)
router.get('/microsites/:id/analytics', adminMicrositesController.getMicrositeAnalytics)
router.get('/microsites/:id/report', adminMicrositesController.generateMicrositeReport)
router.put('/microsites/:id/status', adminMicrositesController.updateMicrositeStatus)
router.post('/microsites/:id/approve', adminMicrositesController.approveMicrosite)
router.post('/microsites/:id/reject', adminMicrositesController.rejectMicrosite)
router.post('/microsites/:id/suspend', adminMicrositesController.suspendMicrosite)
router.post('/microsites/:id/audit', adminMicrositesController.performContentAudit)
router.post('/microsites/:id/notify', adminMicrositesController.sendMicrositeNotification)

// Reports Routes
router.get('/reports', adminReportsController.getReports)
router.post('/reports/generate', adminReportsController.generateReport)
router.post('/reports/preview', adminReportsController.getReportPreview)
router.get('/reports/:id/status', adminReportsController.getReportStatus)
router.get('/reports/:id/download', adminReportsController.downloadReport)
router.delete('/reports/:id', adminReportsController.deleteReport)

// Payments Routes
router.get('/payments', adminPaymentsController.getPayments)
router.get('/payments/stats', adminPaymentsController.getPaymentStats)
router.get('/payments/export', adminPaymentsController.exportPayments)
router.get('/payment-methods', adminPaymentsController.getPaymentMethods)
router.post('/payments/:id/refund', adminPaymentsController.processRefund)
router.put('/payments/:id/status', adminPaymentsController.updatePaymentStatus)
router.put('/payments/bulk-status', adminPaymentsController.bulkUpdatePaymentStatus)

module.exports = router