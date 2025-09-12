const { Subscription, SubscriptionPlan, Payment, User, Coach, CoachingSession, Player } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get coach membership data
const getCoachMembershipData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: userId }
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
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

    // Get available subscription plans for coaches
    const availablePlans = await SubscriptionPlan.findAll({
      where: { 
        for_role: 'coach',
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
      attributes: [
        'id', 'user_id', 'amount', 'currency', 'payment_type', 'payment_method', 
        'reference_type', 'reference_id', 'stripe_payment_id', 'status', 
        'transaction_date', 'created_at', 'updated_at'
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    })

    // Calculate coaching statistics
    const coachingSessions = await CoachingSession.findAll({
      where: { coach_id: coach.id },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id']
        }
      ]
    })

    // Calculate stats
    const totalSpent = await Payment.sum('amount', {
      where: { 
        user_id: userId,
        status: 'completed',
        payment_type: 'membership'
      }
    })

    const totalEarnings = coachingSessions
      .filter(session => session.payment_status === 'paid')
      .reduce((sum, session) => sum + parseFloat(session.price || 0), 0)

    const sessionsCompleted = coachingSessions.filter(session => session.status === 'completed').length

    const uniqueStudents = new Set(coachingSessions.map(session => session.player_id)).size

    let stats = {
      total_spent: totalSpent || 0,
      membership_since: null,
      days_remaining: 0,
      status: 'inactive',
      total_earnings: totalEarnings,
      students_taught: uniqueStudents,
      sessions_completed: sessionsCompleted
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
        status: currentSubscription.status,
        total_earnings: totalEarnings,
        students_taught: uniqueStudents,
        sessions_completed: sessionsCompleted
      }
    }

    res.json({
      currentSubscription,
      availablePlans,
      paymentHistory,
      stats
    })

  } catch (error) {
    console.error('Error fetching coach membership data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Subscribe to a plan
const subscribeToCoachPlan = async (req, res) => {
  try {
    const { plan_id, payment_method, billing_cycle } = req.body
    const userId = req.user.id

    // Get the plan
    const plan = await SubscriptionPlan.findOne({
      where: { 
        id: plan_id,
        for_role: 'coach',
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
      currency: 'MXN',
      status: 'completed',
      payment_type: 'membership',
      payment_method: payment_method,
      reference_type: 'subscription',
      reference_id: null
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
      message: 'Successfully subscribed to coach plan'
    })

  } catch (error) {
    console.error('Error subscribing to coach plan:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Cancel subscription
const cancelCoachSubscription = async (req, res) => {
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

    res.json({ message: 'Coach subscription canceled successfully' })

  } catch (error) {
    console.error('Error canceling coach subscription:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Renew subscription
const renewCoachSubscription = async (req, res) => {
  try {
    const { plan_id, payment_method, billing_cycle } = req.body
    const userId = req.user.id

    // Get the plan
    const plan = await SubscriptionPlan.findOne({
      where: { 
        id: plan_id,
        for_role: 'coach',
        is_active: true
      }
    })

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' })
    }

    // Get current subscription
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
      currency: 'MXN',
      status: 'completed',
      payment_type: 'membership',
      payment_method: payment_method,
      reference_type: 'subscription'
    })

    // Create new subscription or reactivate existing
    let subscription
    if (currentSubscription && currentSubscription.plan_id === plan_id) {
      subscription = await currentSubscription.update({
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        auto_renew: true,
        payment_id: payment.id,
        updated_at: new Date()
      })
    } else {
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
      message: 'Coach subscription renewed successfully'
    })

  } catch (error) {
    console.error('Error renewing coach subscription:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update payment method
const updateCoachPaymentMethod = async (req, res) => {
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

    // Update subscription record
    await subscription.update({
      updated_at: new Date()
    })

    res.json({
      subscription,
      message: 'Coach payment method updated successfully'
    })

  } catch (error) {
    console.error('Error updating coach payment method:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getCoachMembershipData,
  subscribeToCoachPlan,
  cancelCoachSubscription,
  renewCoachSubscription,
  updateCoachPaymentMethod
}