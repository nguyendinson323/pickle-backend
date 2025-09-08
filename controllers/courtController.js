const courtService = require('../services/courtService')

const createCourt = async (req, res) => {
  try {
    const courtData = req.body
    const ownerType = req.userRole
    let ownerId = req.userId

    if (ownerType === 'club') {
      const { Club } = require('../db/models')
      const club = await Club.findOne({ where: { user_id: req.userId } })
      ownerId = club.id
    } else if (ownerType === 'partner') {
      const { Partner } = require('../db/models')
      const partner = await Partner.findOne({ where: { user_id: req.userId } })
      ownerId = partner.id
    } else {
      return res.status(403).json({ message: 'Only clubs and partners can create courts' })
    }
    
    const court = await courtService.createCourt(courtData, ownerType, ownerId)
    
    res.status(201).json(court)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateCourt = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const court = await courtService.updateCourt(id, updates)
    
    res.json(court)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getCourt = async (req, res) => {
  try {
    const { id } = req.params
    
    const court = await courtService.getCourt(id)
    
    res.json(court)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getAllCourts = async (req, res) => {
  try {
    const filters = req.query
    
    const courts = await courtService.getAllCourts(filters)
    
    res.json(courts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getMyCourts = async (req, res) => {
  try {
    const ownerType = req.userRole
    let ownerId = req.userId

    if (ownerType === 'club') {
      const { Club } = require('../db/models')
      const club = await Club.findOne({ where: { user_id: req.userId } })
      ownerId = club.id
    } else if (ownerType === 'partner') {
      const { Partner } = require('../db/models')
      const partner = await Partner.findOne({ where: { user_id: req.userId } })
      ownerId = partner.id
    } else {
      return res.status(403).json({ message: 'Only clubs and partners can view their courts' })
    }
    
    const courts = await courtService.getCourtsByOwner(ownerType, ownerId)
    
    res.json(courts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateCourtSchedule = async (req, res) => {
  try {
    const { id } = req.params
    const { schedules } = req.body
    
    const updatedSchedules = await courtService.updateCourtSchedule(id, schedules)
    
    res.json(updatedSchedules)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const createReservation = async (req, res) => {
  try {
    const reservationData = req.body
    
    const { Player } = require('../db/models')
    const player = await Player.findOne({ where: { user_id: req.userId } })
    
    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }
    
    reservationData.player_id = player.id
    
    const reservation = await courtService.createReservation(reservationData)
    
    res.status(201).json(reservation)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getReservationsByDate = async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.query
    
    const reservations = await courtService.getReservationsByDate(id, date)
    
    res.json(reservations)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getMyReservations = async (req, res) => {
  try {
    const { upcoming } = req.query
    
    const { Player } = require('../db/models')
    const player = await Player.findOne({ where: { user_id: req.userId } })
    
    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }
    
    const reservations = await courtService.getReservationsByPlayer(player.id, upcoming !== 'false')
    
    res.json(reservations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params
    
    let playerId = null
    if (req.userRole === 'player') {
      const { Player } = require('../db/models')
      const player = await Player.findOne({ where: { user_id: req.userId } })
      playerId = player?.id
    }
    
    const reservation = await courtService.cancelReservation(id, playerId)
    
    res.json(reservation)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getAvailableSlots = async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.query
    
    const slots = await courtService.getAvailableSlots(id, date)
    
    res.json(slots)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const scheduleMaintenance = async (req, res) => {
  try {
    const maintenanceData = req.body
    maintenanceData.created_by = req.userId
    
    const maintenance = await courtService.scheduleMaintenance(maintenanceData)
    
    res.status(201).json(maintenance)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const maintenance = await courtService.updateMaintenance(id, updates)
    
    res.json(maintenance)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getMaintenanceSchedule = async (req, res) => {
  try {
    const { id } = req.params
    
    const maintenance = await courtService.getMaintenanceSchedule(id)
    
    res.json(maintenance)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const searchNearbyCourts = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' })
    }
    
    const courts = await courtService.searchNearbyCourts(
      parseFloat(latitude), 
      parseFloat(longitude), 
      radius ? parseFloat(radius) : 10
    )
    
    res.json(courts)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  createCourt,
  updateCourt,
  getCourt,
  getAllCourts,
  getMyCourts,
  updateCourtSchedule,
  createReservation,
  getReservationsByDate,
  getMyReservations,
  cancelReservation,
  getAvailableSlots,
  scheduleMaintenance,
  updateMaintenance,
  getMaintenanceSchedule,
  searchNearbyCourts
}