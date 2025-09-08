const { Op } = require('sequelize')
const { 
  Tournament,
  TournamentCategory,
  TournamentRegistration,
  TournamentMatch,
  Player,
  State,
  Court
} = require('../db/models')

const createTournament = async (tournamentData, organizerType, organizerId) => {
  const tournament = await Tournament.create({
    ...tournamentData,
    organizer_type: organizerType,
    organizer_id: organizerId
  })

  return tournament
}

const updateTournament = async (tournamentId, updates) => {
  const tournament = await Tournament.findByPk(tournamentId)

  if (!tournament) {
    throw new Error('Tournament not found')
  }

  await tournament.update(updates)

  return tournament
}

const getTournament = async (tournamentId) => {
  const tournament = await Tournament.findByPk(tournamentId, {
    include: [
      { model: State, as: 'state' },
      { model: TournamentCategory, as: 'categories' }
    ]
  })

  if (!tournament) {
    throw new Error('Tournament not found')
  }

  const registrations = await TournamentRegistration.count({
    where: { tournament_id: tournamentId }
  })

  return {
    tournament,
    totalRegistrations: registrations
  }
}

const getAllTournaments = async (filters = {}) => {
  const { 
    state_id, 
    organizer_type, 
    status, 
    start_date, 
    end_date,
    limit = 50, 
    offset = 0 
  } = filters

  const where = {}

  if (state_id) where.state_id = state_id
  if (organizer_type) where.organizer_type = organizer_type
  if (status) where.status = status
  
  if (start_date && end_date) {
    where.start_date = {
      [Op.between]: [start_date, end_date]
    }
  } else if (start_date) {
    where.start_date = {
      [Op.gte]: start_date
    }
  }

  const tournaments = await Tournament.findAndCountAll({
    where,
    include: [
      { model: State, as: 'state' },
      { model: TournamentCategory, as: 'categories' }
    ],
    limit,
    offset,
    order: [['start_date', 'DESC']]
  })

  return tournaments
}

const registerForTournament = async (tournamentId, categoryId, playerId, partnerPlayerId = null) => {
  const tournament = await Tournament.findByPk(tournamentId)
  
  if (!tournament) {
    throw new Error('Tournament not found')
  }

  if (tournament.status !== 'upcoming') {
    throw new Error('Tournament registration is closed')
  }

  const now = new Date()
  if (now < tournament.registration_start || now > tournament.registration_end) {
    throw new Error('Registration period is not active')
  }

  const category = await TournamentCategory.findOne({
    where: {
      id: categoryId,
      tournament_id: tournamentId
    }
  })

  if (!category) {
    throw new Error('Invalid category')
  }

  const existingRegistration = await TournamentRegistration.findOne({
    where: {
      tournament_id: tournamentId,
      category_id: categoryId,
      player_id: playerId
    }
  })

  if (existingRegistration) {
    throw new Error('Already registered for this category')
  }

  const registrationCount = await TournamentRegistration.count({
    where: {
      tournament_id: tournamentId,
      category_id: categoryId,
      status: { [Op.in]: ['registered', 'confirmed'] }
    }
  })

  let status = 'registered'
  if (category.max_participants && registrationCount >= category.max_participants) {
    status = 'waitlisted'
  }

  const registration = await TournamentRegistration.create({
    tournament_id: tournamentId,
    category_id: categoryId,
    player_id: playerId,
    partner_player_id: partnerPlayerId,
    status,
    amount_paid: tournament.entry_fee
  })

  return registration
}

const withdrawFromTournament = async (tournamentId, playerId) => {
  const registration = await TournamentRegistration.findOne({
    where: {
      tournament_id: tournamentId,
      player_id: playerId,
      status: { [Op.ne]: 'withdrawn' }
    }
  })

  if (!registration) {
    throw new Error('Registration not found')
  }

  await registration.update({ status: 'withdrawn' })

  const waitlisted = await TournamentRegistration.findOne({
    where: {
      tournament_id: tournamentId,
      category_id: registration.category_id,
      status: 'waitlisted'
    },
    order: [['created_at', 'ASC']]
  })

  if (waitlisted) {
    await waitlisted.update({ status: 'registered' })
  }

  return { message: 'Successfully withdrawn from tournament' }
}

const createTournamentCategory = async (tournamentId, categoryData) => {
  const tournament = await Tournament.findByPk(tournamentId)

  if (!tournament) {
    throw new Error('Tournament not found')
  }

  const category = await TournamentCategory.create({
    ...categoryData,
    tournament_id: tournamentId
  })

  return category
}

const getTournamentRegistrations = async (tournamentId, categoryId = null) => {
  const where = { tournament_id: tournamentId }
  
  if (categoryId) {
    where.category_id = categoryId
  }

  const registrations = await TournamentRegistration.findAll({
    where,
    include: [
      { model: Player, as: 'player' },
      { model: Player, as: 'partner' },
      { model: TournamentCategory, as: 'category' }
    ],
    order: [['created_at', 'ASC']]
  })

  return registrations
}

