const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const playerController = require('../controllers/playerController')
const playerMembershipController = require('../controllers/playerMembershipController')

// Apply authentication middleware to all routes
router.use(authenticate)

// GET /api/player/states - Get list of all states
router.get('/states', playerController.getStates)

// GET /api/player/dashboard - Get player dashboard data
router.get('/dashboard', playerController.getDashboard)

// GET /api/player/profile - Get current player's profile
router.get('/profile', playerController.getProfile)

// PUT /api/player/profile - Update player profile
router.put('/profile', playerController.updateProfile)

// PUT /api/player/account - Update user account information
router.put('/account', playerController.updateAccount)

// GET /api/player/credentials - Get player's digital credentials
router.get('/credentials', playerController.getDigitalCredentials)

// ==================== MEMBERSHIP ROUTES ====================

// GET /api/player/membership - Get player membership data
router.get('/membership', playerMembershipController.getPlayerMembershipData)

// POST /api/player/membership/subscribe - Subscribe to a plan
router.post('/membership/subscribe', playerMembershipController.subscribeToPlan)

// POST /api/player/membership/cancel - Cancel subscription
router.post('/membership/cancel', playerMembershipController.cancelSubscription)

// POST /api/player/membership/renew - Renew subscription
router.post('/membership/renew', playerMembershipController.renewSubscription)

// PUT /api/player/membership/payment-method - Update payment method
router.put('/membership/payment-method', playerMembershipController.updatePaymentMethod)

module.exports = router