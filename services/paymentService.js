const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_KEY || process.env.STRIPE_SECRET_KEY)
const { Payment } = require('../db/models')

const createPaymentIntent = async (data) => {
  const { amount, currency = 'usd', metadata } = data

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects cents
      currency,
      metadata: {
        ...metadata,
        court_id: metadata?.court_id?.toString(),
        player_id: metadata?.player_id?.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    }
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error)
    throw new Error('Failed to create payment intent')
  }
}

const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Failed to retrieve payment intent:', error)
    throw new Error('Failed to confirm payment')
  }
}

const recordPayment = async (paymentData) => {
  const payment = await Payment.create({
    user_id: paymentData.user_id,
    amount: paymentData.amount,
    currency: paymentData.currency || 'usd',
    payment_type: paymentData.payment_type || 'court_reservation',
    payment_method: paymentData.payment_method || 'credit_card',
    reference_type: paymentData.reference_type,
    reference_id: paymentData.reference_id,
    stripe_payment_id: paymentData.stripe_payment_id,
    status: paymentData.status || 'completed',
    transaction_date: new Date()
  })

  return payment
}

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  recordPayment
}