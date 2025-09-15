const { 
  StateCommittee, 
  User, 
  Message, 
  MessageRecipient, 
  MessageAttachment,
  MessageTemplate,
  Player, 
  Club, 
  Partner, 
  Coach 
} = require('../db/models')
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
      return res.status(404).json({ message: 'State committee not found' })
    }

    // Get received messages through message_recipients table
    const receivedMessageRecipients = await MessageRecipient.findAll({
      where: { recipient_id: userId },
      include: [
        {
          model: Message,
          as: 'message',
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'email', 'role']
            },
            {
              model: MessageAttachment,
              as: 'attachments',
              required: false
            }
          ]
        }
      ],
      order: [['message', 'sent_at', 'DESC']],
      limit: 100
    })

    // Transform to messages with recipient info
    const messages = receivedMessageRecipients.map(recipient => ({
      ...recipient.message.dataValues,
      is_read: recipient.is_read,
      read_at: recipient.read_at,
      recipient_info: {
        is_read: recipient.is_read,
        read_at: recipient.read_at
      }
    }))

    // Get sent messages
    const sentMessages = await Message.findAll({
      where: { sender_id: userId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: MessageRecipient,
          as: 'recipients',
          include: [
            {
              model: User,
              as: 'recipient',
              attributes: ['id', 'username', 'email', 'role']
            }
          ]
        },
        {
          model: MessageAttachment,
          as: 'attachments',
          required: false
        }
      ],
      order: [['sent_at', 'DESC']],
      limit: 100
    })

    // Calculate statistics
    const totalMessages = messages.length
    const unreadMessages = messages.filter(m => !m.is_read).length
    const announcementsSent = sentMessages.filter(m => m.message_type === 'announcement').length
    
    // Calculate total recipients reached
    const totalRecipientsReached = sentMessages.reduce((sum, message) => {
      return sum + (message.recipients ? message.recipients.length : 0)
    }, 0)

    // Recent activity (messages in last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentSentCount = await Message.count({
      where: {
        sender_id: userId,
        sent_at: { [Op.gte]: sevenDaysAgo }
      }
    })

    const recentReceivedCount = await MessageRecipient.count({
      where: {
        recipient_id: userId,
        created_at: { [Op.gte]: sevenDaysAgo }
      }
    })

    const stats = {
      total_messages: totalMessages,
      unread_messages: unreadMessages,
      announcements_sent: announcementsSent,
      total_recipients_reached: totalRecipientsReached,
      recent_activity: recentSentCount + recentReceivedCount
    }

    res.json({
      messages,
      sentMessages,
      stats
    })

  } catch (error) {
    console.error('Error fetching state inbox data:', error)
    res.status(500).json({ message: 'Failed to fetch inbox data' })
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
      return res.status(404).json({ message: 'State committee not found' })
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
    res.status(500).json({ message: 'Failed to fetch recipients' })
  }
}

// Send individual message
const sendStateMessage = async (req, res) => {
  try {
    const userId = req.user.id
    const { subject, content, recipient_ids, message_type = 'direct' } = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    if (!recipient_ids || recipient_ids.length === 0) {
      return res.status(400).json({ message: 'At least one recipient is required' })
    }

    // Create the message
    const message = await Message.create({
      sender_id: userId,
      subject,
      content,
      message_type,
      sent_at: new Date(),
      has_attachments: false
    })

    // Create message recipients
    const messageRecipients = await Promise.all(
      recipient_ids.map(recipientId => 
        MessageRecipient.create({
          message_id: message.id,
          recipient_id: recipientId,
          is_read: false
        })
      )
    )

    // Fetch created message with relations
    const messageWithRelations = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: MessageRecipient,
          as: 'recipients',
          include: [
            {
              model: User,
              as: 'recipient',
              attributes: ['id', 'username', 'email', 'role']
            }
          ]
        }
      ]
    })

    res.status(201).json({
      message: messageWithRelations,
      recipients_count: recipient_ids.length,
      success: true
    })

  } catch (error) {
    console.error('Error sending state message:', error)
    res.status(500).json({ message: 'Failed to send message' })
  }
}

