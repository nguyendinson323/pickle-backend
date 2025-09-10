const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { authenticate } = require('../middlewares/authMiddleware')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

router.use(authenticate)

router.post('/change-password', authController.changePassword)
router.get('/dashboard', authController.getDashboard)
router.post('/refresh-token', authController.refreshToken)
router.get('/profile', authController.getProfile)
router.put('/profile/club', authController.updateProfile)
router.put('/profile/player', authController.updateProfile)
router.put('/profile/coach', authController.updateProfile)
router.put('/profile/partner', authController.updateProfile)
router.put('/profile/state', authController.updateProfile)

module.exports = router