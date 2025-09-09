const { Court, CourtSchedule, CourtReservation, CourtMaintenance, Club, Player, User, State } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get all club courts data
const getClubCourtsData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })
    
    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Get all courts owned by this club
    const courts = await Court.findAll({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      },
      order: [['created_at', 'DESC']]
    })

    // Get court schedules for all club courts
    const courtSchedules = await CourtSchedule.findAll({
      where: {
        court_id: {
          [Op.in]: courts.map(court => court.id)
        }
      },
      order: [['court_id', 'ASC'], ['day_of_week', 'ASC']]
    })

    // Get reservations for club courts (last 30 days and future)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const reservations = await CourtReservation.findAll({
      where: {
        court_id: {
          [Op.in]: courts.map(court => court.id)
        },
        date: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'full_name', 'profile_photo_url'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'phone']
            }
          ]
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']]
    })

    // Get maintenance records
    const maintenance = await CourtMaintenance.findAll({
      where: {
        court_id: {
          [Op.in]: courts.map(court => court.id)
        }
      },
      include: [
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name']
        }
      ],
      order: [['start_date', 'DESC']]
    })

    // Calculate statistics
    const totalCourts = courts.length
    const totalReservations = reservations.length
    
    // Monthly revenue (current month)
    const currentMonth = new Date()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    
    const monthlyRevenue = reservations
      .filter(reservation => 
        new Date(reservation.date) >= firstDayOfMonth && 
        reservation.payment_status === 'paid'
      )
      .reduce((sum, reservation) => sum + parseFloat(reservation.total_amount || 0), 0)

    // Occupancy rate calculation (current month)
    const currentMonthReservations = reservations.filter(reservation => 
      new Date(reservation.date) >= firstDayOfMonth && 
      reservation.status === 'confirmed'
    ).length

    // Assuming 8 hours per day, 30 days per month per court
    const totalAvailableSlots = totalCourts * 8 * 30
    const occupancyRate = totalAvailableSlots > 0 ? (currentMonthReservations / totalAvailableSlots) * 100 : 0

    // Upcoming maintenance
    const upcomingMaintenance = maintenance.filter(item => 
      new Date(item.start_date) > new Date() && 
      item.status === 'scheduled'
    ).length

    const stats = {
      total_courts: totalCourts,
      total_reservations: totalReservations,
      monthly_revenue: monthlyRevenue,
      occupancy_rate: Math.round(occupancyRate * 10) / 10,
      upcoming_maintenance: upcomingMaintenance
    }

    res.json({
      courts,
      courtSchedules,
      reservations,
      maintenance,
      stats
    })

  } catch (error) {
    console.error('Error fetching club courts data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create a new court
const createCourt = async (req, res) => {
  try {
    const {
      name,
      address,
      court_count,
      surface_type,
      indoor,
      lights,
      amenities,
      description,
      hourly_rate
    } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Create court
    const court = await Court.create({
      name,
      owner_type: 'club',
      owner_id: club.id,
      address,
      state_id: club.state_id,
      court_count: court_count || 1,
      surface_type,
      indoor: indoor || false,
      lights: lights || false,
      amenities,
      description,
      hourly_rate: hourly_rate || 0
    })

    // Create default schedules (Monday to Sunday, 8 AM to 8 PM)
    const defaultSchedules = []
    for (let day = 0; day <= 6; day++) {
      defaultSchedules.push({
        court_id: court.id,
        day_of_week: day,
        open_time: '08:00:00',
        close_time: '20:00:00',
        is_closed: false
      })
    }

    await CourtSchedule.bulkCreate(defaultSchedules)

    res.status(201).json({
      court,
      message: 'Court created successfully'
    })

  } catch (error) {
    console.error('Error creating court:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update court information
const updateCourt = async (req, res) => {
  try {
    const { courtId } = req.params
    const updateData = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find and verify court ownership
    const court = await Court.findOne({
      where: {
        id: courtId,
        owner_type: 'club',
        owner_id: club.id
      }
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found or access denied' })
    }

    // Update court
    await court.update(updateData)

    res.json({
      court,
      message: 'Court updated successfully'
    })

  } catch (error) {
    console.error('Error updating court:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete court
const deleteCourt = async (req, res) => {
  try {
    const { courtId } = req.params
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find and verify court ownership
    const court = await Court.findOne({
      where: {
        id: courtId,
        owner_type: 'club',
        owner_id: club.id
      }
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found or access denied' })
    }

    // Check for future reservations
    const futureReservations = await CourtReservation.count({
      where: {
        court_id: courtId,
        date: {
          [Op.gte]: new Date()
        },
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      }
    })

    if (futureReservations > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete court with future reservations. Please cancel or complete all future reservations first.' 
      })
    }

    // Delete court (cascades to schedules)
    await court.destroy()

    res.json({ message: 'Court deleted successfully' })

  } catch (error) {
    console.error('Error deleting court:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update court schedule
const updateCourtSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params
    const { day_of_week, open_time, close_time, is_closed } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find schedule and verify ownership
    const schedule = await CourtSchedule.findOne({
      where: { id: scheduleId },
      include: [
        {
          model: Court,
          as: 'court',
          where: {
            owner_type: 'club',
            owner_id: club.id
          }
        }
      ]
    })

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found or access denied' })
    }

    // Update schedule
    await schedule.update({
      day_of_week,
      open_time,
      close_time,
      is_closed
    })

    res.json({
      schedule,
      message: 'Schedule updated successfully'
    })

  } catch (error) {
    console.error('Error updating court schedule:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update reservation status
const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId } = req.params
    const { status } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find reservation and verify court ownership
    const reservation = await CourtReservation.findOne({
      where: { id: reservationId },
      include: [
        {
          model: Court,
          as: 'court',
          where: {
            owner_type: 'club',
            owner_id: club.id
          }
        }
      ]
    })

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found or access denied' })
    }

    // Update reservation status
    await reservation.update({ status })

    res.json({ message: 'Reservation status updated successfully' })

  } catch (error) {
    console.error('Error updating reservation status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create maintenance record
const createMaintenance = async (req, res) => {
  try {
    const {
      court_id,
      maintenance_type,
      description,
      start_date,
      end_date,
      cost,
      notes
    } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Verify court ownership
    const court = await Court.findOne({
      where: {
        id: court_id,
        owner_type: 'club',
        owner_id: club.id
      }
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found or access denied' })
    }

    // Create maintenance record
    const maintenance = await CourtMaintenance.create({
      court_id,
      maintenance_type,
      description,
      start_date,
      end_date,
      status: 'scheduled',
      cost: cost || 0,
      notes
    })

    // Include court information in response
    const maintenanceWithCourt = await CourtMaintenance.findByPk(maintenance.id, {
      include: [
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name']
        }
      ]
    })

    res.status(201).json({
      maintenance: maintenanceWithCourt,
      message: 'Maintenance record created successfully'
    })

  } catch (error) {
    console.error('Error creating maintenance record:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update maintenance record
const updateMaintenance = async (req, res) => {
  try {
    const { maintenanceId } = req.params
    const updateData = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find maintenance and verify ownership
    const maintenance = await CourtMaintenance.findOne({
      where: { id: maintenanceId },
      include: [
        {
          model: Court,
          as: 'court',
          where: {
            owner_type: 'club',
            owner_id: club.id
          }
        }
      ]
    })

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found or access denied' })
    }

    // Update maintenance
    await maintenance.update(updateData)

    // Get updated maintenance with court info
    const updatedMaintenance = await CourtMaintenance.findByPk(maintenance.id, {
      include: [
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name']
        }
      ]
    })

    res.json({
      maintenance: updatedMaintenance,
      message: 'Maintenance record updated successfully'
    })

  } catch (error) {
    console.error('Error updating maintenance record:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getClubCourtsData,
  createCourt,
  updateCourt,
  deleteCourt,
  updateCourtSchedule,
  updateReservationStatus,
  createMaintenance,
  updateMaintenance
}