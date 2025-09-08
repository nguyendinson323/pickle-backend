const { Op } = require('sequelize')
const { 
  Message,
  MessageRecipient,
  MessageAttachment,
  User,
  Player,
  Coach,
  Club,
  Partner,
  StateCommittee
} = require('../db/models')

const sendMessage = async (senderId, messageData) => {
  const { recipientIds, subject, content, message_type, attachments } = messageData

  const message = await Message.create({
    sender_id: senderId,
    subject,
    content,
    message_type,
    has_attachments: attachments && attachments.length > 0
  })

  const recipients = recipientIds.map(recipientId => ({
    message_id: message.id,
    recipient_id: recipientId,
    is_read: false
  }))

  await MessageRecipient.bulkCreate(recipients)

  if (attachments && attachments.length > 0) {
    const messageAttachments = attachments.map(attachment => ({
      message_id: message.id,
      ...attachment
    }))
    await MessageAttachment.bulkCreate(messageAttachments)
  }

  return message
}

const sendBulkMessage = async (senderId, senderRole, messageData) => {
  const { targetGroups, subject, content, message_type } = messageData
  
  let recipientIds = []

  for (const group of targetGroups) {
    switch (group) {
      case 'all_players':
        const players = await Player.findAll()
        recipientIds.push(...players.map(p => p.user_id))
        break
      
      case 'all_coaches':
        const coaches = await Coach.findAll()
        recipientIds.push(...coaches.map(c => c.user_id))
        break
      
      case 'all_clubs':
        const clubs = await Club.findAll()
        recipientIds.push(...clubs.map(c => c.user_id))
        break
      
      case 'all_partners':
        const partners = await Partner.findAll()
        recipientIds.push(...partners.map(p => p.user_id))
        break
      
      case 'state_players':
        if (senderRole === 'state') {
          const stateCommittee = await StateCommittee.findOne({ 
            where: { user_id: senderId } 
          })
          const statePlayers = await Player.findAll({ 
            where: { state_id: stateCommittee.state_id } 
          })
          recipientIds.push(...statePlayers.map(p => p.user_id))
        }
        break
      
      case 'state_clubs':
        if (senderRole === 'state') {
          const stateCommittee = await StateCommittee.findOne({ 
            where: { user_id: senderId } 
          })
          const stateClubs = await Club.findAll({ 
            where: { state_id: stateCommittee.state_id } 
          })
          recipientIds.push(...stateClubs.map(c => c.user_id))
        }
        break
      
      case 'club_members':
        if (senderRole === 'club') {
          const club = await Club.findOne({ 
            where: { user_id: senderId } 
          })
          const members = await Player.findAll({ 
            where: { club_id: club.id } 
          })
          recipientIds.push(...members.map(m => m.user_id))
        }
        break
    }
  }

  recipientIds = [...new Set(recipientIds)]

  return await sendMessage(senderId, {
    recipientIds,
    subject,
    content,
    message_type
  })
}

const getInbox = async (userId, filters = {}) => {
  const { is_read, message_type, limit = 50, offset = 0, search } = filters

  const where = { recipient_id: userId }
  
  if (is_read !== undefined) where.is_read = is_read

  const messageWhere = {}
  if (message_type) messageWhere.message_type = message_type
  if (search) {
    messageWhere[Op.or] = [
      { subject: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } }
    ]
  }

  const messages = await MessageRecipient.findAndCountAll({
    where,
    include: [{
      model: Message,
      where: messageWhere,
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role']
        },
        { model: MessageAttachment, as: 'attachments' }
      ]
    }],
    limit,
    offset,
    order: [[Message, 'sent_at', 'DESC']]
  })

  return messages
}

const getSentMessages = async (userId, filters = {}) => {
  const { message_type, limit = 50, offset = 0, search } = filters

  const where = { sender_id: userId }
  
  if (message_type) where.message_type = message_type
  if (search) {
    where[Op.or] = [
      { subject: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } }
    ]
  }

  const messages = await Message.findAndCountAll({
    where,
    include: [
      { model: MessageAttachment, as: 'attachments' },
      {
        model: MessageRecipient,
        as: 'recipients',
        include: [{
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'email', 'role']
        }]
      }
    ],
    limit,
    offset,
    order: [['sent_at', 'DESC']]
  })

  return messages
}

const getMessage = async (messageId, userId) => {
  const messageRecipient = await MessageRecipient.findOne({
    where: {
      message_id: messageId,
      recipient_id: userId
    },
    include: [{
      model: Message,
      include: [
        { 
          model: User, 
          as: 'sender',
          attributes: ['id', 'username', 'email', 'role']
        },
        { model: MessageAttachment, as: 'attachments' }
      ]
    }]
  })

  if (!messageRecipient) {
    const message = await Message.findOne({
      where: {
        id: messageId,
        sender_id: userId
      },
      include: [
        { model: MessageAttachment, as: 'attachments' },
        {
          model: MessageRecipient,
          as: 'recipients',
          include: [{
            model: User,
            as: 'recipient',
            attributes: ['id', 'username', 'email', 'role']
          }]
        }
      ]
    })

    if (!message) {
      throw new Error('Message not found')
    }

    return { message, isSender: true }
  }

  if (!messageRecipient.is_read) {
    await messageRecipient.update({ 
      is_read: true, 
      read_at: new Date() 
    })
  }

  return { message: messageRecipient.Message, isSender: false }
}

const markAsRead = async (messageId, userId) => {
  const messageRecipient = await MessageRecipient.findOne({
    where: {
      message_id: messageId,
      recipient_id: userId
    }
  })

  if (!messageRecipient) {
    throw new Error('Message not found')
  }

  await messageRecipient.update({ 
    is_read: true, 
    read_at: new Date() 
  })

  return messageRecipient
}

const markAllAsRead = async (userId) => {
  await MessageRecipient.update(
    { 
      is_read: true, 
      read_at: new Date() 
    },
    {
      where: {
        recipient_id: userId,
        is_read: false
      }
    }
  )

  return { message: 'All messages marked as read' }
}

const deleteMessage = async (messageId, userId) => {
  const messageRecipient = await MessageRecipient.findOne({
    where: {
      message_id: messageId,
      recipient_id: userId
    }
  })

  if (messageRecipient) {
    await messageRecipient.destroy()
    return { message: 'Message removed from inbox' }
  }

  const message = await Message.findOne({
    where: {
      id: messageId,
      sender_id: userId
    }
  })

  if (!message) {
    throw new Error('Message not found')
  }

  const recipientCount = await MessageRecipient.count({
    where: { message_id: messageId }
  })

  if (recipientCount === 0) {
    await message.destroy()
  }

  return { message: 'Message deleted' }
}

const getUnreadCount = async (userId) => {
  const count = await MessageRecipient.count({
    where: {
      recipient_id: userId,
      is_read: false
    }
  })

  return { unreadCount: count }
}

module.exports = {
  sendMessage,
  sendBulkMessage,
  getInbox,
  getSentMessages,
  getMessage,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getUnreadCount
}