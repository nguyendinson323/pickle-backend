const express = require('express')
const router = express.Router()
const { upload, uploadClubLogo, uploadPlayerPhoto, uploadPlayerDocument, uploadStateLogo } = require('../controllers/uploadController')
const { authenticate } = require('../middlewares/authMiddleware')

// Upload club logo - protected route
router.post('/club-logo', authenticate, upload, uploadClubLogo)

// Upload club logo during registration - public route
router.post('/club-logo-registration', upload, uploadClubLogo)

// Upload player photo during registration - public route
router.post('/player-photo-registration', upload, uploadPlayerPhoto)

// Upload player ID document during registration - public route
router.post('/player-document-registration', upload, uploadPlayerDocument)

// Upload state committee logo during registration - public route
router.post('/state-logo-registration', upload, uploadStateLogo)

module.exports = router