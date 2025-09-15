const express = require('express')
const router = express.Router()
const {
  upload,
  uploadCertification,
  uploadClubLogo,
  uploadPlayerPhoto,
  uploadPlayerDocument,
  uploadStateLogo,
  uploadPartnerLogo,
  uploadCoachPhoto,
  uploadCoachDocument,
  uploadCoachCertification,
  uploadAdminPhoto
} = require('../controllers/uploadController')
const { authenticate } = require('../middlewares/authMiddleware')

// Upload club logo - protected route
router.post('/club-logo', authenticate, upload, uploadClubLogo)

// Upload partner logo - protected route
router.post('/partner-logo', authenticate, upload, uploadPartnerLogo)

// Upload admin photo - protected route
router.post('/admin-photo', authenticate, upload, uploadAdminPhoto)

// Upload player assets - protected routes for existing players
router.post('/player-photo', authenticate, upload, uploadPlayerPhoto)
router.post('/player-document', authenticate, upload, uploadPlayerDocument)
router.post('/coach-photo', authenticate, upload, uploadCoachPhoto)
router.post('/coach-document', authenticate, upload, uploadCoachDocument)
router.post('/coach-certification', authenticate, uploadCertification, uploadCoachCertification)

// Registration upload routes - public routes
router.post('/club-logo-registration', upload, uploadClubLogo)
router.post('/player-photo-registration', upload, uploadPlayerPhoto)
router.post('/player-document-registration', upload, uploadPlayerDocument)
router.post('/state-logo-registration', upload, uploadStateLogo)
router.post('/partner-logo-registration', upload, uploadPartnerLogo)
router.post('/coach-photo-registration', upload, uploadCoachPhoto)
router.post('/coach-document-registration', upload, uploadCoachDocument)

module.exports = router