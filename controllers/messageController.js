const messageService = require('../services/messageService')

const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId
    const messageData = req.body
    
    const message = await messageService.sendMessage(senderId, messageData)
    
    res.status(201).json(message)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const sendBulkMessage = async (req, res) => {
  try {
    const senderId = req.userId
    const senderRole = req.userRole
    const messageData = req.body
    
    const message = await messageService.sendBulkMessage(senderId, senderRole, messageData)
    
    res.status(201).json(message)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getInbox = async (req, res) => {
  try {
    const userId = req.userId
    const filters = req.query
    
    const messages = await messageService.getInbox(userId, filters)
    
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getSentMessages = async (req, res) => {
  try {
    const userId = req.userId
    const filters = req.query
    
    const messages = await messageService.getSentMessages(userId, filters)
    
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getMessage = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId
    
    const message = await messageService.getMessage(id, userId)
    
    res.json(message)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId
    
    const message = await messageService.markAsRead(id, userId)
    
    res.json(message)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId
    
    const result = await messageService.markAllAsRead(userId)
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId
    
    const result = await messageService.deleteMessage(id, userId)
    
    res.json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId
    
    const count = await messageService.getUnreadCount(userId)
    
    res.json(count)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
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