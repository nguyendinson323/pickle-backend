const { 
  Tournament,
  TournamentCategory,
  TournamentRegistration,
  Player, 
  User, 
  State,
  Club,
  Partner,
  StateCommittee
} = require('../db/models')
const { Op } = require('sequelize')
const { sequelize } = require('../db/models')

// POST /api/tournament-browse/search - Search tournaments based on filters
const searchTournaments = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null
    const {
      state_id,
      status,
      tournament_type,
      organizer_type,
      start_date_from,
      start_date_to,
      entry_fee_max,
      is_ranking,
      has_available_spots
    } = req.body

    // Build where conditions
    const whereConditions = {}

    if (state_id) {
      whereConditions.state_id = state_id
    }

    if (status) {
      whereConditions.status = status
    } else {
      // Default to upcoming tournaments
      whereConditions.status = { [Op.in]: ['upcoming', 'ongoing'] }
    }

    if (tournament_type) {
      whereConditions.tournament_type = tournament_type
    }

    if (organizer_type) {
      whereConditions.organizer_type = organizer_type
    }

    if (start_date_from || start_date_to) {
      whereConditions.start_date = {}
      if (start_date_from) whereConditions.start_date[Op.gte] = start_date_from
      if (start_date_to) whereConditions.start_date[Op.lte] = start_date_to
    }

    if (entry_fee_max) {
      whereConditions.entry_fee = { [Op.lte]: entry_fee_max }
    }

    if (is_ranking !== null && is_ranking !== undefined) {
      whereConditions.is_ranking = is_ranking
    }

    const tournaments = await Tournament.findAll({
      where: whereConditions,
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        },
        {
          model: TournamentCategory,
          as: 'categories',
          attributes: ['id', 'tournament_id', 'name', 'min_age', 'max_age', 'gender', 'min_skill_level', 'max_skill_level', 'format', 'max_participants']
        }
      ],
      order: [['start_date', 'ASC']]
    })

    // Get current player if authenticated
    let currentPlayer = null
    if (currentUserId) {
      currentPlayer = await Player.findOne({
        where: { user_id: currentUserId }
      })
    }

    // Add additional data for each tournament
    const tournamentsWithData = await Promise.all(tournaments.map(async (tournament) => {
      const tournamentData = tournament.toJSON()

      // Get total participants count
      const totalParticipants = await TournamentRegistration.count({
        where: { 
          tournament_id: tournament.id,
          status: { [Op.in]: ['registered', 'confirmed'] }
        }
      })

      // Calculate available spots
      let availableSpots = null
      if (tournament.max_participants) {
        availableSpots = tournament.max_participants - totalParticipants
      }

      // Check if current user is registered
      let isRegistered = false
      let userRegistrations = []
      if (currentPlayer) {
        userRegistrations = await TournamentRegistration.findAll({
          where: {
            tournament_id: tournament.id,
            player_id: currentPlayer.id,
            status: { [Op.in]: ['registered', 'confirmed'] }
          },
          include: [
            {
              model: TournamentCategory,
              as: 'category',
              attributes: ['id', 'name', 'gender', 'min_skill_level', 'max_skill_level']
            }
          ]
        })
        isRegistered = userRegistrations.length > 0
      }

      // Add participants count to each category
      const categoriesWithData = await Promise.all(tournamentData.categories.map(async (category) => {
        const participantsCount = await TournamentRegistration.count({
          where: {
            category_id: category.id,
            status: { [Op.in]: ['registered', 'confirmed'] }
          }
        })

        let categoryAvailableSpots = null
        if (category.max_participants) {
          categoryAvailableSpots = category.max_participants - participantsCount
        }

        return {
          ...category,
          participantsCount,
          availableSpots: categoryAvailableSpots
        }
      }))

      return {
        ...tournamentData,
        totalParticipants,
        availableSpots,
        isRegistered,
        userRegistrations,
        categories: categoriesWithData
      }
    }))

    // Filter by available spots if requested
    let filteredTournaments = tournamentsWithData
    if (has_available_spots) {
      filteredTournaments = tournamentsWithData.filter(tournament => 
        !tournament.max_participants || tournament.availableSpots > 0
      )
    }

    res.status(200).json(filteredTournaments)
  } catch (error) {
    console.error('Error searching tournaments:', error)
    res.status(500).json({ message: 'Failed to search tournaments' })
  }
}

