const { 
  Partner, Court, Tournament, CourtReservation, TournamentRegistration, 
  User, Player
} = require('../db/models')
const { Op, fn, col, literal } = require('sequelize')

const getPartnerStatistics = async (req, res) => {
  try {
    // Get the partner ID from the authenticated user
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Partner,
        as: 'partner'
      }]
    })

    if (!user || !user.partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    const partnerId = user.partner.id
    const { startDate, endDate } = req.query

    const dateFilter = {}
    if (startDate && endDate) {
      dateFilter.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }

    // Revenue Data - Monthly breakdown from court reservations
    const revenueData = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: { 
          owner_type: 'partner',
          owner_id: partnerId 
        },
        attributes: []
      }],
      where: {
        payment_status: 'paid',
        ...dateFilter
      },
      attributes: [
        [fn('DATE_TRUNC', 'month', col('CourtReservation.created_at')), 'month'],
        [fn('SUM', col('amount')), 'court_revenue'],
        [literal('0'), 'tournament_revenue'],
        [fn('SUM', col('amount')), 'total_revenue']
      ],
      group: [fn('DATE_TRUNC', 'month', col('CourtReservation.created_at'))],
      order: [[fn('DATE_TRUNC', 'month', col('CourtReservation.created_at')), 'ASC']],
      raw: true
    })

    // Tournament revenue (if tournaments are organized by partner)
    const tournamentRevenue = await TournamentRegistration.findAll({
      include: [{
        model: Tournament,
        as: 'tournament',
        where: { 
          organizer_type: 'partner',
          organizer_id: partnerId 
        },
        attributes: []
      }],
      where: {
        payment_status: 'paid',
        ...dateFilter
      },
      attributes: [
        [fn('DATE_TRUNC', 'month', col('TournamentRegistration.created_at')), 'month'],
        [literal('0'), 'court_revenue'],
        [fn('SUM', col('amount_paid')), 'tournament_revenue'],
        [fn('SUM', col('amount_paid')), 'total_revenue']
      ],
      group: [fn('DATE_TRUNC', 'month', col('TournamentRegistration.created_at'))],
      order: [[fn('DATE_TRUNC', 'month', col('TournamentRegistration.created_at')), 'ASC']],
      raw: true
    })

    // Combine and format revenue data
    const combinedRevenue = {}
    revenueData.forEach(item => {
      const month = new Date(item.month).toISOString().substring(0, 7)
      combinedRevenue[month] = {
        month,
        court_revenue: parseFloat(item.court_revenue) || 0,
        tournament_revenue: 0,
        total_revenue: parseFloat(item.total_revenue) || 0
      }
    })

    tournamentRevenue.forEach(item => {
      const month = new Date(item.month).toISOString().substring(0, 7)
      if (combinedRevenue[month]) {
        combinedRevenue[month].tournament_revenue = parseFloat(item.tournament_revenue) || 0
        combinedRevenue[month].total_revenue += parseFloat(item.tournament_revenue) || 0
      } else {
        combinedRevenue[month] = {
          month,
          court_revenue: 0,
          tournament_revenue: parseFloat(item.tournament_revenue) || 0,
          total_revenue: parseFloat(item.tournament_revenue) || 0
        }
      }
    })

    const formattedRevenueData = Object.values(combinedRevenue).sort((a, b) => a.month.localeCompare(b.month))

    // Booking Metrics
    const bookingStats = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: {
          owner_type: 'partner',
          owner_id: partnerId
        },
        attributes: []
      }],
      where: dateFilter,
      attributes: [
        [fn('COUNT', col('CourtReservation.id')), 'total_reservations'],
        [fn('COUNT', literal('CASE WHEN CourtReservation.status = \'confirmed\' THEN 1 END')), 'completed_reservations'],
        [fn('COUNT', literal('CASE WHEN CourtReservation.status = \'canceled\' THEN 1 END')), 'canceled_reservations'],
        [fn('AVG', col('amount')), 'average_booking_value']
      ],
      raw: true
    })

    const peakHours = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: {
          owner_type: 'partner',
          owner_id: partnerId
        },
        attributes: []
      }],
      where: {
        ...dateFilter
      },
      attributes: [
        [fn('EXTRACT', literal('HOUR FROM start_time')), 'hour'],
        [fn('COUNT', col('CourtReservation.id')), 'count']
      ],
      group: [fn('EXTRACT', literal('HOUR FROM start_time'))],
      order: [[fn('COUNT', col('CourtReservation.id')), 'DESC']],
      limit: 5,
      raw: true
    })

    const popularCourts = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: {
          owner_type: 'partner',
          owner_id: partnerId
        },
        attributes: ['id', 'name']
      }],
      where: {
        ...dateFilter
      },
      attributes: [
        [col('court.id'), 'court_id'],
        [col('court.name'), 'court_name'],
        [fn('COUNT', col('CourtReservation.id')), 'reservation_count']
      ],
      group: [col('court.id'), col('court.name')],
      order: [[fn('COUNT', col('CourtReservation.id')), 'DESC']],
      limit: 5,
      raw: true
    })

    const bookingMetrics = {
      total_reservations: parseInt(bookingStats[0]?.total_reservations) || 0,
      completed_reservations: parseInt(bookingStats[0]?.completed_reservations) || 0,
      canceled_reservations: parseInt(bookingStats[0]?.canceled_reservations) || 0,
      average_booking_value: parseFloat(bookingStats[0]?.average_booking_value) || 0,
      peak_booking_hours: peakHours.map(item => ({
        hour: parseInt(item.hour),
        count: parseInt(item.count)
      })),
      popular_courts: popularCourts.map(item => ({
        court_id: parseInt(item.court_id),
        court_name: item.court_name,
        reservation_count: parseInt(item.reservation_count)
      }))
    }

    // Tournament Metrics
    const tournamentStats = await Tournament.findAll({
      where: {
        organizer_type: 'partner',
        organizer_id: partnerId,
        ...dateFilter
      },
      attributes: [
        [fn('COUNT', col('id')), 'total_tournaments'],
        [fn('COUNT', literal('CASE WHEN Tournament.status = \'completed\' THEN 1 END')), 'completed_tournaments'],
        [fn('COUNT', literal('CASE WHEN Tournament.status = \'ongoing\' THEN 1 END')), 'active_tournaments'],
        [fn('SUM', col('max_participants')), 'total_participants'],
        [fn('AVG', col('max_participants')), 'average_participants_per_tournament']
      ],
      raw: true
    })

    const tournamentRevenueSum = await TournamentRegistration.findOne({
      include: [{
        model: Tournament,
        as: 'tournament',
        where: { 
          organizer_type: 'partner',
          organizer_id: partnerId 
        },
        attributes: []
      }],
      where: {
        payment_status: 'paid',
        ...dateFilter
      },
      attributes: [
        [fn('SUM', col('amount_paid')), 'tournament_revenue']
      ],
      raw: true
    })

    const tournamentMetrics = {
      total_tournaments: parseInt(tournamentStats[0]?.total_tournaments) || 0,
      completed_tournaments: parseInt(tournamentStats[0]?.completed_tournaments) || 0,
      active_tournaments: parseInt(tournamentStats[0]?.active_tournaments) || 0,
      total_participants: parseInt(tournamentStats[0]?.total_participants) || 0,
      average_participants_per_tournament: parseFloat(tournamentStats[0]?.average_participants_per_tournament) || 0,
      tournament_revenue: parseFloat(tournamentRevenueSum?.tournament_revenue) || 0
    }

    // Customer Metrics
    const uniqueCustomers = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: { 
          owner_type: 'partner',
          owner_id: partnerId 
        },
        attributes: []
      }, {
        model: Player,
        as: 'player',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }],
        attributes: ['id', 'full_name']
      }],
      where: {
        payment_status: 'paid',
        ...dateFilter
      },
      attributes: [
        [col('player.user.id'), 'user_id'],
        [col('player.full_name'), 'customer_name'],
        [fn('SUM', col('amount')), 'total_spent'],
        [fn('COUNT', col('CourtReservation.id')), 'total_reservations']
      ],
      group: [col('player.user.id'), col('player.full_name'), col('player.id')],
      order: [[fn('SUM', col('amount')), 'DESC']],
      raw: true
    })

    const totalCustomers = uniqueCustomers.length
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const newCustomersThisMonth = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: { 
          owner_type: 'partner',
          owner_id: partnerId 
        },
        attributes: []
      }],
      where: {
        created_at: { [Op.gte]: thisMonth },
        payment_status: 'paid'
      },
      attributes: [
        [fn('COUNT', fn('DISTINCT', col('player_id'))), 'new_customers']
      ],
      raw: true
    })

    const returningCustomers = uniqueCustomers.filter(customer => customer.total_reservations > 1).length
    const customerRetentionRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0

    const customerMetrics = {
      total_customers: totalCustomers,
      returning_customers: returningCustomers,
      new_customers_this_month: parseInt(newCustomersThisMonth[0]?.new_customers) || 0,
      customer_retention_rate: parseFloat(customerRetentionRate.toFixed(2)),
      top_customers: uniqueCustomers.slice(0, 10).map(customer => ({
        user_id: parseInt(customer.user_id),
        customer_name: customer.customer_name || 'Unknown Customer',
        total_spent: parseFloat(customer.total_spent),
        total_reservations: parseInt(customer.total_reservations)
      }))
    }

    // Performance Metrics
    const courts = await Court.findAll({
      where: { 
        owner_type: 'partner',
        owner_id: partnerId 
      },
      attributes: ['id', 'court_count']
    })

    const totalCourtHours = courts.reduce((sum, court) => sum + (court.court_count * 24), 0)
    
    const bookedHours = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: { 
          owner_type: 'partner',
          owner_id: partnerId 
        },
        attributes: []
      }],
      where: {
        ...dateFilter
      },
      attributes: [
        [fn('SUM', literal('EXTRACT(EPOCH FROM (end_time - start_time))/3600')), 'total_hours']
      ],
      raw: true
    })

    const utilizationRate = totalCourtHours > 0 ? 
      (parseFloat(bookedHours[0]?.total_hours) || 0) / totalCourtHours * 100 : 0

    const avgSessionDuration = await CourtReservation.findOne({
      include: [{
        model: Court,
        as: 'court',
        where: { 
          owner_type: 'partner',
          owner_id: partnerId 
        },
        attributes: []
      }],
      where: {
        status: 'confirmed',
        ...dateFilter
      },
      attributes: [
        [fn('AVG', literal('EXTRACT(EPOCH FROM (end_time - start_time))/3600')), 'avg_duration']
      ],
      raw: true
    })

    const cancellationRate = bookingMetrics.total_reservations > 0 ?
      (bookingMetrics.canceled_reservations / bookingMetrics.total_reservations) * 100 : 0

    const revenuePerCourt = courts.length > 0 ?
      formattedRevenueData.reduce((sum, item) => sum + item.total_revenue, 0) / courts.length : 0

    // Calculate monthly growth rate (current vs previous month)
    let monthlyGrowthRate = 0
    if (formattedRevenueData.length >= 2) {
      const current = formattedRevenueData[formattedRevenueData.length - 1].total_revenue
      const previous = formattedRevenueData[formattedRevenueData.length - 2].total_revenue
      monthlyGrowthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0
    }

    const performanceMetrics = {
      court_utilization_rate: parseFloat(utilizationRate.toFixed(2)),
      average_session_duration: parseFloat(avgSessionDuration?.avg_duration) || 0,
      cancellation_rate: parseFloat(cancellationRate.toFixed(2)),
      revenue_per_court: parseFloat(revenuePerCourt.toFixed(2)),
      monthly_growth_rate: parseFloat(monthlyGrowthRate.toFixed(2))
    }

    res.json({
      revenueData: formattedRevenueData,
      bookingMetrics,
      tournamentMetrics,
      customerMetrics,
      performanceMetrics
    })

  } catch (error) {
    console.error('Error fetching partner statistics:', error)
    res.status(500).json({ message: 'Failed to fetch partner statistics' })
  }
}

