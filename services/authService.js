const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { 
  User, 
  Player, 
  Coach, 
  Club, 
  Partner, 
  StateCommittee, 
  State,
  Tournament,
  Court,
  TournamentRegistration,
  PlayerRanking,
  Notification,
  Message,
  MessageRecipient,
  Subscription,
  Payment
} = require('../db/models')

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
}

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

const login = async (username, password) => {
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email: username }
      ],
      is_active: true
    }
  })

  if (!user) {
    throw new Error('Invalid credentials')
  }

  const isPasswordValid = await comparePassword(password, user.password)
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials')
  }

  await user.update({ last_login: new Date() })

  const token = generateToken(user)
  const dashboardData = await getDashboardData(user)

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_premium: user.is_premium,
      is_verified: user.is_verified
    },
    dashboard: dashboardData
  }
}

const getDashboardData = async (user) => {
  let profileData = null
  let dashboardInfo = {}

  switch (user.role) {
    case 'player':
      profileData = await Player.findOne({
        where: { user_id: user.id },
        include: [
          { model: State, as: 'state' },
          { model: Club, as: 'club' }
        ]
      })

      if (!profileData) {
        throw new Error('Player profile not found')
      }

      const upcomingTournaments = await TournamentRegistration.findAll({
        where: { 
          player_id: profileData.id,
          status: 'registered'
        },
        include: [{
          model: Tournament,
          as: 'tournament',
          where: {
            start_date: { [Op.gte]: new Date() },
            status: 'upcoming'
          }
        }],
        limit: 5
      })

      const currentRanking = await PlayerRanking.findOne({
        where: { player_id: profileData.id },
        order: [['updated_at', 'DESC']]
      })

      const unreadNotifications = await Notification.count({
        where: {
          user_id: user.id,
          is_read: false
        }
      })

      const unreadMessages = await MessageRecipient.count({
        where: {
          recipient_id: user.id,
          is_read: false
        }
      })

      dashboardInfo = {
        profile: profileData,
        upcomingTournaments,
        upcomingMatches: upcomingTournaments, // Add alias for frontend compatibility
        recentMatches: [], // Placeholder for recent matches
        currentRanking,
        unreadNotifications,
        unreadMessages,
        affiliationStatus: profileData?.affiliation_expires_at,
        tournamentWins: 0, // Placeholder for tournament wins calculation
        totalMatches: await TournamentRegistration.count({
          where: { player_id: profileData.id }
        }),
        stats: {
          tournamentsPlayed: await TournamentRegistration.count({
            where: { player_id: profileData.id }
          }),
          rankingPosition: currentRanking?.current_rank || null,
          rankingPoints: currentRanking?.points || 0
        }
      }
      break

    case 'coach':
      profileData = await Coach.findOne({
        where: { user_id: user.id },
        include: [{ model: State, as: 'state' }]
      })

      const upcomingSessions = await require('../db/models').CoachingSession.findAll({
        where: {
          coach_id: profileData.id,
          session_date: { [Op.gte]: new Date() },
          status: 'scheduled'
        },
        limit: 5
      })

      const certifications = await require('../db/models').CoachCertification.count({
        where: { coach_id: profileData.id }
      })

      dashboardInfo = {
        profile: profileData,
        upcomingSessions,
        certifications,
        affiliationStatus: profileData.affiliation_expires_at,
        stats: {
          totalSessions: await require('../db/models').CoachingSession.count({
            where: { coach_id: profileData.id }
          }),
          activeCertifications: certifications
        }
      }
      break

    case 'club':
      profileData = await Club.findOne({
        where: { user_id: user.id },
        include: [{ model: State, as: 'state' }]
      })

      const clubCourts = await Court.count({
        where: {
          owner_type: 'club',
          owner_id: profileData.id
        }
      })

      const clubTournaments = await Tournament.findAll({
        where: {
          organizer_type: 'club',
          organizer_id: profileData.id,
          start_date: { [Op.gte]: new Date() }
        },
        limit: 5
      })

      const clubMembers = await Player.count({
        where: { club_id: profileData.id }
      })

      dashboardInfo = {
        profile: profileData,
        courts: clubCourts,
        upcomingTournaments: clubTournaments,
        members: clubMembers,
        affiliationStatus: profileData.affiliation_expires_at,
        premiumStatus: profileData.premium_expires_at,
        stats: {
          totalMembers: clubMembers,
          totalCourts: clubCourts,
          activeTournaments: clubTournaments.length
        }
      }
      break

    case 'partner':
      profileData = await Partner.findOne({
        where: { user_id: user.id },
        include: [{ model: State, as: 'state' }]
      })

      const partnerCourts = await Court.count({
        where: {
          owner_type: 'partner',
          owner_id: profileData.id
        }
      })

      const partnerTournaments = await Tournament.findAll({
        where: {
          organizer_type: 'partner',
          organizer_id: profileData.id,
          start_date: { [Op.gte]: new Date() }
        },
        limit: 5
      })

      dashboardInfo = {
        profile: profileData,
        courts: partnerCourts,
        upcomingTournaments: partnerTournaments,
        premiumStatus: profileData.premium_expires_at,
        stats: {
          totalCourts: partnerCourts,
          activeTournaments: partnerTournaments.length
        }
      }
      break

    case 'state':
      profileData = await StateCommittee.findOne({
        where: { user_id: user.id },
        include: [{ model: State, as: 'state' }]
      })

      const statePlayers = await Player.count({
        where: { state_id: profileData.state_id }
      })

      const stateClubs = await Club.count({
        where: { state_id: profileData.state_id }
      })

      const stateTournaments = await Tournament.findAll({
        where: {
          state_id: profileData.state_id,
          start_date: { [Op.gte]: new Date() }
        },
        limit: 5
      })

      const stateCourts = await Court.count({
        where: { state_id: profileData.state_id }
      })

      dashboardInfo = {
        profile: profileData,
        upcomingTournaments: stateTournaments,
        affiliationStatus: profileData.affiliation_expires_at,
        stats: {
          totalPlayers: statePlayers,
          totalClubs: stateClubs,
          totalCourts: stateCourts,
          activeTournaments: stateTournaments.length
        }
      }
      break

    case 'admin':
      const totalUsers = await User.count()
      const totalPlayers = await Player.count()
      const totalClubs = await Club.count()
      const totalPartners = await Partner.count()
      const totalStates = await StateCommittee.count()
      const totalTournaments = await Tournament.count({
        where: { status: 'upcoming' }
      })
      const totalCourts = await Court.count()
      const recentPayments = await Payment.findAll({
        order: [['created_at', 'DESC']],
        limit: 10
      })

      dashboardInfo = {
        stats: {
          totalUsers,
          totalPlayers,
          totalClubs,
          totalPartners,
          totalStates,
          totalTournaments,
          totalCourts
        },
        recentPayments,
        systemStatus: {
          database: 'connected',
          uptime: process.uptime()
        }
      }
      break
  }

  return dashboardInfo
}

