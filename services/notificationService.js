const { Op } = require('sequelize')
const { Notification } = require('../db/models')

const createNotification = async (userId, notificationData) => {
  const { title, content, notification_type, action_url } = notificationData

  const notification = await Notification.create({
    user_id: userId,
    title,
    content,
    notification_type,
    action_url,
    is_read: false
  })

  return notification
}

const createBulkNotifications = async (userIds, notificationData) => {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    ...notificationData,
    is_read: false
  }))

  const createdNotifications = await Notification.bulkCreate(notifications)

  return createdNotifications
}

const getNotifications = async (userId, filters = {}) => {
  const { is_read, notification_type, limit = 50, offset = 0 } = filters

  const where = { user_id: userId }
  
  if (is_read !== undefined) where.is_read = is_read
  if (notification_type) where.notification_type = notification_type

  const notifications = await Notification.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  })

  return notifications
}

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      user_id: userId
    }
  })

  if (!notification) {
    throw new Error('Notification not found')
  }

  await notification.update({ 
    is_read: true, 
    read_at: new Date() 
  })

  return notification
}

const markAllAsRead = async (userId) => {
  await Notification.update(
    { 
      is_read: true, 
      read_at: new Date() 
    },
    {
      where: {
        user_id: userId,
        is_read: false
      }
    }
  )

  return { message: 'All notifications marked as read' }
}

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: {
      id: notificationId,
      user_id: userId
    }
  })

  if (!notification) {
    throw new Error('Notification not found')
  }

  await notification.destroy()

  return { message: 'Notification deleted' }
}

const getUnreadCount = async (userId) => {
  const count = await Notification.count({
    where: {
      user_id: userId,
      is_read: false
    }
  })

  return { unreadCount: count }
}

const sendTournamentNotification = async (tournamentId, title, content) => {
  const { TournamentRegistration, Player } = require('../db/models')
  
  const registrations = await TournamentRegistration.findAll({
    where: { tournament_id: tournamentId },
    include: [{ model: Player, as: 'player' }]
  })

  const userIds = registrations.map(reg => reg.player.user_id)

  if (userIds.length > 0) {
    await createBulkNotifications(userIds, {
      title,
      content,
      notification_type: 'Tournament',
      action_url: `/tournaments/${tournamentId}`
    })
  }

  return { message: `Notifications sent to ${userIds.length} tournament participants` }
}

const sendMatchNotification = async (matchId, title, content) => {
  const { TournamentMatch } = require('../db/models')
  
  const match = await TournamentMatch.findByPk(matchId)

  if (!match) {
    throw new Error('Match not found')
  }

  const userIds = []
  
  const { Player } = require('../db/models')
  
  if (match.player1_id) {
    const player1 = await Player.findByPk(match.player1_id)
    if (player1) userIds.push(player1.user_id)
  }
  
  if (match.player2_id) {
    const player2 = await Player.findByPk(match.player2_id)
    if (player2) userIds.push(player2.user_id)
  }
  
  if (match.player3_id) {
    const player3 = await Player.findByPk(match.player3_id)
    if (player3) userIds.push(player3.user_id)
  }
  
  if (match.player4_id) {
    const player4 = await Player.findByPk(match.player4_id)
    if (player4) userIds.push(player4.user_id)
  }

  if (userIds.length > 0) {
    await createBulkNotifications(userIds, {
      title,
      content,
      notification_type: 'Match',
      action_url: `/matches/${matchId}`
    })
  }

  return { message: `Notifications sent to ${userIds.length} players` }
}

const sendCourtReservationNotification = async (reservationId, title, content) => {
  const { CourtReservation, Player } = require('../db/models')
  
  const reservation = await CourtReservation.findByPk(reservationId, {
    include: [{ model: Player, as: 'player' }]
  })

  if (!reservation) {
    throw new Error('Reservation not found')
  }

  await createNotification(reservation.player.user_id, {
    title,
    content,
    notification_type: 'Court Reservation',
    action_url: `/reservations/${reservationId}`
  })

  return { message: 'Notification sent to player' }
}

