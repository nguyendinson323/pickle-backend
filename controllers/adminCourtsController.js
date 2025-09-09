const { User, Club, Partner, Court, CourtReservation, State, sequelize } = require('../models')
const { Op } = require('sequelize')

// Get courts with filters and statistics
const getCourts = async (req, res) => {
  try {
    const {
      location,
      owner,
      status,
      surface,
      lighting,
      indoor,
      searchTerm,
      minRate,
      maxRate
    } = req.query

    // Build filter conditions
    const whereConditions = {}
    
    if (status) {
      whereConditions.status = status
    }

    if (surface) {
      whereConditions.surface_type = { [Op.iLike]: `%${surface}%` }
    }

    if (lighting !== undefined && lighting !== '') {
      whereConditions.lighting = lighting === 'true'
    }

    if (indoor !== undefined && indoor !== '') {
      whereConditions.indoor = indoor === 'true'
    }

    if (minRate) {
      whereConditions.hourly_rate = { [Op.gte]: parseFloat(minRate) }
    }

    if (maxRate) {
      if (whereConditions.hourly_rate) {
        whereConditions.hourly_rate[Op.lte] = parseFloat(maxRate)
      } else {
        whereConditions.hourly_rate = { [Op.lte]: parseFloat(maxRate) }
      }
    }

    if (searchTerm) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { '$location.address$': { [Op.iLike]: `%${searchTerm}%` } },
        { '$location.city$': { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    if (location) {
      whereConditions[Op.or] = [
        { '$location.city$': { [Op.iLike]: `%${location}%` } },
        { '$location.state$': { [Op.iLike]: `%${location}%` } }
      ]
    }

    // Fetch courts with associations
    const courts = await Court.findAll({
      where: whereConditions,
      include: [
        {
          model: Club,
          as: 'Club',
          attributes: ['id', 'business_name'],
          required: false
        },
        {
          model: Partner,
          as: 'Partner', 
          attributes: ['id', 'business_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 1000
    })

    // Transform data for frontend
    const transformedCourts = courts.map(court => ({
      id: court.id,
      name: court.name,
      club_id: court.club_id,
      club_name: court.Club?.business_name || null,
      partner_id: court.partner_id,
      partner_name: court.Partner?.business_name || null,
      surface_type: court.surface_type,
      lighting: court.lighting,
      indoor: court.indoor,
      status: court.status,
      hourly_rate: court.hourly_rate,
      location: {
        address: court.address,
        city: court.city,
        state: court.state,
        latitude: court.latitude,
        longitude: court.longitude
      },
      total_reservations: court.total_reservations || 0,
      revenue_generated: court.revenue_generated || 0
    }))

    // Apply owner filter after transformation
    let filteredCourts = transformedCourts
    if (owner) {
      filteredCourts = transformedCourts.filter(court => {
        const ownerName = court.club_name || court.partner_name || ''
        return ownerName.toLowerCase().includes(owner.toLowerCase())
      })
    }

    // Calculate statistics
    const totalCourts = filteredCourts.length
    const statusCounts = filteredCourts.reduce((acc, court) => {
      acc[court.status] = (acc[court.status] || 0) + 1
      return acc
    }, {})

    const totalReservations = await CourtReservation.count()
    const totalRevenue = filteredCourts.reduce((sum, court) => sum + (court.revenue_generated || 0), 0)

    const stats = {
      totalCourts,
      activeCourts: totalCourts,
      availableCourts: statusCounts.available || 0,
      occupiedCourts: statusCounts.occupied || 0,
      maintenanceCourts: statusCounts.maintenance || 0,
      totalReservations,
      totalRevenue,
      averageUtilization: totalCourts > 0 ? Math.round((totalReservations / totalCourts) * 100) / 100 : 0,
      topPerformingCourt: filteredCourts.length > 0 ? filteredCourts.sort((a, b) => b.revenue_generated - a.revenue_generated)[0].name : 'N/A',
      pendingApprovals: Math.floor(Math.random() * 5) // Mock pending approvals
    }

    res.json({
      courts: filteredCourts,
      stats
    })
  } catch (error) {
    console.error('Error fetching courts:', error)
    res.status(500).json({ message: 'Failed to fetch courts' })
  }
}

// Get court reservations
const getCourtReservations = async (req, res) => {
  try {
    const {
      courtId,
      status,
      dateFrom,
      dateTo,
      userId
    } = req.query

    // Build filter conditions
    const whereConditions = {}
    
    if (courtId) {
      whereConditions.court_id = parseInt(courtId)
    }

    if (status) {
      whereConditions.status = status
    }

    if (userId) {
      whereConditions.user_id = parseInt(userId)
    }

    if (dateFrom || dateTo) {
      whereConditions.start_time = {}
      if (dateFrom) {
        whereConditions.start_time[Op.gte] = new Date(dateFrom)
      }
      if (dateTo) {
        whereConditions.start_time[Op.lte] = new Date(dateTo + 'T23:59:59')
      }
    }

    const reservations = await CourtReservation.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'role'],
          required: true
        },
        {
          model: Court,
          attributes: ['id', 'name'],
          required: true
        }
      ],
      order: [['start_time', 'DESC']],
      limit: 1000
    })

    // Transform data for frontend
    const transformedReservations = reservations.map(reservation => ({
      id: reservation.id,
      court_id: reservation.court_id,
      user_id: reservation.user_id,
      user_name: reservation.User.username,
      user_type: reservation.User.role,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      status: reservation.status,
      amount_paid: reservation.amount_paid || 0,
      payment_status: reservation.payment_status || 'pending',
      created_at: reservation.created_at
    }))

    res.json(transformedReservations)
  } catch (error) {
    console.error('Error fetching court reservations:', error)
    res.status(500).json({ message: 'Failed to fetch court reservations' })
  }
}

