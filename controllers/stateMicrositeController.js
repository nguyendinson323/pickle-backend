const { StateCommittee, StateMicrosite, StateMicrositeNews, Tournament, Court, Club, Partner, Player, Coach, User, State } = require('../db/models')
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

    // Get state committee with full info including state data
    const stateCommittee = await StateCommittee.findByPk(stateCommitteeId, {
      include: [{
        model: State,
        as: 'state',
        attributes: ['name', 'short_code']
      }],
      attributes: ['id', 'name']
    })

    // Get or create microsite info from database
    let micrositeInfo = await StateMicrosite.findOne({
      where: { state_committee_id: stateCommitteeId },
      include: [{
        model: StateCommittee,
        as: 'state_committee',
        include: [{
          model: State,
          as: 'state',
          attributes: ['name', 'short_code']
        }],
        attributes: ['id', 'name']
      }]
    })
    
    if (!micrositeInfo) {
      // Create default microsite info
      micrositeInfo = await StateMicrosite.create({
        state_committee_id: stateCommitteeId,
        title: `${stateCommittee.state.name} Pickleball Association`,
        description: `Official pickleball association for the state of ${stateCommittee.state.name}`,
        mission_statement: `To promote and develop pickleball throughout ${stateCommittee.state.name} by organizing tournaments, supporting clubs, and fostering community engagement.`,
        contact_email: 'info@pickleballassociation.com',
        contact_phone: null,
        website_url: null,
        facebook_url: null,
        twitter_url: null,
        instagram_url: null,
        logo_url: null,
        banner_image_url: null,
        address: null,
        established_year: null,
        is_public: true,
        custom_content: null
      })

      // Add state committee info to the response
      micrositeInfo = {
        ...micrositeInfo.toJSON(),
        state_committee: {
          id: stateCommittee.id,
          name: stateCommittee.name,
          state_name: stateCommittee.state.name,
          state_code: stateCommittee.state.short_code,
          is_active: true
        }
      }
    } else {
      // Convert to JSON and ensure state committee info is included
      micrositeInfo = {
        ...micrositeInfo.toJSON(),
        state_committee: {
          id: stateCommittee.id,
          name: stateCommittee.name,
          state_name: stateCommittee.state.name,
          state_code: stateCommittee.state.short_code,
          is_active: true
        }
      }
    }

    // Get state statistics - use state_id for foreign key relationships
    const stateCommitteeStateId = stateCommittee.state_id
    const committeeId = stateCommittee.id

    // Count tournaments organized by this state committee
    const [totalTournaments, activeTournaments, upcomingTournaments] = await Promise.all([
      Tournament.count({
        where: { 
          organizer_type: 'state',
          organizer_id: committeeId
        }
      }),
      Tournament.count({
        where: { 
          organizer_type: 'state',
          organizer_id: committeeId,
          status: 'ongoing'
        }
      }),
      Tournament.count({
        where: { 
          organizer_type: 'state',
          organizer_id: committeeId,
          status: 'upcoming'
        }
      })
    ])

    // Count clubs, courts, players, partners, coaches in the state
    const [totalClubs, totalCourts, totalPlayers, totalPartners, totalCoaches] = await Promise.all([
      Club.count({
        where: { state_id: stateCommitteeStateId }
      }),
      Court.count({
        where: { state_id: stateCommitteeStateId }
      }),
      Player.count({
        where: { state_id: stateCommitteeStateId }
      }),
      Partner.count({
        where: { state_id: stateCommitteeStateId }
      }),
      Coach.count({
        where: { state_id: stateCommitteeStateId }
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
        organizer_id: committeeId,
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
      where: { state_id: stateCommitteeStateId },
      attributes: [
        'id', 'name', 'website', 'social_media'
      ],
      order: [['name', 'ASC']],
      limit: 12
    })

    // Format clubs data
    const clubsData = clubs.map(club => ({
      id: club.id,
      name: club.name,
      description: null, // Not available in current schema
      address: null, // Not available in current schema
      contact_email: null, // Not available in current schema
      contact_phone: null, // Not available in current schema
      website_url: club.website,
      total_courts: 0, // Simplified for now
      is_active: true, // Default value since column doesn't exist
      membership_fee: null, // Not available in current schema
      amenities: null // Not available in current schema
    }))

    // Get news articles from database
    const news = await StateMicrositeNews.findAll({
      where: { state_committee_id: stateCommitteeId },
      attributes: [
        'id', 'title', 'content', 'author_name', 'published_date', 
        'is_featured', 'image_url'
      ],
      order: [
        ['is_featured', 'DESC'],
        ['published_date', 'DESC']
      ],
      limit: 10
    })

    const newsData = news.map(article => article.toJSON())

    res.json({
      micrositeInfo,
      stats,
      upcomingEvents: eventsWithRegistrations,
      clubs: clubsData,
      news: newsData
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
      where: { user_id: userId },
      include: [{
        model: State,
        as: 'state',
        attributes: ['name', 'short_code']
      }],
      attributes: ['id', 'name']
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    const stateCommitteeId = stateCommittee.id

    // Get or create microsite from database
    let micrositeInfo = await StateMicrosite.findOne({
      where: { state_committee_id: stateCommitteeId }
    })

    if (!micrositeInfo) {
      // Create default microsite if it doesn't exist
      micrositeInfo = await StateMicrosite.create({
        state_committee_id: stateCommitteeId,
        title: `${stateCommittee.state.name} Pickleball Association`,
        description: `Official pickleball association for the state of ${stateCommittee.state.name}`,
        mission_statement: `To promote and develop pickleball throughout ${stateCommittee.state.name} by organizing tournaments, supporting clubs, and fostering community engagement.`,
        contact_email: 'info@pickleballassociation.com',
        contact_phone: null,
        website_url: null,
        facebook_url: null,
        twitter_url: null,
        instagram_url: null,
        logo_url: null,
        banner_image_url: null,
        address: null,
        established_year: null,
        is_public: true,
        custom_content: null
      })
    }

    // Update the microsite with new data
    await micrositeInfo.update(updateData)
    
    // Add state committee info to the response
    const updatedMicrositeInfo = {
      ...micrositeInfo.toJSON(),
      state_committee: {
        id: stateCommittee.id,
        name: stateCommittee.name,
        state_name: stateCommittee.state.name,
        state_code: stateCommittee.state.short_code,
        is_active: true
      }
    }

    res.json({
      micrositeInfo: updatedMicrositeInfo,
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

    const stateCommitteeId = stateCommittee.id

    // Create new news article in database
    const news = await StateMicrositeNews.create({
      state_committee_id: stateCommitteeId,
      title,
      content,
      author_name: user.username,
      is_featured: is_featured || false,
      image_url: image_url || null,
      published_date: new Date()
    })

    res.status(201).json({
      news: news.toJSON(),
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

    const stateCommitteeId = stateCommittee.id

    // Find and update news article in database
    const news = await StateMicrositeNews.findOne({
      where: { 
        id: newsId,
        state_committee_id: stateCommitteeId 
      }
    })

    if (!news) {
      return res.status(404).json({ message: 'News article not found' })
    }

    // Update the article
    await news.update(updateData)

    res.json({
      news: news.toJSON(),
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

    const stateCommitteeId = stateCommittee.id

    // Find and delete news article from database
    const news = await StateMicrositeNews.findOne({
      where: { 
        id: newsId,
        state_committee_id: stateCommitteeId 
      }
    })

    if (!news) {
      return res.status(404).json({ message: 'News article not found' })
    }

    // Delete the article
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