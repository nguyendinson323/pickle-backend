const { 
  Player, 
  User, 
  State, 
  Club,
  PlayerRanking,
  RankingPeriod,
  TournamentRegistration,
  Tournament,
  TournamentMatch,
  DigitalCredential,
  CourtReservation,
  CoachingSession
} = require('../db/models')
const { Op } = require('sequelize')

// GET /api/player/states - Get list of all states
const getStates = async (req, res) => {
  try {
    const states = await State.findAll({
      attributes: ['id', 'name', 'short_code'],
      order: [['name', 'ASC']]
    })

    res.status(200).json(states)
  } catch (error) {
    console.error('Error fetching states:', error)
    res.status(500).json({ message: 'Failed to fetch states' })
  }
}

// GET /api/player/profile - Get current player's profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const player = await Player.findOne({
      where: { user_id: userId },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        },
        {
          model: Club,
          as: 'club',
          attributes: ['id', 'name', 'logo_url']
        }
      ]
    })

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    res.status(200).json(player)
  } catch (error) {
    console.error('Error fetching player profile:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
}

// PUT /api/player/profile - Update player profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      full_name,
      birth_date,
      gender,
      state_id,
      curp,
      nrtp_level,
      profile_photo_url,
      nationality,
      club_id
    } = req.body

    const player = await Player.findOne({
      where: { user_id: userId }
    })

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Update player profile fields
    const updateData = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (birth_date !== undefined) updateData.birth_date = birth_date
    if (gender !== undefined) updateData.gender = gender
    if (state_id !== undefined) updateData.state_id = state_id
    if (curp !== undefined) updateData.curp = curp
    if (nrtp_level !== undefined) updateData.nrtp_level = nrtp_level
    if (profile_photo_url !== undefined) updateData.profile_photo_url = profile_photo_url
    if (nationality !== undefined) updateData.nationality = nationality
    if (club_id !== undefined) updateData.club_id = club_id

    await player.update(updateData)

    // Fetch updated player with associations
    const updatedPlayer = await Player.findOne({
      where: { user_id: userId },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        },
        {
          model: Club,
          as: 'club',
          attributes: ['id', 'name', 'logo_url']
        }
      ]
    })

    res.status(200).json(updatedPlayer)
  } catch (error) {
    console.error('Error updating player profile:', error)
    
    // Handle unique constraint violations (like CURP)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'CURP already exists for another player' 
      })
    }
    
    res.status(500).json({ message: 'Failed to update profile' })
  }
}

// PUT /api/player/account - Update user account information
const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id
    const { username, email, phone, is_searchable } = req.body

    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update user account fields
    const updateData = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (is_searchable !== undefined) updateData.is_searchable = is_searchable

    await user.update(updateData)

    // Return updated user data (exclude password)
    const updatedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified,
      is_premium: user.is_premium,
      is_searchable: user.is_searchable
    }

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Error updating user account:', error)
    
    // Handle unique constraint violations (username/email)
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.fields.username ? 'Username' : 'Email'
      return res.status(400).json({ 
        message: `${field} already exists` 
      })
    }
    
    res.status(500).json({ message: 'Failed to update account' })
  }
}

