const { User, Player, Coach, Club, Partner, StateCommittee, State } = require('../db/models')
const { Op } = require('sequelize')

// Get message templates
const getTemplates = async (req, res) => {
  try {
    // In a real implementation, you would have a MessageTemplate model
    // For now, returning mock data structure that would come from database
    const templates = [
      {
        id: 1,
        name: 'Tournament Announcement',
        subject: 'New Tournament Available',
        body: 'Dear {{name}}, a new tournament {{tournament_name}} is now available for registration.',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Membership Renewal',
        subject: 'Membership Renewal Required',
        body: 'Hello {{name}}, your membership expires on {{expiry_date}}. Please renew to continue access.',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'System Maintenance',
        subject: 'Scheduled System Maintenance',
        body: 'Dear users, we will be performing system maintenance on {{date}} from {{start_time}} to {{end_time}}.',
        created_at: new Date().toISOString()
      }
    ]

    res.json(templates)
  } catch (error) {
    console.error('Error fetching message templates:', error)
    res.status(500).json({ message: 'Failed to fetch message templates' })
  }
}

// Get sent messages with filters
const getSentMessages = async (req, res) => {
  try {
    const {
      recipientType,
      status,
      dateFrom,
      dateTo,
      searchTerm
    } = req.query

    // Build filter conditions
    const whereConditions = {}
    
    if (recipientType) {
      whereConditions.recipient_type = recipientType
    }

    if (status) {
      whereConditions.status = status
    }

    if (dateFrom || dateTo) {
      whereConditions.sent_at = {}
      if (dateFrom) {
        whereConditions.sent_at[Op.gte] = new Date(dateFrom)
      }
      if (dateTo) {
        whereConditions.sent_at[Op.lte] = new Date(dateTo + 'T23:59:59')
      }
    }

    if (searchTerm) {
      whereConditions[Op.or] = [
        { subject: { [Op.iLike]: `%${searchTerm}%` } },
        { body: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    // Mock sent messages data (would come from BroadcastMessage model)
    const messages = [
      {
        id: 1,
        subject: 'Welcome to New Season',
        body: 'Welcome all players to the new pickleball season!',
        recipients: ['players', 'coaches'],
        recipient_count: 1247,
        sent_at: new Date().toISOString(),
        sent_by: 'Admin User',
        status: 'sent',
        delivery_stats: {
          delivered: 1200,
          failed: 12,
          pending: 35
        }
      },
      {
        id: 2,
        subject: 'Tournament Registration Open',
        body: 'State Championship registration is now open.',
        recipients: ['players'],
        recipient_count: 856,
        sent_at: new Date(Date.now() - 86400000).toISOString(),
        sent_by: 'Admin User',
        status: 'sent',
        delivery_stats: {
          delivered: 850,
          failed: 6,
          pending: 0
        }
      }
    ]

    // Calculate message statistics
    const stats = {
      totalSent: messages.length,
      totalDelivered: messages.reduce((sum, msg) => sum + msg.delivery_stats.delivered, 0),
      totalFailed: messages.reduce((sum, msg) => sum + msg.delivery_stats.failed, 0),
      totalPending: messages.reduce((sum, msg) => sum + msg.delivery_stats.pending, 0),
      emailsSent: messages.reduce((sum, msg) => sum + msg.recipient_count, 0),
      smsSent: 245,
      inAppSent: messages.reduce((sum, msg) => sum + msg.recipient_count, 0)
    }

    res.json({
      messages,
      stats
    })
  } catch (error) {
    console.error('Error fetching sent messages:', error)
    res.status(500).json({ message: 'Failed to fetch sent messages' })
  }
}

// Create message template
const createTemplate = async (req, res) => {
  try {
    const { name, subject, body } = req.body

    if (!name || !subject || !body) {
      return res.status(400).json({ message: 'Name, subject, and body are required' })
    }

    // In real implementation, save to MessageTemplate model
    const template = {
      id: Date.now(), // Mock ID
      name,
      subject,
      body,
      created_at: new Date().toISOString()
    }

    res.status(201).json(template)
  } catch (error) {
    console.error('Error creating message template:', error)
    res.status(500).json({ message: 'Failed to create message template' })
  }
}

// Update message template
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params
    const { name, subject, body } = req.body

    if (!name || !subject || !body) {
      return res.status(400).json({ message: 'Name, subject, and body are required' })
    }

    // In real implementation, update MessageTemplate model
    const template = {
      id: parseInt(id),
      name,
      subject,
      body,
      created_at: new Date().toISOString()
    }

    res.json(template)
  } catch (error) {
    console.error('Error updating message template:', error)
    res.status(500).json({ message: 'Failed to update message template' })
  }
}

// Delete message template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params

    // In real implementation, delete from MessageTemplate model
    res.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting message template:', error)
    res.status(500).json({ message: 'Failed to delete message template' })
  }
}

