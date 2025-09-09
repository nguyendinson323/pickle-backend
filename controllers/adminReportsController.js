const { 
  User, 
  Player, 
  Coach, 
  Club, 
  Partner, 
  StateCommittee,
  Tournament,
  TournamentParticipant,
  Court,
  CourtReservation,
  Payment,
  Subscription,
  PlayerRanking,
  RankingChange,
  Microsite,
  MicrositeAnalytics,
  AdminLog,
  Report,
  ScheduledReport,
  sequelize
} = require('../models')
const { Op } = require('sequelize')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs').promises

// Get all reports with statistics
const getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      order: [['created_at', 'DESC']],
      limit: 50
    })

    // Calculate statistics
    const totalReports = await Report.count()
    const pendingReports = await Report.count({ where: { status: 'pending' } })
    const completedReports = await Report.count({ where: { status: 'completed' } })
    const failedReports = await Report.count({ where: { status: 'failed' } })
    
    const fileSizeResult = await Report.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('file_size')), 'totalFileSize']
      ],
      where: { status: 'completed' }
    })
    
    const recordCountResult = await Report.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('record_count')), 'totalRecords']
      ],
      where: { status: 'completed' }
    })

    const mostPopularTypeResult = await Report.findOne({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('type')), 'count']
      ],
      group: ['type'],
      order: [[sequelize.fn('COUNT', sequelize.col('type')), 'DESC']]
    })

    const avgGenerationTimeResult = await Report.findOne({
      attributes: [
        [sequelize.fn('AVG', 
          sequelize.literal('EXTRACT(EPOCH FROM (completed_at - created_at))')
        ), 'avgTime']
      ],
      where: { 
        status: 'completed',
        completed_at: { [Op.not]: null }
      }
    })

    const stats = {
      totalReports,
      pendingReports,
      completedReports,
      failedReports,
      totalFileSize: parseInt(fileSizeResult?.dataValues?.totalFileSize || 0),
      totalRecords: parseInt(recordCountResult?.dataValues?.totalRecords || 0),
      mostPopularType: mostPopularTypeResult?.dataValues?.type || 'users',
      averageGenerationTime: parseFloat(avgGenerationTimeResult?.dataValues?.avgTime || 0)
    }

    res.json({
      reports,
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

    const reportId = uuidv4()
    
    // Create report record
    const report = await Report.create({
      id: reportId,
      name,
      type,
      status: 'pending',
      filters: JSON.stringify(filters),
      fields: JSON.stringify(fields),
      format: format || 'csv',
      created_by: req.user.id,
      created_at: new Date()
    })

    // Start report generation asynchronously
    generateReportAsync(reportId, type, filters, fields, format)

    res.json({
      message: 'Report generation started',
      report: {
        id: report.id,
        name: report.name,
        type: report.type,
        status: report.status,
        generatedAt: report.created_at,
        downloadUrl: null,
        fileSize: 0,
        recordCount: 0
      }
    })
  } catch (error) {
    console.error('Error generating report:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Async report generation function
const generateReportAsync = async (reportId, type, filters, fields, format) => {
  try {
    // Update status to processing
    await Report.update(
      { status: 'processing', started_at: new Date() },
      { where: { id: reportId } }
    )

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
        throw new Error('Unknown report type')
    }

    recordCount = data.length

    // Generate file
    const fileName = `${type}-report-${reportId}-${Date.now()}.${format}`
    const filePath = path.join(__dirname, '../../uploads/reports', fileName)
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true })

    let fileContent = ''
    let fileSize = 0

    if (format === 'csv') {
      fileContent = await generateCSV(data)
      await fs.writeFile(filePath, fileContent)
      fileSize = Buffer.byteLength(fileContent, 'utf8')
    } else if (format === 'json') {
      fileContent = JSON.stringify(data, null, 2)
      await fs.writeFile(filePath, fileContent)
      fileSize = Buffer.byteLength(fileContent, 'utf8')
    }

    // Update report as completed
    await Report.update({
      status: 'completed',
      completed_at: new Date(),
      file_path: filePath,
      file_size: fileSize,
      record_count: recordCount,
      download_url: `/api/admin/reports/${reportId}/download`
    }, { where: { id: reportId } })

  } catch (error) {
    console.error('Error in async report generation:', error)
    
    // Update report as failed
    await Report.update({
      status: 'failed',
      completed_at: new Date(),
      error_message: error.message
    }, { where: { id: reportId } })
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
  
  if (filters.dateFrom || filters.dateTo) {
    whereClause.created_at = {}
    if (filters.dateFrom) whereClause.created_at[Op.gte] = new Date(filters.dateFrom)
    if (filters.dateTo) whereClause.created_at[Op.lte] = new Date(filters.dateTo)
  }

  const users = await User.findAll({
    where: whereClause,
    include: [
      { model: Player, as: 'playerProfile', required: false },
      { model: Coach, as: 'coachProfile', required: false },
      { model: Club, as: 'clubProfile', required: false },
      { model: Partner, as: 'partnerProfile', required: false },
      { model: StateCommittee, as: 'stateProfile', required: false }
    ],
    order: [['created_at', 'DESC']]
  })

  return users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.is_active ? 'active' : 'inactive',
    verified: user.is_verified,
    premium: user.is_premium,
    created_at: user.created_at,
    last_login: user.last_login,
    profile_data: user.playerProfile || user.coachProfile || user.clubProfile || user.partnerProfile || user.stateProfile
  }))
}

const generateTournamentsReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status) {
    whereClause.status = filters.status
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
        model: TournamentParticipant, 
        as: 'participants',
        include: [{ model: User, as: 'user', attributes: ['username', 'email'] }]
      },
      { model: Club, as: 'organizerClub', required: false },
      { model: Partner, as: 'organizerPartner', required: false },
      { model: StateCommittee, as: 'organizerState', required: false }
    ],
    order: [['created_at', 'DESC']]
  })

  return tournaments.map(tournament => ({
    id: tournament.id,
    name: tournament.name,
    organizer_type: tournament.organizer_type,
    organizer_name: tournament.organizerClub?.name || tournament.organizerPartner?.business_name || tournament.organizerState?.name,
    start_date: tournament.start_date,
    end_date: tournament.end_date,
    location: tournament.location,
    status: tournament.status,
    max_participants: tournament.max_participants,
    current_participants: tournament.participants?.length || 0,
    entry_fee: tournament.entry_fee,
    total_revenue: (tournament.participants?.length || 0) * tournament.entry_fee,
    created_at: tournament.created_at
  }))
}

const generateCourtsReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status) {
    whereClause.status = filters.status
  }

  const courts = await Court.findAll({
    where: whereClause,
    include: [
      { 
        model: CourtReservation, 
        as: 'reservations',
        where: filters.dateFrom || filters.dateTo ? {
          reservation_date: {
            ...(filters.dateFrom && { [Op.gte]: new Date(filters.dateFrom) }),
            ...(filters.dateTo && { [Op.lte]: new Date(filters.dateTo) })
          }
        } : undefined,
        required: false
      },
      { model: Club, as: 'ownerClub', required: false },
      { model: Partner, as: 'ownerPartner', required: false }
    ],
    order: [['created_at', 'DESC']]
  })

  return courts.map(court => ({
    id: court.id,
    name: court.name,
    owner_type: court.club_id ? 'club' : 'partner',
    owner_name: court.ownerClub?.name || court.ownerPartner?.business_name,
    surface_type: court.surface_type,
    lighting: court.lighting,
    indoor: court.indoor,
    status: court.status,
    hourly_rate: court.hourly_rate,
    location: `${court.address}, ${court.city}, ${court.state}`,
    total_reservations: court.reservations?.length || 0,
    revenue_generated: court.reservations?.reduce((sum, res) => sum + res.amount, 0) || 0
  }))
}

const generatePaymentsReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status) {
    whereClause.status = filters.status
  }
  
  if (filters.dateFrom || filters.dateTo) {
    whereClause.payment_date = {}
    if (filters.dateFrom) whereClause.payment_date[Op.gte] = new Date(filters.dateFrom)
    if (filters.dateTo) whereClause.payment_date[Op.lte] = new Date(filters.dateTo)
  }

  const payments = await Payment.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'user', attributes: ['username', 'email', 'role'] }
    ],
    order: [['payment_date', 'DESC']]
  })

  return payments.map(payment => ({
    id: payment.id,
    user_name: payment.user?.username,
    user_email: payment.user?.email,
    user_role: payment.user?.role,
    amount: payment.amount,
    type: payment.type,
    status: payment.status,
    payment_method: payment.payment_method,
    reference_id: payment.reference_id,
    payment_date: payment.payment_date,
    created_at: payment.created_at
  }))
}

