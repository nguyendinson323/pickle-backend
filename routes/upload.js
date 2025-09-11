const express = require('express')
const router = express.Router()
const { 
  upload, 
  uploadClubLogo, 
  uploadPlayerPhoto, 
  uploadPlayerDocument, 
  uploadStateLogo,
  uploadPartnerLogo,
  uploadCoachPhoto,
  uploadCoachDocument
} = require('../controllers/uploadController')
const { authenticate } = require('../middlewares/authMiddleware')

// Upload club logo - protected route
router.post('/club-logo', authenticate, upload, uploadClubLogo)

// Registration upload routes - public routes
router.post('/club-logo-registration', upload, uploadClubLogo)
router.post('/player-photo-registration', upload, uploadPlayerPhoto)
router.post('/player-document-registration', upload, uploadPlayerDocument)
router.post('/state-logo-registration', upload, uploadStateLogo)
router.post('/partner-logo-registration', upload, uploadPartnerLogo)
router.post('/coach-photo-registration', upload, uploadCoachPhoto)
router.post('/coach-document-registration', upload, uploadCoachDocument)

module.exports = router