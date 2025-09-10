const { Tournament, TournamentCategory, TournamentRegistration, TournamentMatch, Player, User, Club, State, Court } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get all club tournaments data
const getClubTournamentsData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })
    
    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Get all tournaments organized by this club
    const tournaments = await Tournament.findAll({
      where: { 
        organizer_type: 'club',
        organizer_id: club.id 
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

    // Calculate enhanced tournament data
    const tournamentsWithStats = tournaments.map(tournament => {
      const tournamentData = tournament.toJSON()
      
      let totalRegistrations = 0
      let totalRevenue = 0
      
      if (tournamentData.categories) {
        tournamentData.categories.forEach(category => {
          const registrationCount = category.registrations ? category.registrations.length : 0
          category.registration_count = registrationCount
          totalRegistrations += registrationCount
          
          // Calculate revenue from paid registrations
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

    // Calculate overall statistics
    const currentDate = new Date()
    const totalTournaments = tournaments.length
    const activeTournaments = tournaments.filter(t => 
      t.status === 'upcoming' || t.status === 'ongoing'
    ).length
    const completedTournaments = tournaments.filter(t => t.status === 'completed').length
    const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').length
    
    // Calculate total participants and revenue
    let totalParticipants = 0
    let totalRevenue = 0
    
    tournaments.forEach(tournament => {
      if (tournament.categories) {
        tournament.categories.forEach(category => {
          if (category.registrations) {
            totalParticipants += category.registrations.length
            category.registrations.forEach(registration => {
              if (registration.payment_status === 'paid') {
                totalRevenue += parseFloat(registration.amount_paid || 0)
              }
            })
          }
        })
      }
    })

    const stats = {
      total_tournaments: totalTournaments,
      active_tournaments: activeTournaments,
      completed_tournaments: completedTournaments,
      upcoming_tournaments: upcomingTournaments,
      total_participants: totalParticipants,
      total_revenue: totalRevenue
    }

    res.json({
      tournaments: tournamentsWithStats,
      stats
    })

  } catch (error) {
    console.error('Error fetching club tournaments data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create new tournament
const createTournament = async (req, res) => {
  try {
    const userId = req.user.id
    const { 
      name, description, tournament_type, venue_name, venue_address,
      start_date, end_date, registration_start, registration_end,
      entry_fee, max_participants, is_ranking, ranking_multiplier,
      categories
    } = req.body

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Create tournament
    const tournament = await Tournament.create({
      name,
      description,
      tournament_type,
      organizer_type: 'club',
      organizer_id: club.id,
      state_id: club.state_id,
      venue_name,
      venue_address,
      start_date,
      end_date,
      registration_start,
      registration_end,
      entry_fee,
      max_participants,
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
      message: 'Tournament created successfully'
    })

  } catch (error) {
    console.error('Error creating tournament:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update tournament
const updateTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const userId = req.user.id
    const updateData = req.body

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find tournament and verify ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'club',
        organizer_id: club.id
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
    console.error('Error updating tournament:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete tournament
const deleteTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find tournament and verify ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'club',
        organizer_id: club.id
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
    console.error('Error deleting tournament:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update tournament status
const updateTournamentStatus = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const { status } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find tournament and verify ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'club',
        organizer_id: club.id
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

// Get tournament registrations
const getTournamentRegistrations = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Verify tournament ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'club',
        organizer_id: club.id
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found or access denied' })
    }

    // Get all registrations for this tournament
    const registrations = await TournamentRegistration.findAll({
      where: { tournament_id: tournamentId },
      include: [
        {
          model: Player,
          as: 'player',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'phone']
            }
          ]
        },
        {
          model: Player,
          as: 'partnerPlayer',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'phone']
            }
          ],
          required: false
        },
        {
          model: TournamentCategory,
          as: 'category',
          attributes: ['id', 'name', 'gender', 'format']
        }
      ],
      order: [['registration_date', 'DESC']]
    })

    res.json({
      registrations,
      count: registrations.length
    })

  } catch (error) {
    console.error('Error fetching tournament registrations:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Generate tournament matches
const generateTournamentMatches = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Verify tournament ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'club',
        organizer_id: club.id
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found or access denied' })
    }

    // Get tournament categories with registrations
    const categories = await TournamentCategory.findAll({
      where: { tournament_id: tournamentId },
      include: [
        {
          model: TournamentRegistration,
          as: 'registrations',
          where: { status: 'confirmed' },
          required: false,
          include: [
            {
              model: Player,
              as: 'player'
            },
            {
              model: Player,
              as: 'partnerPlayer',
              required: false
            }
          ]
        }
      ]
    })

    // Generate matches for each category
    for (const category of categories) {
      if (!category.registrations || category.registrations.length < 2) {
        continue // Skip categories with insufficient registrations
      }

      // Simple round-robin match generation
      const registrations = category.registrations
      let matchNumber = 1

      for (let i = 0; i < registrations.length - 1; i++) {
        for (let j = i + 1; j < registrations.length; j++) {
          const reg1 = registrations[i]
          const reg2 = registrations[j]

          await TournamentMatch.create({
            tournament_id: tournamentId,
            category_id: category.id,
            round: 1,
            match_number: matchNumber++,
            player1_id: reg1.player_id,
            player2_id: reg1.partner_player_id,
            player3_id: reg2.player_id,
            player4_id: reg2.partner_player_id,
            status: 'scheduled'
          })
        }
      }
    }

    // Fetch generated matches
    const matches = await TournamentMatch.findAll({
      where: { tournament_id: tournamentId },
      include: [
        {
          model: Player,
          as: 'player1',
          attributes: ['id', 'full_name']
        },
        {
          model: Player,
          as: 'player2',
          attributes: ['id', 'full_name'],
          required: false
        },
        {
          model: Player,
          as: 'player3',
          attributes: ['id', 'full_name']
        },
        {
          model: Player,
          as: 'player4',
          attributes: ['id', 'full_name'],
          required: false
        },
        {
          model: TournamentCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['category_id', 'ASC'], ['round', 'ASC'], ['match_number', 'ASC']]
    })

    res.json({
      matches,
      message: 'Tournament matches generated successfully'
    })

  } catch (error) {
    console.error('Error generating tournament matches:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get tournament matches
const getTournamentMatches = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Verify tournament ownership
    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        organizer_type: 'club',
        organizer_id: club.id
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found or access denied' })
    }

    const matches = await TournamentMatch.findAll({
      where: { tournament_id: tournamentId },
      include: [
        {
          model: Player,
          as: 'player1',
          attributes: ['id', 'full_name']
        },
        {
          model: Player,
          as: 'player2',
          attributes: ['id', 'full_name'],
          required: false
        },
        {
          model: Player,
          as: 'player3',
          attributes: ['id', 'full_name']
        },
        {
          model: Player,
          as: 'player4',
          attributes: ['id', 'full_name'],
          required: false
        },
        {
          model: TournamentCategory,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['category_id', 'ASC'], ['round', 'ASC'], ['match_number', 'ASC']]
    })

    res.json({
      matches
    })

  } catch (error) {
    console.error('Error fetching tournament matches:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update match result
const updateMatchResult = async (req, res) => {
  try {
    const { matchId } = req.params
    const { score, winner_side, status } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find match and verify tournament ownership
    const match = await TournamentMatch.findOne({
      where: { id: matchId },
      include: [
        {
          model: Tournament,
          as: 'tournament',
          where: {
            organizer_type: 'club',
            organizer_id: club.id
          }
        }
      ]
    })

    if (!match) {
      return res.status(404).json({ message: 'Match not found or access denied' })
    }

    await match.update({
      score,
      winner_side,
      status
    })

    res.json({ message: 'Match result updated successfully' })

  } catch (error) {
    console.error('Error updating match result:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getClubTournamentsData,
  createTournament,
  updateTournament,
  deleteTournament,
  updateTournamentStatus,
  getTournamentRegistrations,
  generateTournamentMatches,
  getTournamentMatches,
  updateMatchResult
}