const generateRankingsReport = async (filters, fields) => {
  const rankings = await PlayerRanking.findAll({
    include: [
      { 
        model: User, 
        as: 'player', 
        attributes: ['username', 'email'],
        include: [
          { model: Player, as: 'playerProfile', attributes: ['full_name', 'birth_date', 'gender'] }
        ]
      }
    ],
    order: [['ranking_position', 'ASC']]
  })

  return rankings.map(ranking => ({
    player_id: ranking.player_id,
    player_name: ranking.player?.playerProfile?.full_name || ranking.player?.username,
    player_email: ranking.player?.email,
    current_position: ranking.ranking_position,
    current_points: ranking.ranking_points,
    tournaments_played: ranking.tournaments_played,
    wins: ranking.wins,
    losses: ranking.losses,
    last_updated: ranking.last_updated
  }))
}

const generateMicrositesReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.status) {
    whereClause.status = filters.status
  }

  const microsites = await Microsite.findAll({
    where: whereClause,
    include: [
      { model: Club, as: 'ownerClub', required: false },
      { model: Partner, as: 'ownerPartner', required: false },
      { model: StateCommittee, as: 'ownerState', required: false }
    ],
    order: [['created_at', 'DESC']]
  })

  return microsites.map(microsite => ({
    id: microsite.id,
    title: microsite.title,
    domain_name: microsite.domain_name,
    owner_type: microsite.owner_type,
    owner_name: microsite.ownerClub?.name || microsite.ownerPartner?.business_name || microsite.ownerState?.name,
    status: microsite.status,
    visibility_status: microsite.visibility_status,
    page_views: microsite.page_views,
    monthly_visitors: microsite.monthly_visitors,
    content_score: microsite.content_score,
    seo_score: microsite.seo_score,
    has_inappropriate_content: microsite.has_inappropriate_content,
    created_at: microsite.created_at,
    last_updated: microsite.last_updated
  }))
}

const generateSystemActivityReport = async (filters, fields) => {
  const whereClause = {}
  
  if (filters.dateFrom || filters.dateTo) {
    whereClause.timestamp = {}
    if (filters.dateFrom) whereClause.timestamp[Op.gte] = new Date(filters.dateFrom)
    if (filters.dateTo) whereClause.timestamp[Op.lte] = new Date(filters.dateTo)
  }

  const logs = await AdminLog.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'admin', attributes: ['username', 'email'] }
    ],
    order: [['timestamp', 'DESC']],
    limit: 10000 // Limit for performance
  })

  return logs.map(log => ({
    id: log.id,
    admin_name: log.admin?.username,
    admin_email: log.admin?.email,
    action: log.action,
    target_type: log.target_type,
    target_id: log.target_id,
    details: log.details,
    ip_address: log.ip_address,
    timestamp: log.timestamp
  }))
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

// Download report
const downloadReport = async (req, res) => {
  try {
    const { id } = req.params

    const report = await Report.findByPk(id)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    if (report.status !== 'completed') {
      return res.status(400).json({ message: 'Report is not ready for download' })
    }

    const filePath = report.file_path
    const fileName = path.basename(filePath)

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err)
        res.status(500).json({ message: 'Failed to download report' })
      }
    })
  } catch (error) {
    console.error('Error downloading report:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get report status
const getReportStatus = async (req, res) => {
  try {
    const { id } = req.params

    const report = await Report.findByPk(id)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    res.json({
      status: report.status,
      downloadUrl: report.download_url,
      fileSize: report.file_size,
      recordCount: report.record_count,
      errorMessage: report.error_message,
      completedAt: report.completed_at
    })
  } catch (error) {
    console.error('Error fetching report status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params

    const report = await Report.findByPk(id)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    // Delete file if exists
    if (report.file_path) {
      try {
        await fs.unlink(report.file_path)
      } catch (err) {
        console.error('Error deleting report file:', err)
      }
    }

    await report.destroy()

    res.json({ message: 'Report deleted successfully' })
  } catch (error) {
    console.error('Error deleting report:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
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
  downloadReport,
  getReportStatus,
  deleteReport,
  getReportPreview
}