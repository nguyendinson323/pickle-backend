const {
  StateCommittee, User, State, Player, Club, Partner, Court, Tournament,
  TournamentRegistration, CourtReservation, Message, Coach
} = require('../db/models')
const { Op, fn, col, literal } = require('sequelize')

const getStateDashboard = async (req, res) => {
  try {
    console.log('🏛️ State Dashboard Request:', {
      userId: req.user?.id,
      userRole: req.userRole,
      user: req.user ? { id: req.user.id, username: req.user.username, role: req.user.role } : null
    })
    
    // Get the state committee from the authenticated user
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: StateCommittee,
        as: 'stateCommittee'
      }]
    })
    
    console.log('🔍 User found:', user ? { id: user.id, role: user.role, hasStateCommittee: !!user.stateCommittee } : null)

    if (!user || !user.stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    const stateCommittee = user.stateCommittee
    const stateId = stateCommittee.state_id

    // Get profile with state information
    const profile = await StateCommittee.findByPk(stateCommittee.id, {
      include: [{
        model: State,
        as: 'state',
        attributes: ['id', 'name', 'short_code']
      }]
    })

    // Get comprehensive statistics
    const [
      totalPlayers,
      totalClubs,
      totalPartners,
      totalCoaches,
      totalCourts,
      activePlayers,
      verifiedPlayers
    ] = await Promise.all([
      Player.count({ where: { state_id: stateId } }),
      Club.count({ where: { state_id: stateId } }),
      Partner.count({ where: { state_id: stateId } }),
      Coach.count({ where: { state_id: stateId } }),
      Court.count({ where: { state_id: stateId } }),
      Player.count({
        include: [{
          model: User,
          as: 'user',
          where: { is_active: true }
        }],
        where: { state_id: stateId }
      }),
      Player.count({
        include: [{
          model: User,
          as: 'user',
          where: { is_verified: true }
        }],
        where: { state_id: stateId }
      })
    ])

    // Get tournaments data
    const currentYear = new Date().getFullYear()
    const tournamentsThisYear = await Tournament.count({
      where: {
        state_id: stateId,
        start_date: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lt]: new Date(currentYear + 1, 0, 1)
        }
      }
    })

    const activeTournaments = await Tournament.count({
      where: {
        state_id: stateId,
        status: 'ongoing'
      }
    })

    const upcomingTournaments = await Tournament.findAll({
      where: {
        state_id: stateId,
        start_date: { [Op.gte]: new Date() },
        status: 'upcoming'
      },
      order: [['start_date', 'ASC']],
      limit: 5
    })

    // Calculate growth metrics (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const [
      newPlayersLast30,
      newPlayersLast60,
      newClubsLast30,
      newClubsLast60
    ] = await Promise.all([
      Player.count({
        where: {
          state_id: stateId,
          created_at: { [Op.gte]: thirtyDaysAgo }
        }
      }),
      Player.count({
        where: {
          state_id: stateId,
          created_at: {
            [Op.gte]: sixtyDaysAgo,
            [Op.lt]: thirtyDaysAgo
          }
        }
      }),
      Club.count({
        where: {
          state_id: stateId,
          created_at: { [Op.gte]: thirtyDaysAgo }
        }
      }),
      Club.count({
        where: {
          state_id: stateId,
          created_at: {
            [Op.gte]: sixtyDaysAgo,
            [Op.lt]: thirtyDaysAgo
          }
        }
      })
    ])

    // Calculate growth percentages
    const playerGrowth = newPlayersLast60 > 0 
      ? ((newPlayersLast30 - newPlayersLast60) / newPlayersLast60) * 100
      : newPlayersLast30 > 0 ? 100 : 0

    const clubGrowth = newClubsLast60 > 0
      ? ((newClubsLast30 - newClubsLast60) / newClubsLast60) * 100
      : newClubsLast30 > 0 ? 100 : 0

    // Get tournament participation data
    const tournamentParticipation = await TournamentRegistration.count({
      include: [{
        model: Tournament,
        as: 'tournament',
        where: { state_id: stateId }
      }],
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo }
      }
    })

    // Get pending approvals (simplified - could be expanded based on business logic)
    const pendingApprovals = await Club.findAll({
      where: {
        state_id: stateId,
        created_at: { [Op.gte]: thirtyDaysAgo }
      },
      include: [{
        model: User,
        as: 'user',
        where: { is_verified: false }
      }],
      limit: 10
    })

    const formattedPendingApprovals = pendingApprovals.map(club => ({
      type: 'Club Registration',
      name: club.name,
      location: 'State Committee',
      submittedDate: club.created_at
    }))

    // Get recent activity
    const recentActivity = []

    // Recent player registrations
    const recentPlayers = await Player.findAll({
      where: { state_id: stateId },
      order: [['created_at', 'DESC']],
      limit: 3,
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }]
    })

    recentPlayers.forEach(player => {
      recentActivity.push({
        icon: '👤',
        message: `New player ${player.full_name} registered`,
        time: player.created_at
      })
    })

    // Recent tournaments
    const recentTournaments = await Tournament.findAll({
      where: { 
        state_id: stateId,
        created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 2
    })

    recentTournaments.forEach(tournament => {
      recentActivity.push({
        icon: '🏆',
        message: `Tournament "${tournament.name}" was created`,
        time: tournament.created_at
      })
    })

    // Sort recent activity by time
    recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time))

    // Calculate national ranking (simplified - rank by total players)
    const allStatesPlayerCount = await StateCommittee.findAll({
      attributes: [
        'id',
        'state_id',
        [literal('(SELECT COUNT(*) FROM players WHERE players.state_id = "StateCommittee"."state_id")'), 'player_count']
      ],
      order: [[literal('(SELECT COUNT(*) FROM players WHERE players.state_id = "StateCommittee"."state_id")'), 'DESC']]
    })

    const nationalRanking = allStatesPlayerCount.findIndex(state => 
      state.state_id === stateId) + 1

    const stats = {
      totalPlayers,
      totalClubs,
      totalPartners,
      totalCoaches,
      totalCourts,
      activePlayers,
      verifiedPlayers,
      tournamentsThisYear,
      activeTournaments,
      playerGrowth: Math.round(playerGrowth),
      clubGrowth: Math.round(clubGrowth),
      newClubs: newClubsLast30,
      tournamentParticipation,
      nationalRanking: nationalRanking || 1
    }

    res.json({
      profile,
      upcomingTournaments,
      affiliationStatus: profile.affiliation_expires_at,
      pendingApprovals: formattedPendingApprovals,
      recentActivity: recentActivity.slice(0, 10),
      stats
    })

  } catch (error) {
    console.error('Error fetching state dashboard:', error)
    res.status(500).json({ message: 'Failed to fetch state dashboard data' })
  }
}