const createMatch = async (matchData) => {
  const match = await TournamentMatch.create(matchData)

  return match
}

const updateMatch = async (matchId, updates) => {
  const match = await TournamentMatch.findByPk(matchId)

  if (!match) {
    throw new Error('Match not found')
  }

  await match.update(updates)

  if (updates.winner_side && updates.status === 'completed') {
    await updateTournamentProgress(match.tournament_id, match.category_id)
  }

  return match
}

const getTournamentMatches = async (tournamentId, categoryId = null, round = null) => {
  const where = { tournament_id: tournamentId }
  
  if (categoryId) where.category_id = categoryId
  if (round) where.round = round

  const matches = await TournamentMatch.findAll({
    where,
    include: [
      { model: Player, as: 'player1' },
      { model: Player, as: 'player2' },
      { model: Player, as: 'player3' },
      { model: Player, as: 'player4' },
      { model: Court, as: 'court' }
    ],
    order: [['round', 'ASC'], ['match_number', 'ASC']]
  })

  return matches
}

const generateTournamentBrackets = async (tournamentId, categoryId) => {
  const registrations = await TournamentRegistration.findAll({
    where: {
      tournament_id: tournamentId,
      category_id: categoryId,
      status: { [Op.in]: ['registered', 'confirmed'] }
    }
  })

  const category = await TournamentCategory.findByPk(categoryId)

  if (!category) {
    throw new Error('Category not found')
  }

  const shuffled = registrations.sort(() => 0.5 - Math.random())
  const isDoubles = category.name.toLowerCase().includes('doubles')
  
  const matches = []
  let matchNumber = 1

  for (let i = 0; i < shuffled.length; i += 2) {
    if (shuffled[i + 1]) {
      const match = {
        tournament_id: tournamentId,
        category_id: categoryId,
        round: 1,
        match_number: matchNumber++,
        player1_id: shuffled[i].player_id,
        player2_id: isDoubles ? shuffled[i].partner_player_id : null,
        player3_id: shuffled[i + 1].player_id,
        player4_id: isDoubles ? shuffled[i + 1].partner_player_id : null,
        status: 'scheduled'
      }
      matches.push(match)
    }
  }

  await TournamentMatch.bulkCreate(matches)

  return matches
}

const updateTournamentProgress = async (tournamentId, categoryId) => {
  const completedMatches = await TournamentMatch.findAll({
    where: {
      tournament_id: tournamentId,
      category_id: categoryId,
      status: 'completed'
    },
    order: [['round', 'DESC']]
  })

  if (completedMatches.length === 0) return

  const latestRound = completedMatches[0].round
  
  const roundMatches = await TournamentMatch.count({
    where: {
      tournament_id: tournamentId,
      category_id: categoryId,
      round: latestRound
    }
  })

  const completedRoundMatches = await TournamentMatch.count({
    where: {
      tournament_id: tournamentId,
      category_id: categoryId,
      round: latestRound,
      status: 'completed'
    }
  })

  if (roundMatches === completedRoundMatches && roundMatches > 1) {
    await generateNextRound(tournamentId, categoryId, latestRound)
  }
}

const generateNextRound = async (tournamentId, categoryId, currentRound) => {
  const winners = await TournamentMatch.findAll({
    where: {
      tournament_id: tournamentId,
      category_id: categoryId,
      round: currentRound,
      status: 'completed'
    },
    order: [['match_number', 'ASC']]
  })

  const category = await TournamentCategory.findByPk(categoryId)
  const isDoubles = category.name.toLowerCase().includes('doubles')
  
  const nextRoundMatches = []
  let matchNumber = 1

  for (let i = 0; i < winners.length; i += 2) {
    if (winners[i + 1]) {
      const winner1 = winners[i].winner_side === 1 
        ? { player1: winners[i].player1_id, player2: winners[i].player2_id }
        : { player1: winners[i].player3_id, player2: winners[i].player4_id }
      
      const winner2 = winners[i + 1].winner_side === 1
        ? { player1: winners[i + 1].player1_id, player2: winners[i + 1].player2_id }
        : { player1: winners[i + 1].player3_id, player2: winners[i + 1].player4_id }

      const match = {
        tournament_id: tournamentId,
        category_id: categoryId,
        round: currentRound + 1,
        match_number: matchNumber++,
        player1_id: winner1.player1,
        player2_id: isDoubles ? winner1.player2 : null,
        player3_id: winner2.player1,
        player4_id: isDoubles ? winner2.player2 : null,
        status: 'scheduled'
      }
      nextRoundMatches.push(match)
    }
  }

  if (nextRoundMatches.length > 0) {
    await TournamentMatch.bulkCreate(nextRoundMatches)
  }

  return nextRoundMatches
}

module.exports = {
  createTournament,
  updateTournament,
  getTournament,
  getAllTournaments,
  registerForTournament,
  withdrawFromTournament,
  createTournamentCategory,
  getTournamentRegistrations,
  createMatch,
  updateMatch,
  getTournamentMatches,
  generateTournamentBrackets,
  updateTournamentProgress
}