const register = async (userData, profileData) => {
  const { username, email, password, role } = userData

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { username },
        { email }
      ]
    }
  })

  if (existingUser) {
    throw new Error('Username or email already exists')
  }

  const hashedPassword = await hashPassword(password)

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
    is_active: true,
    is_verified: false
  })

  let profile = null

  switch (role) {
    case 'player':
      profile = await Player.create({
        ...profileData,
        user_id: user.id
      })
      break
    case 'coach':
      profile = await Coach.create({
        ...profileData,
        user_id: user.id
      })
      break
    case 'club':
      profile = await Club.create({
        ...profileData,
        user_id: user.id
      })
      break
    case 'partner':
      profile = await Partner.create({
        ...profileData,
        user_id: user.id
      })
      break
    case 'state':
      profile = await StateCommittee.create({
        ...profileData,
        user_id: user.id
      })
      break
  }

  const token = generateToken(user)
  const dashboardData = await getDashboardData(user)

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_premium: user.is_premium,
      is_verified: user.is_verified
    },
    dashboard: dashboardData
  }
}

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new Error('User not found')
  }

  const isPasswordValid = await comparePassword(oldPassword, user.password)

  if (!isPasswordValid) {
    throw new Error('Invalid old password')
  }

  const hashedPassword = await hashPassword(newPassword)
  await user.update({ password: hashedPassword })

  return { message: 'Password changed successfully' }
}

const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } })

  if (!user) {
    throw new Error('User not found')
  }

  const resetToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  return { resetToken, user }
}

const resetPassword = async (token, newPassword) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  
  const user = await User.findByPk(decoded.id)

  if (!user) {
    throw new Error('Invalid token')
  }

  const hashedPassword = await hashPassword(newPassword)
  await user.update({ password: hashedPassword })

  return { message: 'Password reset successfully' }
}

module.exports = {
  login,
  register,
  changePassword,
  forgotPassword,
  resetPassword,
  generateToken,
  hashPassword,
  comparePassword,
  getDashboardData
}