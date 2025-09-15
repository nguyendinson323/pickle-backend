const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController')
const { authenticate } = require('../middlewares/authMiddleware')

// All payment routes require authentication
router.use(authenticate)

// Create payment intent for any payment
router.post('/create-payment-intent', paymentController.createPaymentIntent)

// Create court reservation with payment
router.post('/reservations', paymentController.createReservationWithPayment)

// Get user's payment history
router.get('/history', paymentController.getPaymentHistory)

module.exports = router