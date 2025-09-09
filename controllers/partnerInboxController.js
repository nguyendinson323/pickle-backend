const { Partner, User, Message, MessageRecipient, MessageAttachment, Sequelize } = require('../db/models')
const { Op } = require('sequelize')

// Get partner inbox data (received messages with stats)
const getPartnerInboxData = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      message_type,
      sender_role,
      is_read,
      search
    } = req.query
    
    // Get partner profile
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Build where conditions for messages
    const messageWhere = {}
    const recipientWhere = {
      recipient_id: userId
    }

    // Apply filters
    if (message_type) {
      messageWhere.message_type = message_type
    }

    if (is_read !== undefined && is_read !== '') {
      recipientWhere.is_read = is_read === 'true'
    }

    if (search) {
      messageWhere[Op.or] = [
        { subject: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ]
    }

    // Get messages received by partner
    const messages = await Message.findAll({
      where: messageWhere,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role'],
          where: sender_role ? { role: sender_role } : {}
        },
        {
          model: MessageRecipient,
          as: 'recipients',
          where: recipientWhere,
          attributes: ['message_id', 'recipient_id', 'is_read', 'read_at']
        },
        {
          model: MessageAttachment,
          as: 'attachments',
          attributes: ['id', 'file_name', 'file_url', 'file_type', 'file_size'],
          required: false
        }
      ],
      order: [['sent_at', 'DESC']],
      limit: 100
    })

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      ...message.toJSON(),
      recipient: message.recipients[0]
    }))

    // Calculate statistics
    const totalMessages = await MessageRecipient.count({
      where: { recipient_id: userId }
    })

    const unreadMessages = await MessageRecipient.count({
      where: { 
        recipient_id: userId,
        is_read: false 
      }
    })

    // Messages by type
    const messagesByType = await Message.findAll({
      include: [
        {
          model: MessageRecipient,
          as: 'recipients',
          where: { recipient_id: userId },
          attributes: []
        }
      ],
      attributes: [
        'message_type',
        [Sequelize.fn('COUNT', Sequelize.col('Message.id')), 'count']
      ],
      group: ['message_type']
    })

    const messagesTypeCount = {}
    messagesByType.forEach(item => {
      messagesTypeCount[item.message_type] = parseInt(item.dataValues.count)
    })

    // Messages by sender role
    const messagesBySender = await Message.findAll({
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['role']
        },
        {
          model: MessageRecipient,
          as: 'recipients',
          where: { recipient_id: userId },
          attributes: []
        }
      ],
      attributes: [
        [Sequelize.col('sender.role'), 'sender_role'],
        [Sequelize.fn('COUNT', Sequelize.col('Message.id')), 'count']
      ],
      group: ['sender.role']
    })

    const messagesSenderCount = {}
    messagesBySender.forEach(item => {
      const role = item.dataValues.sender_role
      messagesSenderCount[role] = parseInt(item.dataValues.count)
    })

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await MessageRecipient.count({
      where: {
        recipient_id: userId,
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    })

    const stats = {
      total_messages: totalMessages,
      unread_messages: unreadMessages,
      messages_by_type: messagesTypeCount,
      messages_by_sender: messagesSenderCount,
      recent_activity: recentActivity
    }

    res.json({
      messages: formattedMessages,
      stats
    })

  } catch (error) {
    console.error('Error fetching partner inbox data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Mark message as read
const markPartnerMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id
    
    // Get partner profile
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Find and update message recipient record
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

    res.json({ message: 'Message marked as read' })

  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete message (remove recipient record)
const deletePartnerMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id
    
    // Get partner profile
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Find and delete message recipient record
    const messageRecipient = await MessageRecipient.findOne({
      where: {
        message_id: messageId,
        recipient_id: userId
      }
    })

    if (!messageRecipient) {
      return res.status(404).json({ message: 'Message not found' })
    }

    await messageRecipient.destroy()

    res.json({ message: 'Message deleted successfully' })

  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getPartnerInboxData,
  markPartnerMessageAsRead,
  deletePartnerMessage
}