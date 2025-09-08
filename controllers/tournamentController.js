const tournamentService = require('../services/tournamentService')

const createTournament = async (req, res) => {
  try {
    const tournamentData = req.body
    const organizerType = req.userRole
    let organizerId = req.userId

    if (organizerType === 'club') {
      const { Club } = require('../db/models')
      const club = await Club.findOne({ where: { user_id: req.userId } })
      organizerId = club.id
    } else if (organizerType === 'partner') {
      const { Partner } = require('../db/models')
      const partner = await Partner.findOne({ where: { user_id: req.userId } })
      organizerId = partner.id
    } else if (organizerType === 'state') {
      const { StateCommittee } = require('../db/models')
      const state = await StateCommittee.findOne({ where: { user_id: req.userId } })
      organizerId = state.id
    }
    
    const tournament = await tournamentService.createTournament(tournamentData, organizerType, organizerId)
    
    res.status(201).json(tournament)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateTournament = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const tournament = await tournamentService.updateTournament(id, updates)
    
    res.json(tournament)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getTournament = async (req, res) => {
  try {
    const { id } = req.params
    
    const tournament = await tournamentService.getTournament(id)
    
    res.json(tournament)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getAllTournaments = async (req, res) => {
  try {
    const filters = req.query
    
    const tournaments = await tournamentService.getAllTournaments(filters)
    
    res.json(tournaments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const registerForTournament = async (req, res) => {
  try {
    const { id } = req.params
    const { categoryId, partnerPlayerId } = req.body
    
    const { Player } = require('../db/models')
    const player = await Player.findOne({ where: { user_id: req.userId } })
    
    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }
    
    const registration = await tournamentService.registerForTournament(id, categoryId, player.id, partnerPlayerId)
    
    res.status(201).json(registration)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const withdrawFromTournament = async (req, res) => {
  try {
    const { id } = req.params
    
    const { Player } = require('../db/models')
    const player = await Player.findOne({ where: { user_id: req.userId } })
    
    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }
    
    const result = await tournamentService.withdrawFromTournament(id, player.id)
    
    res.json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const createTournamentCategory = async (req, res) => {
  try {
    const { id } = req.params
    const categoryData = req.body
    
    const category = await tournamentService.createTournamentCategory(id, categoryData)
    
    res.status(201).json(category)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getTournamentRegistrations = async (req, res) => {
  try {
    const { id } = req.params
    const { categoryId } = req.query
    
    const registrations = await tournamentService.getTournamentRegistrations(id, categoryId)
    
    res.json(registrations)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const createMatch = async (req, res) => {
  try {
    const matchData = req.body
    
    const match = await tournamentService.createMatch(matchData)
    
    res.status(201).json(match)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateMatch = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const match = await tournamentService.updateMatch(id, updates)
    
    res.json(match)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getTournamentMatches = async (req, res) => {
  try {
    const { id } = req.params
    const { categoryId, round } = req.query
    
    const matches = await tournamentService.getTournamentMatches(id, categoryId, round)
    
    res.json(matches)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const generateTournamentBrackets = async (req, res) => {
  try {
    const { id } = req.params
    const { categoryId } = req.body
    
    const matches = await tournamentService.generateTournamentBrackets(id, categoryId)
    
    res.json({ message: 'Brackets generated successfully', matches })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
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
  generateTournamentBrackets
}