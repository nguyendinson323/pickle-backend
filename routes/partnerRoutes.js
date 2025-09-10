const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')
const partnerProfileController = require('../controllers/partnerProfileController')
const partnerInboxController = require('../controllers/partnerInboxController')
const partnerMicrositeController = require('../controllers/partnerMicrositeController')
const partnerStatisticsController = require('../controllers/partnerStatisticsController')
const partnerDocumentsController = require('../controllers/partnerDocumentsController')
const partnerManagementController = require('../controllers/partnerManagementController')

// ==================== PROFILE ROUTES ====================

// Get partner profile data
router.get('/profile', 
  authenticate, 
  authorize('partner'), 
  partnerProfileController.getPartnerProfile
)

// Update partner profile information
router.put('/profile', 
  authenticate, 
  authorize('partner'), 
  partnerProfileController.updatePartnerProfile
)

// Get partner affiliation status
router.get('/affiliation', 
  authenticate, 
  authorize('partner'), 
  partnerProfileController.getPartnerAffiliationStatus
)

// ==================== INBOX ROUTES ====================

// Get partner inbox data (received messages and stats)
router.get('/inbox', 
  authenticate, 
  authorize('partner'), 
  partnerInboxController.getPartnerInboxData
)

// Mark message as read
router.put('/messages/:messageId/read', 
  authenticate, 
  authorize('partner'), 
  partnerInboxController.markPartnerMessageAsRead
)

// Delete message
router.delete('/messages/:messageId', 
  authenticate, 
  authorize('partner'), 
  partnerInboxController.deletePartnerMessage
)

// ==================== MICROSITE ROUTES ====================

// Get partner microsite data (authenticated partner)
router.get('/microsite', 
  authenticate, 
  authorize('partner'), 
  partnerMicrositeController.getPartnerMicrositeData
)

// Get partner microsite data (public view by partner ID)
router.get('/microsite/:partnerId', 
  partnerMicrositeController.getPartnerMicrositeData
)

// Update partner microsite information
router.put('/microsite', 
  authenticate, 
  authorize('partner'), 
  partnerMicrositeController.updatePartnerMicrosite
)

// Create microsite page
router.post('/microsite/pages', 
  authenticate, 
  authorize('partner'), 
  partnerMicrositeController.createMicrositePage
)

// Update microsite page
router.put('/microsite/pages/:pageId', 
  authenticate, 
  authorize('partner'), 
  partnerMicrositeController.updateMicrositePage
)

// Delete microsite page
router.delete('/microsite/pages/:pageId', 
  authenticate, 
  authorize('partner'), 
  partnerMicrositeController.deleteMicrositePage
)

// ==================== STATISTICS ROUTES ====================

// Get partner statistics data
router.get('/statistics', 
  authenticate, 
  authorize('partner'), 
  partnerStatisticsController.getPartnerStatistics
)

// Export partner statistics report
router.get('/statistics/export', 
  authenticate, 
  authorize('partner'), 
  partnerStatisticsController.exportPartnerStatistics
)

// ==================== DOCUMENTS ROUTES ====================

// Get partner documents and invoices
router.get('/documents', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.getPartnerDocuments
)

// Upload partner document
router.post('/documents/upload', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.uploadPartnerDocument
)

// Sign partner document
router.post('/documents/:documentId/sign', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.signPartnerDocument
)

// Download partner document
router.get('/documents/:documentId/download', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.downloadPartnerDocument
)

// Get partner document info
router.get('/documents/:documentId', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.getPartnerDocument
)

// Delete partner document
router.delete('/documents/:documentId', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.deletePartnerDocument
)

// Download partner invoice
router.get('/invoices/:invoiceId/download', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.downloadPartnerInvoice
)

// Get partner invoice info
router.get('/invoices/:invoiceId', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.getPartnerInvoice
)

// Mark invoice as paid
router.post('/invoices/:invoiceId/pay', 
  authenticate, 
  authorize('partner'), 
  partnerDocumentsController.markInvoiceAsPaid
)

// ==================== MANAGEMENT ROUTES ====================

// Get partner management data (courts and tournaments)
router.get('/management', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.getPartnerManagementData
)

// Court management routes
router.post('/courts', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.createCourt
)

router.put('/courts/:courtId', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.updateCourt
)

router.delete('/courts/:courtId', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.deleteCourt
)

// Tournament management routes
router.post('/tournaments', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.createTournament
)

router.put('/tournaments/:tournamentId', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.updateTournament
)

router.delete('/tournaments/:tournamentId', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.deleteTournament
)

router.post('/tournaments/:tournamentId/publish', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.publishTournament
)

router.post('/tournaments/:tournamentId/cancel', 
  authenticate, 
  authorize('partner'), 
  partnerManagementController.cancelTournament
)

module.exports = router