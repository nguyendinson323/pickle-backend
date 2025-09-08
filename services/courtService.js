const { Op } = require('sequelize')
const { 
  Court,
  CourtSchedule,
  CourtReservation,
  CourtMaintenance,
  Player,
  State
} = require('../db/models')

const createCourt = async (courtData, ownerType, ownerId) => {
  const court = await Court.create({
    ...courtData,
    owner_type: ownerType,
    owner_id: ownerId
  })

  const defaultSchedule = []
  for (let day = 0; day <= 6; day++) {
    defaultSchedule.push({
      court_id: court.id,
      day_of_week: day,
      open_time: '08:00:00',
      close_time: '22:00:00',
      is_closed: false
    })
  }

  await CourtSchedule.bulkCreate(defaultSchedule)

  return court
}

const updateCourt = async (courtId, updates) => {
  const court = await Court.findByPk(courtId)

  if (!court) {
    throw new Error('Court not found')
  }

  await court.update(updates)

  return court
}

const getCourt = async (courtId) => {
  const court = await Court.findByPk(courtId, {
    include: [
      { model: State, as: 'state' },
      { model: CourtSchedule, as: 'schedules' }
    ]
  })

  if (!court) {
    throw new Error('Court not found')
  }

  return court
}

const getAllCourts = async (filters = {}) => {
  const { 
    state_id, 
    owner_type, 
    surface_type,
    indoor,
    lights,
    status,
    limit = 50, 
    offset = 0 
  } = filters

  const where = {}

  if (state_id) where.state_id = state_id
  if (owner_type) where.owner_type = owner_type
  if (surface_type) where.surface_type = surface_type
  if (indoor !== undefined) where.indoor = indoor
  if (lights !== undefined) where.lights = lights
  if (status) where.status = status

  const courts = await Court.findAndCountAll({
    where,
    include: [{ model: State, as: 'state' }],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  })

  return courts
}

const getCourtsByOwner = async (ownerType, ownerId) => {
  const courts = await Court.findAll({
    where: {
      owner_type: ownerType,
      owner_id: ownerId
    },
    include: [
      { model: State, as: 'state' },
      { model: CourtSchedule, as: 'schedules' }
    ]
  })

  return courts
}

const updateCourtSchedule = async (courtId, scheduleUpdates) => {
  const court = await Court.findByPk(courtId)

  if (!court) {
    throw new Error('Court not found')
  }

  for (const schedule of scheduleUpdates) {
    const existingSchedule = await CourtSchedule.findOne({
      where: {
        court_id: courtId,
        day_of_week: schedule.day_of_week
      }
    })

    if (existingSchedule) {
      await existingSchedule.update(schedule)
    } else {
      await CourtSchedule.create({
        ...schedule,
        court_id: courtId
      })
    }
  }

  const updatedSchedules = await CourtSchedule.findAll({
    where: { court_id: courtId }
  })

  return updatedSchedules
}

const createReservation = async (reservationData) => {
  const { court_id, date, start_time, end_time, player_id } = reservationData

  const court = await Court.findByPk(court_id)
  
  if (!court) {
    throw new Error('Court not found')
  }

  if (court.status !== 'active') {
    throw new Error('Court is not available')
  }

  const dayOfWeek = new Date(date).getDay()
  const schedule = await CourtSchedule.findOne({
    where: {
      court_id,
      day_of_week: dayOfWeek
    }
  })

  if (!schedule || schedule.is_closed) {
    throw new Error('Court is closed on this day')
  }

  if (start_time < schedule.open_time || end_time > schedule.close_time) {
    throw new Error('Reservation time is outside court hours')
  }

  const existingReservation = await CourtReservation.findOne({
    where: {
      court_id,
      date,
      status: { [Op.ne]: 'canceled' },
      [Op.or]: [
        {
          start_time: { [Op.lt]: end_time },
          end_time: { [Op.gt]: start_time }
        }
      ]
    }
  })

  if (existingReservation) {
    throw new Error('Court is already reserved for this time')
  }

  const maintenanceConflict = await CourtMaintenance.findOne({
    where: {
      court_id,
      status: { [Op.in]: ['scheduled', 'in_progress'] },
      start_date: { [Op.lte]: date },
      end_date: { [Op.gte]: date }
    }
  })

  if (maintenanceConflict) {
    throw new Error('Court is under maintenance on this date')
  }

  const reservation = await CourtReservation.create(reservationData)

  return reservation
}

const getReservationsByDate = async (courtId, date) => {
  const reservations = await CourtReservation.findAll({
    where: {
      court_id: courtId,
      date,
      status: { [Op.ne]: 'canceled' }
    },
    include: [{ model: Player, as: 'player' }],
    order: [['start_time', 'ASC']]
  })

  return reservations
}

