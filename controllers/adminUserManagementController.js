const { 
  User, Player, Coach, Club, Partner, StateCommittee, State,
  TournamentRegistration, CourtReservation, Tournament, Court, Notification
} = require('../db/models')
const { Op, fn, col, literal } = require('sequelize')
const bcrypt = require('bcryptjs')

const getUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      state,
      affiliation,
      searchTerm,
      dateFrom,
      dateTo,
      page = 1,
      limit = 50
    } = req.query

    const where = {}
    const profileWhere = {}

    // Role filter
    if (role && role !== '') {
      where.role = role
    }

    // Status filter
    if (status === 'active') {
      where.is_active = true
    } else if (status === 'inactive') {
      where.is_active = false
    } else if (status === 'suspended') {
      where.is_active = false
      where.suspended = true
    }

    // Date range filter
    if (dateFrom && dateTo) {
      where.created_at = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      }
    }

    // Search term filter
    if (searchTerm) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    // State filter for profile tables
    if (state && state !== '') {
      profileWhere.state_id = parseInt(state)
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Get users with their profile information
    const users = await User.findAll({
      where,
      include: [
        {
          model: Player,
          as: 'player',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            },
            {
              model: Club,
              as: 'club',
              required: false,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Coach,
          as: 'coach',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Club,
          as: 'club',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Partner,
          as: 'partner',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: StateCommittee,
          as: 'stateCommittee',
          required: false,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true
    })

    // Get user statistics
    const totalUsers = await User.count({ where })
    const activeUsers = await User.count({ where: { ...where, is_active: true } })
    const inactiveUsers = await User.count({ where: { ...where, is_active: false } })
    const verifiedUsers = await User.count({ where: { ...where, is_verified: true } })
    const premiumUsers = await User.count({ where: { ...where, is_premium: true } })

    const playerCount = await User.count({ where: { ...where, role: 'player' } })
    const coachCount = await User.count({ where: { ...where, role: 'coach' } })
    const clubCount = await User.count({ where: { ...where, role: 'club' } })
    const partnerCount = await User.count({ where: { ...where, role: 'partner' } })
    const stateCount = await User.count({ where: { ...where, role: 'state' } })

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers: inactiveUsers, // Simplified for now
      verifiedUsers,
      premiumUsers,
      playerCount,
      coachCount,
      clubCount,
      partnerCount,
      stateCount
    }

    // Format users for frontend
    const formattedUsers = users.map(user => {
      const profile = user.player || user.coach || user.club ||
                     user.partner || user.stateCommittee

      let affiliationStatus = 'pending'
      let affiliationExpiresAt = null

      if (profile) {
        if (profile.affiliation_expires_at) {
          const expiryDate = new Date(profile.affiliation_expires_at)
          const now = new Date()
          affiliationStatus = expiryDate > now ? 'active' : 'expired'
          affiliationExpiresAt = profile.affiliation_expires_at
        } else if (profile.premium_expires_at) {
          const expiryDate = new Date(profile.premium_expires_at)
          const now = new Date()
          affiliationStatus = expiryDate > now ? 'active' : 'expired'
          affiliationExpiresAt = profile.premium_expires_at
        }
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',
        is_active: user.is_active,
        is_verified: user.is_verified,
        is_premium: user.is_premium,
        created_at: user.created_at,
        last_login: user.last_login,
        affiliation_status: affiliationStatus,
        affiliation_expires_at: affiliationExpiresAt
      }
    })

    res.json({
      users: formattedUsers,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
}

const getUserDetails = async (req, res) => {
  try {
    const { id: userId } = req.params

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Player,
          as: 'player',
          required: false,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            },
            {
              model: Club,
              as: 'club',
              required: false,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Coach,
          as: 'coach',
          required: false,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Club,
          as: 'club',
          required: false,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Partner,
          as: 'partner',
          required: false,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: StateCommittee,
          as: 'stateCommittee',
          required: false,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get additional data based on user type
    let additionalData = {}

    if (user.role === 'player' && user.player) {
      // Get player-specific data
      const tournamentsPlayed = await TournamentRegistration.count({
        where: { player_id: user.player.id }
      })

      const courtReservations = await CourtReservation.count({
        where: { player_id: user.player.id }
      })

      additionalData = {
        tournaments_played: tournamentsPlayed,
        court_reservations: courtReservations,
        ranking_points: user.player.ranking_position || 0,
        ranking_position: user.player.ranking_position || 0
      }
    } else if (user.role === 'coach' && user.coach) {
      // Get coach-specific data
      const studentsCount = await User.count({
        include: [
          {
            model: Player,
            as: 'player',
            where: { coach_id: user.coach.id },
            required: true
          }
        ]
      })

      additionalData = {
        total_students: studentsCount,
        sessions_conducted: 0, // Will be implemented with sessions table
        referee_matches: 0, // Will be implemented with matches table
        certifications: []
      }
    } else if (user.role === 'club' && user.club) {
      // Get club-specific data
      const totalMembers = await User.count({
        include: [
          {
            model: Player,
            as: 'player',
            where: { club_id: user.club.id },
            required: true
          }
        ]
      })

      const totalCourts = await Court.count({
        where: { owner_type: 'club', owner_id: user.club.id }
      })

      const totalTournaments = await Tournament.count({
        where: { organizer_type: 'club', organizer_id: user.club.id }
      })

      additionalData = {
        total_members: totalMembers,
        total_courts: totalCourts,
        total_tournaments: totalTournaments,
        monthly_revenue: 0 // Will be calculated from payments
      }
    } else if (user.role === 'partner' && user.partner) {
      // Get partner-specific data
      const totalCourts = await Court.count({
        where: { owner_type: 'partner', owner_id: user.partner.id }
      })

      const totalEvents = await Tournament.count({
        where: { organizer_type: 'partner', organizer_id: user.partner.id }
      })

      additionalData = {
        total_courts: totalCourts,
        total_events: totalEvents,
        monthly_revenue: 0 // Will be calculated from payments
      }
    } else if (user.role === 'state' && user.stateCommittee) {
      // Get state-specific data
      const totalPlayers = await User.count({
        include: [
          {
            model: Player,
            as: 'player',
            where: { state_id: user.stateCommittee.state_id },
            required: true
          }
        ]
      })

      const totalClubs = await User.count({
        include: [
          {
            model: Club,
            as: 'club',
            where: { state_id: user.stateCommittee.state_id },
            required: true
          }
        ]
      })

      const totalPartners = await User.count({
        include: [
          {
            model: Partner,
            as: 'partner',
            where: { state_id: user.stateCommittee.state_id },
            required: true
          }
        ]
      })

      const totalTournaments = await Tournament.count({
        where: { state_id: user.stateCommittee.state_id }
      })

      additionalData = {
        total_players: totalPlayers,
        total_clubs: totalClubs,
        total_partners: totalPartners,
        total_tournaments: totalTournaments,
        state_ranking: 1 // Will be calculated properly
      }
    }

    const profile = user.player || user.coach || user.club ||
                   user.partner || user.stateCommittee

    let affiliationStatus = 'pending'
    let affiliationExpiresAt = null

    if (profile) {
      if (profile.affiliation_expires_at) {
        const expiryDate = new Date(profile.affiliation_expires_at)
        const now = new Date()
        affiliationStatus = expiryDate > now ? 'active' : 'expired'
        affiliationExpiresAt = profile.affiliation_expires_at
      }
    }

    const userDetail = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.is_active ? 'active' : 'inactive',
      is_active: user.is_active,
      is_verified: user.is_verified,
      is_premium: user.is_premium,
      created_at: user.created_at,
      last_login: user.last_login,
      affiliation_status: affiliationStatus,
      affiliation_expires_at: affiliationExpiresAt,
      profile: {
        ...additionalData,
        ...(profile ? {
          full_name: profile.full_name || profile.name || profile.business_name,
          birth_date: profile.birth_date,
          gender: profile.gender,
          state_id: profile.state_id,
          state_name: profile.state?.name,
          ...(user.role === 'player' && {
            club_id: profile.club_id,
            club_name: profile.club?.name,
            nrtp_level: profile.nrtp_level,
            nationality: profile.nationality,
            profile_photo_url: profile.profile_photo_url,
            id_document_url: profile.id_document_url
          }),
          ...(user.role === 'coach' && {
            hourly_rate: profile.hourly_rate,
            specializations: []
          }),
          ...(user.role === 'club' && {
            manager_name: profile.manager_name,
            website: profile.website,
            logo_url: profile.logo_url
          }),
          ...(user.role === 'partner' && {
            contact_name: profile.contact_name,
            partner_type: profile.partner_type,
            website: profile.website,
            logo_url: profile.logo_url
          }),
          ...(user.role === 'state' && {
            representative_name: profile.president_name
          })
        } : {})
      }
    }

    res.json(userDetail)

  } catch (error) {
    console.error('Error fetching user details:', error)
    res.status(500).json({ message: 'Failed to fetch user details' })
  }
}

const updateUserStatus = async (req, res) => {
  try {
    const { id: userId } = req.params
    const { status, reason } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    let updateData = {}
    if (status === 'active') {
      updateData.is_active = true
    } else if (status === 'inactive' || status === 'suspended') {
      updateData.is_active = false
    }

    await user.update(updateData)

    // Create notification for user
    await Notification.create({
      user_id: userId,
      title: 'Account Status Updated',
      content: `Your account status has been changed to ${status}${reason ? `. Reason: ${reason}` : ''}`,
      notification_type: 'system'
    })

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user.id,
        status: status,
        is_active: updateData.is_active
      }
    })

  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ message: 'Failed to update user status' })
  }
}