const exportPartnerStatistics = async (req, res) => {
  try {
    // Get the partner ID from the authenticated user
    const user = await User.findByPk(req.user.id, {
      include: [{
        model: Partner,
        as: 'partner'
      }]
    })

    if (!user || !user.partner) {
      return res.status(404).json({ message: 'Partner not found' })
    }

    const partnerId = user.partner.id
    const { startDate, endDate, format } = req.query

    if (!format || !['csv', 'pdf'].includes(format)) {
      return res.status(400).json({ message: 'Invalid export format' })
    }

    const dateFilter = {}
    if (startDate && endDate) {
      dateFilter.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    }

    // Get basic statistics for export
    const reservations = await CourtReservation.findAll({
      include: [{
        model: Court,
        as: 'court',
        where: { 
          owner_type: 'partner',
          owner_id: partnerId 
        },
        attributes: ['name']
      }, {
        model: Player,
        as: 'player',
        include: [{
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        }],
        attributes: ['full_name']
      }],
      where: dateFilter,
      order: [['created_at', 'DESC']]
    })

    if (format === 'csv') {
      let csvContent = 'Date,Customer,Court,Duration,Cost,Status\n'
      
      reservations.forEach(reservation => {
        const date = new Date(reservation.created_at).toLocaleDateString()
        const customer = reservation.player?.full_name || 'Unknown Customer'
        const court = reservation.court?.name || 'Unknown Court'
        const startTime = new Date(`1970-01-01T${reservation.start_time}`)
        const endTime = new Date(`1970-01-01T${reservation.end_time}`)
        const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1)
        const cost = reservation.amount
        const status = reservation.status
        
        csvContent += `${date},"${customer}","${court}",${duration},${cost},${status}\n`
      })

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=partner-statistics-${startDate}-${endDate}.csv`)
      return res.send(csvContent)
    }

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=partner-statistics-${startDate}-${endDate}.pdf`)
      return res.send('PDF export functionality will be implemented')
    }

  } catch (error) {
    console.error('Error exporting partner statistics:', error)
    res.status(500).json({ message: 'Failed to export partner statistics' })
  }
}

module.exports = {
  getPartnerStatistics,
  exportPartnerStatistics
}