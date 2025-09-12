const { Message, MessageRecipient, Player, Club, User, State, ChatRoom, ChatParticipant, ChatMessage } = require('../db/models');
const { Op, Sequelize } = require('sequelize');

const playerMessagesController = {
  // Get all conversations for the current user
  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      // Get chat rooms where user is a participant
      const userChatRooms = await ChatParticipant.findAll({
        where: { user_id: userId },
        include: [
          {
            model: ChatRoom,
            as: 'chatRoom',
            include: [
              {
                model: ChatParticipant,
                as: 'participants',
                where: {
                  user_id: { [Op.ne]: userId }
                },
                include: [
                  {
                    model: User,
                    as: 'user',
                    include: [
                      {
                        model: Player,
                        as: 'player',
                        attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        order: [['last_read', 'DESC']]
      });

      // Format conversations for frontend
      const formattedConversations = await Promise.all(userChatRooms.map(async (userChat) => {
        const chatRoom = userChat.chatRoom;
        const otherParticipants = chatRoom.participants;
        
        // Get unread message count
        const unreadCount = await ChatMessage.count({
          where: {
            chat_room_id: chatRoom.id,
            sender_id: { [Op.ne]: userId },
            sent_at: {
              [Op.gt]: userChat.last_read || '1900-01-01'
            }
          }
        });

        // Get last message
        const lastMessage = await ChatMessage.findOne({
          where: { chat_room_id: chatRoom.id },
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
          ],
          order: [['sent_at', 'DESC']]
        });

        const otherParticipant = otherParticipants.length > 0 ? otherParticipants[0] : null;

        return {
          id: chatRoom.id,
          participant1_id: userId,
          participant2_id: otherParticipant ? otherParticipant.user.id : null,
          last_message_id: lastMessage ? lastMessage.id : null,
          created_at: chatRoom.created_at,
          updated_at: lastMessage ? lastMessage.sent_at : chatRoom.created_at,
          participant: otherParticipant ? {
            id: otherParticipant.user.id,
            full_name: otherParticipant.user.player ? otherParticipant.user.player.full_name : otherParticipant.user.username,
            profile_image: otherParticipant.user.player ? otherParticipant.user.player.profile_photo_url : null,
            skill_level: otherParticipant.user.player ? otherParticipant.user.player.nrtp_level : null,
            is_online: false,
            last_seen: null
          } : null,
          last_message: lastMessage ? {
            id: lastMessage.id,
            conversation_id: chatRoom.id,
            sender_id: lastMessage.sender_id,
            receiver_id: otherParticipant ? otherParticipant.user.id : null,
            content: lastMessage.content,
            message_type: lastMessage.message_type || 'text',
            attachment_url: lastMessage.attachment_url,
            is_read: false,
            sent_at: lastMessage.sent_at,
            edited_at: lastMessage.edited_at,
            sender: {
              id: lastMessage.sender.id,
              full_name: lastMessage.sender.player ? lastMessage.sender.player.full_name : lastMessage.sender.username,
              profile_image: lastMessage.sender.player ? lastMessage.sender.player.profile_photo_url : null,
              skill_level: lastMessage.sender.player ? lastMessage.sender.player.nrtp_level : null,
              is_online: false,
              last_seen: null
            }
          } : null,
          unread_count: unreadCount
        };
      }));

      res.json(formattedConversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to get conversations' });
    }
  },

  // Get messages for a specific conversation
  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user.id;

      // Verify user is part of this chat room
      const userParticipation = await ChatParticipant.findOne({
        where: {
          chat_room_id: conversationId,
          user_id: userId
        }
      });

      if (!userParticipation) {
        return res.status(404).json({ error: 'Chat room not found or access denied' });
      }

      const offset = (page - 1) * limit;
      
      const { rows: messages, count } = await ChatMessage.findAndCountAll({
        where: { chat_room_id: conversationId },
        include: [
          {
            model: User,
            as: 'sender',
            include: [
              {
                model: Player,
                as: 'player',
                attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level']
              }
            ]
          }
        ],
        order: [['sent_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      const hasMore = offset + messages.length < count;

      // Transform messages to frontend format
      const transformedMessages = messages.map(msg => ({
        id: msg.id,
        conversation_id: msg.chat_room_id,
        sender_id: msg.sender_id,
        receiver_id: null, // Will be calculated from participants
        content: msg.content,
        message_type: msg.message_type || 'text',
        attachment_url: msg.attachment_url,
        is_read: false, // Will be calculated based on read receipts
        sent_at: msg.sent_at,
        edited_at: msg.edited_at,
        sender: {
          id: msg.sender.id,
          full_name: msg.sender.player ? msg.sender.player.full_name : msg.sender.username,
          profile_image: msg.sender.player ? msg.sender.player.profile_photo_url : null,
          skill_level: msg.sender.player ? msg.sender.player.nrtp_level : null,
          is_online: false,
          last_seen: null
        }
      }));

      res.json({
        messages: transformedMessages,
        total_count: count,
        has_more: hasMore
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  // Send a new message
  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { 
        chat_room_id, 
        receiver_id, 
        content
      } = req.body;

      let chatRoomId = chat_room_id;

      // If no chat_room_id, create or find existing direct chat room
      if (!chatRoomId && receiver_id) {
        // Find existing direct chat room
        const existingRooms = await ChatRoom.findAll({
          where: { type: 'direct' },
          include: [
            {
              model: ChatParticipant,
              as: 'participants',
              where: {
                user_id: { [Op.in]: [userId, receiver_id] }
              }
            }
          ]
        });

        let chatRoom = null;
        
        // Check if any room has exactly these two participants
        for (const room of existingRooms) {
          const participantIds = room.participants.map(p => p.user_id);
          if (participantIds.length === 2 && 
              participantIds.includes(userId) && 
              participantIds.includes(parseInt(receiver_id))) {
            chatRoom = room;
            break;
          }
        }

        if (!chatRoom) {
          // Create new direct chat room
          chatRoom = await ChatRoom.create({
            type: 'direct'
          });
          
          // Add both participants
          await ChatParticipant.bulkCreate([
            { chat_room_id: chatRoom.id, user_id: userId },
            { chat_room_id: chatRoom.id, user_id: receiver_id }
          ]);
        }

        chatRoomId = chatRoom.id;
      }

      if (!chatRoomId) {
        return res.status(400).json({ error: 'Chat room ID or receiver ID required' });
      }

      // Create the message
      const message = await ChatMessage.create({
        chat_room_id: chatRoomId,
        sender_id: userId,
        content,
        sent_at: new Date(),
        is_system_message: false
      });

      // Get full message with sender details
      const fullMessage = await ChatMessage.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            include: [
              {
                model: Player,
                as: 'player',
                attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level']
              }
            ]
          }
        ]
      });

      // Transform to frontend format
      const transformedMessage = {
        id: fullMessage.id,
        conversation_id: fullMessage.chat_room_id,
        sender_id: fullMessage.sender_id,
        receiver_id: receiver_id || null,
        content: fullMessage.content,
        message_type: fullMessage.message_type || 'text',
        attachment_url: fullMessage.attachment_url,
        is_read: false,
        sent_at: fullMessage.sent_at,
        edited_at: fullMessage.edited_at,
        sender: {
          id: fullMessage.sender.id,
          full_name: fullMessage.sender.player ? fullMessage.sender.player.full_name : fullMessage.sender.username,
          profile_image: fullMessage.sender.player ? fullMessage.sender.player.profile_photo_url : null,
          skill_level: fullMessage.sender.player ? fullMessage.sender.player.nrtp_level : null,
          is_online: false,
          last_seen: null
        }
      };

      res.status(201).json(transformedMessage);
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  // Start a new conversation
  async startConversation(req, res) {
    try {
      const userId = req.user.id;
      const { receiver_id, initial_message } = req.body;

      if (userId === parseInt(receiver_id)) {
        return res.status(400).json({ error: 'Cannot start conversation with yourself' });
      }

      // Create new direct chat room
      const chatRoom = await ChatRoom.create({
        type: 'direct'
      });
      
      // Add both participants
      await ChatParticipant.bulkCreate([
        { chat_room_id: chatRoom.id, user_id: userId },
        { chat_room_id: chatRoom.id, user_id: receiver_id }
      ]);

      // Send initial message if provided
      if (initial_message) {
        await ChatMessage.create({
          chat_room_id: chatRoom.id,
          sender_id: userId,
          content: initial_message,
          sent_at: new Date(),
          is_system_message: false
        });
      }

      // Get chat room with participant details
      const fullChatRoom = await ChatRoom.findByPk(chatRoom.id, {
        include: [
          {
            model: ChatParticipant,
            as: 'participants',
            include: [
              {
                model: User,
                as: 'user',
                include: [
                  {
                    model: Player,
                    as: 'player',
                    attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level']
                  }
                ]
              }
            ]
          }
        ]
      });

      const otherParticipant = fullChatRoom.participants.find(p => p.user_id !== userId);

      const response = {
        id: fullChatRoom.id,
        type: fullChatRoom.type,
        created_at: fullChatRoom.created_at,
        participant: otherParticipant ? {
          id: otherParticipant.user.id,
          full_name: otherParticipant.user.player ? otherParticipant.user.player.full_name : otherParticipant.user.username,
          profile_image: otherParticipant.user.player ? otherParticipant.user.player.profile_photo_url : null,
          skill_level: otherParticipant.user.player ? otherParticipant.user.player.nrtp_level : null
        } : null,
        unread_count: 0
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Start conversation error:', error);
      res.status(500).json({ error: 'Failed to start conversation' });
    }
  },

  // Search for players to message
  async searchPlayers(req, res) {
    try {
      const { q } = req.query;
      const userId = req.user.id;

      if (!q || q.length < 2) {
        return res.json([]);
      }

      // Get current player
      const currentUser = await User.findByPk(userId, {
        include: [{
          model: Player,
          as: 'player'
        }]
      });

      const currentPlayerId = currentUser && currentUser.player ? currentUser.player.id : null;

      const players = await Player.findAll({
        where: {
          id: { [Op.ne]: currentPlayerId }, // Exclude current player
          [Op.or]: [
            { full_name: { [Op.iLike]: `%${q}%` } }
          ]
        },
        include: [
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email']
          }
        ],
        limit: 20,
        attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level']
      });

      // Add conversation info and mutual connections (mock)
      const playersWithExtras = await Promise.all(players.map(async (player) => {
        // Check if there's an existing chat room between these users
        const userId = req.user.id;
        
        // Find existing direct chat room
        const existingRooms = await ChatRoom.findAll({
          where: { type: 'direct' },
          include: [
            {
              model: ChatParticipant,
              as: 'participants',
              where: {
                user_id: { [Op.in]: [userId, player.user?.id] }
              }
            }
          ]
        });

        let lastConversationId = null;
        
        // Check if any room has exactly these two participants
        for (const room of existingRooms) {
          const participantIds = room.participants.map(p => p.user_id);
          if (participantIds.length === 2 && 
              participantIds.includes(userId) && 
              participantIds.includes(player.user?.id)) {
            lastConversationId = room.id;
            break;
          }
        }

        return {
          ...player.toJSON(),
          mutual_connections: 0, // Could calculate real mutual connections later
          last_conversation_id: lastConversationId,
          is_online: player.is_online || false
        };
      }));

      res.json(playersWithExtras);
    } catch (error) {
      console.error('Search players error:', error);
      res.status(500).json({ error: 'Failed to search players' });
    }
  },

  // Get player contacts
  async getContacts(req, res) {
    try {
      const userId = req.user.id;

      // Get chat rooms where user is a participant
      const userChatRooms = await ChatParticipant.findAll({
        where: { user_id: userId },
        include: [
          {
            model: ChatRoom,
            as: 'chatRoom',
            where: { type: 'direct' },
            include: [
              {
                model: ChatParticipant,
                as: 'participants',
                where: {
                  user_id: { [Op.ne]: userId }
                },
                include: [
                  {
                    model: User,
                    as: 'user',
                    include: [
                      {
                        model: Player,
                        as: 'player',
                        attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level'],
                        include: [
                          {
                            model: Club,
                            as: 'club',
                            attributes: ['id', 'name']
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        order: [['last_read', 'DESC']],
        limit: 50
      });

      const contacts = userChatRooms.map(userChat => {
        const chatRoom = userChat.chatRoom;
        const otherParticipant = chatRoom.participants[0]; // Should only be one other participant in direct chat
        
        if (otherParticipant && otherParticipant.user && otherParticipant.user.player) {
          return {
            id: otherParticipant.user.player.id,
            full_name: otherParticipant.user.player.full_name,
            email: otherParticipant.user.email || '',
            profile_image: otherParticipant.user.player.profile_photo_url,
            skill_level: otherParticipant.user.player.nrtp_level,
            is_online: false,
            last_seen: null,
            club: otherParticipant.user.player.club,
            mutual_connections: 0,
            last_conversation_id: chatRoom.id
          };
        }
        return null;
      }).filter(contact => contact !== null);

      res.json(contacts);
    } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({ error: 'Failed to get contacts' });
    }
  },

  // Mark messages as read
  async markMessagesAsRead(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      // Verify user is part of this chat room
      const userParticipation = await ChatParticipant.findOne({
        where: {
          chat_room_id: conversationId,
          user_id: userId
        }
      });

      if (!userParticipation) {
        return res.status(404).json({ error: 'Chat room not found or access denied' });
      }

      // Update the user's last_read timestamp for this chat room
      await userParticipation.update({
        last_read: new Date()
      });

      res.json({ message: 'Messages marked as read' });
    } catch (error) {
      console.error('Mark messages as read error:', error);
      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  },

  // Delete a message (soft delete)
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const userId = req.user.id;

      const message = await ChatMessage.findOne({
        where: {
          id: messageId,
          sender_id: userId
        }
      });

      if (!message) {
        return res.status(404).json({ error: 'Message not found or unauthorized' });
      }

      // Soft delete - update content and mark as deleted
      await message.update({
        content: 'This message was deleted',
        message_type: 'system',
        edited_at: new Date()
      });

      res.json({ message: 'Message deleted' });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  },

  // Update online status  
  async updateOnlineStatus(req, res) {
    try {
      const userId = req.user.id;
      const { is_online } = req.body;
      
      // Get player associated with this user
      const user = await User.findByPk(userId, {
        include: [{
          model: Player,
          as: 'player'
        }]
      });
      
      if (user && user.player) {
        // Update player's online status - Note: these fields may not exist in schema
        // This is kept for frontend compatibility but may need schema updates
        // await Player.update({ last_seen: new Date() }, { where: { id: user.player.id } });
      }

      res.json({ message: 'Status updated' });
    } catch (error) {
      console.error('Update online status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }
};

module.exports = playerMessagesController;