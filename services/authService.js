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
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified,
      is_premium: user.is_premium,
      is_searchable: user.is_searchable,
      profile_photo_url: user.profile_photo_url,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at
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
        limit: 5,
        order: [['start_date', 'ASC']]
      })

      const clubMembers = await Player.count({
        where: { club_id: profileData.id }
      })

      // Get recent members (last 30 days)
      const recentMembers = await Player.findAll({
        where: { 
          club_id: profileData.id,
          created_at: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        order: [['created_at', 'DESC']],
        limit: 5,
        attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level', 'created_at']
      })

      // Calculate monthly revenue from court reservations
      const firstDayOfMonth = new Date()
      firstDayOfMonth.setDate(1)
      firstDayOfMonth.setHours(0, 0, 0, 0)

      const monthlyReservations = await require('../db/models').CourtReservation.findAll({
        where: {
          created_at: { [Op.gte]: firstDayOfMonth },
          payment_status: 'paid'
        },
        include: [{
          model: Court,
          as: 'court',
          where: {
            owner_type: 'club',
            owner_id: profileData.id
          }
        }]
      })

      const monthlyRevenue = monthlyReservations.reduce((sum, reservation) => {
        return sum + parseFloat(reservation.amount || 0)
      }, 0)

      // Calculate member growth (new members this month vs last month)
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      lastMonth.setDate(1)
      lastMonth.setHours(0, 0, 0, 0)

      const thisMonthMembers = await Player.count({
        where: { 
          club_id: profileData.id,
          created_at: { [Op.gte]: firstDayOfMonth }
        }
      })

      const lastMonthMembers = await Player.count({
        where: { 
          club_id: profileData.id,
          created_at: { 
            [Op.gte]: lastMonth,
            [Op.lt]: firstDayOfMonth
          }
        }
      })

      const memberGrowth = lastMonthMembers > 0 ? 
        Math.round(((thisMonthMembers - lastMonthMembers) / lastMonthMembers) * 100) : 
        (thisMonthMembers > 0 ? 100 : 0)

      // Get today's court bookings
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todaysBookings = await require('../db/models').CourtReservation.count({
        where: {
          date: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        },
        include: [{
          model: Court,
          as: 'court',
          where: {
            owner_type: 'club',
            owner_id: profileData.id
          }
        }]
      })

      // Calculate weekly court usage (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const weeklyReservations = await require('../db/models').CourtReservation.count({
        where: {
          date: { [Op.gte]: weekAgo }
        },
        include: [{
          model: Court,
          as: 'court',
          where: {
            owner_type: 'club',
            owner_id: profileData.id
          }
        }]
      })

      // Estimate weekly usage percentage (assuming 8 hours per day per court)
      const totalWeeklySlots = clubCourts * 7 * 8
      const weeklyUsage = totalWeeklySlots > 0 ? 
        Math.round((weeklyReservations / totalWeeklySlots) * 100) : 0

      // Member satisfaction placeholder (could be calculated from feedback/ratings)
      const memberSatisfaction = 85 // Default satisfaction score

      dashboardInfo = {
        profile: profileData,
        courts: clubCourts,
        upcomingTournaments: clubTournaments,
        members: clubMembers,
        recentMembers,
        affiliationStatus: profileData.affiliation_expires_at,
        premiumStatus: profileData.premium_expires_at,
        stats: {
          totalMembers: clubMembers,
          totalCourts: clubCourts,
          activeTournaments: clubTournaments.length
        },
        dashboardStats: {
          monthlyRevenue,
          memberGrowth,
          memberSatisfaction,
          todaysBookings,
          weeklyUsage
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

      // Calculate monthly bookings and revenue
      const partnerMonthStart = new Date()
      partnerMonthStart.setDate(1)
      partnerMonthStart.setHours(0, 0, 0, 0)

      const partnerReservations = await require('../db/models').CourtReservation.findAll({
        where: {
          date: { [Op.gte]: partnerMonthStart },
          payment_status: 'paid'
        },
        include: [{
          model: Court,
          as: 'court',
          where: {
            owner_type: 'partner',
            owner_id: profileData.id
          }
        }]
      })

      const partnerMonthlyRevenue = partnerReservations.reduce((sum, reservation) => {
        return sum + parseFloat(reservation.amount || 0)
      }, 0)

      const partnerMonthlyBookings = partnerReservations.length

      // Get recent bookings (last 10)
      const partnerRecentBookings = await require('../db/models').CourtReservation.findAll({
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Court,
            as: 'court',
            where: {
              owner_type: 'partner',
              owner_id: profileData.id
            }
          },
          {
            model: require('../db/models').Player,
            as: 'player',
            include: [{
              model: User,
              as: 'user',
              attributes: ['username']
            }]
          }
        ]
      })

      // Format recent bookings for frontend
      const formattedRecentBookings = partnerRecentBookings.map(booking => ({
        id: booking.id,
        player_name: booking.player?.user?.username || 'Unknown Player',
        court_number: 1,
        date: booking.date,
        time: `${booking.start_time} - ${booking.end_time}`,
        amount: parseFloat(booking.amount || 0),
        status: booking.status
      }))

      // Format upcoming events (tournaments)
      const formattedUpcomingEvents = partnerTournaments.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        type: tournament.tournament_type || 'Tournament',
        date: tournament.start_date,
        duration: `${tournament.start_date} to ${tournament.end_date}`,
        expected_revenue: parseFloat(tournament.entry_fee || 0),
        registrations: 0
      }))

      // Calculate court utilization
      const partnerTotalReservations = await require('../db/models').CourtReservation.count({
        include: [{
          model: Court,
          as: 'court',
          where: {
            owner_type: 'partner',
            owner_id: profileData.id
          }
        }]
      })

      const courtUtilization = partnerCourts > 0 ? Math.min(Math.round((partnerTotalReservations / (partnerCourts * 30)) * 100), 100) : 0

      dashboardInfo = {
        profile: profileData,
        upcomingEvents: formattedUpcomingEvents,
        recentBookings: formattedRecentBookings,
        premiumStatus: profileData.premium_expires_at,
        stats: {
          total_courts: partnerCourts,
          active_tournaments: partnerTournaments.length,
          monthly_bookings: partnerMonthlyBookings,
          monthly_revenue: partnerMonthlyRevenue,
          court_utilization: courtUtilization,
          customer_rating: 4.5,
          repeat_customers: 65,
          revenue_growth: 12,
          booking_trend: 8
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

// Get profile data for current user
const getProfile = async (user) => {
  let profileData = null

  switch (user.role) {
    case 'player':
      profileData = await Player.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          },
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          }
        ]
      })
      break
    
    case 'coach':
      profileData = await Coach.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    case 'club':
      profileData = await Club.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    case 'partner':
      profileData = await Partner.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    case 'state':
      profileData = await StateCommittee.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    default:
      throw new Error('Invalid user role')
  }

  if (!profileData) {
    throw new Error('Profile not found')
  }

  return profileData
}

