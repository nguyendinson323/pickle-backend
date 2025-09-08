const { Op } = require('sequelize')
const { 
  User, 
  Player, 
  Coach, 
  Club, 
  Partner, 
  StateCommittee,
  State,
  Notification,
  Message,
  MessageRecipient,
  Payment,
  Subscription
} = require('../db/models')

const getProfile = async (userId, role) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  })

  if (!user) {
    throw new Error('User not found')
  }

  let profile = null

  switch (role) {
    case 'player':
      profile = await Player.findOne({
        where: { user_id: userId },
        include: [
          { model: State, as: 'state' },
          { model: Club, as: 'club' }
        ]
      })
      break
    case 'coach':
      profile = await Coach.findOne({
        where: { user_id: userId },
        include: [{ model: State, as: 'state' }]
      })
      break
    case 'club':
      profile = await Club.findOne({
        where: { user_id: userId },
        include: [{ model: State, as: 'state' }]
      })
      break
    case 'partner':
      profile = await Partner.findOne({
        where: { user_id: userId },
        include: [{ model: State, as: 'state' }]
      })
      break
    case 'state':
      profile = await StateCommittee.findOne({
        where: { user_id: userId },
        include: [{ model: State, as: 'state' }]
      })
      break
  }

  return {
    user,
    profile
  }
}

const updateProfile = async (userId, role, updates) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new Error('User not found')
  }

  const { userUpdates, profileUpdates } = updates

  if (userUpdates) {
    if (userUpdates.username) {
      const existingUser = await User.findOne({
        where: {
          username: userUpdates.username,
          id: { [Op.ne]: userId }
        }
      })
      if (existingUser) {
        throw new Error('Username already taken')
      }
    }

    if (userUpdates.email) {
      const existingUser = await User.findOne({
        where: {
          email: userUpdates.email,
          id: { [Op.ne]: userId }
        }
      })
      if (existingUser) {
        throw new Error('Email already in use')
      }
    }

    await user.update(userUpdates)
  }

  let profile = null

  if (profileUpdates) {
    switch (role) {
      case 'player':
        profile = await Player.findOne({ where: { user_id: userId } })
        await profile.update(profileUpdates)
        break
      case 'coach':
        profile = await Coach.findOne({ where: { user_id: userId } })
        await profile.update(profileUpdates)
        break
      case 'club':
        profile = await Club.findOne({ where: { user_id: userId } })
        await profile.update(profileUpdates)
        break
      case 'partner':
        profile = await Partner.findOne({ where: { user_id: userId } })
        await profile.update(profileUpdates)
        break
      case 'state':
        profile = await StateCommittee.findOne({ where: { user_id: userId } })
        await profile.update(profileUpdates)
        break
    }
  }

  return {
    user: await User.findByPk(userId, { attributes: { exclude: ['password'] } }),
    profile
  }
}

const getAllUsers = async (filters = {}) => {
  const { role, is_active, is_verified, limit = 50, offset = 0, search } = filters

  const where = {}

  if (role) where.role = role
  if (is_active !== undefined) where.is_active = is_active
  if (is_verified !== undefined) where.is_verified = is_verified
  
  if (search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ]
  }

  const users = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit,
    offset,
    order: [['created_at', 'DESC']]
  })

  return users
}

const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const profile = await getProfile(userId, user.role)

  const notifications = await Notification.count({
    where: { user_id: userId, is_read: false }
  })

  const messages = await MessageRecipient.count({
    where: { recipient_id: userId, is_read: false }
  })

  const payments = await Payment.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
    limit: 5
  })

  const subscription = await Subscription.findOne({
    where: { 
      user_id: userId,
      status: 'active'
    }
  })

  return {
    ...profile,
    unreadNotifications: notifications,
    unreadMessages: messages,
    recentPayments: payments,
    activeSubscription: subscription
  }
}

const toggleUserStatus = async (userId) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new Error('User not found')
  }

  await user.update({ is_active: !user.is_active })

  return user
}

const verifyUser = async (userId) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new Error('User not found')
  }

  await user.update({ is_verified: true })

  return user
}

const deleteUser = async (userId) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new Error('User not found')
  }

  await user.destroy()

  return { message: 'User deleted successfully' }
}

const updateSearchableStatus = async (userId, isSearchable) => {
  const user = await User.findByPk(userId)

  if (!user) {
    throw new Error('User not found')
  }

  await user.update({ is_searchable: isSearchable })

  return user
}

const getUserStats = async (userId, role) => {
  let stats = {}

  switch (role) {
    case 'player':
      const player = await Player.findOne({ where: { user_id: userId } })
      
      stats = {
        tournamentsPlayed: await require('../db/models').TournamentRegistration.count({
          where: { player_id: player.id }
        }),
        matchesPlayed: await require('../db/models').TournamentMatch.count({
          where: {
            [Op.or]: [
              { player1_id: player.id },
              { player2_id: player.id },
              { player3_id: player.id },
              { player4_id: player.id }
            ]
          }
        }),
        courtReservations: await require('../db/models').CourtReservation.count({
          where: { player_id: player.id }
        })
      }
      break

    case 'coach':
      const coach = await Coach.findOne({ where: { user_id: userId } })
      
      stats = {
        sessionsCompleted: await require('../db/models').CoachingSession.count({
          where: { 
            coach_id: coach.id,
            status: 'completed'
          }
        }),
        certifications: await require('../db/models').CoachCertification.count({
          where: { coach_id: coach.id }
        }),
        matchesRefereed: await require('../db/models').TournamentMatch.count({
          where: { referee_id: coach.id }
        })
      }
      break

    case 'club':
      const club = await Club.findOne({ where: { user_id: userId } })
      
      stats = {
        members: await Player.count({ where: { club_id: club.id } }),
        courts: await require('../db/models').Court.count({
          where: { owner_type: 'club', owner_id: club.id }
        }),
        tournaments: await require('../db/models').Tournament.count({
          where: { organizer_type: 'club', organizer_id: club.id }
        })
      }
      break

    case 'partner':
      const partner = await Partner.findOne({ where: { user_id: userId } })
      
      stats = {
        courts: await require('../db/models').Court.count({
          where: { owner_type: 'partner', owner_id: partner.id }
        }),
        tournaments: await require('../db/models').Tournament.count({
          where: { organizer_type: 'partner', organizer_id: partner.id }
        })
      }
      break

    case 'state':
      const stateCommittee = await StateCommittee.findOne({ where: { user_id: userId } })
      
      stats = {
        players: await Player.count({ where: { state_id: stateCommittee.state_id } }),
        clubs: await Club.count({ where: { state_id: stateCommittee.state_id } }),
        tournaments: await require('../db/models').Tournament.count({
          where: { state_id: stateCommittee.state_id }
        }),
        courts: await require('../db/models').Court.count({
          where: { state_id: stateCommittee.state_id }
        })
      }
      break
  }

  return stats
}

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  toggleUserStatus,
  verifyUser,
  deleteUser,
  updateSearchableStatus,
  getUserStats
}