// Send bulk announcement
const sendBulkAnnouncement = async (req, res) => {
  try {
    const userId = req.user.id
    const { subject, content, target_groups, recipient_ids } = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    let allRecipients = []

    // Get recipients based on target groups
    if (target_groups && target_groups.length > 0) {
      if (target_groups.includes('players')) {
        const players = await Player.findAll({
          where: { state_id: stateCommittee.state_id },
          include: [{ model: User, as: 'user', attributes: ['id'] }]
        })
        allRecipients = [...allRecipients, ...players.map(p => p.user.id)]
      }

      if (target_groups.includes('clubs')) {
        const clubs = await Club.findAll({
          where: { state_id: stateCommittee.state_id },
          include: [{ model: User, as: 'user', attributes: ['id'] }]
        })
        allRecipients = [...allRecipients, ...clubs.map(c => c.user.id)]
      }

      if (target_groups.includes('partners')) {
        const partners = await Partner.findAll({
          where: { state_id: stateCommittee.state_id },
          include: [{ model: User, as: 'user', attributes: ['id'] }]
        })
        allRecipients = [...allRecipients, ...partners.map(p => p.user.id)]
      }

      if (target_groups.includes('coaches')) {
        const coaches = await Coach.findAll({
          where: { state_id: stateCommittee.state_id },
          include: [{ model: User, as: 'user', attributes: ['id'] }]
        })
        allRecipients = [...allRecipients, ...coaches.map(c => c.user.id)]
      }
    }

    // If specific recipient IDs provided, use those instead
    if (recipient_ids && recipient_ids.length > 0) {
      allRecipients = recipient_ids
    }

    // Remove duplicates
    allRecipients = [...new Set(allRecipients)]

    if (allRecipients.length === 0) {
      return res.status(400).json({ message: 'No recipients found' })
    }

    // Create the announcement message
    const announcement = await Message.create({
      sender_id: userId,
      subject,
      content,
      message_type: 'announcement',
      sent_at: new Date(),
      has_attachments: false
    })

    // Create message recipients for all recipients
    await Promise.all(
      allRecipients.map(recipientId => 
        MessageRecipient.create({
          message_id: announcement.id,
          recipient_id: recipientId,
          is_read: false
        })
      )
    )

    // Fetch announcement with relations
    const announcementWithRelations = await Message.findByPk(announcement.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role']
        },
        {
          model: MessageRecipient,
          as: 'recipients',
          include: [
            {
              model: User,
              as: 'recipient',
              attributes: ['id', 'username', 'email', 'role']
            }
          ]
        }
      ]
    })

    res.status(201).json({
      announcement: announcementWithRelations,
      recipients_count: allRecipients.length,
      success: true
    })

  } catch (error) {
    console.error('Error sending bulk announcement:', error)
    res.status(500).json({ message: 'Failed to send announcement' })
  }
}

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id

    const messageRecipient = await MessageRecipient.findOne({
      where: {
        message_id: messageId,
        recipient_id: userId
      }
    })

    if (!messageRecipient) {
      return res.status(404).json({ message: 'Message not found' })
    }

    await messageRecipient.update({
      is_read: true,
      read_at: new Date()
    })

    res.json({ message: 'Message marked as read', success: true })

  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ message: 'Failed to mark message as read' })
  }
}

// Delete message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id

    // Check if user is sender or recipient
    const message = await Message.findOne({
      where: { id: messageId },
      include: [
        {
          model: MessageRecipient,
          as: 'recipients',
          where: { recipient_id: userId },
          required: false
        }
      ]
    })

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // If user is sender, delete the entire message
    if (message.sender_id === userId) {
      await message.destroy()
      res.json({ message: 'Message deleted successfully', success: true })
    } 
    // If user is recipient, only delete their recipient record
    else if (message.recipients && message.recipients.length > 0) {
      await MessageRecipient.destroy({
        where: {
          message_id: messageId,
          recipient_id: userId
        }
      })
      res.json({ message: 'Message removed from inbox', success: true })
    } 
    else {
      return res.status(403).json({ message: 'Not authorized to delete this message' })
    }

  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ message: 'Failed to delete message' })
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

    // Map body field to content for frontend compatibility
    const templatesWithContent = templates.map(template => ({
      ...template.toJSON(),
      content: template.body,
      target_audience: 'All Members' // Default value for compatibility
    }))

    res.json({
      templates: templatesWithContent,
      success: true
    })

  } catch (error) {
    console.error('Error fetching message templates:', error)
    res.status(500).json({ message: 'Failed to fetch templates' })
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
      body: content,
      created_by: userId
    })

    res.status(201).json({
      template,
      message: 'Template created successfully',
      success: true
    })

  } catch (error) {
    console.error('Error creating message template:', error)
    res.status(500).json({ message: 'Failed to create template' })
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

    // Map content to body for database compatibility
    if (updateData.content) {
      updateData.body = updateData.content
      delete updateData.content
    }

    await template.update(updateData)

    res.json({
      template,
      message: 'Template updated successfully',
      success: true
    })

  } catch (error) {
    console.error('Error updating message template:', error)
    res.status(500).json({ message: 'Failed to update template' })
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

    res.json({ 
      message: 'Template deleted successfully',
      success: true 
    })

  } catch (error) {
    console.error('Error deleting message template:', error)
    res.status(500).json({ message: 'Failed to delete template' })
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