// Update profile data for current user
const updateProfile = async (user, updateData) => {
  const { user_data, ...profileData } = updateData
  
  // Update user data if provided
  if (user_data) {
    await User.update(user_data, {
      where: { id: user.id }
    })
  }

  let updatedProfile = null

  switch (user.role) {
    case 'club':
      await Club.update(profileData, {
        where: { user_id: user.id }
      })
      
      updatedProfile = await Club.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    case 'player':
      await Player.update(profileData, {
        where: { user_id: user.id }
      })
      
      updatedProfile = await Player.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          },
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          }
        ]
      })
      break
    
    case 'coach':
      await Coach.update(profileData, {
        where: { user_id: user.id }
      })
      
      updatedProfile = await Coach.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    case 'partner':
      await Partner.update(profileData, {
        where: { user_id: user.id }
      })
      
      updatedProfile = await Partner.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    case 'state':
      await StateCommittee.update(profileData, {
        where: { user_id: user.id }
      })
      
      updatedProfile = await StateCommittee.findOne({
        where: { user_id: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login', 'created_at', 'updated_at']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      })
      break
    
    default:
      throw new Error('Invalid user role')
  }

  // Return updated dashboard data in the expected format
  return await getDashboardData(user)
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
  getDashboardData,
  getProfile,
  updateProfile
}