const updateUserVerification = async (req, res) => {
  try {
    const { id: userId } = req.params
    const { verified } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.update({ is_verified: verified })

    // Create notification for user
    await Notification.create({
      user_id: userId,
      title: verified ? 'Account Verified' : 'Verification Removed',
      content: verified ? 
        'Your account has been verified by an administrator.' : 
        'Your account verification has been removed by an administrator.',
      notification_type: 'system'
    })

    res.json({
      message: 'User verification updated successfully',
      user: {
        id: user.id,
        is_verified: verified
      }
    })

  } catch (error) {
    console.error('Error updating user verification:', error)
    res.status(500).json({ message: 'Failed to update user verification' })
  }
}

const updateUserPremium = async (req, res) => {
  try {
    const { id: userId } = req.params
    const { premium, duration } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.update({ is_premium: premium })

    // Create notification for user
    await Notification.create({
      user_id: userId,
      title: premium ? 'Premium Access Granted' : 'Premium Access Removed',
      content: premium ? 
        `You have been granted premium access${duration ? ` for ${duration} days` : ''}.` : 
        'Your premium access has been removed by an administrator.',
      notification_type: 'system'
    })

    res.json({
      message: 'User premium status updated successfully',
      user: {
        id: user.id,
        is_premium: premium
      }
    })

  } catch (error) {
    console.error('Error updating user premium status:', error)
    res.status(500).json({ message: 'Failed to update user premium status' })
  }
}