// Send broadcast message
const sendBroadcastMessage = async (req, res) => {
  try {
    const {
      recipients,
      subject,
      body,
      attachments,
      sendEmail,
      sendSMS,
      sendInApp
    } = req.body

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Recipients are required' })
    }

    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject and body are required' })
    }

    // Get recipient counts based on selected user types
    let recipientCount = 0
    const recipientCounts = {}

    for (const recipientType of recipients) {
      let count = 0
      
      switch (recipientType) {
        case 'players':
          count = await User.count({ where: { role: 'player', is_active: true } })
          break
        case 'coaches':
          count = await User.count({ where: { role: 'coach', is_active: true } })
          break
        case 'clubs':
          count = await User.count({ where: { role: 'club', is_active: true } })
          break
        case 'partners':
          count = await User.count({ where: { role: 'partner', is_active: true } })
          break
        case 'states':
          count = await User.count({ where: { role: 'state', is_active: true } })
          break
        case 'all':
          count = await User.count({ where: { is_active: true } })
          break
      }
      
      recipientCounts[recipientType] = count
      recipientCount += count
    }

    // In real implementation, this would:
    // 1. Create BroadcastMessage record
    // 2. Queue messages for delivery via email/SMS/in-app
    // 3. Track delivery status

    const sentMessage = {
      id: Date.now(),
      subject,
      body,
      recipients,
      recipient_count: recipientCount,
      sent_at: new Date().toISOString(),
      sent_by: req.user.username,
      status: 'sent',
      delivery_stats: {
        delivered: Math.floor(recipientCount * 0.95),
        failed: Math.floor(recipientCount * 0.02),
        pending: Math.floor(recipientCount * 0.03)
      }
    }

    // Simulate message sending delay
    setTimeout(() => {
      console.log(`Broadcast message sent to ${recipientCount} recipients`)
    }, 1000)

    res.status(201).json(sentMessage)
  } catch (error) {
    console.error('Error sending broadcast message:', error)
    res.status(500).json({ message: 'Failed to send broadcast message' })
  }
}

// Get message preview
const getMessagePreview = async (req, res) => {
  try {
    const { recipients, subject, body } = req.body

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Recipients are required' })
    }

    // Calculate recipient counts
    let totalRecipients = 0
    const recipientBreakdown = {}

    for (const recipientType of recipients) {
      let count = 0
      
      switch (recipientType) {
        case 'players':
          count = await User.count({ where: { role: 'player', is_active: true } })
          break
        case 'coaches':
          count = await User.count({ where: { role: 'coach', is_active: true } })
          break
        case 'clubs':
          count = await User.count({ where: { role: 'club', is_active: true } })
          break
        case 'partners':
          count = await User.count({ where: { role: 'partner', is_active: true } })
          break
        case 'states':
          count = await User.count({ where: { role: 'state', is_active: true } })
          break
        case 'all':
          count = await User.count({ where: { is_active: true } })
          break
      }
      
      recipientBreakdown[recipientType] = count
      totalRecipients += count
    }

    const preview = {
      subject,
      body,
      totalRecipients,
      recipientBreakdown,
      estimatedDeliveryTime: Math.ceil(totalRecipients / 100) + ' minutes'
    }

    res.json(preview)
  } catch (error) {
    console.error('Error getting message preview:', error)
    res.status(500).json({ message: 'Failed to get message preview' })
  }
}

// Resend failed message
const resendFailedMessage = async (req, res) => {
  try {
    const { id } = req.params

    // In real implementation, would:
    // 1. Find failed recipients for this message
    // 2. Re-queue them for delivery
    // 3. Update delivery statistics

    res.json({ 
      message: 'Failed messages re-queued for delivery',
      requeued_count: 12
    })
  } catch (error) {
    console.error('Error resending failed message:', error)
    res.status(500).json({ message: 'Failed to resend message' })
  }
}

// Get message delivery report
const getMessageDeliveryReport = async (req, res) => {
  try {
    const { id } = req.params

    // In real implementation, would fetch detailed delivery data
    const report = {
      messageId: parseInt(id),
      totalRecipients: 1247,
      deliveryStats: {
        delivered: 1200,
        failed: 12,
        pending: 35
      },
      deliveryBreakdown: {
        email: {
          delivered: 1180,
          failed: 8,
          pending: 22
        },
        sms: {
          delivered: 245,
          failed: 2,
          pending: 5
        },
        inApp: {
          delivered: 1200,
          failed: 2,
          pending: 8
        }
      },
      failureReasons: [
        { reason: 'Invalid email address', count: 5 },
        { reason: 'SMS delivery failed', count: 2 },
        { reason: 'User opted out', count: 3 },
        { reason: 'Server timeout', count: 2 }
      ]
    }

    res.json(report)
  } catch (error) {
    console.error('Error getting delivery report:', error)
    res.status(500).json({ message: 'Failed to get delivery report' })
  }
}

module.exports = {
  getTemplates,
  getSentMessages,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  sendBroadcastMessage,
  getMessagePreview,
  resendFailedMessage,
  getMessageDeliveryReport
}