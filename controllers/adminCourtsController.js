const { User, Club, Partner, Court, CourtReservation, State, Player, sequelize } = require('../db/models')
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
      whereConditions.lights = lighting === 'true'
    }

    if (indoor !== undefined && indoor !== '') {
      whereConditions.indoor = indoor === 'true'
    }

    // Note: hourly_rate filtering removed as it doesn't exist in courts table
    // This would need to be implemented via court_schedules or a separate rates table

    if (searchTerm) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { address: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    if (location) {
      if (whereConditions[Op.or]) {
        whereConditions[Op.or].push({ address: { [Op.iLike]: `%${location}%` } })
      } else {
        whereConditions.address = { [Op.iLike]: `%${location}%` }
      }
    }

    // Fetch courts with associations based on owner_type and owner_id
    const courts = await Court.findAll({
      where: whereConditions,
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code'],
          required: true
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 1000
    })

    // Get owner details for each court
    const courtsWithOwners = await Promise.all(courts.map(async (court) => {
      let ownerName = null
      let ownerDetails = null
      
      if (court.owner_type === 'club') {
        const club = await Club.findByPk(court.owner_id, {
          attributes: ['id', 'name', 'manager_name']
        })
        ownerName = club?.name
        ownerDetails = club
      } else if (court.owner_type === 'partner') {
        const partner = await Partner.findByPk(court.owner_id, {
          attributes: ['id', 'business_name', 'contact_name']
        })
        ownerName = partner?.business_name
        ownerDetails = partner
      }

      return {
        id: court.id,
        name: court.name,
        owner_type: court.owner_type,
        owner_id: court.owner_id,
        owner_name: ownerName,
        owner_details: ownerDetails,
        address: court.address,
        state_id: court.state_id,
        state_name: court.state?.name,
        court_count: court.court_count,
        surface_type: court.surface_type,
        indoor: court.indoor,
        lights: court.lights,
        amenities: court.amenities,
        description: court.description,
        latitude: court.latitude,
        longitude: court.longitude,
        status: court.status,
        created_at: court.created_at,
        updated_at: court.updated_at
      }
    }))

    // Apply owner filter after transformation
    let filteredCourts = courtsWithOwners
    if (owner) {
      filteredCourts = courtsWithOwners.filter(court => {
        const ownerName = court.owner_name || ''
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
    
    // Get reservation counts per court for revenue calculation
    const courtReservationCounts = await CourtReservation.findAll({
      attributes: [
        'court_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'reservation_count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_revenue']
      ],
      group: ['court_id'],
      raw: true
    })

    const totalRevenue = courtReservationCounts.reduce((sum, court) => sum + parseFloat(court.total_revenue || 0), 0)
    const pendingCourts = await Court.count({ where: { status: 'pending' } })

    const stats = {
      totalCourts,
      activeCourts: statusCounts.active || 0,
      availableCourts: statusCounts.active || 0,
      occupiedCourts: 0, // Would need real-time data
      maintenanceCourts: statusCounts.maintenance || 0,
      totalReservations,
      totalRevenue,
      averageUtilization: totalCourts > 0 ? Math.round((totalReservations / totalCourts) * 100) / 100 : 0,
      topPerformingCourt: filteredCourts.length > 0 ? filteredCourts[0].name : 'N/A',
      pendingApprovals: pendingCourts
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
      whereConditions.player_id = parseInt(userId)
    }

    if (dateFrom || dateTo) {
      whereConditions.date = {}
      if (dateFrom) {
        whereConditions.date[Op.gte] = dateFrom
      }
      if (dateTo) {
        whereConditions.date[Op.lte] = dateTo
      }
    }

    const reservations = await CourtReservation.findAll({
      where: whereConditions,
      include: [
        {
          model: Player,
          as: 'player',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'role']
          }],
          required: true
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name'],
          required: true
        }
      ],
      order: [['date', 'DESC'], ['start_time', 'DESC']],
      limit: 1000
    })

    // Transform data for frontend
    const transformedReservations = reservations.map(reservation => ({
      id: reservation.id,
      court_id: reservation.court_id,
      court_name: reservation.court?.name,
      player_id: reservation.player_id,
      player_name: reservation.player?.user?.username,
      user_type: reservation.player?.user?.role,
      date: reservation.date,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      status: reservation.status,
      payment_status: reservation.payment_status,
      amount: reservation.amount,
      stripe_payment_id: reservation.stripe_payment_id,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at
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
    
    // Get court with state information (same as getCourts pattern)
    const court = await Court.findByPk(id, {
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        }
      ]
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found' })
    }

    // Get owner details based on owner_type (same as getCourts pattern)
    let ownerDetails = null
    let ownerName = null
    
    if (court.owner_type === 'club' && court.owner_id) {
      const club = await Club.findByPk(court.owner_id, {
        attributes: ['id', 'name', 'manager_name']
      })
      ownerDetails = club
      ownerName = club?.name
    } else if (court.owner_type === 'partner' && court.owner_id) {
      const partner = await Partner.findByPk(court.owner_id, {
        attributes: ['id', 'business_name', 'contact_name']
      })
      ownerDetails = partner
      ownerName = partner?.business_name
    }

    // Get recent reservations for this court
    const recentReservations = await CourtReservation.findAll({
      where: { court_id: id },
      order: [['start_time', 'DESC']],
      limit: 10
    })

    // Calculate reservation stats
    const totalReservations = await CourtReservation.count({
      where: { court_id: id }
    })

    const revenueResult = await CourtReservation.sum('amount', {
      where: { court_id: id, payment_status: 'paid' }
    })

    // Return the same structure as getCourts with additional details
    const courtDetails = {
      id: court.id,
      name: court.name,
      owner_type: court.owner_type,
      owner_id: court.owner_id,
      owner_name: ownerName,
      owner_details: ownerDetails,
      address: court.address,
      state_id: court.state_id,
      state_name: court.state?.name,
      court_count: court.court_count,
      surface_type: court.surface_type,
      indoor: court.indoor,
      lights: court.lights,
      amenities: court.amenities,
      description: court.description,
      latitude: court.latitude,
      longitude: court.longitude,
      status: court.status,
      created_at: court.created_at,
      updated_at: court.updated_at,
      recent_reservations: recentReservations,
      total_reservations: totalReservations || 0,
      revenue_generated: revenueResult || 0
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

    if (!['active', 'maintenance', 'inactive'].includes(status)) {
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
      status: 'active',
      updated_at: new Date()
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
      status: 'inactive',
      updated_at: new Date()
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

    if (!['pending', 'confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
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
    const mockFileContent = `Court Name,Owner,Location,Surface,Status,Reservations,Revenue\n${courtsData.map(court =>
      `${court.name},"${court.club_name || court.partner_name || 'Independent'}","${court.location?.city || 'N/A'}, ${court.location?.state || 'N/A'}",${court.surface_type || 'N/A'},${court.status},${court.total_reservations},${court.revenue_generated}`
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
        date: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
        }
      },
      include: [
        {
          model: Court,
          as: 'court',
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
          courtName: reservation.court.name,
          totalHours: 0,
          totalReservations: 0,
          revenue: 0
        }
      }

      // Parse time strings correctly
      const startTime = new Date(`${reservation.date}T${reservation.start_time}`)
      const endTime = new Date(`${reservation.date}T${reservation.end_time}`)
      const duration = (endTime - startTime) / (1000 * 60 * 60)

      acc[courtId].totalHours += duration
      acc[courtId].totalReservations += 1
      acc[courtId].revenue += (reservation.payment_status === 'paid' ? parseFloat(reservation.amount) : 0)

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
        model: State,
        as: 'state',
        attributes: ['name', 'short_code'],
        required: false
      }
    ],
    limit: 1000
  })

  // Get owners data for each court
  const courtsWithOwners = await Promise.all(courts.map(async (court) => {
    let ownerName = 'Independent'

    if (court.owner_type === 'club') {
      const club = await Club.findByPk(court.owner_id, {
        attributes: ['name', 'business_name']
      })
      ownerName = club?.name || club?.business_name || 'Club'
    } else if (court.owner_type === 'partner') {
      const partner = await Partner.findByPk(court.owner_id, {
        attributes: ['business_name', 'contact_name']
      })
      ownerName = partner?.business_name || 'Partner'
    }

    // Get reservation count and revenue for this court
    const reservationStats = await CourtReservation.aggregate('amount', 'sum', {
      where: { court_id: court.id, payment_status: 'paid' }
    })

    const reservationCount = await CourtReservation.count({
      where: { court_id: court.id }
    })

    return {
      name: court.name,
      club_name: court.owner_type === 'club' ? ownerName : null,
      partner_name: court.owner_type === 'partner' ? ownerName : null,
      location: {
        city: court.address ? court.address.split(',')[0] : 'N/A',
        state: court.state?.name || 'N/A'
      },
      surface_type: court.surface_type,
      status: court.status,
      total_reservations: reservationCount || 0,
      revenue_generated: reservationStats || 0
    }
  }))

  return courtsWithOwners
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