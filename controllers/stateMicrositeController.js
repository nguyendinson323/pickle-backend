const { StateCommittee, StateMicrosite, Tournament, Court, Club, Partner, Player, Coach, User, StateMicrositeNews } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get state microsite data (public or authenticated view)
const getStateMicrositeData = async (req, res) => {
  try {
    let stateCommitteeId
    const { stateId } = req.params
    
    if (stateId) {
      // Public view - get by state ID
      const stateCommittee = await StateCommittee.findByPk(stateId)
      if (!stateCommittee) {
        return res.status(404).json({ message: 'State committee not found' })
      }
      stateCommitteeId = stateCommittee.id
    } else {
      // Authenticated state user view - get by user ID
      const userId = req.user.id
      const stateCommittee = await StateCommittee.findOne({
        where: { user_id: userId }
      })
      
      if (!stateCommittee) {
        return res.status(404).json({ message: 'State committee profile not found' })
      }
      stateCommitteeId = stateCommittee.id
    }

    // Get or create microsite info
    let micrositeInfo = await StateMicrosite.findOne({
      where: { state_committee_id: stateCommitteeId },
      include: [
        {
          model: StateCommittee,
          as: 'state_committee',
          attributes: ['id', 'name', 'state_name', 'state_code', 'is_active']
        }
      ]
    })

    if (!micrositeInfo) {
      // Create default microsite if it doesn't exist
      const stateCommittee = await StateCommittee.findByPk(stateCommitteeId)
      micrositeInfo = await StateMicrosite.create({
        state_committee_id: stateCommitteeId,
        title: `${stateCommittee.state_name} Pickleball Association`,
        description: `Official pickleball association for the state of ${stateCommittee.state_name}`,
        mission_statement: `To promote and develop pickleball throughout ${stateCommittee.state_name} by organizing tournaments, supporting clubs, and fostering community engagement.`,
        contact_email: 'info@pickleballassociation.com',
        is_public: true
      })
      
      // Reload with associations
      micrositeInfo = await StateMicrosite.findByPk(micrositeInfo.id, {
        include: [
          {
            model: StateCommittee,
            as: 'state_committee',
            attributes: ['id', 'name', 'state_name', 'state_code', 'is_active']
          }
        ]
      })
    }

    // Get state statistics
    const stateId = micrositeInfo.state_committee.id

    // Count tournaments
    const [totalTournaments, activeTournaments, upcomingTournaments] = await Promise.all([
      Tournament.count({
        where: { 
          organizer_type: 'state',
          organizer_id: stateId
        }
      }),
      Tournament.count({
        where: { 
          organizer_type: 'state',
          organizer_id: stateId,
          status: 'ongoing'
        }
      }),
      Tournament.count({
        where: { 
          organizer_type: 'state',
          organizer_id: stateId,
          status: 'upcoming'
        }
      })
    ])

    // Count clubs, courts, players, partners, coaches in the state
    const [totalClubs, totalCourts, totalPlayers, totalPartners, totalCoaches] = await Promise.all([
      Club.count({
        where: { state_id: stateId, is_active: true }
      }),
      Court.count({
        include: [
          {
            model: Club,
            as: 'club',
            where: { state_id: stateId },
            required: true
          }
        ]
      }),
      Player.count({
        where: { state_id: stateId }
      }),
      Partner.count({
        where: { state_id: stateId }
      }),
      Coach.count({
        where: { state_id: stateId }
      })
    ])

    const stats = {
      total_tournaments: totalTournaments,
      total_clubs: totalClubs,
      total_courts: totalCourts,
      total_players: totalPlayers,
      active_tournaments: activeTournaments,
      upcoming_tournaments: upcomingTournaments,
      total_partners: totalPartners,
      total_coaches: totalCoaches
    }

    // Get upcoming tournaments (next 10)
    const upcomingEvents = await Tournament.findAll({
      where: {
        organizer_type: 'state',
        organizer_id: stateId,
        start_date: {
          [Op.gte]: new Date()
        }
      },
      attributes: [
        'id', 'name', 'start_date', 'end_date', 'venue_name', 'venue_address',
        'tournament_type', 'status', 'entry_fee', 'max_participants'
      ],
      order: [['start_date', 'ASC']],
      limit: 10
    })

    // Add current registrations count for each tournament
    const eventsWithRegistrations = upcomingEvents.map(event => ({
      ...event.toJSON(),
      current_registrations: 0 // This would need to be calculated from actual registrations table
    }))

    // Get top clubs in the state
    const clubs = await Club.findAll({
      where: { state_id: stateId, is_active: true },
      include: [
        {
          model: Court,
          as: 'courts',
          attributes: []
        }
      ],
      attributes: [
        'id', 'name', 'description', 'address', 'contact_email', 'contact_phone',
        'website_url', 'is_active', 'membership_fee', 'amenities',
        [Sequelize.fn('COUNT', Sequelize.col('courts.id')), 'total_courts']
      ],
      group: ['Club.id'],
      order: [
        [Sequelize.fn('COUNT', Sequelize.col('courts.id')), 'DESC'],
        ['name', 'ASC']
      ],
      limit: 12
    })

    // Format clubs data
    const clubsData = clubs.map(club => ({
      id: club.id,
      name: club.name,
      description: club.description,
      address: club.address,
      contact_email: club.contact_email,
      contact_phone: club.contact_phone,
      website_url: club.website_url,
      total_courts: parseInt(club.dataValues.total_courts) || 0,
      is_active: club.is_active,
      membership_fee: club.membership_fee,
      amenities: club.amenities
    }))

    // Get recent news articles
    const news = await StateMicrositeNews.findAll({
      where: { state_committee_id: stateCommitteeId },
      attributes: ['id', 'title', 'content', 'author_name', 'published_date', 'is_featured', 'image_url'],
      order: [
        ['is_featured', 'DESC'],
        ['published_date', 'DESC']
      ],
      limit: 10
    })

    res.json({
      micrositeInfo,
      stats,
      upcomingEvents: eventsWithRegistrations,
      clubs: clubsData,
      news
    })

  } catch (error) {
    console.error('Error fetching state microsite data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update state microsite information
const updateStateMicrosite = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Get or create microsite
    let micrositeInfo = await StateMicrosite.findOne({
      where: { state_committee_id: stateCommittee.id }
    })

    if (!micrositeInfo) {
      // Create new microsite
      micrositeInfo = await StateMicrosite.create({
        state_committee_id: stateCommittee.id,
        ...updateData
      })
    } else {
      // Update existing microsite
      await micrositeInfo.update(updateData)
    }

    // Fetch updated microsite with associations
    const updatedMicrosite = await StateMicrosite.findByPk(micrositeInfo.id, {
      include: [
        {
          model: StateCommittee,
          as: 'state_committee',
          attributes: ['id', 'name', 'state_name', 'state_code', 'is_active']
        }
      ]
    })

    res.json({
      micrositeInfo: updatedMicrosite,
      message: 'Microsite updated successfully'
    })

  } catch (error) {
    console.error('Error updating state microsite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create microsite news article
const createMicrositeNews = async (req, res) => {
  try {
    const userId = req.user.id
    const { title, content, is_featured, image_url } = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Get user info for author
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email']
    })

    // Create news article
    const news = await StateMicrositeNews.create({
      state_committee_id: stateCommittee.id,
      title,
      content,
      author_name: user.username,
      is_featured: is_featured || false,
      image_url: image_url || null,
      published_date: new Date()
    })

    res.status(201).json({
      news,
      message: 'News article created successfully'
    })

  } catch (error) {
    console.error('Error creating microsite news:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update microsite news article
const updateMicrositeNews = async (req, res) => {
  try {
    const { newsId } = req.params
    const userId = req.user.id
    const updateData = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and update news article
    const news = await StateMicrositeNews.findOne({
      where: {
        id: newsId,
        state_committee_id: stateCommittee.id
      }
    })

    if (!news) {
      return res.status(404).json({ message: 'News article not found' })
    }

    await news.update(updateData)

    res.json({
      news,
      message: 'News article updated successfully'
    })

  } catch (error) {
    console.error('Error updating microsite news:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete microsite news article
const deleteMicrositeNews = async (req, res) => {
  try {
    const { newsId } = req.params
    const userId = req.user.id

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and delete news article
    const news = await StateMicrositeNews.findOne({
      where: {
        id: newsId,
        state_committee_id: stateCommittee.id
      }
    })

    if (!news) {
      return res.status(404).json({ message: 'News article not found' })
    }

    await news.destroy()

    res.json({ message: 'News article deleted successfully' })

  } catch (error) {
    console.error('Error deleting microsite news:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getStateMicrositeData,
  updateStateMicrosite,
  createMicrositeNews,
  updateMicrositeNews,
  deleteMicrositeNews
}