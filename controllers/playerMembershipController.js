const { Subscription, SubscriptionPlan, Payment, User, Player } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get player membership data
const getPlayerMembershipData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get player profile
    const player = await Player.findOne({
      where: { user_id: userId }
    })
    
    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Get current active subscription
    const currentSubscription = await Subscription.findOne({
      where: { 
        user_id: userId,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'monthly_price', 'yearly_price', 'features']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Get available subscription plans for players
    const availablePlans = await SubscriptionPlan.findAll({
      where: { 
        for_role: 'player',
        is_active: true
      },
      order: [['monthly_price', 'ASC']]
    })

    // Get payment history
    const paymentHistory = await Payment.findAll({
      where: { 
        user_id: userId,
        payment_type: 'membership'
      },
      order: [['created_at', 'DESC']],
      limit: 10
    })

    // Calculate stats
    const totalSpent = await Payment.sum('amount', {
      where: { 
        user_id: userId,
        status: 'completed',
        payment_type: 'membership'
      }
    })

    let stats = {
      total_spent: totalSpent || 0,
      membership_since: null,
      days_remaining: 0,
      status: 'inactive'
    }

    if (currentSubscription) {
      const membershipSince = await Subscription.min('start_date', {
        where: { user_id: userId }
      })

      const endDate = new Date(currentSubscription.end_date)
      const currentDate = new Date()
      const timeDiff = endDate.getTime() - currentDate.getTime()
      const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)))

      stats = {
        total_spent: totalSpent || 0,
        membership_since: membershipSince,
        days_remaining: daysRemaining,
        status: currentSubscription.status
      }
    }

    res.json({
      currentSubscription,
      availablePlans,
      paymentHistory,
      stats
    })

  } catch (error) {
    console.error('Error fetching player membership data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Subscribe to a plan
const subscribeToPlan = async (req, res) => {
  try {
    const { plan_id, payment_method, billing_cycle } = req.body
    const userId = req.user.id

    // Get the plan
    const plan = await SubscriptionPlan.findOne({
      where: { 
        id: plan_id,
        for_role: 'player',
        is_active: true
      }
    })

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' })
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      where: { 
        user_id: userId,
        status: 'active'
      }
    })

    if (existingSubscription) {
      return res.status(400).json({ message: 'You already have an active subscription' })
    }

    // Calculate dates and amount
    const startDate = new Date()
    const endDate = new Date()
    let amount = 0

    if (billing_cycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
      amount = plan.yearly_price
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
      amount = plan.monthly_price
    }

    // Create payment record
    const payment = await Payment.create({
      user_id: userId,
      amount: amount,
      currency: 'USD',
      status: 'completed', // In real implementation, this would be pending until Stripe confirms
      payment_type: 'membership',
      payment_method: payment_method,
      reference_type: 'subscription',
      reference_id: null // Will be updated after subscription creation
    })

    // Create subscription
    const subscription = await Subscription.create({
      user_id: userId,
      plan_id: plan_id,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
      auto_renew: true,
      payment_id: payment.id
    })

    // Update payment reference
    await payment.update({ reference_id: subscription.id })

    // Get subscription with plan details
    const subscriptionWithPlan = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'monthly_price', 'yearly_price', 'features']
        }
      ]
    })

    res.status(201).json({
      subscription: subscriptionWithPlan,
      payment,
      message: 'Successfully subscribed to plan'
    })

  } catch (error) {
    console.error('Error subscribing to plan:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Cancel subscription
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id

    const subscription = await Subscription.findOne({
      where: { 
        user_id: userId,
        status: 'active'
      }
    })

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' })
    }

    // Update subscription status
    await subscription.update({
      status: 'canceled',
      auto_renew: false,
      updated_at: new Date()
    })

    res.json({ message: 'Subscription canceled successfully' })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Renew subscription
const renewSubscription = async (req, res) => {
  try {
    const { plan_id, payment_method, billing_cycle } = req.body
    const userId = req.user.id

    // Get the plan
    const plan = await SubscriptionPlan.findOne({
      where: { 
        id: plan_id,
        for_role: 'player',
        is_active: true
      }
    })

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' })
    }

    // Get current subscription (can be expired or canceled)
    const currentSubscription = await Subscription.findOne({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    })

    // Calculate dates and amount
    const startDate = new Date()
    const endDate = new Date()
    let amount = 0

    if (billing_cycle === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
      amount = plan.yearly_price
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
      amount = plan.monthly_price
    }

    // Create payment record
    const payment = await Payment.create({
      user_id: userId,
      amount: amount,
      currency: 'USD',
      status: 'completed',
      payment_type: 'membership',
      payment_method: payment_method,
      reference_type: 'subscription'
    })

    // Create new subscription or reactivate existing
    let subscription
    if (currentSubscription && currentSubscription.plan_id === plan_id) {
      // Reactivate existing subscription
      subscription = await currentSubscription.update({
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        auto_renew: true,
        payment_id: payment.id,
        updated_at: new Date()
      })
    } else {
      // Create new subscription
      subscription = await Subscription.create({
        user_id: userId,
        plan_id: plan_id,
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        auto_renew: true,
        payment_id: payment.id
      })
    }

    // Update payment reference
    await payment.update({ reference_id: subscription.id })

    // Get subscription with plan details
    const subscriptionWithPlan = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'monthly_price', 'yearly_price', 'features']
        }
      ]
    })

    res.json({
      subscription: subscriptionWithPlan,
      payment,
      message: 'Subscription renewed successfully'
    })

  } catch (error) {
    console.error('Error renewing subscription:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update payment method
const updatePaymentMethod = async (req, res) => {
  try {
    const { payment_method, stripe_payment_method_id } = req.body
    const userId = req.user.id

    const subscription = await Subscription.findOne({
      where: { 
        user_id: userId,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'monthly_price', 'yearly_price', 'features']
        }
      ]
    })

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' })
    }

    // In a real implementation, you would update the payment method in Stripe
    // For now, we'll just update the subscription record
    await subscription.update({
      updated_at: new Date()
    })

    res.json({
      subscription,
      message: 'Payment method updated successfully'
    })

  } catch (error) {
    console.error('Error updating payment method:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getPlayerMembershipData,
  subscribeToPlan,
  cancelSubscription,
  renewSubscription,
  updatePaymentMethod
}