const resetUserPassword = async (req, res) => {
  try {
    const { id: userId } = req.params

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    await user.update({ password: hashedPassword })

    // Create notification for user
    await Notification.create({
      user_id: userId,
      title: 'Password Reset',
      content: `Your password has been reset by an administrator. Your new temporary password is: ${tempPassword}. Please change it after logging in.`,
      notification_type: 'system'
    })

    res.json({
      message: 'Password reset successfully',
      tempPassword
    })

  } catch (error) {
    console.error('Error resetting user password:', error)
    res.status(500).json({ message: 'Failed to reset user password' })
  }
}

const bulkUpdateUsers = async (req, res) => {
  try {
    const { userIds, action, data } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Invalid user IDs' })
    }

    let updateData = {}
    let notificationTitle = ''
    let notificationContent = ''

    switch (action) {
      case 'activate':
        updateData = { is_active: true }
        notificationTitle = 'Account Activated'
        notificationContent = 'Your account has been activated by an administrator.'
        break
      case 'deactivate':
        updateData = { is_active: false }
        notificationTitle = 'Account Deactivated'
        notificationContent = 'Your account has been deactivated by an administrator.'
        break
      case 'verify':
        updateData = { is_verified: true }
        notificationTitle = 'Account Verified'
        notificationContent = 'Your account has been verified by an administrator.'
        break
      case 'unverify':
        updateData = { is_verified: false }
        notificationTitle = 'Verification Removed'
        notificationContent = 'Your account verification has been removed by an administrator.'
        break
      case 'premium':
        updateData = { is_premium: true }
        notificationTitle = 'Premium Access Granted'
        notificationContent = 'You have been granted premium access by an administrator.'
        break
      case 'unpremium':
        updateData = { is_premium: false }
        notificationTitle = 'Premium Access Removed'
        notificationContent = 'Your premium access has been removed by an administrator.'
        break
      default:
        return res.status(400).json({ message: 'Invalid action' })
    }

    // Update users
    await User.update(updateData, {
      where: { id: { [Op.in]: userIds } }
    })

    // Create notifications for all affected users
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title: notificationTitle,
      content: notificationContent,
      notification_type: 'system'
    }))

    await Notification.bulkCreate(notifications)

    res.json({
      message: `Successfully updated ${userIds.length} users`,
      affectedUsers: userIds.length
    })

  } catch (error) {
    console.error('Error bulk updating users:', error)
    res.status(500).json({ message: 'Failed to bulk update users' })
  }
}

