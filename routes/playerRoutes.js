const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const playerController = require('../controllers/playerController')

// Apply authentication middleware to all routes
router.use(authenticate)

// GET /api/player/states - Get list of all states
router.get('/states', playerController.getStates)

// GET /api/player/profile - Get current player's profile
router.get('/profile', playerController.getProfile)

// PUT /api/player/profile - Update player profile
router.put('/profile', playerController.updateProfile)

// PUT /api/player/account - Update user account information
router.put('/account', playerController.updateAccount)

module.exports = router