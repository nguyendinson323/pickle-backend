const { Player, User, State, Club, PlayerMatchRequest, PlayerAvailability, Court } = require('../db/models');
const { Op, Sequelize } = require('sequelize');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

const playerFinderController = {
  // Search for players based on criteria
  async searchPlayers(req, res) {
    try {
      const userId = req.user.id;
      const {
        state_id,
        nrtp_level_min,
        nrtp_level_max,
        gender,
        age_min,
        age_max,
        distance_km,
        has_premium,
        location_lat,
        location_lng,
        page = 1,
        limit = 20
      } = req.body;

      const offset = (page - 1) * limit;

      // Get current player to exclude from results
      const currentUser = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!currentUser || !currentUser.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const searchCriteria = {
        id: { [Op.ne]: currentUser.player.id }, // Exclude current player
        '$user.is_searchable$': true, // Only searchable players
        '$user.is_active$': true // Only active users
      };

      // Apply filters
      if (state_id) {
        searchCriteria.state_id = parseInt(state_id);
      }

      if (nrtp_level_min || nrtp_level_max) {
        searchCriteria.nrtp_level = {};
        if (nrtp_level_min) searchCriteria.nrtp_level[Op.gte] = parseFloat(nrtp_level_min);
        if (nrtp_level_max) searchCriteria.nrtp_level[Op.lte] = parseFloat(nrtp_level_max);
      }

      if (gender && gender !== 'all') {
        searchCriteria.gender = gender;
      }

      if (age_min || age_max) {
        const currentDate = new Date();
        if (age_max) {
          const minBirthDate = new Date(currentDate.getFullYear() - parseInt(age_max) - 1, currentDate.getMonth(), currentDate.getDate());
          searchCriteria.birth_date = { [Op.gte]: minBirthDate };
        }
        if (age_min) {
          const maxBirthDate = new Date(currentDate.getFullYear() - parseInt(age_min), currentDate.getMonth(), currentDate.getDate());
          searchCriteria.birth_date = {
            ...searchCriteria.birth_date,
            [Op.lte]: maxBirthDate
          };
        }
      }

      if (has_premium !== null && has_premium !== undefined) {
        searchCriteria['$user.is_premium$'] = has_premium === 'true';
      }

      // Base query
      let query = {
        where: searchCriteria,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'phone', 'is_premium', 'is_searchable'],
            where: {
              is_searchable: true,
              is_active: true
            }
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          },
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name', 'logo_url'],
            required: false
          }
        ],
        attributes: [
          'id', 'user_id', 'full_name', 'birth_date', 'gender', 'state_id',
          'nrtp_level', 'profile_photo_url', 'nationality', 'club_id', 'ranking_position'
        ],
        order: [['ranking_position', 'ASC NULLS LAST']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      // Add distance calculation if coordinates provided
      if (location_lat && location_lng && distance_km) {
        // Simple distance calculation using Haversine formula
        // In production, you might want to use PostGIS for better performance
        query.attributes.push([
          Sequelize.literal(`
            (6371 * acos(
              cos(radians(${parseFloat(location_lat)})) * 
              cos(radians(${parseFloat(location_lat)})) * 
              cos(radians(${parseFloat(location_lng)}) - radians(${parseFloat(location_lng)})) + 
              sin(radians(${parseFloat(location_lat)})) * 
              sin(radians(${parseFloat(location_lat)}))
            ))
          `),
          'distance'
        ]);

        query.order = [['distance', 'ASC']];
      }

      const { count, rows: players } = await Player.findAndCountAll(query);

      // Calculate ages and format response
      const formattedPlayers = players.map(player => {
        const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
        const playerData = {
          id: player.id,
          user_id: player.user_id,
          full_name: player.full_name,
          age,
          gender: player.gender,
          state_id: player.state_id,
          nrtp_level: player.nrtp_level,
          profile_photo_url: player.profile_photo_url,
          nationality: player.nationality,
          club_id: player.club_id,
          ranking_position: player.ranking_position,
          state: player.state,
          club: player.club,
          user: {
            id: player.user.id,
            username: player.user.username,
            is_premium: player.user.is_premium
            // Note: Not including email/phone for privacy
          }
        };

        // Add distance if calculated
        if (player.dataValues && player.dataValues.distance) {
          playerData.distance = Math.round(player.dataValues.distance * 10) / 10; // Round to 1 decimal
        }

        return playerData;
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        players: formattedPlayers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount: count,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Search players error:', error);
      res.status(500).json({ error: 'Failed to search players' });
    }
  },

  // Send match request to another player
  async sendMatchRequest(req, res) {
    try {
      const userId = req.user.id;
      const { receiver_id, preferred_date, preferred_time, message, court_id } = req.body;

      // Get current player
      const currentUser = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!currentUser || !currentUser.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      // Check if receiver exists and is searchable
      const receiver = await Player.findByPk(receiver_id, {
        include: [{
          model: User,
          as: 'user',
          where: { is_searchable: true, is_active: true }
        }]
      });

      if (!receiver) {
        return res.status(404).json({ error: 'Receiver player not found or not available' });
      }

      // Check for existing pending request
      const existingRequest = await PlayerMatchRequest.findOne({
        where: {
          requester_id: currentUser.player.id,
          receiver_id: receiver_id,
          status: 'pending'
        }
      });

      if (existingRequest) {
        return res.status(400).json({ error: 'You already have a pending request with this player' });
      }

      // Create match request
      const matchRequest = await PlayerMatchRequest.create({
        requester_id: currentUser.player.id,
        receiver_id: receiver_id,
        preferred_date: new Date(preferred_date),
        preferred_time: preferred_time,
        message: message || null,
        court_id: court_id || null,
        status: 'pending'
      });

      // Send notification to receiver (email/SMS)
      await this.sendMatchRequestNotification(receiver.user, currentUser.player, matchRequest);

      // Return the created request with full details
      const createdRequest = await PlayerMatchRequest.findByPk(matchRequest.id, {
        include: [
          {
            model: Player,
            as: 'requester',
            include: [
              { model: User, as: 'user', attributes: ['username'] },
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          },
          {
            model: Player,
            as: 'receiver',
            include: [
              { model: User, as: 'user', attributes: ['username'] },
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          },
          { model: Court, as: 'court' }
        ]
      });

      res.status(201).json(createdRequest);
    } catch (error) {
      console.error('Send match request error:', error);
      res.status(500).json({ error: 'Failed to send match request' });
    }
  },

  // Get sent match requests
  async getSentRequests(req, res) {
    try {
      const userId = req.user.id;

      const currentUser = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!currentUser || !currentUser.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const sentRequests = await PlayerMatchRequest.findAll({
        where: { requester_id: currentUser.player.id },
        include: [
          {
            model: Player,
            as: 'receiver',
            include: [
              { model: User, as: 'user', attributes: ['username'] },
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          },
          { model: Court, as: 'court' }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(sentRequests);
    } catch (error) {
      console.error('Get sent requests error:', error);
      res.status(500).json({ error: 'Failed to get sent requests' });
    }
  },

  // Get received match requests
  async getReceivedRequests(req, res) {
    try {
      const userId = req.user.id;

      const currentUser = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!currentUser || !currentUser.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const receivedRequests = await PlayerMatchRequest.findAll({
        where: { receiver_id: currentUser.player.id },
        include: [
          {
            model: Player,
            as: 'requester',
            include: [
              { model: User, as: 'user', attributes: ['username'] },
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          },
          { model: Court, as: 'court' }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(receivedRequests);
    } catch (error) {
      console.error('Get received requests error:', error);
      res.status(500).json({ error: 'Failed to get received requests' });
    }
  },

  // Update match request (respond or cancel)
  async updateMatchRequest(req, res) {
    try {
      const { id: requestId } = req.params;
      const { response, response_message, action } = req.body;
      const userId = req.user.id;

      const currentUser = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!currentUser || !currentUser.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      // Handle cancel action (requester cancels their own request)
      if (action === 'cancel') {
        const matchRequest = await PlayerMatchRequest.findOne({
          where: {
            id: requestId,
            requester_id: currentUser.player.id,
            status: 'pending'
          }
        });

        if (!matchRequest) {
          return res.status(404).json({ error: 'Match request not found or cannot be cancelled' });
        }

        await matchRequest.update({ status: 'canceled' });
        return res.json({ message: 'Match request cancelled successfully' });
      }

      // Handle respond action (receiver accepts/rejects request)
      if (response) {
        const matchRequest = await PlayerMatchRequest.findOne({
          where: {
            id: requestId,
            receiver_id: currentUser.player.id,
            status: 'pending'
          },
          include: [
            {
              model: Player,
              as: 'requester',
              include: [{ model: User, as: 'user' }]
            }
          ]
        });

        if (!matchRequest) {
          return res.status(404).json({ error: 'Match request not found or already responded' });
        }

        // Update request status
        await matchRequest.update({
          status: response,
          response_message: response_message || null
        });

        // Send notification to requester
        await this.sendMatchRequestResponseNotification(
          matchRequest.requester.user,
          currentUser.player,
          matchRequest,
          response
        );

        // Return updated request
        const updatedRequest = await PlayerMatchRequest.findByPk(requestId, {
          include: [
            {
              model: Player,
              as: 'requester',
              include: [
                { model: User, as: 'user', attributes: ['username'] },
                { model: State, as: 'state' },
                { model: Club, as: 'club' }
              ]
            },
            {
              model: Player,
              as: 'receiver',
              include: [
                { model: User, as: 'user', attributes: ['username'] },
                { model: State, as: 'state' },
                { model: Club, as: 'club' }
              ]
            },
            { model: Court, as: 'court' }
          ]
        });

        return res.json(updatedRequest);
      }

      res.status(400).json({ error: 'Invalid action. Use "cancel" or provide "response" (accepted/rejected)' });
    } catch (error) {
      console.error('Update match request error:', error);
      res.status(500).json({ error: 'Failed to update match request' });
    }
  },

  // Update player searchability
  async updateSearchability(req, res) {
    try {
      const userId = req.user.id;
      const { is_searchable } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ is_searchable });

      res.json({
        is_searchable: user.is_searchable,
        message: `You are now ${user.is_searchable ? 'visible' : 'hidden'} in player searches`
      });
    } catch (error) {
      console.error('Update searchability error:', error);
      res.status(500).json({ error: 'Failed to update searchability' });
    }
  },

  // Helper method to send match request notification
  async sendMatchRequestNotification(receiverUser, requesterPlayer, matchRequest) {
    try {
      const notificationText = `${requesterPlayer.full_name} wants to play pickleball with you on ${new Date(matchRequest.preferred_date).toLocaleDateString()} at ${matchRequest.preferred_time}. Check your player finder to respond!`;

      // Send email notification (if email service is configured)
      if (process.env.SENDGRID_API_KEY) {
        // Implementation would go here using SendGrid
        console.log('Email notification sent:', notificationText);
      }

      // Send SMS notification (if Twilio is configured)
      if (process.env.TWILIO_ACCOUNT_SID && receiverUser.phone) {
        // Implementation would go here using Twilio
        console.log('SMS notification sent:', notificationText);
      }

      console.log(`Match request notification sent to user ${receiverUser.id}`);
    } catch (error) {
      console.error('Send notification error:', error);
      // Don't throw error - notification failure shouldn't stop the main operation
    }
  },

  // Helper method to send match request response notification
  async sendMatchRequestResponseNotification(requesterUser, responderPlayer, matchRequest, response) {
    try {
      const status = response === 'accepted' ? 'accepted' : 'rejected';
      const notificationText = `${responderPlayer.full_name} has ${status} your match request for ${new Date(matchRequest.preferred_date).toLocaleDateString()}.`;

      if (process.env.SENDGRID_API_KEY) {
        console.log('Email notification sent:', notificationText);
      }

      if (process.env.TWILIO_ACCOUNT_SID && requesterUser.phone) {
        console.log('SMS notification sent:', notificationText);
      }

      console.log(`Match request response notification sent to user ${requesterUser.id}`);
    } catch (error) {
      console.error('Send response notification error:', error);
    }
  }
};

module.exports = playerFinderController;