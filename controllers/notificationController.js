const notificationService = require('../services/notificationService')

const getNotifications = async (req, res) => {
  try {
    const userId = req.userId
    const filters = req.query
    
    const notifications = await notificationService.getNotifications(userId, filters)
    
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId
    
    const notification = await notificationService.markAsRead(id, userId)
    
    res.json(notification)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId
    
    const result = await notificationService.markAllAsRead(userId)
    
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId
    
    const result = await notificationService.deleteNotification(id, userId)
    
    res.json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId
    
    const count = await notificationService.getUnreadCount(userId)
    
    res.json(count)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const sendTournamentNotification = async (req, res) => {
  try {
    const { tournamentId, title, content } = req.body
    
    const result = await notificationService.sendTournamentNotification(tournamentId, title, content)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const sendMatchNotification = async (req, res) => {
  try {
    const { matchId, title, content } = req.body
    
    const result = await notificationService.sendMatchNotification(matchId, title, content)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const sendCourtReservationNotification = async (req, res) => {
  try {
    const { reservationId, title, content } = req.body
    
    const result = await notificationService.sendCourtReservationNotification(reservationId, title, content)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const sendPlayerMatchRequestNotification = async (req, res) => {
  try {
    const { requestId, title, content } = req.body
    
    const result = await notificationService.sendPlayerMatchRequestNotification(requestId, title, content)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const sendPaymentNotification = async (req, res) => {
  try {
    const { paymentId, title, content } = req.body
    
    const result = await notificationService.sendPaymentNotification(paymentId, title, content)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendTournamentNotification,
  sendMatchNotification,
  sendCourtReservationNotification,
  sendPlayerMatchRequestNotification,
  sendPaymentNotification
}