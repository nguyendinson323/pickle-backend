const { 
  User, 
  Player, 
  Coach, 
  Club, 
  Partner, 
  StateCommittee,
  State,
  Tournament,
  TournamentRegistration,
  TournamentCategory,
  TournamentMatch,
  Court,
  CourtReservation,
  Payment,
  Subscription,
  PlayerRanking,
  RankingPointsHistory,
  RankingPeriod,
  RankingCategory,
  Microsite,
  MicrositeAnalytics,
  Message,
  MessageRecipient,
  Notification,
  sequelize
} = require('../db/models')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs').promises

// Get reports statistics from actual system data
const getReports = async (req, res) => {
  try {
    // Since we don't have a reports table, we'll provide live statistics
    // In a real system, you'd track generated reports, but for now we'll show current data metrics
    
    // Get basic counts
    const totalUsers = await User.count()
    const activeUsers = await User.count({ where: { is_active: true } })
    const totalTournaments = await Tournament.count()
    const activeTournaments = await Tournament.count({ where: { status: 'ongoing' } })
    const completedTournaments = await Tournament.count({ where: { status: 'completed' } })
    const totalCourts = await Court.count()
    const activeCourts = await Court.count({ where: { status: 'active' } })
    const totalPayments = await Payment.count()
    const totalRevenue = await Payment.sum('amount') || 0
    const totalRankedPlayers = await PlayerRanking.count()
    const totalMicrosites = await Microsite.count()
    const activeMicrosites = await Microsite.count({ where: { is_active: true } })

    const stats = {
      totalReports: 0, // Would track actual report generation
      pendingReports: 0,
      completedReports: 0, 
      failedReports: 0,
      totalFileSize: 0,
      totalRecords: totalUsers + totalTournaments + totalCourts + totalPayments,
      mostPopularType: 'users',
      averageGenerationTime: 0,
      systemMetrics: {
        totalUsers,
        activeUsers,
        totalTournaments,
        activeTournaments, 
        completedTournaments,
        totalCourts,
        activeCourts,
        totalPayments,
        totalRevenue,
        totalRankedPlayers,
        totalMicrosites,
        activeMicrosites
      }
    }

    res.json({
      reports: [], // Would contain actual generated reports
      stats
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Generate new report
const generateReport = async (req, res) => {
  try {
    const { type, name, filters, fields, format } = req.body

    if (!type || !name) {
      return res.status(400).json({ message: 'Report type and name are required' })
    }

    // Generate report data immediately since we don't have async processing
    let data = []
    let recordCount = 0

    switch (type) {
      case 'users':
        data = await generateUsersReport(filters, fields)
        break
      case 'tournaments':
        data = await generateTournamentsReport(filters, fields)
        break
      case 'courts':
        data = await generateCourtsReport(filters, fields)
        break
      case 'payments':
        data = await generatePaymentsReport(filters, fields)
        break
      case 'rankings':
        data = await generateRankingsReport(filters, fields)
        break
      case 'microsites':
        data = await generateMicrositesReport(filters, fields)
        break
      case 'system_activity':
        data = await generateSystemActivityReport(filters, fields)
        break
      default:
        return res.status(400).json({ message: 'Unknown report type' })
    }

    recordCount = data.length
    
    // Generate file content
    let fileContent = ''
    const fileExtension = format || 'csv'
    
    if (fileExtension === 'csv') {
      fileContent = await generateCSV(data)
    } else if (fileExtension === 'json') {
      fileContent = JSON.stringify(data, null, 2)
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `${type}-report-${timestamp}.${fileExtension}`
    
    // Set response headers for file download
    res.setHeader('Content-Type', fileExtension === 'csv' ? 'text/csv' : 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(fileContent)
    
  } catch (error) {
    console.error('Error generating report:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}


// Report generation functions
const generateUsersReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.userType) {
    whereClause.role = filters.userType
  }
  
  if (filters.status) {
    if (filters.status === 'active') {
      whereClause.is_active = true
    } else if (filters.status === 'inactive') {
      whereClause.is_active = false
    }
  }
  
  if (filters.state) {
    // We'll filter by state in the includes
  }
  
  if (filters.dateFrom || filters.dateTo) {
    whereClause.created_at = {}
    if (filters.dateFrom) whereClause.created_at[Op.gte] = new Date(filters.dateFrom)
    if (filters.dateTo) whereClause.created_at[Op.lte] = new Date(filters.dateTo)
  }

  const users = await User.findAll({
    where: whereClause,
    include: [
      { 
        model: Player, 
        as: 'playerProfile', 
        required: false,
        include: [{ model: State, as: 'state', attributes: ['name'] }]
      },
      { 
        model: Coach, 
        as: 'coachProfile', 
        required: false,
        include: [{ model: State, as: 'state', attributes: ['name'] }]
      },
      { 
        model: Club, 
        as: 'clubProfile', 
        required: false,
        include: [{ model: State, as: 'state', attributes: ['name'] }]
      },
      { 
        model: Partner, 
        as: 'partnerProfile', 
        required: false,
        include: [{ model: State, as: 'state', attributes: ['name'] }]
      },
      { 
        model: StateCommittee, 
        as: 'stateProfile', 
        required: false,
        include: [{ model: State, as: 'state', attributes: ['name'] }]
      }
    ],
    order: [['created_at', 'DESC']]
  })

  return users.map(user => {
    const profile = user.playerProfile || user.coachProfile || user.clubProfile || user.partnerProfile || user.stateProfile
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.is_active ? 'active' : 'inactive',
      verified: user.is_verified,
      premium: user.is_premium,
      searchable: user.is_searchable,
      created_at: user.created_at,
      last_login: user.last_login,
      state: profile?.state?.name || 'Unknown',
      profile_name: profile?.full_name || profile?.name || profile?.business_name || 'N/A',
      profile_type: user.role
    }
  })
}

const generateTournamentsReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status) {
    whereClause.status = filters.status
  }
  
  if (filters.state) {
    whereClause.state_id = filters.state
  }
  
  if (filters.dateFrom || filters.dateTo) {
    whereClause.start_date = {}
    if (filters.dateFrom) whereClause.start_date[Op.gte] = new Date(filters.dateFrom)
    if (filters.dateTo) whereClause.start_date[Op.lte] = new Date(filters.dateTo)
  }

  const tournaments = await Tournament.findAll({
    where: whereClause,
    include: [
      { 
        model: TournamentRegistration, 
        as: 'registrations',
        include: [
          { 
            model: Player, 
            as: 'player',
            include: [{ model: User, as: 'user', attributes: ['username', 'email'] }]
          }
        ],
        required: false
      },
      { model: State, as: 'state', attributes: ['name'] },
      { model: TournamentCategory, as: 'categories', required: false }
    ],
    order: [['created_at', 'DESC']]
  })

  return tournaments.map(tournament => ({
    id: tournament.id,
    name: tournament.name,
    tournament_type: tournament.tournament_type,
    organizer_type: tournament.organizer_type,
    organizer_id: tournament.organizer_id,
    venue_name: tournament.venue_name,
    venue_address: tournament.venue_address,
    start_date: tournament.start_date,
    end_date: tournament.end_date,
    registration_start: tournament.registration_start,
    registration_end: tournament.registration_end,
    status: tournament.status,
    state: tournament.state?.name || 'Unknown',
    max_participants: tournament.max_participants,
    current_participants: tournament.registrations?.length || 0,
    categories_count: tournament.categories?.length || 0,
    entry_fee: tournament.entry_fee,
    total_revenue: (tournament.registrations?.length || 0) * (tournament.entry_fee || 0),
    is_ranking: tournament.is_ranking,
    ranking_multiplier: tournament.ranking_multiplier,
    created_at: tournament.created_at
  }))
}

const generateCourtsReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status) {
    whereClause.status = filters.status
  }
  
  if (filters.state) {
    whereClause.state_id = filters.state
  }

  const courts = await Court.findAll({
    where: whereClause,
    include: [
      { 
        model: CourtReservation, 
        as: 'reservations',
        where: filters.dateFrom || filters.dateTo ? {
          date: {
            ...(filters.dateFrom && { [Op.gte]: new Date(filters.dateFrom) }),
            ...(filters.dateTo && { [Op.lte]: new Date(filters.dateTo) })
          }
        } : undefined,
        required: false,
        include: [
          { 
            model: Player, 
            as: 'player',
            include: [{ model: User, as: 'user', attributes: ['username'] }]
          }
        ]
      },
      { model: State, as: 'state', attributes: ['name'] }
    ],
    order: [['created_at', 'DESC']]
  })

  return courts.map(court => ({
    id: court.id,
    name: court.name,
    owner_type: court.owner_type,
    owner_id: court.owner_id,
    address: court.address,
    state: court.state?.name || 'Unknown',
    court_count: court.court_count,
    surface_type: court.surface_type,
    indoor: court.indoor,
    lights: court.lights,
    amenities: court.amenities,
    status: court.status,
    latitude: court.latitude,
    longitude: court.longitude,
    total_reservations: court.reservations?.length || 0,
    revenue_generated: court.reservations?.reduce((sum, res) => sum + (res.amount || 0), 0) || 0,
    created_at: court.created_at
  }))
}

const generatePaymentsReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status) {
    whereClause.status = filters.status
  }
  
  if (filters.dateFrom || filters.dateTo) {
    whereClause.transaction_date = {}
    if (filters.dateFrom) whereClause.transaction_date[Op.gte] = new Date(filters.dateFrom)
    if (filters.dateTo) whereClause.transaction_date[Op.lte] = new Date(filters.dateTo)
  }

  const payments = await Payment.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'user', attributes: ['username', 'email', 'role'] }
    ],
    order: [['transaction_date', 'DESC']]
  })

  return payments.map(payment => ({
    id: payment.id,
    user_name: payment.user?.username,
    user_email: payment.user?.email,
    user_role: payment.user?.role,
    amount: payment.amount,
    currency: payment.currency,
    payment_type: payment.payment_type,
    payment_method: payment.payment_method,
    reference_type: payment.reference_type,
    reference_id: payment.reference_id,
    stripe_payment_id: payment.stripe_payment_id,
    transaction_id: payment.transaction_id,
    description: payment.description,
    status: payment.status,
    transaction_date: payment.transaction_date,
    created_at: payment.created_at
  }))
}

const generateRankingsReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.category) {
    whereClause.category_id = filters.category
  }
  
  if (filters.period) {
    whereClause.period_id = filters.period
  }

  const rankings = await PlayerRanking.findAll({
    where: whereClause,
    include: [
      { 
        model: Player, 
        as: 'player', 
        attributes: ['id', 'full_name', 'birth_date', 'gender', 'nrtp_level'],
        include: [
          { model: User, as: 'user', attributes: ['username', 'email'] },
          { model: State, as: 'state', attributes: ['name'] }
        ]
      },
      { model: RankingPeriod, as: 'period', attributes: ['name', 'start_date', 'end_date'] },
      { model: RankingCategory, as: 'category', attributes: ['name', 'gender', 'min_age', 'max_age'] }
    ],
    order: [['current_rank', 'ASC']]
  })

  return rankings.map(ranking => ({
    id: ranking.id,
    player_id: ranking.player_id,
    player_name: ranking.player?.full_name || 'Unknown',
    username: ranking.player?.user?.username || 'Unknown',
    player_email: ranking.player?.user?.email,
    state: ranking.player?.state?.name || 'Unknown',
    nrtp_level: ranking.player?.nrtp_level,
    period: ranking.period?.name || 'Unknown',
    category: ranking.category?.name || 'Unknown',
    current_rank: ranking.current_rank,
    previous_rank: ranking.previous_rank,
    current_points: ranking.points,
    tournaments_played: ranking.tournaments_played,
    rank_change: ranking.previous_rank ? ranking.previous_rank - ranking.current_rank : 0,
    created_at: ranking.created_at,
    updated_at: ranking.updated_at
  }))
}

const generateMicrositesReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status !== undefined) {
    whereClause.is_active = filters.status === 'active'
  }
  
  if (filters.owner_type) {
    whereClause.owner_type = filters.owner_type
  }

  const microsites = await Microsite.findAll({
    where: whereClause,
    include: [
      { 
        model: MicrositeAnalytics, 
        as: 'analytics',
        required: false
      }
    ],
    order: [['created_at', 'DESC']]
  })

  return microsites.map(microsite => ({
    id: microsite.id,
    owner_type: microsite.owner_type,
    owner_id: microsite.owner_id,
    subdomain: microsite.subdomain,
    title: microsite.title,
    description: microsite.description,
    logo_url: microsite.logo_url,
    banner_url: microsite.banner_url,
    primary_color: microsite.primary_color,
    secondary_color: microsite.secondary_color,
    is_active: microsite.is_active,
    created_at: microsite.created_at,
    updated_at: microsite.updated_at,
    analytics_data: microsite.analytics || null
  }))
}

const generateSystemActivityReport = async (filters, fields) => {
  // Since we don't have an AdminLog table, we'll generate a report from various system activities
  const whereClause = {}
  
  if (filters.dateFrom || filters.dateTo) {
    whereClause.created_at = {}
    if (filters.dateFrom) whereClause.created_at[Op.gte] = new Date(filters.dateFrom)
    if (filters.dateTo) whereClause.created_at[Op.lte] = new Date(filters.dateTo)
  }

  // Get recent system activities from different sources
  const activities = []
  
  // Recent user registrations
  const recentUsers = await User.findAll({
    where: whereClause,
    attributes: ['id', 'username', 'role', 'created_at'],
    order: [['created_at', 'DESC']],
    limit: 100
  })
  
  recentUsers.forEach(user => {
    activities.push({
      id: `user_${user.id}`,
      activity_type: 'user_registration',
      description: `New ${user.role} registered: ${user.username}`,
      timestamp: user.created_at,
      related_id: user.id,
      related_type: 'user'
    })
  })
  
  // Recent tournament creations
  const recentTournaments = await Tournament.findAll({
    where: whereClause,
    attributes: ['id', 'name', 'organizer_type', 'created_at'],
    order: [['created_at', 'DESC']],
    limit: 100
  })
  
  recentTournaments.forEach(tournament => {
    activities.push({
      id: `tournament_${tournament.id}`,
      activity_type: 'tournament_created',
      description: `New tournament created: ${tournament.name}`,
      timestamp: tournament.created_at,
      related_id: tournament.id,
      related_type: 'tournament'
    })
  })
  
  // Recent court reservations
  const recentReservations = await CourtReservation.findAll({
    where: whereClause,
    attributes: ['id', 'amount', 'status', 'created_at'],
    include: [
      { model: Court, as: 'court', attributes: ['name'] },
      { 
        model: Player, 
        as: 'player', 
        include: [{ model: User, as: 'user', attributes: ['username'] }]
      }
    ],
    order: [['created_at', 'DESC']],
    limit: 100
  })
  
  recentReservations.forEach(reservation => {
    activities.push({
      id: `reservation_${reservation.id}`,
      activity_type: 'court_reservation',
      description: `Court reserved: ${reservation.court?.name} by ${reservation.player?.user?.username}`,
      timestamp: reservation.created_at,
      amount: reservation.amount,
      related_id: reservation.id,
      related_type: 'reservation'
    })
  })

  // Sort all activities by timestamp
  return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

// Utility function to generate CSV
const generateCSV = async (data) => {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvHeader = headers.join(',')
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) return ''
      if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""')
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  })

  return [csvHeader, ...csvRows].join('\n')
}

// Get report preview  
const getReportPreview = async (req, res) => {
  try {
    const { type, filters, fields, limit = 10 } = req.body

    let data = []

    switch (type) {
      case 'users':
        data = await generateUsersReport(filters, fields)
        break
      case 'tournaments':
        data = await generateTournamentsReport(filters, fields)
        break
      case 'courts':
        data = await generateCourtsReport(filters, fields)
        break
      case 'payments':
        data = await generatePaymentsReport(filters, fields)
        break
      case 'rankings':
        data = await generateRankingsReport(filters, fields)
        break
      case 'microsites':
        data = await generateMicrositesReport(filters, fields)
        break
      case 'system_activity':
        data = await generateSystemActivityReport(filters, fields)
        break
      default:
        return res.status(400).json({ message: 'Unknown report type' })
    }

    res.json({
      preview: data.slice(0, parseInt(limit)),
      totalRecords: data.length,
      fields: data.length > 0 ? Object.keys(data[0]) : []
    })
  } catch (error) {
    console.error('Error generating report preview:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}




module.exports = {
  getReports,
  generateReport,
  getReportPreview
}