const sendPlayerMatchRequestNotification = async (requestId, title, content) => {
  const { PlayerMatchRequest, Player } = require('../db/models')
  
  const request = await PlayerMatchRequest.findByPk(requestId, {
    include: [
      { model: Player, as: 'requester' },
      { model: Player, as: 'receiver' }
    ]
  })

  if (!request) {
    throw new Error('Match request not found')
  }

  await createNotification(request.receiver.user_id, {
    title,
    content,
    notification_type: 'Match Request',
    action_url: `/match-requests/${requestId}`
  })

  return { message: 'Notification sent to receiver' }
}

const sendPaymentNotification = async (paymentId, title, content) => {
  const { Payment } = require('../db/models')
  
  const payment = await Payment.findByPk(paymentId)

  if (!payment) {
    throw new Error('Payment not found')
  }

  await createNotification(payment.user_id, {
    title,
    content,
    notification_type: 'Payment',
    action_url: `/payments/${paymentId}`
  })

  return { message: 'Payment notification sent' }
}

const sendAffiliationReminderNotifications = async () => {
  const { Player, Coach, Club, StateCommittee } = require('../db/models')
  
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const expiringPlayers = await Player.findAll({
    where: {
      affiliation_expires_at: {
        [Op.lte]: thirtyDaysFromNow,
        [Op.gte]: new Date()
      }
    }
  })

  const expiringCoaches = await Coach.findAll({
    where: {
      affiliation_expires_at: {
        [Op.lte]: thirtyDaysFromNow,
        [Op.gte]: new Date()
      }
    }
  })

  const expiringClubs = await Club.findAll({
    where: {
      affiliation_expires_at: {
        [Op.lte]: thirtyDaysFromNow,
        [Op.gte]: new Date()
      }
    }
  })

  const expiringStates = await StateCommittee.findAll({
    where: {
      affiliation_expires_at: {
        [Op.lte]: thirtyDaysFromNow,
        [Op.gte]: new Date()
      }
    }
  })

  const notifications = []

  for (const player of expiringPlayers) {
    notifications.push({
      user_id: player.user_id,
      title: 'Affiliation Expiring Soon',
      content: `Your player affiliation expires on ${player.affiliation_expires_at}. Please renew to maintain your status.`,
      notification_type: 'Affiliation',
      action_url: '/profile/affiliation'
    })
  }

  for (const coach of expiringCoaches) {
    notifications.push({
      user_id: coach.user_id,
      title: 'Affiliation Expiring Soon',
      content: `Your coach affiliation expires on ${coach.affiliation_expires_at}. Please renew to maintain your status.`,
      notification_type: 'Affiliation',
      action_url: '/profile/affiliation'
    })
  }

  for (const club of expiringClubs) {
    notifications.push({
      user_id: club.user_id,
      title: 'Affiliation Expiring Soon',
      content: `Your club affiliation expires on ${club.affiliation_expires_at}. Please renew to maintain your status.`,
      notification_type: 'Affiliation',
      action_url: '/profile/affiliation'
    })
  }

  for (const state of expiringStates) {
    notifications.push({
      user_id: state.user_id,
      title: 'Affiliation Expiring Soon',
      content: `Your state committee affiliation expires on ${state.affiliation_expires_at}. Please renew to maintain your status.`,
      notification_type: 'Affiliation',
      action_url: '/profile/affiliation'
    })
  }

  if (notifications.length > 0) {
    await Notification.bulkCreate(notifications)
  }

  return { message: `${notifications.length} affiliation reminder notifications sent` }
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendTournamentNotification,
  sendMatchNotification,
  sendCourtReservationNotification,
  sendPlayerMatchRequestNotification,
  sendPaymentNotification,
  sendAffiliationReminderNotifications
}