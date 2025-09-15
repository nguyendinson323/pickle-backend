const { Subscription, SubscriptionPlan, Payment, User, Partner } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get available subscription plans for partners (public endpoint)
const getAvailablePartnerPlans = async (req, res) => {
  try {
    const availablePlans = await SubscriptionPlan.findAll({
      where: {
        for_role: 'partner',
        is_active: true
      },
      attributes: ['id', 'name', 'description', 'monthly_price', 'yearly_price', 'features'],
      order: [['monthly_price', 'ASC']]
    })

    res.json({ plans: availablePlans })
  } catch (error) {
    console.error('Error fetching available partner plans:', error)
    res.status(500).json({ message: 'Failed to fetch available plans' })
  }
}

// Get partner membership data
const getPartnerMembershipData = async (req, res) => {
  try {
    const userId = req.user.id

    // Get partner profile
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
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

    // Get available subscription plans for partners
    const availablePlans = await SubscriptionPlan.findAll({
      where: {
        for_role: 'partner',
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

    // Calculate partnership stats (mock data for now based on partner activities)
    const stats = {
      profileViews: Math.floor(Math.random() * 2000) + 500,
      leadsGenerated: Math.floor(Math.random() * 100) + 20,
      tournamentsSponsored: Math.floor(Math.random() * 15) + 1,
      averageRating: (Math.random() * 1 + 4).toFixed(1) // 4.0 - 5.0 rating
    }

    // Calculate metrics based on subscription and partner activity
    const partnershipMetrics = {
      profileViews: stats.profileViews,
      leadsGenerated: stats.leadsGenerated,
      tournamentsSponsored: stats.tournamentsSponsored,
      averageRating: parseFloat(stats.averageRating),
      partnerSince: partner.created_at,
      currentPlan: currentSubscription?.plan?.name || 'No active plan',
      planStatus: currentSubscription?.status || 'inactive'
    }

    res.json({
      currentSubscription,
      availablePlans,
      paymentHistory,
      stats: partnershipMetrics,
      partnerInfo: {
        id: partner.id,
        business_name: partner.business_name,
        partner_type: partner.partner_type,
        has_courts: partner.has_courts,
        premium_expires_at: partner.premium_expires_at
      }
    })
  } catch (error) {
    console.error('Error fetching partner membership data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Subscribe to a plan
const subscribeToPartnerPlan = async (req, res) => {
  try {
    const userId = req.user.id
    const { planId, paymentData } = req.body

    // Get partner profile
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Get the subscription plan
    const plan = await SubscriptionPlan.findOne({
      where: {
        id: planId,
        for_role: 'partner',
        is_active: true
      }
    })

    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' })
    }

    // Cancel any existing active subscription
    await Subscription.update(
      { status: 'canceled' },
      {
        where: {
          user_id: userId,
          status: 'active'
        }
      }
    )

    // Calculate subscription period
    const startDate = new Date()
    const endDate = new Date()
    const isYearly = paymentData.billing_cycle === 'yearly'

    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Create payment record
    const paymentAmount = isYearly ? plan.yearly_price : plan.monthly_price
    const payment = await Payment.create({
      user_id: userId,
      amount: paymentAmount,
      payment_type: 'membership',
      status: 'completed',
      stripe_payment_id: `pi_test_${Date.now()}`, // Mock Stripe payment ID for development
      metadata: JSON.stringify({
        plan_id: planId,
        billing_cycle: paymentData.billing_cycle,
        partner_id: partner.id
      })
    })

    // Create new subscription
    const subscription = await Subscription.create({
      user_id: userId,
      plan_id: planId,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
      auto_renew: true,
      stripe_subscription_id: `sub_test_${Date.now()}`, // Mock Stripe subscription ID
      payment_id: payment.id
    })

    // Update partner premium expiration
    await Partner.update(
      { premium_expires_at: endDate },
      { where: { id: partner.id } }
    )

    // Get the created subscription with plan details
    const newSubscription = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan',
          attributes: ['id', 'name', 'description', 'monthly_price', 'yearly_price', 'features']
        }
      ]
    })

    res.json({
      message: 'Successfully subscribed to partner plan',
      subscription: newSubscription,
      payment
    })
  } catch (error) {
    console.error('Error subscribing to partner plan:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Cancel subscription
const cancelPartnerSubscription = async (req, res) => {
  try {
    const userId = req.user.id

    // Find active subscription
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
    await Subscription.update(
      {
        status: 'canceled',
        auto_renew: false
      },
      { where: { id: subscription.id } }
    )

    res.json({ message: 'Subscription canceled successfully' })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Renew subscription
const renewPartnerSubscription = async (req, res) => {
  try {
    const userId = req.user.id
    const { paymentData } = req.body

    // Find current subscription (can be expired or canceled)
    const currentSubscription = await Subscription.findOne({
      where: { user_id: userId },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan'
        }
      ],
      order: [['created_at', 'DESC']]
    })

    if (!currentSubscription) {
      return res.status(404).json({ message: 'No subscription found to renew' })
    }

    const plan = currentSubscription.plan

    // Calculate new subscription period
    const startDate = new Date()
    const endDate = new Date()
    const isYearly = paymentData.billing_cycle === 'yearly'

    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Create payment record
    const paymentAmount = isYearly ? plan.yearly_price : plan.monthly_price
    const payment = await Payment.create({
      user_id: userId,
      amount: paymentAmount,
      payment_type: 'membership',
      status: 'completed',
      stripe_payment_id: `pi_test_${Date.now()}`,
      metadata: JSON.stringify({
        plan_id: plan.id,
        billing_cycle: paymentData.billing_cycle,
        renewal: true
      })
    })

    // Update subscription
    await Subscription.update(
      {
        start_date: startDate,
        end_date: endDate,
        status: 'active',
        auto_renew: true,
        payment_id: payment.id
      },
      { where: { id: currentSubscription.id } }
    )

    res.json({
      message: 'Subscription renewed successfully',
      payment
    })
  } catch (error) {
    console.error('Error renewing subscription:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update payment method
const updatePartnerPaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id
    const { paymentMethodData } = req.body

    // Find active subscription
    const subscription = await Subscription.findOne({
      where: {
        user_id: userId,
        status: 'active'
      }
    })

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' })
    }

    // In a real implementation, this would update the payment method with Stripe
    // For development, we just simulate the update

    res.json({
      message: 'Payment method updated successfully',
      paymentMethod: {
        type: paymentMethodData.type || 'card',
        last4: paymentMethodData.last4 || '****',
        brand: paymentMethodData.brand || 'visa'
      }
    })
  } catch (error) {
    console.error('Error updating payment method:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Change subscription plan
const changePartnerPlan = async (req, res) => {
  try {
    const userId = req.user.id
    const { newPlanId, paymentData } = req.body

    // Find current active subscription
    const currentSubscription = await Subscription.findOne({
      where: {
        user_id: userId,
        status: 'active'
      },
      include: [
        {
          model: SubscriptionPlan,
          as: 'plan'
        }
      ]
    })

    if (!currentSubscription) {
      return res.status(404).json({ message: 'No active subscription found' })
    }

    // Get new plan
    const newPlan = await SubscriptionPlan.findOne({
      where: {
        id: newPlanId,
        for_role: 'partner',
        is_active: true
      }
    })

    if (!newPlan) {
      return res.status(404).json({ message: 'New subscription plan not found' })
    }

    // Calculate proration and new subscription period
    const startDate = new Date()
    const endDate = new Date()
    const isYearly = paymentData.billing_cycle === 'yearly'

    if (isYearly) {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Create payment record (in real implementation, calculate proration)
    const paymentAmount = isYearly ? newPlan.yearly_price : newPlan.monthly_price
    const payment = await Payment.create({
      user_id: userId,
      amount: paymentAmount,
      payment_type: 'membership',
      status: 'completed',
      stripe_payment_id: `pi_test_${Date.now()}`,
      metadata: JSON.stringify({
        old_plan_id: currentSubscription.plan_id,
        new_plan_id: newPlanId,
        billing_cycle: paymentData.billing_cycle,
        plan_change: true
      })
    })

    // Update subscription
    await Subscription.update(
      {
        plan_id: newPlanId,
        start_date: startDate,
        end_date: endDate,
        payment_id: payment.id
      },
      { where: { id: currentSubscription.id } }
    )

    res.json({
      message: 'Plan changed successfully',
      payment
    })
  } catch (error) {
    console.error('Error changing plan:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Download payment receipt
const downloadPartnerPaymentReceipt = async (req, res) => {
  try {
    const userId = req.user.id
    const { paymentId } = req.params

    // Find the payment and verify it belongs to the user
    const payment = await Payment.findOne({
      where: {
        id: paymentId,
        user_id: userId
      }
    })

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' })
    }

    // Get partner info for the receipt
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    // Create receipt data
    const receiptData = {
      paymentId: payment.id,
      date: payment.transaction_date || payment.created_at,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentType: payment.payment_type,
      paymentMethod: payment.payment_method,
      partnerName: partner?.business_name || 'N/A',
      stripePaymentId: payment.stripe_payment_id
    }

    res.json({
      message: 'Receipt data retrieved successfully',
      receipt: receiptData
    })
  } catch (error) {
    console.error('Error downloading receipt:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getAvailablePartnerPlans,
  getPartnerMembershipData,
  subscribeToPartnerPlan,
  cancelPartnerSubscription,
  renewPartnerSubscription,
  updatePartnerPaymentMethod,
  changePartnerPlan,
  downloadPartnerPaymentReceipt
}