const express = require('express')
const router = express.Router()
const { authenticateToken, authorize } = require('../middleware/auth')
const coachSessionsController = require('../controllers/coachSessionsController')
const coachCertificationsController = require('../controllers/coachCertificationsController')
const coachStudentsController = require('../controllers/coachStudentsController')

// ==================== SESSIONS ROUTES ====================

// Get all coach sessions data (sessions, availability, stats)
router.get('/sessions', 
  authenticateToken, 
  authorize(['coach']), 
  coachSessionsController.getCoachSessionsData
)

// Update coaching session status
router.put('/sessions/:sessionId/status', 
  authenticateToken, 
  authorize(['coach']), 
  coachSessionsController.updateSessionStatus
)

// Add coach availability
router.post('/availability', 
  authenticateToken, 
  authorize(['coach']), 
  coachSessionsController.addAvailability
)

// Remove coach availability
router.delete('/availability/:availabilityId', 
  authenticateToken, 
  authorize(['coach']), 
  coachSessionsController.removeAvailability
)

// ==================== CERTIFICATIONS ROUTES ====================

// Get all coach certifications data
router.get('/certifications', 
  authenticateToken, 
  authorize(['coach']), 
  coachCertificationsController.getCoachCertificationsData
)

// Add new certification
router.post('/certifications', 
  authenticateToken, 
  authorize(['coach']), 
  coachCertificationsController.addCertification
)

// Update certification
router.put('/certifications/:certificationId', 
  authenticateToken, 
  authorize(['coach']), 
  coachCertificationsController.updateCertification
)

// Delete certification
router.delete('/certifications/:certificationId', 
  authenticateToken, 
  authorize(['coach']), 
  coachCertificationsController.deleteCertification
)

// Download certificate PDF
router.get('/certifications/:certificationId/download', 
  authenticateToken, 
  authorize(['coach']), 
  coachCertificationsController.downloadCertificate
)

// ==================== STUDENTS ROUTES ====================

// Get all coach students data
router.get('/students', 
  authenticateToken, 
  authorize(['coach']), 
  coachStudentsController.getCoachStudentsData
)

// Get detailed information for a specific student
router.get('/students/:studentId', 
  authenticateToken, 
  authorize(['coach']), 
  coachStudentsController.getStudentDetails
)

// Update student NRTP level
router.put('/students/:studentId/level', 
  authenticateToken, 
  authorize(['coach']), 
  coachStudentsController.updateStudentLevel
)

// Add a note about a student
router.post('/students/:studentId/notes', 
  authenticateToken, 
  authorize(['coach']), 
  coachStudentsController.addStudentNote
)

module.exports = router