const { StateCommittee, Player, Coach, Club, Partner, User, State, Sequelize } = require('../db/models')
const { Op } = require('sequelize')

// Get comprehensive state member management data
const getStateMemberData = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      member_type,
      status,
      search,
      skill_level,
      certification_level
    } = req.query
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    const stateId = stateCommittee.state_id

    // Build where conditions based on filters
    const playerWhere = { state_id: stateId }
    const coachWhere = { state_id: stateId }
    const clubWhere = { state_id: stateId }
    const partnerWhere = { state_id: stateId }

    // Apply search filter
    const searchCondition = search ? {
      [Op.or]: [
        { '$user.email$': { [Op.iLike]: `%${search}%` } },
        { '$user.username$': { [Op.iLike]: `%${search}%` } },
        { full_name: { [Op.iLike]: `%${search}%` } }
      ]
    } : {}

    const clubSearchCondition = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } }
      ]
    } : {}

    const partnerSearchCondition = search ? {
      [Op.or]: [
        { business_name: { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } }
      ]
    } : {}

    // Apply status filters based on available fields
    if (status) {
      if (status === 'active') {
        // Players with unexpired affiliations
        playerWhere.affiliation_expires_at = { [Op.or]: [null, { [Op.gte]: new Date() }] }
        // No specific status field for coaches
        // No specific status field for clubs/partners - use premium/affiliation status
      } else if (status === 'inactive') {
        // Players with expired affiliations
        playerWhere.affiliation_expires_at = { [Op.lt]: new Date() }
      }
    }

    // Apply specific filters
    if (skill_level) {
      playerWhere.nrtp_level = skill_level
    }

    // No certification_level field in actual schema, skip this filter

    // Fetch data based on member_type filter or get all
    let players = []
    let coaches = []
    let clubs = []
    let partners = []

    if (!member_type || member_type === 'all' || member_type === 'players') {
      players = await Player.findAll({
        where: { ...playerWhere, ...searchCondition },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone']
          },
          {
            model: State,
            as: 'state',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 100
      })

      // Add computed fields based on actual schema
      players = players.map(player => ({
        ...player.toJSON(),
        membership_status: player.affiliation_expires_at && new Date(player.affiliation_expires_at) >= new Date() ? 'active' : 'inactive',
        age: new Date().getFullYear() - new Date(player.birth_date).getFullYear()
      }))
    }

    if (!member_type || member_type === 'all' || member_type === 'coaches') {
      coaches = await Coach.findAll({
        where: { ...coachWhere, ...searchCondition },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone']
          },
          {
            model: State,
            as: 'state',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 100
      })

      // Add computed fields based on actual schema
      coaches = coaches.map(coach => ({
        ...coach.toJSON(),
        membership_status: coach.affiliation_expires_at && new Date(coach.affiliation_expires_at) >= new Date() ? 'active' : 'inactive',
        age: new Date().getFullYear() - new Date(coach.birth_date).getFullYear()
      }))
    }

    if (!member_type || member_type === 'all' || member_type === 'clubs') {
      clubs = await Club.findAll({
        where: { ...clubWhere, ...clubSearchCondition },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone']
          },
          {
            model: State,
            as: 'state',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 100
      })

      // Add computed fields based on actual schema
      clubs = clubs.map(club => ({
        ...club.toJSON(),
        membership_status: club.affiliation_expires_at && new Date(club.affiliation_expires_at) >= new Date() ? 'active' : 'inactive'
      }))
    }

    if (!member_type || member_type === 'all' || member_type === 'partners') {
      partners = await Partner.findAll({
        where: { ...partnerWhere, ...partnerSearchCondition },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone']
          },
          {
            model: State,
            as: 'state',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 100
      })

      // Add computed fields based on actual schema
      partners = partners.map(partner => ({
        ...partner.toJSON(),
        membership_status: partner.premium_expires_at && new Date(partner.premium_expires_at) >= new Date() ? 'active' : 'inactive'
      }))
    }

    // Calculate statistics
    const totalPlayers = await Player.count({
      where: { state_id: stateId }
    })

    const activePlayers = await Player.count({
      where: { 
        state_id: stateId,
        affiliation_expires_at: { [Op.or]: [null, { [Op.gte]: new Date() }] }
      }
    })

    const inactivePlayers = await Player.count({
      where: { 
        state_id: stateId,
        affiliation_expires_at: { [Op.lt]: new Date() }
      }
    })

    const totalCoaches = await Coach.count({
      where: { state_id: stateId }
    })

    const activeCoaches = await Coach.count({
      where: { 
        state_id: stateId,
        affiliation_expires_at: { [Op.or]: [null, { [Op.gte]: new Date() }] }
      }
    })

    const totalClubs = await Club.count({
      where: { state_id: stateId }
    })

    const activeClubs = await Club.count({
      where: { 
        state_id: stateId,
        affiliation_expires_at: { [Op.or]: [null, { [Op.gte]: new Date() }] }
      }
    })

    const totalPartners = await Partner.count({
      where: { state_id: stateId }
    })

    const activePartners = await Partner.count({
      where: { 
        state_id: stateId,
        premium_expires_at: { [Op.or]: [null, { [Op.gte]: new Date() }] }
      }
    })

    // Players by NRTP skill level
    const playersBySkill = await Player.findAll({
      where: { state_id: stateId, nrtp_level: { [Op.not]: null } },
      attributes: [
        'nrtp_level',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['nrtp_level']
    })

    const skillLevelCount = {}
    playersBySkill.forEach(item => {
      skillLevelCount[item.nrtp_level] = parseInt(item.dataValues.count)
    })

    // Coaches by NRTP level (no specific certification field in schema)
    const coachesByLevel = await Coach.findAll({
      where: { state_id: stateId, nrtp_level: { [Op.not]: null } },
      attributes: [
        'nrtp_level',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['nrtp_level']
    })

    const coachLevelCount = {}
    coachesByLevel.forEach(item => {
      coachLevelCount[item.nrtp_level] = parseInt(item.dataValues.count)
    })

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentPlayerRegistrations = await Player.count({
      where: {
        state_id: stateId,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    })

    const recentCoachRegistrations = await Coach.count({
      where: {
        state_id: stateId,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    })

    const recentClubRegistrations = await Club.count({
      where: {
        state_id: stateId,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    })

    const recentRegistrations = recentPlayerRegistrations + recentCoachRegistrations + recentClubRegistrations

    const stats = {
      total_players: totalPlayers,
      active_players: activePlayers,
      inactive_players: inactivePlayers,
      total_coaches: totalCoaches,
      active_coaches: activeCoaches,
      total_clubs: totalClubs,
      active_clubs: activeClubs,
      total_partners: totalPartners,
      active_partners: activePartners,
      players_by_skill: skillLevelCount,
      coaches_by_level: coachLevelCount,
      recent_registrations: recentRegistrations
    }

    res.json({
      players,
      coaches,
      clubs,
      partners,
      stats
    })

  } catch (error) {
    console.error('Error fetching state member data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update player status (actually updates affiliation expiry)
const updatePlayerStatus = async (req, res) => {
  try {
    const { playerId } = req.params
    const { status } = req.body
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and update player
    const player = await Player.findOne({
      where: {
        id: playerId,
        state_id: stateCommittee.state_id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        },
        {
          model: State,
          as: 'state',
          attributes: ['name']
        }
      ]
    })

    if (!player) {
      return res.status(404).json({ message: 'Player not found' })
    }

    // Map status to affiliation expiry date
    let affiliationExpiresAt
    if (status === 'active') {
      affiliationExpiresAt = new Date()
      affiliationExpiresAt.setFullYear(affiliationExpiresAt.getFullYear() + 1)
    } else {
      affiliationExpiresAt = new Date('2020-01-01') // Past date for inactive
    }

    await player.update({ affiliation_expires_at: affiliationExpiresAt })

    const updatedPlayer = {
      ...player.toJSON(),
      membership_status: status,
      age: new Date().getFullYear() - new Date(player.birth_date).getFullYear()
    }

    res.json({
      player: updatedPlayer,
      message: 'Player status updated successfully'
    })

  } catch (error) {
    console.error('Error updating player status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update coach verification (actually updates affiliation)
const updateCoachVerification = async (req, res) => {
  try {
    const { coachId } = req.params
    const { verified } = req.body
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and update coach
    const coach = await Coach.findOne({
      where: {
        id: coachId,
        state_id: stateCommittee.state_id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        },
        {
          model: State,
          as: 'state',
          attributes: ['name']
        }
      ]
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' })
    }

    // Map verification to affiliation expiry date
    let affiliationExpiresAt
    if (verified) {
      affiliationExpiresAt = new Date()
      affiliationExpiresAt.setFullYear(affiliationExpiresAt.getFullYear() + 1)
    } else {
      affiliationExpiresAt = new Date('2020-01-01') // Past date for inactive
    }

    await coach.update({ affiliation_expires_at: affiliationExpiresAt })

    const updatedCoach = {
      ...coach.toJSON(),
      membership_status: verified ? 'active' : 'inactive',
      age: new Date().getFullYear() - new Date(coach.birth_date).getFullYear()
    }

    res.json({
      coach: updatedCoach,
      message: 'Coach status updated successfully'
    })

  } catch (error) {
    console.error('Error updating coach verification:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update club status
const updateClubStatus = async (req, res) => {
  try {
    const { clubId } = req.params
    const { is_active } = req.body
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and update club
    const club = await Club.findOne({
      where: {
        id: clubId,
        state_id: stateCommittee.state_id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        },
        {
          model: State,
          as: 'state',
          attributes: ['name']
        }
      ]
    })

    if (!club) {
      return res.status(404).json({ message: 'Club not found' })
    }

    // Map status to affiliation expiry date
    let affiliationExpiresAt
    if (is_active) {
      affiliationExpiresAt = new Date()
      affiliationExpiresAt.setFullYear(affiliationExpiresAt.getFullYear() + 1)
    } else {
      affiliationExpiresAt = new Date('2020-01-01') // Past date for inactive
    }

    await club.update({ affiliation_expires_at: affiliationExpiresAt })

    const updatedClub = {
      ...club.toJSON(),
      membership_status: is_active ? 'active' : 'inactive'
    }

    res.json({
      club: updatedClub,
      message: 'Club status updated successfully'
    })

  } catch (error) {
    console.error('Error updating club status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update partner status
const updatePartnerStatus = async (req, res) => {
  try {
    const { partnerId } = req.params
    const { is_active } = req.body
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and update partner
    const partner = await Partner.findOne({
      where: {
        id: partnerId,
        state_id: stateCommittee.state_id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone']
        },
        {
          model: State,
          as: 'state',
          attributes: ['name']
        }
      ]
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    // Map status to premium expiry date
    let premiumExpiresAt
    if (is_active) {
      premiumExpiresAt = new Date()
      premiumExpiresAt.setFullYear(premiumExpiresAt.getFullYear() + 1)
    } else {
      premiumExpiresAt = new Date('2020-01-01') // Past date for inactive
    }

    await partner.update({ premium_expires_at: premiumExpiresAt })

    const updatedPartner = {
      ...partner.toJSON(),
      membership_status: is_active ? 'active' : 'inactive'
    }

    res.json({
      partner: updatedPartner,
      message: 'Partner status updated successfully'
    })

  } catch (error) {
    console.error('Error updating partner status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getStateMemberData,
  updatePlayerStatus,
  updateCoachVerification,
  updateClubStatus,
  updatePartnerStatus
}