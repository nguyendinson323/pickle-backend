const { StateCommittee, User, State, Tournament, TournamentCategory, TournamentRegistration, Court, CourtSchedule, CourtReservation, Club, Partner, Player } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get all state management data
const getStateManagementData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    const stateId = stateCommittee.state_id

    // Get tournaments organized by state or in the state
    const tournaments = await Tournament.findAll({
      where: {
        [Op.or]: [
          {
            organizer_type: 'state',
            organizer_id: stateCommittee.id
          },
          {
            state_id: stateId
          }
        ]
      },
      include: [
        {
          model: TournamentCategory,
          as: 'categories',
          include: [
            {
              model: TournamentRegistration,
              as: 'registrations',
              required: false
            }
          ]
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Calculate tournament data with stats
    const tournamentsWithStats = tournaments.map(tournament => {
      const tournamentData = tournament.toJSON()
      
      let totalRegistrations = 0
      let totalRevenue = 0
      
      if (tournamentData.categories) {
        tournamentData.categories.forEach(category => {
          const registrationCount = category.registrations ? category.registrations.length : 0
          category.registration_count = registrationCount
          totalRegistrations += registrationCount
          
          if (category.registrations) {
            category.registrations.forEach(registration => {
              if (registration.payment_status === 'paid') {
                totalRevenue += parseFloat(registration.amount_paid || 0)
              }
            })
          }
        })
      }
      
      tournamentData.registration_count = totalRegistrations
      tournamentData.revenue = totalRevenue
      
      return tournamentData
    })

    // Get courts in the state
    const courts = await Court.findAll({
      where: { state_id: stateId },
      include: [
        {
          model: CourtSchedule,
          as: 'schedules',
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Enhance courts with owner information and reservation count
    const courtsWithDetails = await Promise.all(courts.map(async (court) => {
      const courtData = court.toJSON()
      
      // Get owner information
      let owner = null
      if (court.owner_type === 'club') {
        const club = await Club.findByPk(court.owner_id, {
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'phone']
            }
          ]
        })
        if (club) {
          owner = {
            id: club.id,
            name: club.name,
            type: 'club',
            contact_email: club.user?.email,
            phone: club.user?.phone
          }
        }
      } else if (court.owner_type === 'partner') {
        const partner = await Partner.findByPk(court.owner_id, {
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'phone']
            }
          ]
        })
        if (partner) {
          owner = {
            id: partner.id,
            name: partner.business_name,
            type: 'partner',
            contact_email: partner.user?.email,
            phone: partner.user?.phone
          }
        }
      }

      // Get reservation count
      const reservationsCount = await CourtReservation.count({
        where: { 
          court_id: court.id,
          date: {
            [Op.gte]: new Date()
          }
        }
      })

      return {
        ...courtData,
        owner,
        reservations_count: reservationsCount
      }
    }))

    // Get clubs in the state
    const clubs = await Club.findAll({
      where: { state_id: stateId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Enhance clubs with statistics
    const clubsWithStats = await Promise.all(clubs.map(async (club) => {
      const clubData = club.toJSON()
      
      const membersCount = await Player.count({
        where: { club_id: club.id }
      })

      const courtsCount = await Court.count({
        where: { 
          owner_type: 'club',
          owner_id: club.id
        }
      })

      const tournamentsCount = await Tournament.count({
        where: {
          organizer_type: 'club',
          organizer_id: club.id
        }
      })

      return {
        ...clubData,
        members_count: membersCount,
        courts_count: courtsCount,
        tournaments_count: tournamentsCount
      }
    }))

    // Get partners in the state
    const partners = await Partner.findAll({
      where: { state_id: stateId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'phone']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Enhance partners with statistics
    const partnersWithStats = await Promise.all(partners.map(async (partner) => {
      const partnerData = partner.toJSON()
      
      const courtsCount = await Court.count({
        where: { 
          owner_type: 'partner',
          owner_id: partner.id
        }
      })

      const tournamentsCount = await Tournament.count({
        where: {
          organizer_type: 'partner',
          organizer_id: partner.id
        }
      })

      return {
        ...partnerData,
        courts_count: courtsCount,
        tournaments_count: tournamentsCount
      }
    }))

    // Calculate overall statistics
    const totalTournaments = tournaments.length
    const activeTournaments = tournaments.filter(t => t.status === 'upcoming' || t.status === 'ongoing').length
    const totalCourts = courts.length
    const activeCourts = courts.filter(c => c.status === 'active').length
    const totalClubs = clubs.length
    const activeClubs = clubs.filter(c => c.affiliation_expires_at && new Date(c.affiliation_expires_at) >= new Date()).length
    const totalPartners = partners.length
    const activePartners = partners.filter(p => p.premium_expires_at && new Date(p.premium_expires_at) >= new Date()).length

    // Calculate court utilization rate (simplified)
    const totalReservations = await CourtReservation.count({
      include: [
        {
          model: Court,
          as: 'court',
          where: { state_id: stateId },
          required: true
        }
      ],
      where: {
        date: {
          [Op.gte]: Sequelize.literal("DATE_TRUNC('month', CURRENT_DATE)")
        }
      }
    })
    
    const courtUtilizationRate = totalCourts > 0 ? Math.round((totalReservations / (totalCourts * 30)) * 100) : 0

    // Calculate tournament revenue
    let tournamentRevenue = 0
    tournamentsWithStats.forEach(tournament => {
      tournamentRevenue += tournament.revenue || 0
    })

    const stats = {
      total_tournaments: totalTournaments,
      active_tournaments: activeTournaments,
      total_courts: totalCourts,
      active_courts: activeCourts,
      total_clubs: totalClubs,
      active_clubs: activeClubs,
      total_partners: totalPartners,
      active_partners: activePartners,
      court_utilization_rate: courtUtilizationRate,
      tournament_revenue: tournamentRevenue
    }

    res.json({
      tournaments: tournamentsWithStats,
      courts: courtsWithDetails,
      clubs: clubsWithStats,
      partners: partnersWithStats,
      stats
    })

  } catch (error) {
    console.error('Error fetching state management data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create state tournament
const createStateTournament = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      name, description, tournament_type, venue_name, venue_address,
      start_date, end_date, registration_start, registration_end,
      entry_fee, max_participants, is_ranking, ranking_multiplier,
      banner_url, categories
    } = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Create tournament
    const tournament = await Tournament.create({
      name,
      description,
      tournament_type: tournament_type || 'State',
      organizer_type: 'state',
      organizer_id: stateCommittee.id,
      state_id: stateCommittee.state_id,
      venue_name,
      venue_address,
      start_date,
      end_date,
      registration_start,
      registration_end,
      entry_fee,
      max_participants,
      banner_url,
      is_ranking: is_ranking !== false,
      ranking_multiplier: ranking_multiplier || 1.0,
      status: 'upcoming'
    })

    // Create tournament categories
    if (categories && categories.length > 0) {
      for (const category of categories) {
        await TournamentCategory.create({
          tournament_id: tournament.id,
          name: category.name,
          min_age: category.min_age,
          max_age: category.max_age,
          gender: category.gender,
          min_skill_level: category.min_skill_level,
          max_skill_level: category.max_skill_level,
          format: category.format,
          max_participants: category.max_participants
        })
      }
    }

    // Fetch the created tournament with categories
    const createdTournament = await Tournament.findByPk(tournament.id, {
      include: [
        {
          model: TournamentCategory,
          as: 'categories'
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name']
        }
      ]
    })

    res.status(201).json({
      tournament: createdTournament,
      message: 'State tournament created successfully'
    })

  } catch (error) {
    console.error('Error creating state tournament:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update state tournament
const updateStateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const userId = req.user.id
    const updateData = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find tournament and verify ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'state',
        organizer_id: stateCommittee.id
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found or access denied' })
    }

    // Update tournament
    await tournament.update(updateData)

    // Fetch updated tournament with relations
    const updatedTournament = await Tournament.findByPk(tournament.id, {
      include: [
        {
          model: TournamentCategory,
          as: 'categories'
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name']
        }
      ]
    })

    res.json({
      tournament: updatedTournament,
      message: 'Tournament updated successfully'
    })

  } catch (error) {
    console.error('Error updating state tournament:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete state tournament
const deleteStateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const userId = req.user.id

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find tournament and verify ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'state',
        organizer_id: stateCommittee.id
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found or access denied' })
    }

    // Check if tournament has registrations
    const registrationCount = await TournamentRegistration.count({
      where: { tournament_id: tournamentId }
    })

    if (registrationCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete tournament with existing registrations. Cancel the tournament instead.' 
      })
    }

    await tournament.destroy()

    res.json({ message: 'Tournament deleted successfully' })

  } catch (error) {
    console.error('Error deleting state tournament:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update state tournament status
const updateStateTournamentStatus = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const { status } = req.body
    const userId = req.user.id

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find tournament and verify ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'state',
        organizer_id: stateCommittee.id
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found or access denied' })
    }

    await tournament.update({ status })

    res.json({ message: 'Tournament status updated successfully' })

  } catch (error) {
    console.error('Error updating tournament status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update court status (for monitoring purposes)
const updateCourtStatus = async (req, res) => {
  try {
    const { courtId } = req.params
    const { status, reason } = req.body
    const userId = req.user.id

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find court in the state
    const court = await Court.findOne({
      where: {
        id: courtId,
        state_id: stateCommittee.state_id
      }
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found in your state' })
    }

    await court.update({ status })

    res.json({ message: 'Court status updated successfully' })

  } catch (error) {
    console.error('Error updating court status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getStateManagementData,
  createStateTournament,
  updateStateTournament,
  deleteStateTournament,
  updateStateTournamentStatus,
  updateCourtStatus
}