// GET /api/player/dashboard - Get player dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id

    // Get player profile with associations
    const player = await Player.findOne({
      where: { user_id: userId },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        },
        {
          model: Club,
          as: 'club',
          attributes: ['id', 'name', 'logo_url']
        }
      ]
    })

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Get current ranking
    const currentPeriod = await RankingPeriod.findOne({
      where: { is_active: true }
    })

    let currentRanking = null
    if (currentPeriod) {
      currentRanking = await PlayerRanking.findOne({
        where: { 
          player_id: player.id,
          period_id: currentPeriod.id
        }
      })
    }

    // Get tournament stats
    const tournamentRegistrations = await TournamentRegistration.findAll({
      where: { player_id: player.id },
      include: [
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name', 'start_date', 'status']
        }
      ]
    })

    // Get matches where player participated
    const playerMatches = await TournamentMatch.findAll({
      where: {
        [Op.or]: [
          { player1_id: player.id },
          { player2_id: player.id },
          { player3_id: player.id },
          { player4_id: player.id }
        ]
      },
      include: [
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name', 'start_date']
        }
      ],
      order: [['match_date', 'DESC']],
      limit: 10
    })

    // Calculate stats
    const totalMatches = playerMatches.length
    const completedMatches = playerMatches.filter(match => match.status === 'completed')
    const tournamentWins = completedMatches.filter(match => {
      // Check if player was on winning side
      const isPlayerOnSide1 = match.player1_id === player.id || match.player2_id === player.id
      const isPlayerOnSide2 = match.player3_id === player.id || match.player4_id === player.id
      return (isPlayerOnSide1 && match.winner_side === 1) || (isPlayerOnSide2 && match.winner_side === 2)
    }).length

    // Get upcoming tournaments/matches (next 5)
    const upcomingTournaments = tournamentRegistrations
      .filter(reg => reg.tournament.status === 'upcoming')
      .slice(0, 5)
      .map(reg => ({
        id: reg.tournament.id,
        name: reg.tournament.name,
        date: reg.tournament.start_date,
        status: reg.status
      }))

    // Get recent matches (last 5 completed)
    const recentMatches = completedMatches
      .slice(0, 5)
      .map(match => ({
        id: match.id,
        tournament: match.tournament.name,
        date: match.match_date,
        opponent: 'Opponent', // Would need more complex logic to determine opponent
        result: match.winner_side ? 'Win/Loss' : 'TBD',
        score: match.score
      }))

    // Get digital credentials count
    const credentialsCount = await DigitalCredential.count({
      where: { 
        player_id: player.id,
        is_active: true
      }
    })

    // Get upcoming court reservations
    const upcomingReservations = await CourtReservation.findAll({
      where: { 
        player_id: player.id,
        date: {
          [Op.gte]: new Date()
        },
        status: 'confirmed'
      },
      limit: 3,
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    })

    // Get upcoming coaching sessions
    const upcomingSessions = await CoachingSession.findAll({
      where: { 
        player_id: player.id,
        session_date: {
          [Op.gte]: new Date()
        },
        status: 'scheduled'
      },
      limit: 3,
      order: [['session_date', 'ASC'], ['start_time', 'ASC']]
    })

    // Construct dashboard response matching PlayerDashboard interface
    const dashboardData = {
      profile: player,
      upcomingTournaments: tournamentRegistrations
        .filter(reg => reg.tournament.status === 'upcoming')
        .map(reg => ({
          id: reg.id,
          tournament_id: reg.tournament_id,
          category_id: reg.category_id,
          player_id: reg.player_id,
          partner_player_id: reg.partner_player_id,
          registration_date: reg.registration_date,
          payment_status: reg.payment_status,
          amount_paid: reg.amount_paid,
          stripe_payment_id: reg.stripe_payment_id,
          status: reg.status,
          created_at: reg.created_at,
          updated_at: reg.updated_at,
          Tournament: reg.tournament
        })),
      currentRanking: currentRanking,
      unreadNotifications: 0, // TODO: Implement notifications system
      unreadMessages: 0, // TODO: Implement messages system
      affiliationStatus: player.affiliation_expires_at && new Date(player.affiliation_expires_at) > new Date() ? 'active' : 'expired',
      tournamentWins: tournamentWins,
      totalMatches: totalMatches,
      upcomingMatches: upcomingTournaments.map(tournament => ({
        tournamentName: tournament.name,
        opponent: 'TBD', // Will be determined when matches are drawn
        date: new Date(tournament.date).toLocaleDateString(),
        time: 'TBD', // Time will be set closer to tournament
        status: tournament.status
      })),
      recentMatches: recentMatches.map(match => ({
        opponent: 'Opponent', // Complex logic needed to determine opponent
        tournament: match.tournament,
        date: match.date,
        result: match.result?.includes('Win') ? 'win' : match.result?.includes('Loss') ? 'loss' : 'draw',
        score: match.score || 'N/A'
      })),
      stats: {
        tournamentsPlayed: tournamentRegistrations.filter(r => r.tournament.status === 'completed').length,
        rankingPosition: currentRanking?.current_rank || null,
        rankingPoints: currentRanking?.points || 0
      }
    }

    res.status(200).json(dashboardData)
  } catch (error) {
    console.error('Error fetching player dashboard:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
}

// GET /api/player/credentials - Get player's digital credentials
const getDigitalCredentials = async (req, res) => {
  try {
    const userId = req.user.id
    const player = await Player.findOne({
      where: { user_id: userId }
    })

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    const credentials = await DigitalCredential.findAll({
      where: { 
        player_id: player.id
      },
      order: [['created_at', 'DESC']]
    })

    res.status(200).json(credentials)
  } catch (error) {
    console.error('Error fetching digital credentials:', error)
    res.status(500).json({ message: 'Failed to fetch digital credentials' })
  }
}

module.exports = {
  getStates,
  getProfile,
  updateProfile,
  updateAccount,
  getDashboard,
  getDigitalCredentials
}