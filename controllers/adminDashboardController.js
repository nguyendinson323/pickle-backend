const { 
  User,
  Player,
  Coach,
  Club,
  Partner,
  StateCommittee,
  Payment,
  Tournament,
  Court,
  Message,
  TournamentRegistration,
  CourtReservation,
  Microsite
} = require('../db/models')
const { Op, Sequelize } = require('sequelize')

const adminDashboardController = {
  // GET /api/admin/dashboard - Get admin dashboard data
  async getDashboardData(req, res) {
    try {
      // Get basic user stats
      const [
        totalUsersCount,
        activeUsersCount,
        totalPayments,
        totalTournaments,
        activeTournaments,
        totalCourts,
        activeCourts,
        totalMessages,
        unreadMessages
      ] = await Promise.all([
        User.count(),
        User.count({ where: { is_active: true } }),
        Payment.findAll({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
            [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
          ],
          where: { status: 'completed' },
          raw: true
        }),
        Tournament.count(),
        Tournament.count({ where: { status: { [Op.in]: ['upcoming', 'ongoing'] } } }),
        Court.count(),
        Court.count({ where: { status: 'active' } }),
        Message.count(),
        Message.count({
          include: [{
            model: require('../db/models/MessageRecipient'),
            as: 'recipients',
            where: { is_read: false }
          }]
        })
      ])

      // Calculate monthly revenue
      const currentMonth = new Date()
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const monthlyPayments = await Payment.findAll({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'total']
        ],
        where: {
          status: 'completed',
          transaction_date: { [Op.gte]: startOfMonth }
        },
        raw: true
      })

      // Get pending approvals
      const pendingApprovals = []
      
      // Pending users (unverified)
      const unverifiedUsers = await User.findAll({
        where: { is_verified: false },
        include: [
          { model: Player, as: 'player', required: false },
          { model: Coach, as: 'coach', required: false },
          { model: Club, as: 'club', required: false },
          { model: Partner, as: 'partner', required: false },
          { model: StateCommittee, as: 'stateCommittee', required: false }
        ],
        limit: 5,
        order: [['created_at', 'DESC']]
      })

      unverifiedUsers.forEach(user => {
        const profile = user.player || user.coach || user.club || user.partner || user.stateCommittee
        pendingApprovals.push({
          id: user.id,
          type: 'user',
          title: `User Verification - ${user.role}`,
          description: `${profile?.full_name || profile?.name || user.username} waiting for verification`,
          submittedBy: user.username,
          submittedAt: user.created_at,
          status: 'pending'
        })
      })

      // Pending courts
      const pendingCourts = await Court.findAll({
        where: { status: 'pending' },
        limit: 5,
        order: [['created_at', 'DESC']]
      })

      pendingCourts.forEach(court => {
        pendingApprovals.push({
          id: court.id,
          type: 'court',
          title: 'Court Approval',
          description: `${court.name} pending approval`,
          submittedBy: 'Court Owner',
          submittedAt: court.created_at,
          status: 'pending'
        })
      })

      // Get recent activity
      const recentActivity = []

      // Recent user registrations
      const recentUsers = await User.findAll({
        include: [
          { model: Player, as: 'player', required: false },
          { model: Coach, as: 'coach', required: false },
          { model: Club, as: 'club', required: false },
          { model: Partner, as: 'partner', required: false },
          { model: StateCommittee, as: 'stateCommittee', required: false }
        ],
        limit: 5,
        order: [['created_at', 'DESC']]
      })

      recentUsers.forEach(user => {
        const profile = user.player || user.coach || user.club || user.partner || user.stateCommittee
        recentActivity.push({
          id: user.id,
          type: 'user_registration',
          title: 'New User Registration',
          description: `${user.role} account created`,
          user: {
            id: user.id,
            name: profile?.full_name || profile?.name || user.username,
            role: user.role
          },
          timestamp: user.created_at
        })
      })

      // Recent payments
      const recentPayments = await Payment.findAll({
        include: [{
          model: User,
          as: 'user',
          include: [
            { model: Player, as: 'player', required: false },
            { model: Coach, as: 'coach', required: false },
            { model: Club, as: 'club', required: false },
            { model: Partner, as: 'partner', required: false },
            { model: StateCommittee, as: 'stateCommittee', required: false }
          ]
        }],
        limit: 3,
        order: [['created_at', 'DESC']]
      })

      recentPayments.forEach(payment => {
        const profile = payment.user.player || payment.user.coach || payment.user.club || payment.user.partner || payment.user.stateCommittee
        recentActivity.push({
          id: payment.id,
          type: 'payment',
          title: 'Payment Received',
          description: `$${payment.amount} - ${payment.payment_type}`,
          user: {
            id: payment.user.id,
            name: profile?.full_name || profile?.name || payment.user.username,
            role: payment.user.role
          },
          timestamp: payment.created_at
        })
      })

      // Sort recent activity by timestamp
      recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

      const dashboardData = {
        stats: {
          totalUsers: totalUsersCount,
          activeUsers: activeUsersCount,
          totalPayments: totalPayments[0]?.count || 0,
          monthlyRevenue: monthlyPayments[0]?.total || 0,
          totalTournaments,
          activeTournaments,
          totalCourts,
          activeCourts,
          totalMessages,
          unreadMessages
        },
        systemStatus: {
          database: 'online',
          email: 'online',
          storage: 'online',
          payments: 'online'
        },
        pendingApprovals: pendingApprovals.slice(0, 10),
        recentActivity: recentActivity.slice(0, 10)
      }

      res.json(dashboardData)
    } catch (error) {
      console.error('Admin dashboard error:', error)
      res.status(500).json({ error: 'Failed to fetch dashboard data' })
    }
  },

  // PUT /api/admin/approvals/:id - Update approval status
  async updateApproval(req, res) {
    try {
      const { id } = req.params
      const { status, reason } = req.body

      // This is a simplified implementation
      // In reality, you'd need to determine the type and update accordingly
      await User.update(
        { is_verified: status === 'approved' },
        { where: { id } }
      )

      res.json({ message: 'Approval updated successfully' })
    } catch (error) {
      console.error('Update approval error:', error)
      res.status(500).json({ error: 'Failed to update approval' })
    }
  }
}

module.exports = adminDashboardController