// Get court details
const getCourtDetails = async (req, res) => {
  try {
    const { id } = req.params

    const court = await Court.findByPk(id, {
      include: [
        {
          model: Club,
          as: 'Club',
          attributes: ['id', 'business_name', 'manager_name'],
          required: false
        },
        {
          model: Partner,
          as: 'Partner',
          attributes: ['id', 'business_name', 'contact_name'],
          required: false
        }
      ]
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found' })
    }

    // Get recent reservations for this court
    const recentReservations = await CourtReservation.findAll({
      where: { court_id: id },
      include: [
        {
          model: User,
          attributes: ['username', 'role']
        }
      ],
      order: [['start_time', 'DESC']],
      limit: 10
    })

    const courtDetails = {
      id: court.id,
      name: court.name,
      club_id: court.club_id,
      club_name: court.Club?.business_name || null,
      partner_id: court.partner_id,
      partner_name: court.Partner?.business_name || null,
      surface_type: court.surface_type,
      lighting: court.lighting,
      indoor: court.indoor,
      status: court.status,
      hourly_rate: court.hourly_rate,
      location: {
        address: court.address,
        city: court.city,
        state: court.state,
        latitude: court.latitude,
        longitude: court.longitude
      },
      total_reservations: recentReservations.length,
      revenue_generated: recentReservations.reduce((sum, res) => sum + (res.amount_paid || 0), 0),
      recent_reservations: recentReservations.map(res => ({
        id: res.id,
        user_name: res.User.username,
        start_time: res.start_time,
        end_time: res.end_time,
        status: res.status,
        amount_paid: res.amount_paid
      }))
    }

    res.json(courtDetails)
  } catch (error) {
    console.error('Error fetching court details:', error)
    res.status(500).json({ message: 'Failed to fetch court details' })
  }
}

// Update court status
const updateCourtStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    if (!['available', 'occupied', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const court = await Court.findByPk(id)
    if (!court) {
      return res.status(404).json({ message: 'Court not found' })
    }

    await court.update({
      status,
      updated_at: new Date()
    })

    // In real implementation, log the status change with reason
    
    res.json({
      message: 'Court status updated successfully',
      court: {
        id: court.id,
        name: court.name,
        status: court.status
      }
    })
  } catch (error) {
    console.error('Error updating court status:', error)
    res.status(500).json({ message: 'Failed to update court status' })
  }
}

// Approve court
const approveCourt = async (req, res) => {
  try {
    const { id } = req.params

    const court = await Court.findByPk(id)
    if (!court) {
      return res.status(404).json({ message: 'Court not found' })
    }

    await court.update({
      status: 'available',
      is_approved: true,
      approved_at: new Date(),
      approved_by: req.user.id
    })

    res.json({
      message: 'Court approved successfully',
      court: {
        id: court.id,
        name: court.name,
        status: court.status
      }
    })
  } catch (error) {
    console.error('Error approving court:', error)
    res.status(500).json({ message: 'Failed to approve court' })
  }
}

// Reject court
const rejectCourt = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' })
    }

    const court = await Court.findByPk(id)
    if (!court) {
      return res.status(404).json({ message: 'Court not found' })
    }

    await court.update({
      status: 'maintenance',
      is_approved: false,
      rejection_reason: reason,
      rejected_at: new Date(),
      rejected_by: req.user.id
    })

    res.json({
      message: 'Court rejected successfully',
      reason
    })
  } catch (error) {
    console.error('Error rejecting court:', error)
    res.status(500).json({ message: 'Failed to reject court' })
  }
}

// Update reservation status
const updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    if (!['active', 'completed', 'cancelled', 'no_show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid reservation status' })
    }

    const reservation = await CourtReservation.findByPk(id)
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' })
    }

    await reservation.update({
      status,
      updated_at: new Date()
    })

    // Handle refunds for cancelled reservations
    if (status === 'cancelled' && reservation.payment_status === 'paid') {
      // In real implementation, process refund
      await reservation.update({
        payment_status: 'refunded'
      })
    }

    res.json({
      message: 'Reservation status updated successfully',
      reservation: {
        id: reservation.id,
        status: reservation.status
      }
    })
  } catch (error) {
    console.error('Error updating reservation status:', error)
    res.status(500).json({ message: 'Failed to update reservation status' })
  }
}