const getReservationsByPlayer = async (playerId, upcoming = true) => {
  const where = {
    player_id: playerId,
    status: { [Op.ne]: 'canceled' }
  }

  if (upcoming) {
    where.date = { [Op.gte]: new Date() }
  }

  const reservations = await CourtReservation.findAll({
    where,
    include: [{ model: Court, as: 'court' }],
    order: [['date', 'ASC'], ['start_time', 'ASC']]
  })

  return reservations
}

const cancelReservation = async (reservationId, playerId = null) => {
  const reservation = await CourtReservation.findByPk(reservationId)

  if (!reservation) {
    throw new Error('Reservation not found')
  }

  if (playerId && reservation.player_id !== playerId) {
    throw new Error('Unauthorized to cancel this reservation')
  }

  if (reservation.status === 'canceled') {
    throw new Error('Reservation is already canceled')
  }

  await reservation.update({ 
    status: 'canceled',
    payment_status: reservation.payment_status === 'paid' ? 'refunded' : 'canceled'
  })

  return reservation
}

const getAvailableSlots = async (courtId, date) => {
  const court = await Court.findByPk(courtId)
  
  if (!court) {
    throw new Error('Court not found')
  }

  const dayOfWeek = new Date(date).getDay()
  const schedule = await CourtSchedule.findOne({
    where: {
      court_id: courtId,
      day_of_week: dayOfWeek
    }
  })

  if (!schedule || schedule.is_closed) {
    return []
  }

  const reservations = await CourtReservation.findAll({
    where: {
      court_id: courtId,
      date,
      status: { [Op.ne]: 'canceled' }
    },
    order: [['start_time', 'ASC']]
  })

  const maintenance = await CourtMaintenance.findOne({
    where: {
      court_id: courtId,
      status: { [Op.in]: ['scheduled', 'in_progress'] },
      start_date: { [Op.lte]: date },
      end_date: { [Op.gte]: date }
    }
  })

  if (maintenance) {
    return []
  }

  const slots = []
  const slotDuration = 60
  const openTime = new Date(`${date}T${schedule.open_time}`)
  const closeTime = new Date(`${date}T${schedule.close_time}`)

  let currentTime = new Date(openTime)

  while (currentTime < closeTime) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000)
    
    const isAvailable = !reservations.some(res => {
      const resStart = new Date(`${date}T${res.start_time}`)
      const resEnd = new Date(`${date}T${res.end_time}`)
      return (currentTime >= resStart && currentTime < resEnd) || 
             (slotEnd > resStart && slotEnd <= resEnd)
    })

    if (isAvailable && slotEnd <= closeTime) {
      slots.push({
        start_time: currentTime.toTimeString().slice(0, 8),
        end_time: slotEnd.toTimeString().slice(0, 8),
        available: true
      })
    }

    currentTime = slotEnd
  }

  return slots
}

const scheduleMaintenance = async (maintenanceData) => {
  const { court_id, start_date, end_date } = maintenanceData

  const court = await Court.findByPk(court_id)
  
  if (!court) {
    throw new Error('Court not found')
  }

  const conflictingReservations = await CourtReservation.count({
    where: {
      court_id,
      date: {
        [Op.between]: [start_date, end_date]
      },
      status: { [Op.ne]: 'canceled' }
    }
  })

  if (conflictingReservations > 0) {
    throw new Error(`There are ${conflictingReservations} active reservations during this period`)
  }

  const maintenance = await CourtMaintenance.create(maintenanceData)

  await court.update({ status: 'maintenance' })

  return maintenance
}

const updateMaintenance = async (maintenanceId, updates) => {
  const maintenance = await CourtMaintenance.findByPk(maintenanceId)

  if (!maintenance) {
    throw new Error('Maintenance record not found')
  }

  await maintenance.update(updates)

  if (updates.status === 'completed') {
    const court = await Court.findByPk(maintenance.court_id)
    await court.update({ status: 'active' })
  }

  return maintenance
}

const getMaintenanceSchedule = async (courtId) => {
  const maintenance = await CourtMaintenance.findAll({
    where: { court_id: courtId },
    order: [['start_date', 'DESC']]
  })

  return maintenance
}

const searchNearbyCourts = async (latitude, longitude, radius = 10) => {
  const courts = await Court.findAll({
    where: {
      status: 'active',
      latitude: {
        [Op.between]: [latitude - radius / 111, latitude + radius / 111]
      },
      longitude: {
        [Op.between]: [longitude - radius / 111, longitude + radius / 111]
      }
    },
    include: [{ model: State, as: 'state' }]
  })

  return courts.map(court => ({
    ...court.toJSON(),
    distance: calculateDistance(latitude, longitude, court.latitude, court.longitude)
  })).sort((a, b) => a.distance - b.distance)
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

module.exports = {
  createCourt,
  updateCourt,
  getCourt,
  getAllCourts,
  getCourtsByOwner,
  updateCourtSchedule,
  createReservation,
  getReservationsByDate,
  getReservationsByPlayer,
  cancelReservation,
  getAvailableSlots,
  scheduleMaintenance,
  updateMaintenance,
  getMaintenanceSchedule,
  searchNearbyCourts
}