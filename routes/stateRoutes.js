const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')
const stateManagementController = require('../controllers/stateManagementController')
const stateInboxController = require('../controllers/stateInboxController')
const stateMicrositeController = require('../controllers/stateMicrositeController')
const stateStatisticsController = require('../controllers/stateStatisticsController')
const stateDocumentsController = require('../controllers/stateDocumentsController')
const stateMemberManagementController = require('../controllers/stateMemberManagementController')
const stateDashboardController = require('../controllers/stateDashboardController')
const stateMembershipController = require('../controllers/stateMembershipController')

// ==================== DASHBOARD ROUTES ====================

// Get state dashboard data
router.get('/dashboard', 
  authenticate, 
  authorize(['state']), 
  stateDashboardController.getStateDashboard
)

// Get state performance metrics
router.get('/dashboard/metrics', 
  authenticate, 
  authorize(['state']), 
  stateDashboardController.getStatePerformanceMetrics
)

// ==================== MANAGEMENT ROUTES ====================

// Get all state management data
router.get('/management', 
  authenticate, 
  authorize(['state']), 
  stateManagementController.getStateManagementData
)

// Create state tournament
router.post('/tournaments', 
  authenticate, 
  authorize(['state']), 
  stateManagementController.createStateTournament
)

// Update state tournament
router.put('/tournaments/:tournamentId', 
  authenticate, 
  authorize(['state']), 
  stateManagementController.updateStateTournament
)

// Delete state tournament
router.delete('/tournaments/:tournamentId', 
  authenticate, 
  authorize(['state']), 
  stateManagementController.deleteStateTournament
)

// Update state tournament status
router.put('/tournaments/:tournamentId/status', 
  authenticate, 
  authorize(['state']), 
  stateManagementController.updateStateTournamentStatus
)

// Update court status (monitoring)
router.put('/courts/:courtId/status', 
  authenticate, 
  authorize(['state']), 
  stateManagementController.updateCourtStatus
)

// ==================== INBOX ROUTES ====================

// Get state inbox data (received and sent messages)
router.get('/inbox', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.getStateInboxData
)

// Get potential message recipients
router.get('/recipients', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.getStateRecipients
)

// Send individual message
router.post('/messages', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.sendStateMessage
)

// Send bulk announcement
router.post('/announcements', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.sendBulkAnnouncement
)

// Mark message as read
router.put('/messages/:messageId/read', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.markMessageAsRead
)

// Delete message
router.delete('/messages/:messageId', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.deleteMessage
)

// Get message templates
router.get('/templates', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.getMessageTemplates
)

// Create message template
router.post('/templates', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.createMessageTemplate
)

// Update message template
router.put('/templates/:templateId', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.updateMessageTemplate
)

// Delete message template
router.delete('/templates/:templateId', 
  authenticate, 
  authorize(['state']), 
  stateInboxController.deleteMessageTemplate
)

// ==================== MICROSITE ROUTES ====================

// Get state microsite data (authenticated state user)
router.get('/microsite', 
  authenticate, 
  authorize(['state']), 
  stateMicrositeController.getStateMicrositeData
)

// Get state microsite data (public view by state ID)
router.get('/microsite/:stateId', 
  stateMicrositeController.getStateMicrositeData
)

// Update state microsite information
router.put('/microsite', 
  authenticate, 
  authorize(['state']), 
  stateMicrositeController.updateStateMicrosite
)

// Create microsite news article
router.post('/microsite/news', 
  authenticate, 
  authorize(['state']), 
  stateMicrositeController.createMicrositeNews
)

// Update microsite news article
router.put('/microsite/news/:newsId', 
  authenticate, 
  authorize(['state']), 
  stateMicrositeController.updateMicrositeNews
)

// Delete microsite news article
router.delete('/microsite/news/:newsId', 
  authenticate, 
  authorize(['state']), 
  stateMicrositeController.deleteMicrositeNews
)

// ==================== STATISTICS ROUTES ====================

// Get comprehensive state statistics
router.get('/statistics', 
  authenticate, 
  authorize(['state']), 
  stateStatisticsController.getStateStatisticsData
)

// Export statistics report
router.get('/statistics/export', 
  authenticate, 
  authorize(['state']), 
  stateStatisticsController.exportStatisticsReport
)

// ==================== DOCUMENTS ROUTES ====================

// Get state documents data
router.get('/documents', 
  authenticate, 
  authorize(['state']), 
  stateDocumentsController.getStateDocuments
)

// Upload state document
router.post('/documents/upload', 
  authenticate, 
  authorize(['state']), 
  stateDocumentsController.uploadStateDocument
)

// Update state document
router.put('/documents/:documentId', 
  authenticate, 
  authorize(['state']), 
  stateDocumentsController.updateStateDocument
)

// Delete state document
router.delete('/documents/:documentId', 
  authenticate, 
  authorize(['state']), 
  stateDocumentsController.deleteStateDocument
)

// Download state document
router.get('/documents/:documentId/download', 
  authenticate, 
  authorize(['state']), 
  stateDocumentsController.downloadStateDocument
)


// ==================== MEMBER MANAGEMENT ROUTES ====================

// Get state member management data (players, coaches, clubs, partners, stats)
router.get('/members', 
  authenticate, 
  authorize(['state']), 
  stateMemberManagementController.getStateMemberData
)

// Update player status
router.put('/players/:playerId/status', 
  authenticate, 
  authorize(['state']), 
  stateMemberManagementController.updatePlayerStatus
)

// Update coach verification
router.put('/coaches/:coachId/verify', 
  authenticate, 
  authorize(['state']), 
  stateMemberManagementController.updateCoachVerification
)

// Update club status
router.put('/clubs/:clubId/status', 
  authenticate, 
  authorize(['state']), 
  stateMemberManagementController.updateClubStatus
)

// Update partner status
router.put('/partners/:partnerId/status',
  authenticate,
  authorize(['state']),
  stateMemberManagementController.updatePartnerStatus
)

// ==================== MEMBERSHIP ROUTES ====================

// Get affiliation requirements (public endpoint)
router.get('/affiliation/requirements',
  stateMembershipController.getAffiliationRequirements
)

// Get state membership/affiliation data
router.get('/membership',
  authenticate,
  authorize(['state']),
  stateMembershipController.getStateMembershipData
)

// Renew state affiliation
router.post('/membership/renew',
  authenticate,
  authorize(['state']),
  stateMembershipController.renewStateAffiliation
)

// Submit compliance report
router.post('/membership/compliance-report',
  authenticate,
  authorize(['state']),
  stateMembershipController.submitComplianceReport
)

// Update state committee information
router.put('/membership/info',
  authenticate,
  authorize(['state']),
  stateMembershipController.updateStateCommitteeInfo
)

module.exports = router