const exportUsers = async (req, res) => {
  try {
    const {
      format = 'csv',
      role,
      status,
      state,
      affiliation,
      searchTerm,
      dateFrom,
      dateTo
    } = req.query

    const where = {}
    const profileWhere = {}

    // Apply the same filters as getUsers
    if (role && role !== '') {
      where.role = role
    }

    if (status === 'active') {
      where.is_active = true
    } else if (status === 'inactive') {
      where.is_active = false
    } else if (status === 'suspended') {
      where.is_active = false
      where.suspended = true
    }

    if (dateFrom && dateTo) {
      where.created_at = {
        [Op.between]: [new Date(dateFrom), new Date(dateTo)]
      }
    }

    if (searchTerm) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    if (state && state !== '') {
      profileWhere.state_id = parseInt(state)
    }

    // Get users with their profile information for export
    const users = await User.findAll({
      where,
      include: [
        {
          model: Player,
          as: 'player',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            },
            {
              model: Club,
              as: 'club',
              required: false,
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Coach,
          as: 'coach',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Club,
          as: 'club',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: Partner,
          as: 'partner',
          required: false,
          where: Object.keys(profileWhere).length > 0 ? profileWhere : undefined,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: StateCommittee,
          as: 'stateCommittee',
          required: false,
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Format export data
    const exportData = users.map(user => {
      const profile = user.player || user.coach || user.club ||
                     user.partner || user.stateCommittee

      let affiliationStatus = 'pending'
      let affiliationExpiresAt = null

      if (profile) {
        if (profile.affiliation_expires_at) {
          const expiryDate = new Date(profile.affiliation_expires_at)
          const now = new Date()
          affiliationStatus = expiryDate > now ? 'active' : 'expired'
          affiliationExpiresAt = profile.affiliation_expires_at
        } else if (profile.premium_expires_at) {
          const expiryDate = new Date(profile.premium_expires_at)
          const now = new Date()
          affiliationStatus = expiryDate > now ? 'active' : 'expired'
          affiliationExpiresAt = profile.premium_expires_at
        }
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        status: user.is_active ? 'active' : 'inactive',
        is_verified: user.is_verified ? 'Yes' : 'No',
        is_premium: user.is_premium ? 'Yes' : 'No',
        created_at: user.created_at,
        last_login: user.last_login || '',
        affiliation_status: affiliationStatus,
        affiliation_expires_at: affiliationExpiresAt || '',
        full_name: profile ? (profile.full_name || profile.name || profile.business_name || '') : '',
        state_name: profile && profile.state ? profile.state.name : '',
        club_name: profile && profile.club ? profile.club.name : '',
        nrtp_level: profile && profile.nrtp_level || '',
        hourly_rate: profile && profile.hourly_rate || '',
        partner_type: profile && profile.partner_type || ''
      }
    })

    if (format === 'csv') {
      const csvHeaders = [
        'ID', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Verified', 'Premium',
        'Created At', 'Last Login', 'Affiliation Status', 'Affiliation Expires',
        'Full Name', 'State', 'Club', 'NRTP Level', 'Hourly Rate', 'Partner Type'
      ]

      const csvRows = exportData.map(user => [
        user.id,
        user.username,
        user.email,
        user.phone,
        user.role,
        user.status,
        user.is_verified,
        user.is_premium,
        user.created_at,
        user.last_login,
        user.affiliation_status,
        user.affiliation_expires_at,
        user.full_name,
        user.state_name,
        user.club_name,
        user.nrtp_level,
        user.hourly_rate,
        user.partner_type
      ])

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.map(field => `"${field}"`).join(','))].join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csvContent)
    } else if (format === 'excel') {
      // For Excel format, we'll use a library like exceljs
      const ExcelJS = require('exceljs')
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Users')

      // Add headers
      worksheet.addRow([
        'ID', 'Username', 'Email', 'Phone', 'Role', 'Status', 'Verified', 'Premium',
        'Created At', 'Last Login', 'Affiliation Status', 'Affiliation Expires',
        'Full Name', 'State', 'Club', 'NRTP Level', 'Hourly Rate', 'Partner Type'
      ])

      // Add data rows
      exportData.forEach(user => {
        worksheet.addRow([
          user.id,
          user.username,
          user.email,
          user.phone,
          user.role,
          user.status,
          user.is_verified,
          user.is_premium,
          user.created_at,
          user.last_login,
          user.affiliation_status,
          user.affiliation_expires_at,
          user.full_name,
          user.state_name,
          user.club_name,
          user.nrtp_level,
          user.hourly_rate,
          user.partner_type
        ])
      })

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.xlsx"`)

      await workbook.xlsx.write(res)
      res.end()
    } else if (format === 'pdf') {
      // For PDF format, we'll use a library like pdfkit
      const PDFDocument = require('pdfkit')
      const doc = new PDFDocument()

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.pdf"`)

      doc.pipe(res)

      // Title
      doc.fontSize(16).text('User Management Report', { align: 'center' })
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
      doc.moveDown()

      // Table headers (simplified for PDF)
      doc.fontSize(10)
      const tableTop = doc.y
      doc.text('Username', 50, tableTop)
      doc.text('Email', 150, tableTop)
      doc.text('Role', 280, tableTop)
      doc.text('Status', 350, tableTop)
      doc.text('Created', 420, tableTop)

      let yPosition = tableTop + 20

      exportData.forEach(user => {
        if (yPosition > 700) { // Start new page if needed
          doc.addPage()
          yPosition = 50
        }

        doc.text(user.username, 50, yPosition)
        doc.text(user.email, 150, yPosition)
        doc.text(user.role, 280, yPosition)
        doc.text(user.status, 350, yPosition)
        doc.text(new Date(user.created_at).toLocaleDateString(), 420, yPosition)
        yPosition += 15
      })

      doc.end()
    } else {
      return res.status(400).json({ message: 'Unsupported export format' })
    }

  } catch (error) {
    console.error('Error exporting users:', error)
    res.status(500).json({ message: 'Failed to export users' })
  }
}

const sendUserNotification = async (req, res) => {
  try {
    const { userIds, subject, message } = req.body

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Invalid user IDs' })
    }

    // Create notifications for all specified users
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title: subject,
      content: message,
      notification_type: 'announcement'
    }))

    await Notification.bulkCreate(notifications)

    res.json({
      message: `Notification sent to ${userIds.length} users`,
      recipients: userIds.length
    })

  } catch (error) {
    console.error('Error sending user notification:', error)
    res.status(500).json({ message: 'Failed to send notification' })
  }
}

const getStates = async (req, res) => {
  try {
    const states = await State.findAll({
      attributes: ['id', 'name', 'short_code'],
      order: [['name', 'ASC']]
    })

    res.json(states)
  } catch (error) {
    console.error('Error fetching states:', error)
    res.status(500).json({ message: 'Failed to fetch states' })
  }
}

module.exports = {
  getUsers,
  getUserDetails,
  updateUserStatus,
  updateUserVerification,
  updateUserPremium,
  resetUserPassword,
  bulkUpdateUsers,
  exportUsers,
  sendUserNotification,
  getStates
}