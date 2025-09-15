const paymentService = require('../services/paymentService')
const courtService = require('../services/courtService')

const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body
    const userId = req.userId

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' })
    }

    // Add user_id to metadata
    const paymentMetadata = {
      ...metadata,
      user_id: userId
    }

    const paymentIntent = await paymentService.createPaymentIntent({
      amount,
      currency,
      metadata: paymentMetadata
    })

    res.json(paymentIntent)
  } catch (error) {
    console.error('Payment intent creation failed:', error)
    res.status(500).json({ message: error.message })
  }
}

const createReservationWithPayment = async (req, res) => {
  try {
    const {
      court_id,
      date,
      start_time,
      end_time,
      amount,
      payment_intent_id
    } = req.body

    // Verify payment was successful
    const paymentIntent = await paymentService.confirmPaymentIntent(payment_intent_id)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' })
    }

    // Get player profile
    const { Player } = require('../db/models')
    const player = await Player.findOne({ where: { user_id: req.userId } })

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Create the reservation with payment information
    const reservationData = {
      court_id,
      date,
      start_time,
      end_time,
      player_id: player.id,
      amount,
      payment_status: 'paid',
      stripe_payment_id: payment_intent_id,
      status: 'confirmed'
    }

    const reservation = await courtService.createReservation(reservationData)

    // Record the payment in our system
    await paymentService.recordPayment({
      user_id: req.userId,
      amount,
      currency: paymentIntent.currency,
      payment_type: 'court_reservation',
      reference_type: 'court_reservation',
      reference_id: reservation.id,
      stripe_payment_id: payment_intent_id,
      status: 'completed'
    })

    res.status(201).json(reservation)
  } catch (error) {
    console.error('Reservation with payment failed:', error)
    res.status(500).json({ message: error.message })
  }
}

const getPaymentHistory = async (req, res) => {
  try {
    const { Payment } = require('../db/models')

    const payments = await Payment.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']]
    })

    res.json(payments)
  } catch (error) {
    console.error('Failed to fetch payment history:', error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createPaymentIntent,
  createReservationWithPayment,
  getPaymentHistory
}