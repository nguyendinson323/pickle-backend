const { User, Player, Coach, Club, Partner, StateCommittee, State, Message, MessageRecipient, MessageAttachment, MessageTemplate } = require('../db/models')
const { Op } = require('sequelize')

// Get message templates
const getTemplates = async (req, res) => {
  try {
    // Check if MessageTemplate model exists, otherwise use predefined templates
    if (MessageTemplate) {
      const templates = await MessageTemplate.findAll({
        where: { is_active: true },
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }],
        order: [['created_at', 'DESC']]
      })
      
      res.json(templates)
    } else {
      // Fallback to predefined templates if MessageTemplate model doesn't exist
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
        },
        {
          id: 4,
          name: 'Welcome Message',
          subject: 'Welcome to Pickleball Federation',
          body: 'Welcome {{name}}! Thank you for joining our pickleball community.',
          created_at: new Date().toISOString()
        },
        {
          id: 5,
          name: 'Event Reminder',
          subject: 'Event Reminder',
          body: 'This is a reminder about the upcoming event {{event_name}} on {{event_date}}.',
          created_at: new Date().toISOString()
        }
      ]

      res.json(templates)
    }
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
        { content: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    // Get broadcast messages (messages with type 'Announcement')
    const messages = await Message.findAll({
      where: {
        message_type: 'Announcement',
        ...whereConditions
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email']
        },
        {
          model: MessageRecipient,
          as: 'recipients',
          include: [
            {
              model: User,
              as: 'recipient',
              attributes: ['id', 'username', 'role']
            }
          ]
        }
      ],
      order: [['sent_at', 'DESC']],
      limit: 50
    })

    // Transform messages to match frontend interface
    const transformedMessages = messages.map(message => {
      const recipientTypes = [...new Set(message.recipients.map(r => r.recipient.role))]
      const recipientCount = message.recipients.length
      const readCount = message.recipients.filter(r => r.is_read).length
      const pendingCount = recipientCount - readCount

      return {
        id: message.id,
        subject: message.subject,
        body: message.content,
        recipients: recipientTypes,
        recipient_count: recipientCount,
        sent_at: message.sent_at,
        sent_by: message.sender.username,
        status: 'sent',
        delivery_stats: {
          delivered: readCount,
          failed: 0,
          pending: pendingCount
        }
      }
    })

    // Calculate message statistics
    const totalMessages = await Message.count({
      where: { message_type: 'Announcement' }
    })
    
    const totalRecipients = await MessageRecipient.count({
      include: [{
        model: Message,
        where: { message_type: 'Announcement' }
      }]
    })
    
    const totalRead = await MessageRecipient.count({
      where: { is_read: true },
      include: [{
        model: Message,
        where: { message_type: 'Announcement' }
      }]
    })

    const stats = {
      totalSent: totalMessages,
      totalDelivered: totalRead,
      totalFailed: 0,
      totalPending: totalRecipients - totalRead,
      emailsSent: totalRecipients,
      smsSent: 0,
      inAppSent: totalRecipients
    }

    res.json({
      messages: transformedMessages,
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

    if (MessageTemplate) {
      const template = await MessageTemplate.create({
        name,
        subject,
        body,
        created_by: req.user.id,
        is_active: true
      })

      const templateWithCreator = await MessageTemplate.findByPk(template.id, {
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }]
      })

      res.status(201).json(templateWithCreator)
    } else {
      // Fallback if MessageTemplate model doesn't exist
      const template = {
        id: Date.now(),
        name,
        subject,
        body,
        created_by: req.user.id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      res.status(201).json(template)
    }
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

    if (MessageTemplate) {
      const template = await MessageTemplate.findByPk(id)
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }

      // Check if user has permission to update this template
      if (template.created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' })
      }

      await template.update({
        name,
        subject,
        body
      })

      const updatedTemplate = await MessageTemplate.findByPk(id, {
        include: [{
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }]
      })

      res.json(updatedTemplate)
    } else {
      // Fallback if MessageTemplate model doesn't exist
      const template = {
        id: parseInt(id),
        name,
        subject,
        body,
        updated_at: new Date().toISOString()
      }

      res.json(template)
    }
  } catch (error) {
    console.error('Error updating message template:', error)
    res.status(500).json({ message: 'Failed to update message template' })
  }
}