// Get detailed state performance metrics
const getStatePerformanceMetrics = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: StateCommittee,
        as: 'stateCommittee'
      }]
    })

    if (!user || !user.stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    const stateId = user.stateCommittee.state_id

    // Get monthly registration trends (last 12 months)
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const [players, clubs, tournaments] = await Promise.all([
        Player.count({
          where: {
            state_id: stateId,
            created_at: {
              [Op.gte]: startOfMonth,
              [Op.lte]: endOfMonth
            }
          }
        }),
        Club.count({
          where: {
            state_id: stateId,
            created_at: {
              [Op.gte]: startOfMonth,
              [Op.lte]: endOfMonth
            }
          }
        }),
        Tournament.count({
          where: {
            state_id: stateId,
            created_at: {
              [Op.gte]: startOfMonth,
              [Op.lte]: endOfMonth
            }
          }
        })
      ])

      monthlyData.push({
        month: date.toISOString().substring(0, 7),
        players,
        clubs,
        tournaments
      })
    }

    // Get court utilization
    const courtUtilization = await CourtReservation.count({
      include: [{
        model: Court,
        as: 'court',
        where: { state_id: stateId }
      }],
      where: {
        status: 'confirmed',
        date: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    res.json({
      monthlyData,
      courtUtilization,
      period: 'last_12_months'
    })

  } catch (error) {
    console.error('Error fetching state performance metrics:', error)
    res.status(500).json({ message: 'Failed to fetch performance metrics' })
  }
}

module.exports = {
  getStateDashboard,
  getStatePerformanceMetrics
}