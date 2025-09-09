const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')
const coachSessionsController = require('../controllers/coachSessionsController')
const coachCertificationsController = require('../controllers/coachCertificationsController')
const coachStudentsController = require('../controllers/coachStudentsController')
const coachMembershipController = require('../controllers/coachMembershipController')

// ==================== SESSIONS ROUTES ====================

// Get all coach sessions data (sessions, availability, stats)
router.get('/sessions', 
  authenticate, 
  authorize(['coach']), 
  coachSessionsController.getCoachSessionsData
)

// Update coaching session status
router.put('/sessions/:sessionId/status', 
  authenticate, 
  authorize(['coach']), 
  coachSessionsController.updateSessionStatus
)

// Add coach availability
router.post('/availability', 
  authenticate, 
  authorize(['coach']), 
  coachSessionsController.addAvailability
)

// Remove coach availability
router.delete('/availability/:availabilityId', 
  authenticate, 
  authorize(['coach']), 
  coachSessionsController.removeAvailability
)

// ==================== CERTIFICATIONS ROUTES ====================

// Get all coach certifications data
router.get('/certifications', 
  authenticate, 
  authorize(['coach']), 
  coachCertificationsController.getCoachCertificationsData
)

// Add new certification
router.post('/certifications', 
  authenticate, 
  authorize(['coach']), 
  coachCertificationsController.addCertification
)

// Update certification
router.put('/certifications/:certificationId', 
  authenticate, 
  authorize(['coach']), 
  coachCertificationsController.updateCertification
)

// Delete certification
router.delete('/certifications/:certificationId', 
  authenticate, 
  authorize(['coach']), 
  coachCertificationsController.deleteCertification
)

// Download certificate PDF
router.get('/certifications/:certificationId/download', 
  authenticate, 
  authorize(['coach']), 
  coachCertificationsController.downloadCertificate
)

// ==================== STUDENTS ROUTES ====================

// Get all coach students data
router.get('/students', 
  authenticate, 
  authorize(['coach']), 
  coachStudentsController.getCoachStudentsData
)

// Get detailed information for a specific student
router.get('/students/:studentId', 
  authenticate, 
  authorize(['coach']), 
  coachStudentsController.getStudentDetails
)

// Update student NRTP level
router.put('/students/:studentId/level', 
  authenticate, 
  authorize(['coach']), 
  coachStudentsController.updateStudentLevel
)

// Add a note about a student
router.post('/students/:studentId/notes', 
  authenticate, 
  authorize(['coach']), 
  coachStudentsController.addStudentNote
)

// ==================== MEMBERSHIP ROUTES ====================

// Get coach membership data
router.get('/membership', 
  authenticate, 
  authorize(['coach']), 
  coachMembershipController.getCoachMembershipData
)

// Subscribe to a plan
router.post('/membership/subscribe', 
  authenticate, 
  authorize(['coach']), 
  coachMembershipController.subscribeToCoachPlan
)

// Cancel subscription
router.post('/membership/cancel', 
  authenticate, 
  authorize(['coach']), 
  coachMembershipController.cancelCoachSubscription
)

// Renew subscription
router.post('/membership/renew', 
  authenticate, 
  authorize(['coach']), 
  coachMembershipController.renewCoachSubscription
)

// Update payment method
router.put('/membership/payment-method', 
  authenticate, 
  authorize(['coach']), 
  coachMembershipController.updateCoachPaymentMethod
)

module.exports = router