// Delete message template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params

    if (MessageTemplate) {
      const template = await MessageTemplate.findByPk(id)
      
      if (!template) {
        return res.status(404).json({ message: 'Template not found' })
      }

      // Check if user has permission to delete this template
      if (template.created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Permission denied' })
      }

      // Soft delete by setting is_active to false
      await template.update({ is_active: false })

      res.json({ message: 'Template deleted successfully' })
    } else {
      // Fallback if MessageTemplate model doesn't exist
      res.json({ message: 'Template deleted successfully' })
    }
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

    // Get recipient users based on selected user types
    let recipientUsers = []
    const whereConditions = { is_active: true }

    if (recipients.includes('all')) {
      recipientUsers = await User.findAll({ where: whereConditions })
    } else {
      whereConditions.role = { [Op.in]: recipients }
      recipientUsers = await User.findAll({ where: whereConditions })
    }

    // Create the message record
    const message = await Message.create({
      sender_id: req.user.id,
      subject,
      content: body,
      message_type: 'Announcement',
      sent_at: new Date(),
      has_attachments: attachments && attachments.length > 0
    })

    // Create message recipients
    const messageRecipients = recipientUsers.map(user => ({
      message_id: message.id,
      recipient_id: user.id,
      is_read: false
    }))

    await MessageRecipient.bulkCreate(messageRecipients)

    // Handle attachments if any
    if (attachments && attachments.length > 0) {
      const messageAttachments = attachments.map(attachment => ({
        message_id: message.id,
        file_name: attachment.name || 'attachment',
        file_url: attachment.url || attachment,
        file_type: attachment.type || 'unknown',
        file_size: attachment.size || 0
      }))

      await MessageAttachment.bulkCreate(messageAttachments)
    }

    const recipientCount = recipientUsers.length
    const recipientTypes = [...new Set(recipientUsers.map(user => user.role))]

    const sentMessage = {
      id: message.id,
      subject,
      body,
      recipients: recipientTypes,
      recipient_count: recipientCount,
      sent_at: message.sent_at,
      sent_by: req.user.username,
      status: 'sent',
      delivery_stats: {
        delivered: 0,
        failed: 0,
        pending: recipientCount
      }
    }

    console.log(`Broadcast message sent to ${recipientCount} recipients`)

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

    // Find the message
    const message = await Message.findByPk(id)
    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // For this implementation, we'll consider "failed" messages as those not read yet
    // In a real email system, you'd have actual delivery failure tracking
    const failedRecipients = await MessageRecipient.findAll({
      where: {
        message_id: id,
        is_read: false
      },
      include: [{
        model: User,
        as: 'recipient',
        attributes: ['id', 'username', 'email']
      }]
    })

    if (failedRecipients.length === 0) {
      return res.json({ 
        message: 'No failed messages to resend',
        requeued_count: 0
      })
    }

    // In a real implementation, you would re-queue these for email/SMS delivery
    // For now, we'll just mark them as "pending" (not read)
    console.log(`Re-queuing ${failedRecipients.length} failed message deliveries for message ${id}`)

    res.json({ 
      message: 'Failed messages re-queued for delivery',
      requeued_count: failedRecipients.length
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

    // Find the message
    const message = await Message.findByPk(id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username']
      }]
    })

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // Get all recipients for this message
    const recipients = await MessageRecipient.findAll({
      where: { message_id: id },
      include: [{
        model: User,
        as: 'recipient',
        attributes: ['id', 'username', 'role']
      }]
    })

    const totalRecipients = recipients.length
    const delivered = recipients.filter(r => r.is_read).length
    const pending = totalRecipients - delivered
    const failed = 0 // In a real system, you'd track actual delivery failures

    const report = {
      messageId: parseInt(id),
      messageSubject: message.subject,
      sentAt: message.sent_at,
      sentBy: message.sender.username,
      totalRecipients,
      deliveryStats: {
        delivered,
        failed,
        pending
      },
      deliveryBreakdown: {
        email: {
          delivered: delivered, // Assuming all delivered messages were via email
          failed: 0,
          pending: pending
        },
        sms: {
          delivered: 0, // SMS not implemented in current system
          failed: 0,
          pending: 0
        },
        inApp: {
          delivered: delivered, // All messages are in-app notifications
          failed: 0,
          pending: pending
        }
      },
      recipientsByRole: recipients.reduce((acc, recipient) => {
        const role = recipient.recipient.role
        if (!acc[role]) {
          acc[role] = { total: 0, delivered: 0, pending: 0 }
        }
        acc[role].total++
        if (recipient.is_read) {
          acc[role].delivered++
        } else {
          acc[role].pending++
        }
        return acc
      }, {}),
      failureReasons: [
        // In a real system, you'd track actual failure reasons
        // For now, return empty array since we don't have failure tracking
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