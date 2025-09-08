const { 
  Player, 
  User, 
  State, 
  Club,
  PlayerMatchRequest,
  Court
} = require('../db/models')
const { Op } = require('sequelize')
const { sequelize } = require('../db/models')

// POST /api/player-finder/search - Search for players based on filters
const searchPlayers = async (req, res) => {
  try {
    const currentUserId = req.user.id
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
      location_lng
    } = req.body

    // Get current player's ID
    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Build where conditions
    const whereConditions = {
      id: { [Op.ne]: currentPlayer.id } // Exclude current player
    }

    if (state_id) {
      whereConditions.state_id = state_id
    }

    if (nrtp_level_min || nrtp_level_max) {
      whereConditions.nrtp_level = {}
      if (nrtp_level_min) whereConditions.nrtp_level[Op.gte] = nrtp_level_min
      if (nrtp_level_max) whereConditions.nrtp_level[Op.lte] = nrtp_level_max
    }

    if (gender) {
      whereConditions.gender = gender
    }

    if (age_min || age_max) {
      const currentDate = new Date()
      if (age_max) {
        const minBirthDate = new Date(currentDate.getFullYear() - age_max, currentDate.getMonth(), currentDate.getDate())
        whereConditions.birth_date = { [Op.gte]: minBirthDate }
      }
      if (age_min) {
        const maxBirthDate = new Date(currentDate.getFullYear() - age_min, currentDate.getMonth(), currentDate.getDate())
        whereConditions.birth_date = whereConditions.birth_date || {}
        whereConditions.birth_date[Op.lte] = maxBirthDate
      }
    }

    // User conditions
    const userWhereConditions = {
      is_active: true,
      is_searchable: true
    }

    if (has_premium !== null) {
      userWhereConditions.is_premium = has_premium
    }

    let players = await Player.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhereConditions,
          attributes: ['id', 'username', 'email', 'phone', 'is_premium', 'is_searchable']
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
      order: [['created_at', 'DESC']]
    })

    // Calculate distance if location is provided
    if (location_lat && location_lng && distance_km) {
      // Get players with their associated club/court locations
      const playersWithLocation = await Promise.all(players.map(async (player) => {
        let playerLat = null;
        let playerLng = null;
        
        // Get player location from their club's courts if available
        if (player.club_id) {
          const clubCourts = await Court.findAll({
            where: {
              owner_type: 'club',
              owner_id: player.club_id,
              latitude: { [Op.not]: null },
              longitude: { [Op.not]: null }
            },
            limit: 1
          });
          
          if (clubCourts.length > 0) {
            playerLat = parseFloat(clubCourts[0].latitude);
            playerLng = parseFloat(clubCourts[0].longitude);
          }
        }
        
        // Calculate distance using Haversine formula if we have player location
        if (playerLat && playerLng) {
          const R = 6371; // Earth's radius in km
          const dLat = (playerLat - location_lat) * Math.PI / 180;
          const dLng = (playerLng - location_lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(location_lat * Math.PI / 180) * Math.cos(playerLat * Math.PI / 180) *
                   Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          
          player.dataValues.distance = distance;
          return distance <= distance_km ? player : null;
        } else {
          // If no location data available, exclude from distance filtering
          return null;
        }
      }));
      
      // Filter out null results and sort by distance
      players = playersWithLocation
        .filter(player => player !== null)
        .sort((a, b) => a.dataValues.distance - b.dataValues.distance);
    }

    res.status(200).json(players)
  } catch (error) {
    console.error('Error searching players:', error)
    res.status(500).json({ message: 'Failed to search players' })
  }
}

// GET /api/player-finder/requests/sent - Get current player's sent match requests
const getSentRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id
    
    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    const requests = await PlayerMatchRequest.findAll({
      where: { requester_id: currentPlayer.id },
      include: [
        {
          model: Player,
          as: 'receiver',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'phone']
            },
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name', 'short_code']
            }
          ]
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'location_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })

    res.status(200).json(requests)
  } catch (error) {
    console.error('Error fetching sent requests:', error)
    res.status(500).json({ message: 'Failed to fetch sent requests' })
  }
}