// GET /api/tournament-browse/tournaments/:id - Get tournament details
const getTournamentDetails = async (req, res) => {
  try {
    const tournamentId = req.params.id
    const currentUserId = req.user ? req.user.id : null

    const tournament = await Tournament.findByPk(tournamentId, {
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        },
        {
          model: TournamentCategory,
          as: 'categories',
          attributes: ['id', 'tournament_id', 'name', 'min_age', 'max_age', 'gender', 'min_skill_level', 'max_skill_level', 'format', 'max_participants']
        }
      ]
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    // Get organizer information based on type
    let organizer = null
    switch (tournament.organizer_type) {
      case 'club':
        organizer = await Club.findByPk(tournament.organizer_id, {
          attributes: ['id', 'name', 'logo_url']
        })
        break
      case 'partner':
        organizer = await Partner.findByPk(tournament.organizer_id, {
          attributes: ['id', 'business_name']
        })
        if (organizer) {
          organizer.name = organizer.business_name
        }
        break
      case 'state':
        organizer = await StateCommittee.findByPk(tournament.organizer_id, {
          attributes: ['id', 'state_id'],
          include: [{
            model: State,
            as: 'state',
            attributes: ['name']
          }]
        })
        if (organizer) {
          organizer.name = `${organizer.state.name} State Committee`
        }
        break
      default:
        organizer = { name: 'Mexican Pickleball Federation', type: 'federation' }
    }

    // Get current player if authenticated
    let currentPlayer = null
    if (currentUserId) {
      currentPlayer = await Player.findOne({
        where: { user_id: currentUserId }
      })
    }

    // Get total participants count
    const totalParticipants = await TournamentRegistration.count({
      where: { 
        tournament_id: tournament.id,
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    })

    // Calculate available spots
    let availableSpots = null
    if (tournament.max_participants) {
      availableSpots = tournament.max_participants - totalParticipants
    }

    // Check if current user is registered
    let isRegistered = false
    let userRegistrations = []
    if (currentPlayer) {
      userRegistrations = await TournamentRegistration.findAll({
        where: {
          tournament_id: tournament.id,
          player_id: currentPlayer.id,
          status: { [Op.in]: ['registered', 'confirmed'] }
        },
        include: [
          {
            model: TournamentCategory,
            as: 'category',
            attributes: ['id', 'name', 'gender', 'min_skill_level', 'max_skill_level']
          },
          {
            model: Player,
            as: 'partnerPlayer',
            attributes: ['id', 'full_name', 'nrtp_level'],
            required: false
          }
        ]
      })
      isRegistered = userRegistrations.length > 0
    }

    // Add participants count to each category
    const categoriesWithData = await Promise.all(tournament.categories.map(async (category) => {
      const participantsCount = await TournamentRegistration.count({
        where: {
          category_id: category.id,
          status: { [Op.in]: ['registered', 'confirmed'] }
        }
      })

      let categoryAvailableSpots = null
      if (category.max_participants) {
        categoryAvailableSpots = category.max_participants - participantsCount
      }

      return {
        ...category.toJSON(),
        participantsCount,
        availableSpots: categoryAvailableSpots
      }
    }))

    const tournamentData = {
      ...tournament.toJSON(),
      organizer,
      totalParticipants,
      availableSpots,
      isRegistered,
      userRegistrations,
      categories: categoriesWithData
    }

    res.status(200).json(tournamentData)
  } catch (error) {
    console.error('Error fetching tournament details:', error)
    res.status(500).json({ message: 'Failed to fetch tournament details' })
  }
}

// GET /api/tournament-browse/registrations - Get user's tournament registrations
const getUserRegistrations = async (req, res) => {
  try {
    const currentUserId = req.user.id

    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    const registrations = await TournamentRegistration.findAll({
      where: { player_id: currentPlayer.id },
      include: [
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name', 'start_date', 'end_date', 'venue_name', 'status', 'banner_url'],
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['name']
            }
          ]
        },
        {
          model: TournamentCategory,
          as: 'category',
          attributes: ['id', 'name', 'gender', 'min_skill_level', 'max_skill_level', 'format']
        },
        {
          model: Player,
          as: 'partnerPlayer',
          attributes: ['id', 'full_name', 'nrtp_level'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })

    res.status(200).json(registrations)
  } catch (error) {
    console.error('Error fetching user registrations:', error)
    res.status(500).json({ message: 'Failed to fetch registrations' })
  }
}

// POST /api/tournament-browse/register - Register for a tournament
const registerForTournament = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const { tournament_id, category_id, partner_player_id } = req.body

    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Verify tournament and category exist
    const tournament = await Tournament.findByPk(tournament_id)
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    const category = await TournamentCategory.findByPk(category_id)
    if (!category) {
      return res.status(404).json({ message: 'Tournament category not found' })
    }

    // Check if tournament is open for registration
    const currentDate = new Date()
    const registrationStart = new Date(tournament.registration_start)
    const registrationEnd = new Date(tournament.registration_end)

    if (currentDate < registrationStart || currentDate > registrationEnd) {
      return res.status(400).json({ message: 'Tournament registration is not open' })
    }

    // Check if already registered for this tournament
    const existingRegistration = await TournamentRegistration.findOne({
      where: {
        tournament_id,
        player_id: currentPlayer.id,
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    })

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this tournament' })
    }

    // Verify partner if provided
    if (partner_player_id) {
      const partner = await Player.findByPk(partner_player_id)
      if (!partner) {
        return res.status(404).json({ message: 'Partner player not found' })
      }

      // Check if partner is already registered for this tournament
      const partnerRegistration = await TournamentRegistration.findOne({
        where: {
          tournament_id,
          player_id: partner_player_id,
          status: { [Op.in]: ['registered', 'confirmed'] }
        }
      })

      if (partnerRegistration) {
        return res.status(400).json({ message: 'Your partner is already registered for this tournament' })
      }
    }

    // Check category capacity
    if (category.max_participants) {
      const currentParticipants = await TournamentRegistration.count({
        where: {
          category_id,
          status: { [Op.in]: ['registered', 'confirmed'] }
        }
      })

      if (currentParticipants >= category.max_participants) {
        return res.status(400).json({ message: 'This tournament category is full' })
      }
    }

    // Create registration
    const registrationData = {
      tournament_id,
      category_id,
      player_id: currentPlayer.id,
      payment_status: tournament.entry_fee ? 'pending' : 'paid',
      amount_paid: tournament.entry_fee || 0,
      status: 'registered'
    }

    if (partner_player_id) {
      registrationData.partner_player_id = partner_player_id
    }

    const registration = await TournamentRegistration.create(registrationData)

    // Fetch the complete registration with associations
    const completeRegistration = await TournamentRegistration.findByPk(registration.id, {
      include: [
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name', 'start_date', 'end_date', 'venue_name', 'status', 'banner_url']
        },
        {
          model: TournamentCategory,
          as: 'category',
          attributes: ['id', 'name', 'gender', 'min_skill_level', 'max_skill_level', 'format']
        },
        {
          model: Player,
          as: 'partnerPlayer',
          attributes: ['id', 'full_name', 'nrtp_level'],
          required: false
        }
      ]
    })

    res.status(201).json(completeRegistration)
  } catch (error) {
    console.error('Error registering for tournament:', error)
    res.status(500).json({ message: 'Failed to register for tournament' })
  }
}

