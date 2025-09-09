const { StateCommittee, User, Message, Player, Club, Partner, Coach, MessageTemplate } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get state inbox data (received and sent messages)
const getStateInboxData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Get received messages
    const messages = await Message.findAll({
      where: { 
        recipient_id: userId,
        recipient_type: 'direct'
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role']
        }
      ],
      order: [['sent_at', 'DESC']],
      limit: 100
    })

    // Get sent messages and announcements
    const sentMessages = await Message.findAll({
      where: { sender_id: userId },
      include: [
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'email', 'role'],
          required: false
        }
      ],
      order: [['sent_at', 'DESC']],
      limit: 100
    })

    // Calculate statistics
    const totalMessages = messages.length
    const unreadMessages = messages.filter(m => !m.is_read).length
    const announcementsSent = sentMessages.filter(m => m.is_announcement).length
    
    // Calculate total recipients reached (simplified)
    const totalRecipientsReached = sentMessages.reduce((sum, message) => {
      if (message.recipient_type === 'group' || message.is_announcement) {
        return sum + 10 // Estimated recipients per announcement
      }
      return sum + 1
    }, 0)

    // Recent activity (messages in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentActivity = await Message.count({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { 
            recipient_id: userId,
            recipient_type: 'direct'
          }
        ],
        sent_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    })

    const stats = {
      total_messages: totalMessages,
      unread_messages: unreadMessages,
      announcements_sent: announcementsSent,
      total_recipients_reached: totalRecipientsReached,
      recent_activity: recentActivity
    }

    res.json({
      messages,
      sentMessages,
      stats
    })

  } catch (error) {
    console.error('Error fetching state inbox data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get potential message recipients (players, clubs, partners in state)
const getStateRecipients = async (req, res) => {
  try {
    const userId = req.user.id
    const { type } = req.query
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    const stateId = stateCommittee.state_id
    let recipients = []

    // Get recipients based on type filter
    if (!type || type === 'player') {
      const players = await Player.findAll({
        where: { state_id: stateId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role']
          }
        ],
        limit: 1000
      })

      const playerRecipients = players.map(player => ({
        id: player.user.id,
        name: player.full_name,
        email: player.user.email,
        type: 'player',
        role: player.user.role
      }))

      recipients = [...recipients, ...playerRecipients]
    }

    if (!type || type === 'club') {
      const clubs = await Club.findAll({
        where: { state_id: stateId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role']
          }
        ],
        limit: 1000
      })

      const clubRecipients = clubs.map(club => ({
        id: club.user.id,
        name: club.name,
        email: club.user.email,
        type: 'club',
        role: club.user.role
      }))

      recipients = [...recipients, ...clubRecipients]
    }

    if (!type || type === 'partner') {
      const partners = await Partner.findAll({
        where: { state_id: stateId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role']
          }
        ],
        limit: 1000
      })

      const partnerRecipients = partners.map(partner => ({
        id: partner.user.id,
        name: partner.business_name,
        email: partner.user.email,
        type: 'partner',
        role: partner.user.role
      }))

      recipients = [...recipients, ...partnerRecipients]
    }

    if (!type || type === 'coach') {
      const coaches = await Coach.findAll({
        where: { state_id: stateId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'role']
          }
        ],
        limit: 1000
      })

      const coachRecipients = coaches.map(coach => ({
        id: coach.user.id,
        name: coach.full_name,
        email: coach.user.email,
        type: 'coach',
        role: coach.user.role
      }))

      recipients = [...recipients, ...coachRecipients]
    }

    res.json({
      recipients: recipients.slice(0, 1000), // Limit to 1000 recipients
      total: recipients.length
    })

  } catch (error) {
    console.error('Error fetching state recipients:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Send individual message
const sendStateMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const { subject, message, recipient_type, recipient_ids, is_announcement, schedule_at } = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // If single recipient (direct message)
    if (recipient_type === 'direct' && recipient_ids && recipient_ids.length === 1) {
      const sentMessage = await Message.create({
        sender_id: userId,
        recipient_id: recipient_ids[0],
        recipient_type: 'direct',
        subject,
        message,
        is_announcement: is_announcement || false,
        sent_at: schedule_at ? new Date(schedule_at) : new Date()
      })

      // Fetch created message with relations
      const messageWithRelations = await Message.findByPk(sentMessage.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'email', 'role']
          },
          {
            model: User,
            as: 'recipient',
            attributes: ['id', 'username', 'email', 'role']
          }
        ]
      })

      res.status(201).json({
        message: messageWithRelations,
        success: true
      })
    } else {
      return res.status(400).json({ message: 'Invalid recipient configuration' })
    }

  } catch (error) {
    console.error('Error sending state message:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Send bulk announcement
const sendBulkAnnouncement = async (req, res) => {
  try {
    const userId = req.user.id
    const { subject, message, target_groups, recipient_ids, schedule_at } = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    let allRecipients = []

    // Get recipients based on target groups
    if (target_groups.includes('players')) {
      const players = await Player.findAll({
        where: { state_id: stateCommittee.state_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      })
      allRecipients = [...allRecipients, ...players.map(p => p.user.id)]
    }

    if (target_groups.includes('clubs')) {
      const clubs = await Club.findAll({
        where: { state_id: stateCommittee.state_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      })
      allRecipients = [...allRecipients, ...clubs.map(c => c.user.id)]
    }

    if (target_groups.includes('partners')) {
      const partners = await Partner.findAll({
        where: { state_id: stateCommittee.state_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      })
      allRecipients = [...allRecipients, ...partners.map(p => p.user.id)]
    }

    if (target_groups.includes('coaches')) {
      const coaches = await Coach.findAll({
        where: { state_id: stateCommittee.state_id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      })
      allRecipients = [...allRecipients, ...coaches.map(c => c.user.id)]
    }

    // If specific recipient IDs provided, use those instead
    if (recipient_ids && recipient_ids.length > 0) {
      allRecipients = recipient_ids
    }

    // Remove duplicates
    allRecipients = [...new Set(allRecipients)]

    // Create announcement messages for each recipient
    const sentDate = schedule_at ? new Date(schedule_at) : new Date()
    const messages = []

    for (const recipientId of allRecipients) {
      const sentMessage = await Message.create({
        sender_id: userId,
        recipient_id: recipientId,
        recipient_type: 'group',
        subject,
        message,
        is_announcement: true,
        sent_at: sentDate
      })
      messages.push(sentMessage)
    }

    // Create a summary announcement record
    const announcement = await Message.create({
      sender_id: userId,
      recipient_id: null,
      recipient_type: 'group',
      subject: `[ANNOUNCEMENT] ${subject}`,
      message: `Sent to ${allRecipients.length} recipients: ${message}`,
      is_announcement: true,
      sent_at: sentDate
    })

    // Fetch announcement with relations
    const announcementWithRelations = await Message.findByPk(announcement.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role']
        }
      ]
    })

    // Add announcement stats
    announcementWithRelations.dataValues.announcement_stats = {
      total_recipients: allRecipients.length,
      delivered: allRecipients.length,
      read: 0
    }

    res.status(201).json({
      announcement: announcementWithRelations,
      recipients_count: allRecipients.length,
      success: true
    })

  } catch (error) {
    console.error('Error sending bulk announcement:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id

    const message = await Message.findOne({
      where: {
        id: messageId,
        recipient_id: userId
      }
    })

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    await message.update({
      is_read: true,
      read_at: new Date()
    })

    res.json({ message: 'Message marked as read' })

  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id

    const message = await Message.findOne({
      where: {
        id: messageId,
        [Op.or]: [
          { sender_id: userId },
          { recipient_id: userId }
        ]
      }
    })

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    await message.destroy()

    res.json({ message: 'Message deleted successfully' })

  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get message templates
const getMessageTemplates = async (req, res) => {
  try {
    const userId = req.user.id

    const templates = await MessageTemplate.findAll({
      where: { created_by: userId },
      order: [['created_at', 'DESC']]
    })

    res.json({
      templates
    })

  } catch (error) {
    console.error('Error fetching message templates:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create message template
const createMessageTemplate = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, subject, content, target_audience } = req.body

    const template = await MessageTemplate.create({
      name,
      subject,
      content,
      target_audience,
      created_by: userId
    })

    res.status(201).json({
      template,
      message: 'Template created successfully'
    })

  } catch (error) {
    console.error('Error creating message template:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update message template
const updateMessageTemplate = async (req, res) => {
  try {
    const { templateId } = req.params
    const userId = req.user.id
    const updateData = req.body

    const template = await MessageTemplate.findOne({
      where: {
        id: templateId,
        created_by: userId
      }
    })

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    await template.update(updateData)

    res.json({
      template,
      message: 'Template updated successfully'
    })

  } catch (error) {
    console.error('Error updating message template:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete message template
const deleteMessageTemplate = async (req, res) => {
  try {
    const { templateId } = req.params
    const userId = req.user.id

    const template = await MessageTemplate.findOne({
      where: {
        id: templateId,
        created_by: userId
      }
    })

    if (!template) {
      return res.status(404).json({ message: 'Template not found' })
    }

    await template.destroy()

    res.json({ message: 'Template deleted successfully' })

  } catch (error) {
    console.error('Error deleting message template:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getStateInboxData,
  getStateRecipients,
  sendStateMessage,
  sendBulkAnnouncement,
  markMessageAsRead,
  deleteMessage,
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  deleteMessageTemplate
}