// Bulk update reservations
const bulkUpdateReservations = async (req, res) => {
  try {
    const { reservationIds, action, data } = req.body

    if (!reservationIds || reservationIds.length === 0) {
      return res.status(400).json({ message: 'Reservation IDs are required' })
    }

    let updatedCount = 0

    switch (action) {
      case 'cancel':
        await CourtReservation.update(
          { 
            status: 'cancelled',
            payment_status: 'refunded',
            updated_at: new Date()
          },
          { where: { id: { [Op.in]: reservationIds } } }
        )
        updatedCount = reservationIds.length
        break

      case 'complete':
        await CourtReservation.update(
          { 
            status: 'completed',
            updated_at: new Date()
          },
          { where: { id: { [Op.in]: reservationIds } } }
        )
        updatedCount = reservationIds.length
        break

      case 'no_show':
        await CourtReservation.update(
          { 
            status: 'no_show',
            updated_at: new Date()
          },
          { where: { id: { [Op.in]: reservationIds } } }
        )
        updatedCount = reservationIds.length
        break

      default:
        return res.status(400).json({ message: 'Invalid bulk action' })
    }

    res.json({
      message: `Successfully updated ${updatedCount} reservations`,
      updatedCount,
      action
    })
  } catch (error) {
    console.error('Error bulk updating reservations:', error)
    res.status(500).json({ message: 'Failed to bulk update reservations' })
  }
}

// Export courts
const exportCourts = async (req, res) => {
  try {
    const { format, ...filters } = req.query

    // Get courts data
    const courtsData = await getCourtsData(filters)

    // In a real implementation, generate actual file based on format
    const mockFileContent = `Court Name,Owner,Location,Surface,Rate,Status,Reservations,Revenue\n${courtsData.map(court => 
      `${court.name},"${court.club_name || court.partner_name || 'Independent'}","${court.location.city}, ${court.location.state}",${court.surface_type},${court.hourly_rate},${court.status},${court.total_reservations},${court.revenue_generated}`
    ).join('\n')}`

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=courts.${format}`)
    res.send(mockFileContent)
  } catch (error) {
    console.error('Error exporting courts:', error)
    res.status(500).json({ message: 'Failed to export courts' })
  }
}

// Get court utilization report
const getCourtUtilizationReport = async (req, res) => {
  try {
    const { id } = req.params

    let whereCondition = {}
    if (id) {
      whereCondition.court_id = parseInt(id)
    }

    // Get reservation data for utilization calculation
    const reservations = await CourtReservation.findAll({
      where: {
        ...whereCondition,
        start_time: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        }
      },
      include: [
        {
          model: Court,
          attributes: ['id', 'name']
        }
      ]
    })

    // Calculate utilization metrics
    const utilizationData = reservations.reduce((acc, reservation) => {
      const courtId = reservation.court_id
      if (!acc[courtId]) {
        acc[courtId] = {
          courtId,
          courtName: reservation.Court.name,
          totalHours: 0,
          totalReservations: 0,
          revenue: 0
        }
      }

      const duration = (new Date(reservation.end_time) - new Date(reservation.start_time)) / (1000 * 60 * 60)
      acc[courtId].totalHours += duration
      acc[courtId].totalReservations += 1
      acc[courtId].revenue += reservation.amount_paid || 0

      return acc
    }, {})

    const utilizationReport = Object.values(utilizationData).map(court => ({
      ...court,
      utilizationRate: Math.round((court.totalHours / (30 * 12)) * 100), // Assuming 12 available hours per day
      averageSessionDuration: Math.round((court.totalHours / court.totalReservations) * 100) / 100 || 0
    }))

    res.json({
      period: 'Last 30 days',
      courts: utilizationReport,
      summary: {
        totalCourts: utilizationReport.length,
        averageUtilization: Math.round(utilizationReport.reduce((sum, court) => sum + court.utilizationRate, 0) / utilizationReport.length) || 0,
        totalRevenue: utilizationReport.reduce((sum, court) => sum + court.revenue, 0),
        totalReservations: utilizationReport.reduce((sum, court) => sum + court.totalReservations, 0)
      }
    })
  } catch (error) {
    console.error('Error getting utilization report:', error)
    res.status(500).json({ message: 'Failed to get utilization report' })
  }
}

// Helper function to get courts data for export
const getCourtsData = async (filters = {}) => {
  const courts = await Court.findAll({
    include: [
      {
        model: Club,
        as: 'Club',
        attributes: ['business_name'],
        required: false
      },
      {
        model: Partner,
        as: 'Partner',
        attributes: ['business_name'],
        required: false
      }
    ],
    limit: 1000
  })

  return courts.map(court => ({
    name: court.name,
    club_name: court.Club?.business_name,
    partner_name: court.Partner?.business_name,
    location: {
      city: court.city,
      state: court.state
    },
    surface_type: court.surface_type,
    hourly_rate: court.hourly_rate,
    status: court.status,
    total_reservations: court.total_reservations || 0,
    revenue_generated: court.revenue_generated || 0
  }))
}

module.exports = {
  getCourts,
  getCourtReservations,
  getCourtDetails,
  updateCourtStatus,
  approveCourt,
  rejectCourt,
  updateReservationStatus,
  bulkUpdateReservations,
  exportCourts,
  getCourtUtilizationReport
}