// PUT /api/tournament-browse/registrations/:id/withdraw - Withdraw from tournament
const withdrawFromTournament = async (req, res) => {
  try {
    const registrationId = req.params.id
    const currentUserId = req.user.id

    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    const registration = await TournamentRegistration.findByPk(registrationId)
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' })
    }

    // Verify ownership
    if (registration.player_id !== currentPlayer.id) {
      return res.status(403).json({ message: 'Not authorized to withdraw this registration' })
    }

    // Check if withdrawal is allowed
    const tournament = await Tournament.findByPk(registration.tournament_id)
    const withdrawalDeadline = new Date(tournament.start_date)
    withdrawalDeadline.setDate(withdrawalDeadline.getDate() - 1) // 1 day before tournament

    if (new Date() > withdrawalDeadline) {
      return res.status(400).json({ message: 'Withdrawal deadline has passed' })
    }

    // Update registration status
    await registration.update({
      status: 'withdrawn'
    })

    // Fetch the complete registration with associations
    const completeRegistration = await TournamentRegistration.findByPk(registration.id, {
      include: [
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name', 'start_date', 'end_date', 'venue_name', 'status', 'banner_url']
        },
        {
          model: TournamentCategory,
          as: 'category',
          attributes: ['id', 'name', 'gender', 'min_skill_level', 'max_skill_level', 'format']
        },
        {
          model: Player,
          as: 'partnerPlayer',
          attributes: ['id', 'full_name', 'nrtp_level'],
          required: false
        }
      ]
    })

    res.status(200).json(completeRegistration)
  } catch (error) {
    console.error('Error withdrawing from tournament:', error)
    res.status(500).json({ message: 'Failed to withdraw from tournament' })
  }
}

module.exports = {
  searchTournaments,
  getTournamentDetails,
  getUserRegistrations,
  registerForTournament,
  withdrawFromTournament
}