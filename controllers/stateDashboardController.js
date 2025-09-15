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
        status: ['upcoming', 'ongoing']
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

    // Get pending approvals - comprehensive approval system
    const formattedPendingApprovals = []

    // Pending club verifications
    const pendingClubs = await Club.findAll({
      where: { state_id: stateId },
      include: [{
        model: User,
        as: 'user',
        where: { is_verified: false }
      }],
      limit: 5
    })

    pendingClubs.forEach(club => {
      const timeDiff = Date.now() - new Date(club.created_at).getTime()
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const timeText = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`

      formattedPendingApprovals.push({
        userId: club.user_id,
        type: 'Club Registration',
        name: club.name,
        location: club.user?.username || 'Unknown',
        submittedDate: timeText
      })
    })

    // Pending player verifications
    const pendingPlayers = await Player.findAll({
      where: { state_id: stateId },
      include: [{
        model: User,
        as: 'user',
        where: { is_verified: false }
      }],
      limit: 5
    })

    pendingPlayers.forEach(player => {
      const timeDiff = Date.now() - new Date(player.created_at).getTime()
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const timeText = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`

      formattedPendingApprovals.push({
        userId: player.user_id,
        type: 'Player Verification',
        name: player.full_name,
        location: player.user?.username || 'Unknown',
        submittedDate: timeText
      })
    })

    // Pending coach verifications
    const pendingCoaches = await Coach.findAll({
      where: { state_id: stateId },
      include: [{
        model: User,
        as: 'user',
        where: { is_verified: false }
      }],
      limit: 3
    })

    pendingCoaches.forEach(coach => {
      const timeDiff = Date.now() - new Date(coach.created_at).getTime()
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      const timeText = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`

      formattedPendingApprovals.push({
        userId: coach.user_id,
        type: 'Coach Verification',
        name: coach.full_name,
        location: coach.user?.username || 'Unknown',
        submittedDate: timeText
      })
    })

    // Sort by most recent first
    formattedPendingApprovals.sort((a, b) => {
      const getDays = (timeText) => {
        if (timeText === 'Today') return 0
        return parseInt(timeText.split(' ')[0])
      }
      return getDays(a.submittedDate) - getDays(b.submittedDate)
    })

    // Get recent activity
    const recentActivity = []

    // Recent player registrations
    const recentPlayers = await Player.findAll({
      where: {
        state_id: stateId,
        created_at: { [Op.gte]: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'user',
        attributes: ['username']
      }]
    })

    recentPlayers.forEach(player => {
      const timeDiff = Date.now() - new Date(player.created_at).getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      const timeText = hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`

      recentActivity.push({
        icon: '👤',
        message: `New player ${player.full_name} registered`,
        time: timeText
      })
    })

    // Recent tournaments
    const recentTournaments = await Tournament.findAll({
      where: {
        state_id: stateId,
        created_at: { [Op.gte]: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 3
    })

    recentTournaments.forEach(tournament => {
      const timeDiff = Date.now() - new Date(tournament.created_at).getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      const timeText = hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`

      recentActivity.push({
        icon: '🏆',
        message: `Tournament "${tournament.name}" was created`,
        time: timeText
      })
    })

    // Recent club registrations
    const recentClubs = await Club.findAll({
      where: {
        state_id: stateId,
        created_at: { [Op.gte]: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
      },
      order: [['created_at', 'DESC']],
      limit: 2
    })

    recentClubs.forEach(club => {
      const timeDiff = Date.now() - new Date(club.created_at).getTime()
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
      const timeText = hoursAgo < 24 ? `${hoursAgo} hours ago` : `${Math.floor(hoursAgo / 24)} days ago`

      recentActivity.push({
        icon: '🏢',
        message: `New club "${club.name}" registered`,
        time: timeText
      })
    })

    // Sort recent activity by creation time (newest first)
    recentActivity.sort((a, b) => {
      // Parse time text to compare properly
      const getHours = (timeText) => {
        if (timeText.includes('hours ago')) {
          return parseInt(timeText.split(' ')[0])
        } else if (timeText.includes('days ago')) {
          return parseInt(timeText.split(' ')[0]) * 24
        }
        return 0
      }
      return getHours(a.time) - getHours(b.time)
    })

    // Calculate national ranking (simplified - rank by total players)
    const allStatesPlayerCount = await StateCommittee.findAll({
      attributes: [
        'id',
        'state_id',
        [literal('(SELECT COUNT(*) FROM players WHERE players.state_id = "StateCommittee".state_id)'), 'player_count']
      ],
      order: [[literal('(SELECT COUNT(*) FROM players WHERE players.state_id = "StateCommittee".state_id)'), 'DESC']]
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

// Quick approve user from dashboard
const approveUser = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUser = req.user

    // Get state committee to verify permission
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: currentUser.id }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    // Find the user and verify they belong to this state
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user belongs to this state by checking their profile
    let belongsToState = false
    if (user.role === 'player') {
      const player = await Player.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!player
    } else if (user.role === 'club') {
      const club = await Club.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!club
    } else if (user.role === 'coach') {
      const coach = await Coach.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!coach
    } else if (user.role === 'partner') {
      const partner = await Partner.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!partner
    }

    if (!belongsToState) {
      return res.status(403).json({ message: 'User does not belong to your state' })
    }

    // Approve the user
    await user.update({ is_verified: true })

    res.json({
      message: 'User approved successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_verified: user.is_verified
      }
    })

  } catch (error) {
    console.error('Error approving user:', error)
    res.status(500).json({ message: 'Failed to approve user' })
  }
}

// Quick reject user from dashboard
const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUser = req.user

    // Get state committee to verify permission
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: currentUser.id }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    // Find the user and verify they belong to this state
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Check if user belongs to this state by checking their profile
    let belongsToState = false
    if (user.role === 'player') {
      const player = await Player.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!player
    } else if (user.role === 'club') {
      const club = await Club.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!club
    } else if (user.role === 'coach') {
      const coach = await Coach.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!coach
    } else if (user.role === 'partner') {
      const partner = await Partner.findOne({ where: { user_id: userId, state_id: stateCommittee.state_id } })
      belongsToState = !!partner
    }

    if (!belongsToState) {
      return res.status(403).json({ message: 'User does not belong to your state' })
    }

    // Reject the user by setting them inactive
    await user.update({ is_active: false, is_verified: false })

    res.json({
      message: 'User rejected successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        is_verified: user.is_verified
      }
    })

  } catch (error) {
    console.error('Error rejecting user:', error)
    res.status(500).json({ message: 'Failed to reject user' })
  }
}

module.exports = {
  getStateDashboard,
  getStatePerformanceMetrics,
  approveUser,
  rejectUser
}