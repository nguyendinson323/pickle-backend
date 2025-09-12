const jwt = require('jsonwebtoken')
const { ChatRoom, ChatParticipant, ChatMessage, User, Player } = require('../db/models')

class SocketManager {
  constructor() {
    this.io = null
    this.userSockets = new Map() // userId -> socketId mapping
  }

  initialize(server) {
    this.io = require('socket.io')(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    this.io.use(this.authenticateSocket.bind(this))
    this.io.on('connection', this.handleConnection.bind(this))

    console.log('Socket.io initialized')
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findByPk(decoded.id, {
        include: [
          {
            model: Player,
            as: 'player',
            attributes: ['id', 'full_name', 'profile_photo_url']
          }
        ]
      })

      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }

      socket.userId = user.id
      socket.user = user
      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication error: Invalid token'))
    }
  }

  handleConnection(socket) {
    console.log(`User ${socket.userId} connected via socket ${socket.id}`)
    
    // Store user socket mapping
    this.userSockets.set(socket.userId, socket.id)

    // Join user to their personal room for notifications
    socket.join(`user:${socket.userId}`)

    // Load user's active chat rooms
    this.loadUserChatRooms(socket)

    // Handle socket events
    socket.on('join_chat', this.handleJoinChat.bind(this, socket))
    socket.on('leave_chat', this.handleLeaveChat.bind(this, socket))
    socket.on('send_message', this.handleSendMessage.bind(this, socket))
    socket.on('typing_start', this.handleTypingStart.bind(this, socket))
    socket.on('typing_stop', this.handleTypingStop.bind(this, socket))
    socket.on('mark_read', this.handleMarkAsRead.bind(this, socket))
    socket.on('disconnect', this.handleDisconnect.bind(this, socket))
  }

  async loadUserChatRooms(socket) {
    try {
      const chatParticipants = await ChatParticipant.findAll({
        where: { user_id: socket.userId },
        include: [
          {
            model: ChatRoom,
            as: 'chatRoom',
            attributes: ['id', 'type', 'name']
          }
        ]
      })

      // Join all chat rooms
      chatParticipants.forEach(participant => {
        const roomId = `chat:${participant.chatRoom.id}`
        socket.join(roomId)
        console.log(`User ${socket.userId} joined chat room ${roomId}`)
      })
    } catch (error) {
      console.error('Error loading user chat rooms:', error)
    }
  }

  async handleJoinChat(socket, data) {
    try {
      const { chatRoomId } = data
      const roomId = `chat:${chatRoomId}`

      // Verify user is participant in this chat
      const participant = await ChatParticipant.findOne({
        where: {
          user_id: socket.userId,
          chat_room_id: chatRoomId
        }
      })

      if (participant) {
        socket.join(roomId)
        socket.emit('joined_chat', { chatRoomId, success: true })
        console.log(`User ${socket.userId} joined chat ${roomId}`)
      } else {
        socket.emit('joined_chat', { chatRoomId, success: false, error: 'Not authorized' })
      }
    } catch (error) {
      console.error('Error joining chat:', error)
      socket.emit('joined_chat', { chatRoomId: data.chatRoomId, success: false, error: 'Server error' })
    }
  }

  handleLeaveChat(socket, data) {
    const { chatRoomId } = data
    const roomId = `chat:${chatRoomId}`
    socket.leave(roomId)
    console.log(`User ${socket.userId} left chat ${roomId}`)
  }

  async handleSendMessage(socket, data) {
    try {
      const { chatRoomId, content, messageType = 'text' } = data

      // Verify user is participant in this chat
      const participant = await ChatParticipant.findOne({
        where: {
          user_id: socket.userId,
          chat_room_id: chatRoomId
        }
      })

      if (!participant) {
        socket.emit('message_error', { error: 'Not authorized to send messages in this chat' })
        return
      }

      // Create message in database
      const message = await ChatMessage.create({
        chat_room_id: chatRoomId,
        sender_id: socket.userId,
        content,
        message_type: messageType,
        sent_at: new Date()
      })

      // Get message with sender details
      const messageWithSender = await ChatMessage.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            include: [
              {
                model: Player,
                as: 'player',
                attributes: ['id', 'full_name', 'profile_photo_url']
              }
            ]
          }
        ]
      })

      // Update last message timestamp in chat room
      await ChatRoom.update(
        { last_message_at: new Date() },
        { where: { id: chatRoomId } }
      )

      // Emit message to all participants in the chat room
      const roomId = `chat:${chatRoomId}`
      this.io.to(roomId).emit('new_message', {
        id: message.id,
        chatRoomId,
        content,
        messageType,
        sentAt: message.sent_at,
        sender: {
          id: socket.userId,
          username: messageWithSender.sender.username,
          player: messageWithSender.sender.player
        }
      })

      console.log(`Message sent in chat ${roomId} by user ${socket.userId}`)
    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('message_error', { error: 'Failed to send message' })
    }
  }

  handleTypingStart(socket, data) {
    const { chatRoomId } = data
    const roomId = `chat:${chatRoomId}`
    
    socket.to(roomId).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      chatRoomId
    })
  }

  handleTypingStop(socket, data) {
    const { chatRoomId } = data
    const roomId = `chat:${chatRoomId}`
    
    socket.to(roomId).emit('user_stop_typing', {
      userId: socket.userId,
      chatRoomId
    })
  }

  async handleMarkAsRead(socket, data) {
    try {
      const { chatRoomId, messageId } = data

      // Update last read message for user
      await ChatParticipant.update(
        { 
          last_read: new Date()
        },
        {
          where: {
            user_id: socket.userId,
            chat_room_id: chatRoomId
          }
        }
      )

      // Notify other participants that messages were read
      const roomId = `chat:${chatRoomId}`
      socket.to(roomId).emit('messages_read', {
        userId: socket.userId,
        chatRoomId,
        messageId
      })

    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  handleDisconnect(socket) {
    console.log(`User ${socket.userId} disconnected`)
    this.userSockets.delete(socket.userId)
  }

  // Public methods for sending notifications
  sendNotificationToUser(userId, notification) {
    const userRoom = `user:${userId}`
    this.io.to(userRoom).emit('notification', notification)
  }

  sendMessageToChat(chatRoomId, message) {
    const roomId = `chat:${chatRoomId}`
    this.io.to(roomId).emit('new_message', message)
  }

  sendAnnouncementToUsers(userIds, announcement) {
    userIds.forEach(userId => {
      const userRoom = `user:${userId}`
      this.io.to(userRoom).emit('announcement', announcement)
    })
  }

  getOnlineUsers() {
    return Array.from(this.userSockets.keys())
  }

  isUserOnline(userId) {
    return this.userSockets.has(userId)
  }
}

module.exports = new SocketManager()