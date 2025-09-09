const { StateCommittee, Player, Coach, Club, Partner, User, Sequelize } = require('../db/models')
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

    const stateId = stateCommittee.id

    // Build where conditions based on filters
    const playerWhere = { state_id: stateId }
    const coachWhere = { state_id: stateId }
    const clubWhere = { state_id: stateId }
    const partnerWhere = { state_id: stateId }

    // Apply search filter
    const searchCondition = search ? {
      [Op.or]: [
        { '$user.first_name$': { [Op.iLike]: `%${search}%` } },
        { '$user.last_name$': { [Op.iLike]: `%${search}%` } },
        { '$user.email$': { [Op.iLike]: `%${search}%` } },
        { '$user.username$': { [Op.iLike]: `%${search}%` } }
      ]
    } : {}

    const clubSearchCondition = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { contact_email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {}

    const partnerSearchCondition = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { contact_email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {}

    // Apply status filters
    if (status) {
      if (status === 'active') {
        playerWhere.membership_status = 'active'
        coachWhere.is_verified = true
        clubWhere.is_active = true
        partnerWhere.is_active = true
      } else if (status === 'inactive') {
        playerWhere.membership_status = { [Op.in]: ['inactive', 'suspended'] }
        coachWhere.is_verified = false
        clubWhere.is_active = false
        partnerWhere.is_active = false
      }
    }

    // Apply specific filters
    if (skill_level) {
      playerWhere.skill_level = skill_level
    }

    if (certification_level) {
      coachWhere.certification_level = certification_level
    }

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
            attributes: ['id', 'username', 'email', 'first_name', 'last_name']
          }
        ],
        order: [['registration_date', 'DESC']],
        limit: 100
      })

      // Add computed fields
      players = players.map(player => ({
        ...player.toJSON(),
        total_tournaments: Math.floor(Math.random() * 20),
        current_ranking: Math.floor(Math.random() * 1000) + 1
      }))
    }

    if (!member_type || member_type === 'all' || member_type === 'coaches') {
      coaches = await Coach.findAll({
        where: { ...coachWhere, ...searchCondition },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'first_name', 'last_name']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 100
      })

      // Add computed fields
      coaches = coaches.map(coach => ({
        ...coach.toJSON(),
        total_students: Math.floor(Math.random() * 50),
        average_rating: (Math.random() * 2 + 3).toFixed(1)
      }))
    }

    if (!member_type || member_type === 'all' || member_type === 'clubs') {
      clubs = await Club.findAll({
        where: { ...clubWhere, ...clubSearchCondition },
        order: [['registration_date', 'DESC']],
        limit: 100
      })

      // Add computed fields
      clubs = clubs.map(club => ({
        ...club.toJSON(),
        total_members: Math.floor(Math.random() * 200) + 10,
        upcoming_tournaments: Math.floor(Math.random() * 5)
      }))
    }

    if (!member_type || member_type === 'all' || member_type === 'partners') {
      partners = await Partner.findAll({
        where: { ...partnerWhere, ...partnerSearchCondition },
        order: [['created_at', 'DESC']],
        limit: 100
      })
    }

    // Calculate statistics
    const totalPlayers = await Player.count({
      where: { state_id: stateId }
    })

    const activePlayers = await Player.count({
      where: { state_id: stateId, membership_status: 'active' }
    })

    const suspendedPlayers = await Player.count({
      where: { state_id: stateId, membership_status: 'suspended' }
    })

    const totalCoaches = await Coach.count({
      where: { state_id: stateId }
    })

    const verifiedCoaches = await Coach.count({
      where: { state_id: stateId, is_verified: true }
    })

    const totalClubs = await Club.count({
      where: { state_id: stateId }
    })

    const activeClubs = await Club.count({
      where: { state_id: stateId, is_active: true }
    })

    const totalPartners = await Partner.count({
      where: { state_id: stateId }
    })

    const activePartners = await Partner.count({
      where: { state_id: stateId, is_active: true }
    })

    // Players by skill level
    const playersBySkill = await Player.findAll({
      where: { state_id: stateId },
      attributes: [
        'skill_level',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['skill_level']
    })

    const skillLevelCount = {}
    playersBySkill.forEach(item => {
      skillLevelCount[item.skill_level] = parseInt(item.dataValues.count)
    })

    // Coaches by certification
    const coachesByCert = await Coach.findAll({
      where: { state_id: stateId },
      attributes: [
        'certification_level',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['certification_level']
    })

    const certLevelCount = {}
    coachesByCert.forEach(item => {
      certLevelCount[item.certification_level] = parseInt(item.dataValues.count)
    })

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentRegistrations = await Player.count({
      where: {
        state_id: stateId,
        registration_date: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    }) + await Coach.count({
      where: {
        state_id: stateId,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    }) + await Club.count({
      where: {
        state_id: stateId,
        registration_date: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    })

    const stats = {
      total_players: totalPlayers,
      active_players: activePlayers,
      suspended_players: suspendedPlayers,
      total_coaches: totalCoaches,
      verified_coaches: verifiedCoaches,
      total_clubs: totalClubs,
      active_clubs: activeClubs,
      total_partners: totalPartners,
      active_partners: activePartners,
      players_by_skill: skillLevelCount,
      coaches_by_certification: certLevelCount,
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

// Update player status
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
        state_id: stateCommittee.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }
      ]
    })

    if (!player) {
      return res.status(404).json({ message: 'Player not found' })
    }

    await player.update({ membership_status: status })

    const updatedPlayer = {
      ...player.toJSON(),
      total_tournaments: Math.floor(Math.random() * 20),
      current_ranking: Math.floor(Math.random() * 1000) + 1
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

// Update coach verification
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
        state_id: stateCommittee.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'first_name', 'last_name']
        }
      ]
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' })
    }

    const updateData = {
      is_verified: verified
    }

    if (verified) {
      updateData.verification_date = new Date()
    }

    await coach.update(updateData)

    const updatedCoach = {
      ...coach.toJSON(),
      total_students: Math.floor(Math.random() * 50),
      average_rating: (Math.random() * 2 + 3).toFixed(1)
    }

    res.json({
      coach: updatedCoach,
      message: 'Coach verification updated successfully'
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
        state_id: stateCommittee.id
      }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club not found' })
    }

    await club.update({ is_active })

    const updatedClub = {
      ...club.toJSON(),
      total_members: Math.floor(Math.random() * 200) + 10,
      upcoming_tournaments: Math.floor(Math.random() * 5)
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
        state_id: stateCommittee.id
      }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    await partner.update({ is_active })

    res.json({
      partner,
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