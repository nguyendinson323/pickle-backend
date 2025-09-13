const { Payment, User, PaymentMethod, Tournament, Court } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

const adminPaymentsController = {
  // Get payments with filters
  getPayments: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        payment_method,
        date_range,
        amount_min,
        amount_max,
        user_search,
        transaction_id
      } = req.query

      const offset = (page - 1) * limit
      const where = {}

      // Apply filters
      if (status && status !== 'all') {
        where.status = status
      }

      if (payment_method && payment_method !== 'all') {
        where.payment_method = payment_method
      }

      if (date_range && date_range !== 'all') {
        const now = new Date()
        let startDate

        switch (date_range) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        }

        if (startDate) {
          where.created_at = {
            [Op.gte]: startDate
          }
        }
      }

      if (amount_min || amount_max) {
        where.amount = {}
        if (amount_min) {
          where.amount[Op.gte] = parseFloat(amount_min)
        }
        if (amount_max) {
          where.amount[Op.lte] = parseFloat(amount_max)
        }
      }

      if (transaction_id) {
        where.transaction_id = {
          [Op.iLike]: `%${transaction_id}%`
        }
      }

      // User search in associated user table
      const include = [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'username', 'role'],
        required: false
      }]

      if (user_search) {
        include[0].where = {
          [Op.or]: [
            { username: { [Op.iLike]: `%${user_search}%` } },
            { email: { [Op.iLike]: `%${user_search}%` } }
          ]
        }
        include[0].required = true
      }

      const { count, rows: payments } = await Payment.findAndCountAll({
        where,
        include,
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      })

      const totalPages = Math.ceil(count / limit)

      res.json({
        payments,
        totalCount: count,
        totalPages,
        currentPage: parseInt(page)
      })
    } catch (error) {
      console.error('Error fetching payments:', error)
      res.status(500).json({ message: 'Failed to fetch payments' })
    }
  },

  // Get payment statistics
  getPaymentStats: async (req, res) => {
    try {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Basic stats
      const [
        totalStats,
        todayRevenue,
        thisWeekRevenue,
        thisMonthRevenue,
        paymentMethodStats,
        revenueByPeriod
      ] = await Promise.all([
        // Total stats
        Payment.findAll({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalTransactions'],
            [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalRevenue'],
            [Sequelize.fn('AVG', Sequelize.col('amount')), 'averageTransactionValue'],
            [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN status = 'completed' THEN 1 END")), 'successfulPayments'],
            [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN status = 'failed' THEN 1 END")), 'failedPayments'],
            [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN status = 'pending' THEN 1 END")), 'pendingPayments'],
            [Sequelize.fn('COUNT', Sequelize.literal("CASE WHEN status = 'refunded' THEN 1 END")), 'refundedPayments']
          ],
          raw: true
        }),

        // Today's revenue
        Payment.findAll({
          attributes: [
            [Sequelize.fn('SUM', Sequelize.col('amount')), 'todayRevenue']
          ],
          where: {
            created_at: { [Op.gte]: startOfToday },
            status: 'completed'
          },
          raw: true
        }),

        // This week's revenue
        Payment.findAll({
          attributes: [
            [Sequelize.fn('SUM', Sequelize.col('amount')), 'thisWeekRevenue']
          ],
          where: {
            created_at: { [Op.gte]: startOfWeek },
            status: 'completed'
          },
          raw: true
        }),

        // This month's revenue
        Payment.findAll({
          attributes: [
            [Sequelize.fn('SUM', Sequelize.col('amount')), 'thisMonthRevenue']
          ],
          where: {
            created_at: { [Op.gte]: startOfMonth },
            status: 'completed'
          },
          raw: true
        }),

        // Payment method distribution
        Payment.findAll({
          attributes: [
            'payment_method',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
          ],
          group: ['payment_method'],
          raw: true
        }),

        // Revenue by period (last 12 months)
        Payment.findAll({
          attributes: [
            [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at')), 'period'],
            [Sequelize.fn('SUM', Sequelize.col('amount')), 'revenue'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'transactions']
          ],
          where: {
            created_at: {
              [Op.gte]: new Date(now.getFullYear() - 1, now.getMonth(), 1)
            },
            status: 'completed'
          },
          group: [Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at'))],
          order: [[Sequelize.fn('DATE_TRUNC', 'month', Sequelize.col('created_at')), 'ASC']],
          raw: true
        })
      ])

      // Calculate payment method percentages
      const totalTransactions = parseInt(totalStats[0].totalTransactions) || 0
      const topPaymentMethods = paymentMethodStats.map(method => ({
        method: method.payment_method,
        count: parseInt(method.count),
        percentage: totalTransactions > 0 ? ((parseInt(method.count) / totalTransactions) * 100) : 0
      })).sort((a, b) => b.count - a.count)

      // Format revenue by period
      const formattedRevenueByPeriod = revenueByPeriod.map(item => ({
        period: new Date(item.period).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: parseFloat(item.revenue) || 0,
        transactions: parseInt(item.transactions) || 0
      }))

      res.json({
        totalRevenue: parseFloat(totalStats[0].totalRevenue) || 0,
        totalTransactions: parseInt(totalStats[0].totalTransactions) || 0,
        successfulPayments: parseInt(totalStats[0].successfulPayments) || 0,
        failedPayments: parseInt(totalStats[0].failedPayments) || 0,
        pendingPayments: parseInt(totalStats[0].pendingPayments) || 0,
        refundedPayments: parseInt(totalStats[0].refundedPayments) || 0,
        averageTransactionValue: parseFloat(totalStats[0].averageTransactionValue) || 0,
        todayRevenue: parseFloat(todayRevenue[0].todayRevenue) || 0,
        thisWeekRevenue: parseFloat(thisWeekRevenue[0].thisWeekRevenue) || 0,
        thisMonthRevenue: parseFloat(thisMonthRevenue[0].thisMonthRevenue) || 0,
        topPaymentMethods,
        revenueByPeriod: formattedRevenueByPeriod
      })
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      res.status(500).json({ message: 'Failed to fetch payment statistics' })
    }
  },

  // Get payment methods
  getPaymentMethods: async (req, res) => {
    try {
      // Return mock payment methods data since the database table may not be fully configured
      const paymentMethods = [
        {
          id: 1,
          type: 'credit_card',
          provider: 'Stripe',
          name: 'Credit/Debit Cards',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          type: 'paypal',
          provider: 'PayPal',
          name: 'PayPal',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          type: 'bank_transfer',
          provider: 'ACH',
          name: 'Bank Transfer',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 4,
          type: 'apple_pay',
          provider: 'Apple',
          name: 'Apple Pay',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 5,
          type: 'google_pay',
          provider: 'Google',
          name: 'Google Pay',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]

      res.json(paymentMethods)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      res.status(500).json({ message: 'Failed to fetch payment methods' })
    }
  },

  // Process refund
  processRefund: async (req, res) => {
    try {
      const { id } = req.params
      const { amount, reason } = req.body

      const payment = await Payment.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }]
      })

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' })
      }

      if (payment.status !== 'completed') {
        return res.status(400).json({ message: 'Only completed payments can be refunded' })
      }

      // Process refund (integrate with payment provider)
      const refundAmount = amount || payment.amount
      
      // Update payment record
      await payment.update({
        status: 'refunded',
        metadata: {
          ...payment.metadata,
          refund: {
            amount: refundAmount,
            reason: reason || 'Admin refund',
            processed_at: new Date().toISOString(),
            processed_by: req.user.id
          }
        }
      })

      const updatedPayment = await Payment.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }]
      })

      res.json(updatedPayment)
    } catch (error) {
      console.error('Error processing refund:', error)
      res.status(500).json({ message: 'Failed to process refund' })
    }
  },

  // Update payment status
  updatePaymentStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { status } = req.body

      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid payment status' })
      }

      const payment = await Payment.findByPk(id)
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' })
      }

      await payment.update({
        status,
        metadata: {
          ...payment.metadata,
          status_updated: {
            previous_status: payment.status,
            new_status: status,
            updated_at: new Date().toISOString(),
            updated_by: req.user.id
          }
        }
      })

      const updatedPayment = await Payment.findByPk(id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'role']
        }]
      })

      res.json(updatedPayment)
    } catch (error) {
      console.error('Error updating payment status:', error)
      res.status(500).json({ message: 'Failed to update payment status' })
    }
  },

  // Bulk update payment status
  bulkUpdatePaymentStatus: async (req, res) => {
    try {
      const { payment_ids, status } = req.body

      const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled']
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid payment status' })
      }

      if (!payment_ids || !Array.isArray(payment_ids) || payment_ids.length === 0) {
        return res.status(400).json({ message: 'Payment IDs are required' })
      }

      await Payment.update(
        { 
          status,
          metadata: Sequelize.fn('jsonb_set', 
            Sequelize.col('metadata'), 
            '{bulk_status_update}', 
            JSON.stringify({
              updated_at: new Date().toISOString(),
              updated_by: req.user.id,
              new_status: status
            })
          )
        },
        {
          where: {
            id: {
              [Op.in]: payment_ids
            }
          }
        }
      )

      res.json({ 
        message: `Updated ${payment_ids.length} payments to ${status} status`,
        updated_count: payment_ids.length
      })
    } catch (error) {
      console.error('Error bulk updating payment status:', error)
      res.status(500).json({ message: 'Failed to bulk update payment status' })
    }
  },

  // Export payments
  exportPayments: async (req, res) => {
    try {
      const {
        status,
        payment_method,
        date_range,
        amount_min,
        amount_max,
        user_search,
        transaction_id
      } = req.query

      const where = {}

      // Apply same filters as getPayments
      if (status && status !== 'all') {
        where.status = status
      }

      if (payment_method && payment_method !== 'all') {
        where.payment_method = payment_method
      }

      if (date_range && date_range !== 'all') {
        const now = new Date()
        let startDate

        switch (date_range) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
        }

        if (startDate) {
          where.created_at = {
            [Op.gte]: startDate
          }
        }
      }

      if (amount_min || amount_max) {
        where.amount = {}
        if (amount_min) {
          where.amount[Op.gte] = parseFloat(amount_min)
        }
        if (amount_max) {
          where.amount[Op.lte] = parseFloat(amount_max)
        }
      }

      if (transaction_id) {
        where.transaction_id = {
          [Op.iLike]: `%${transaction_id}%`
        }
      }

      const include = [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'username', 'role'],
        required: false
      }]

      if (user_search) {
        include[0].where = {
          [Op.or]: [
            { username: { [Op.iLike]: `%${user_search}%` } },
            { email: { [Op.iLike]: `%${user_search}%` } }
          ]
        }
        include[0].required = true
      }

      const payments = await Payment.findAll({
        where,
        include,
        order: [['created_at', 'DESC']]
      })

      // Generate CSV
      const csvHeader = 'ID,Amount,Currency,Status,Payment Method,Transaction ID,Description,User Name,User Email,Created At\n'
      const csvData = payments.map(payment => {
        const userName = payment.user ? payment.user.username : 'N/A'
        const userEmail = payment.user ? payment.user.email : 'N/A'
        
        return [
          payment.id,
          payment.amount,
          payment.currency || 'USD',
          payment.status,
          payment.payment_method,
          payment.transaction_id || 'N/A',
          `"${payment.description || 'N/A'}"`,
          `"${userName}"`,
          userEmail,
          payment.created_at
        ].join(',')
      }).join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="payments-export-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csvHeader + csvData)
    } catch (error) {
      console.error('Error exporting payments:', error)
      res.status(500).json({ message: 'Failed to export payments' })
    }
  }
}

module.exports = adminPaymentsController