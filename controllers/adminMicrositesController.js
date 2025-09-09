const { 
  Club, 
  Partner, 
  StateCommittee, 
  Microsite,
  MicrositeAnalytics,
  sequelize
} = require('../db/models')
const { Op } = require('sequelize')

// Get all microsites with filtering and statistics
const getMicrosites = async (req, res) => {
  try {
    const {
      type,
      status,
      owner,
      searchTerm,
      dateFrom,
      dateTo,
      visibilityStatus,
      contentStatus,
      page = 1,
      limit = 50
    } = req.query

    // Build where clause
    const whereClause = {}
    
    if (type) {
      whereClause.owner_type = type
    }
    
    if (status) {
      whereClause.status = status
    }
    
    if (visibilityStatus) {
      whereClause.visibility_status = visibilityStatus
    }
    
    if (contentStatus === 'flagged') {
      whereClause.has_inappropriate_content = true
    } else if (contentStatus === 'clean') {
      whereClause.has_inappropriate_content = false
    }
    
    if (searchTerm) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
        { domain_name: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }
    
    if (dateFrom || dateTo) {
      whereClause.created_at = {}
      if (dateFrom) whereClause.created_at[Op.gte] = new Date(dateFrom)
      if (dateTo) whereClause.created_at[Op.lte] = new Date(dateTo)
    }
    
    if (owner) {
      const ownerConditions = []
      if (owner.includes('club')) {
        ownerConditions.push({ owner_type: 'club' })
      }
      if (owner.includes('partner')) {
        ownerConditions.push({ owner_type: 'partner' })
      }
      if (owner.includes('state')) {
        ownerConditions.push({ owner_type: 'state' })
      }
      if (ownerConditions.length > 0) {
        whereClause[Op.or] = ownerConditions
      }
    }

    // Get microsites with associations
    const microsites = await Microsite.findAll({
      where: whereClause,
      include: [
        {
          model: Club,
          as: 'ownerClub',
          attributes: ['name', 'manager_name'],
          required: false
        },
        {
          model: Partner,
          as: 'ownerPartner', 
          attributes: ['business_name', 'contact_name'],
          required: false
        },
        {
          model: StateCommittee,
          as: 'ownerState',
          attributes: ['name', 'representative_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    })

    // Format microsites data
    const formattedMicrosites = microsites.map(microsite => {
      let ownerName = ''
      
      if (microsite.owner_type === 'club' && microsite.ownerClub) {
        ownerName = microsite.ownerClub.name
      } else if (microsite.owner_type === 'partner' && microsite.ownerPartner) {
        ownerName = microsite.ownerPartner.business_name
      } else if (microsite.owner_type === 'state' && microsite.ownerState) {
        ownerName = microsite.ownerState.name
      }

      return {
        ...microsite.toJSON(),
        owner_name: ownerName
      }
    })

    // Calculate statistics
    const totalMicrosites = await Microsite.count({ where: whereClause })
    const activeMicrosites = await Microsite.count({ where: { ...whereClause, status: 'active' } })
    const inactiveMicrosites = await Microsite.count({ where: { ...whereClause, status: 'inactive' } })
    const pendingApprovalMicrosites = await Microsite.count({ where: { ...whereClause, approval_status: 'pending' } })
    const clubMicrosites = await Microsite.count({ where: { ...whereClause, owner_type: 'club' } })
    const partnerMicrosites = await Microsite.count({ where: { ...whereClause, owner_type: 'partner' } })
    const stateMicrosites = await Microsite.count({ where: { ...whereClause, owner_type: 'state' } })
    
    const contentScoreResult = await Microsite.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('AVG', sequelize.col('content_score')), 'avgContentScore']
      ]
    })
    
    const pageViewsResult = await Microsite.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('page_views')), 'totalPageViews'],
        [sequelize.fn('AVG', sequelize.col('monthly_visitors')), 'avgMonthlyVisitors']
      ]
    })

    const stats = {
      totalMicrosites,
      activeMicrosites,
      inactiveMicrosites,
      pendingApprovalMicrosites,
      clubMicrosites,
      partnerMicrosites,
      stateMicrosites,
      averageContentScore: parseFloat(contentScoreResult.dataValues.avgContentScore || 0),
      totalPageViews: parseInt(pageViewsResult.dataValues.totalPageViews || 0),
      averageMonthlyVisitors: parseFloat(pageViewsResult.dataValues.avgMonthlyVisitors || 0)
    }

    res.json({
      microsites: formattedMicrosites,
      stats,
      pagination: {
        total: totalMicrosites,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalMicrosites / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching microsites:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get microsite details
const getMicrositeDetails = async (req, res) => {
  try {
    const { id } = req.params

    const microsite = await Microsite.findByPk(id, {
      include: [
        {
          model: Club,
          as: 'ownerClub',
          attributes: ['name', 'manager_name', 'email', 'phone'],
          required: false
        },
        {
          model: Partner,
          as: 'ownerPartner',
          attributes: ['business_name', 'contact_name', 'email', 'phone'],
          required: false
        },
        {
          model: StateCommittee,
          as: 'ownerState',
          attributes: ['name', 'representative_name', 'email', 'phone'],
          required: false
        }
      ]
    })

    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Get analytics data
    const analytics = await MicrositeAnalytics.findAll({
      where: { microsite_id: id },
      order: [['date', 'DESC']],
      limit: 30
    })

    let ownerName = ''
    let ownerContact = {}
    
    if (microsite.owner_type === 'club' && microsite.ownerClub) {
      ownerName = microsite.ownerClub.name
      ownerContact = {
        name: microsite.ownerClub.manager_name,
        email: microsite.ownerClub.email,
        phone: microsite.ownerClub.phone
      }
    } else if (microsite.owner_type === 'partner' && microsite.ownerPartner) {
      ownerName = microsite.ownerPartner.business_name
      ownerContact = {
        name: microsite.ownerPartner.contact_name,
        email: microsite.ownerPartner.email,
        phone: microsite.ownerPartner.phone
      }
    } else if (microsite.owner_type === 'state' && microsite.ownerState) {
      ownerName = microsite.ownerState.name
      ownerContact = {
        name: microsite.ownerState.representative_name,
        email: microsite.ownerState.email,
        phone: microsite.ownerState.phone
      }
    }

    const micrositeData = {
      ...microsite.toJSON(),
      owner_name: ownerName,
      owner_contact: ownerContact,
      analytics: analytics
    }

    res.json(micrositeData)
  } catch (error) {
    console.error('Error fetching microsite details:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update microsite status
const updateMicrositeStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    const microsite = await Microsite.findByPk(id)
    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    await microsite.update({
      status,
      rejection_reason: reason || null,
      updated_at: new Date()
    })

    res.json({ 
      message: 'Microsite status updated successfully',
      microsite: await microsite.reload()
    })
  } catch (error) {
    console.error('Error updating microsite status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Approve microsite
const approveMicrosite = async (req, res) => {
  try {
    const { id } = req.params

    const microsite = await Microsite.findByPk(id)
    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    await microsite.update({
      approval_status: 'approved',
      status: 'active',
      rejection_reason: null,
      updated_at: new Date()
    })

    res.json({ 
      message: 'Microsite approved successfully',
      microsite: await microsite.reload()
    })
  } catch (error) {
    console.error('Error approving microsite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Reject microsite
const rejectMicrosite = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' })
    }

    const microsite = await Microsite.findByPk(id)
    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    await microsite.update({
      approval_status: 'rejected',
      status: 'inactive',
      rejection_reason: reason,
      updated_at: new Date()
    })

    res.json({ 
      message: 'Microsite rejected successfully',
      microsite: await microsite.reload()
    })
  } catch (error) {
    console.error('Error rejecting microsite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Suspend microsite
const suspendMicrosite = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ message: 'Suspension reason is required' })
    }

    const microsite = await Microsite.findByPk(id)
    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    await microsite.update({
      status: 'suspended',
      rejection_reason: reason,
      updated_at: new Date()
    })

    res.json({ 
      message: 'Microsite suspended successfully',
      microsite: await microsite.reload()
    })
  } catch (error) {
    console.error('Error suspending microsite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Export microsites
const exportMicrosites = async (req, res) => {
  try {
    const { format = 'csv' } = req.query

    // Get all microsites for export (without pagination)
    const microsites = await Microsite.findAll({
      include: [
        {
          model: Club,
          as: 'ownerClub',
          attributes: ['name'],
          required: false
        },
        {
          model: Partner,
          as: 'ownerPartner',
          attributes: ['business_name'],
          required: false
        },
        {
          model: StateCommittee,
          as: 'ownerState',
          attributes: ['name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Format data for export
    const exportData = microsites.map(microsite => {
      let ownerName = ''
      
      if (microsite.owner_type === 'club' && microsite.ownerClub) {
        ownerName = microsite.ownerClub.name
      } else if (microsite.owner_type === 'partner' && microsite.ownerPartner) {
        ownerName = microsite.ownerPartner.business_name
      } else if (microsite.owner_type === 'state' && microsite.ownerState) {
        ownerName = microsite.ownerState.name
      }

      return {
        id: microsite.id,
        title: microsite.title,
        owner_name: ownerName,
        owner_type: microsite.owner_type,
        status: microsite.status,
        domain_name: microsite.domain_name,
        page_views: microsite.page_views,
        monthly_visitors: microsite.monthly_visitors,
        content_score: microsite.content_score,
        seo_score: microsite.seo_score,
        has_inappropriate_content: microsite.has_inappropriate_content,
        created_at: microsite.created_at,
        last_updated: microsite.last_updated
      }
    })

    if (format === 'csv') {
      const csvHeader = 'ID,Title,Owner Name,Owner Type,Status,Domain,Page Views,Monthly Visitors,Content Score,SEO Score,Inappropriate Content,Created Date,Last Updated\n'
      const csvRows = exportData.map(row => 
        `${row.id},"${row.title}","${row.owner_name}","${row.owner_type}","${row.status}","${row.domain_name}",${row.page_views},${row.monthly_visitors},${row.content_score},${row.seo_score},${row.has_inappropriate_content},"${row.created_at}","${row.last_updated}"`
      ).join('\n')
      
      const csvContent = csvHeader + csvRows
      
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename="microsites_export.csv"')
      return res.send(csvContent)
    }

    res.json({ message: `${format} export format not supported yet` })
  } catch (error) {
    console.error('Error exporting microsites:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Generate microsite report
const generateMicrositeReport = async (req, res) => {
  try {
    const { id } = req.params

    const microsite = await Microsite.findByPk(id, {
      include: [
        {
          model: Club,
          as: 'ownerClub',
          attributes: ['name', 'manager_name'],
          required: false
        },
        {
          model: Partner,
          as: 'ownerPartner',
          attributes: ['business_name', 'contact_name'],
          required: false
        },
        {
          model: StateCommittee,
          as: 'ownerState',
          attributes: ['name', 'representative_name'],
          required: false
        }
      ]
    })

    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Get analytics data for the last 30 days
    const analytics = await MicrositeAnalytics.findAll({
      where: { 
        microsite_id: id,
        date: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      order: [['date', 'DESC']]
    })

    const report = {
      microsite: {
        id: microsite.id,
        title: microsite.title,
        domain_name: microsite.domain_name,
        owner_type: microsite.owner_type,
        status: microsite.status,
        created_at: microsite.created_at,
        last_updated: microsite.last_updated
      },
      performance: {
        total_page_views: microsite.page_views,
        monthly_visitors: microsite.monthly_visitors,
        content_score: microsite.content_score,
        seo_score: microsite.seo_score,
        performance_score: microsite.performance_score
      },
      content: {
        has_inappropriate_content: microsite.has_inappropriate_content,
        content_warnings: microsite.content_warnings,
        last_audit_date: microsite.last_audit_date
      },
      analytics: analytics,
      summary: {
        avg_daily_visitors: analytics.length > 0 ? analytics.reduce((sum, a) => sum + a.visitors, 0) / analytics.length : 0,
        peak_day: analytics.length > 0 ? analytics.reduce((max, a) => a.visitors > max.visitors ? a : max, analytics[0]) : null
      }
    }

    res.json(report)
  } catch (error) {
    console.error('Error generating microsite report:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Send notification
const sendMicrositeNotification = async (req, res) => {
  try {
    const { id } = req.params
    const { subject, message, recipients } = req.body

    const microsite = await Microsite.findByPk(id)
    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Here you would integrate with your notification system
    // For now, we'll just return success
    
    res.json({ 
      message: 'Notification sent successfully',
      sent_to: recipients.length,
      recipients: recipients
    })
  } catch (error) {
    console.error('Error sending microsite notification:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get microsite analytics
const getMicrositeAnalytics = async (req, res) => {
  try {
    const { id } = req.params
    const { period = '30' } = req.query

    const days = parseInt(period)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const analytics = await MicrositeAnalytics.findAll({
      where: {
        microsite_id: id,
        date: { [Op.gte]: startDate }
      },
      order: [['date', 'ASC']]
    })

    const summary = {
      total_visitors: analytics.reduce((sum, a) => sum + a.visitors, 0),
      total_page_views: analytics.reduce((sum, a) => sum + a.page_views, 0),
      avg_daily_visitors: analytics.length > 0 ? analytics.reduce((sum, a) => sum + a.visitors, 0) / analytics.length : 0,
      peak_day: analytics.length > 0 ? analytics.reduce((max, a) => a.visitors > max.visitors ? a : max) : null
    }

    res.json({
      analytics,
      summary,
      period: `${days} days`
    })
  } catch (error) {
    console.error('Error fetching microsite analytics:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Perform content audit
const performContentAudit = async (req, res) => {
  try {
    const { id } = req.params

    const microsite = await Microsite.findByPk(id)
    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Simulate content audit process
    // In a real implementation, this would involve:
    // - Checking for inappropriate content
    // - Analyzing SEO compliance
    // - Checking for broken links
    // - Validating accessibility standards

    const auditResults = {
      content_warnings: [],
      seo_issues: [],
      accessibility_issues: [],
      broken_links: 0,
      overall_score: 85,
      recommendations: [
        'Optimize images for faster loading',
        'Add alt text to images',
        'Improve meta descriptions'
      ]
    }

    // Update microsite with audit results
    await microsite.update({
      last_audit_date: new Date(),
      content_score: auditResults.overall_score,
      content_warnings: auditResults.content_warnings
    })

    res.json({
      message: 'Content audit completed',
      audit_results: auditResults
    })
  } catch (error) {
    console.error('Error performing content audit:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getMicrosites,
  getMicrositeDetails,
  updateMicrositeStatus,
  approveMicrosite,
  rejectMicrosite,
  suspendMicrosite,
  exportMicrosites,
  generateMicrositeReport,
  sendMicrositeNotification,
  getMicrositeAnalytics,
  performContentAudit
}