// GET /api/player-finder/requests/received - Get current player's received match requests
const getReceivedRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id
    
    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    const requests = await PlayerMatchRequest.findAll({
      where: { receiver_id: currentPlayer.id },
      include: [
        {
          model: Player,
          as: 'requester',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'phone']
            },
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name', 'short_code']
            }
          ]
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'location_name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })

    res.status(200).json(requests)
  } catch (error) {
    console.error('Error fetching received requests:', error)
    res.status(500).json({ message: 'Failed to fetch received requests' })
  }
}

// POST /api/player-finder/requests - Send a match request
const sendMatchRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const {
      receiver_id,
      preferred_date,
      preferred_time,
      message,
      court_id
    } = req.body

    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Check if receiver exists and is different from sender
    const receiverPlayer = await Player.findByPk(receiver_id)
    if (!receiverPlayer) {
      return res.status(404).json({ message: 'Receiver player not found' })
    }

    if (currentPlayer.id === receiver_id) {
      return res.status(400).json({ message: 'Cannot send request to yourself' })
    }

    // Check if there's already a pending request between these players
    const existingRequest = await PlayerMatchRequest.findOne({
      where: {
        [Op.or]: [
          { requester_id: currentPlayer.id, receiver_id: receiver_id },
          { requester_id: receiver_id, receiver_id: currentPlayer.id }
        ],
        status: 'pending'
      }
    })

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists between these players' })
    }

    // Create the match request
    const matchRequest = await PlayerMatchRequest.create({
      requester_id: currentPlayer.id,
      receiver_id,
      preferred_date,
      preferred_time,
      message,
      court_id,
      status: 'pending'
    })

    // Fetch the complete request with associations
    const completeRequest = await PlayerMatchRequest.findByPk(matchRequest.id, {
      include: [
        {
          model: Player,
          as: 'receiver',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'phone']
            },
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name', 'short_code']
            }
          ]
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'location_name'],
          required: false
        }
      ]
    })

    res.status(201).json(completeRequest)
  } catch (error) {
    console.error('Error sending match request:', error)
    res.status(500).json({ message: 'Failed to send match request' })
  }
}

// PUT /api/player-finder/requests/:id - Respond to or cancel a match request
const updateMatchRequest = async (req, res) => {
  try {
    const currentUserId = req.user.id
    const requestId = req.params.id
    const { status, response_message, court_id } = req.body

    const currentPlayer = await Player.findOne({
      where: { user_id: currentUserId }
    })

    if (!currentPlayer) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    const matchRequest = await PlayerMatchRequest.findByPk(requestId)
    if (!matchRequest) {
      return res.status(404).json({ message: 'Match request not found' })
    }

    // Check permissions
    const canRespond = matchRequest.receiver_id === currentPlayer.id && ['accepted', 'rejected'].includes(status)
    const canCancel = matchRequest.requester_id === currentPlayer.id && status === 'canceled'

    if (!canRespond && !canCancel) {
      return res.status(403).json({ message: 'Not authorized to update this request' })
    }

    // Update the request
    const updateData = { status }
    if (response_message !== undefined) updateData.response_message = response_message
    if (court_id !== undefined) updateData.court_id = court_id

    await matchRequest.update(updateData)

    // Fetch the complete updated request with associations
    const completeRequest = await PlayerMatchRequest.findByPk(matchRequest.id, {
      include: [
        {
          model: Player,
          as: 'requester',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'phone']
            }
          ]
        },
        {
          model: Player,
          as: 'receiver',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email', 'phone']
            }
          ]
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'location_name'],
          required: false
        }
      ]
    })

    res.status(200).json(completeRequest)
  } catch (error) {
    console.error('Error updating match request:', error)
    res.status(500).json({ message: 'Failed to update match request' })
  }
}

module.exports = {
  searchPlayers,
  getSentRequests,
  getReceivedRequests,
  sendMatchRequest,
  updateMatchRequest
}