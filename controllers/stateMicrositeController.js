const { StateCommittee, Tournament, Court, Club, Partner, Player, Coach, User, State } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Mock data structure for state microsite (since we don't have actual tables yet)
let stateMicrositeData = new Map()
let stateMicrositeNews = new Map()

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

    // Get or create default microsite info (using mock data for now)
    let micrositeInfo = stateMicrositeData.get(stateCommitteeId)
    
    if (!micrositeInfo) {
      // Create default microsite info
      micrositeInfo = {
        id: stateCommitteeId,
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
        custom_content: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state_committee: {
          id: stateCommittee.id,
          name: stateCommittee.name,
          state_name: stateCommittee.state.name,
          state_code: stateCommittee.state.short_code,
          is_active: true
        }
      }
      
      stateMicrositeData.set(stateCommitteeId, micrositeInfo)
    } else {
      // Update state committee info in existing data
      micrositeInfo.state_committee = {
        id: stateCommittee.id,
        name: stateCommittee.name,
        state_name: stateCommittee.state.name,
        state_code: stateCommittee.state.short_code,
        is_active: true
      }
    }

    // Get state statistics
    const committeeId = stateCommittee.id

    // Count tournaments
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
        where: { state_id: committeeId }
      }),
      // Simplified court count - just count all courts for now
      Court.count(),
      Player.count({
        where: { state_id: committeeId }
      }),
      Partner.count({
        where: { state_id: committeeId }
      }),
      Coach.count({
        where: { state_id: committeeId }
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

    // Get top clubs in the state (simplified)
    const clubs = await Club.findAll({
      where: { state_id: committeeId },
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

    // Get news articles (from mock data for now)
    const newsArray = stateMicrositeNews.get(stateCommitteeId) || []
    const news = newsArray.sort((a, b) => {
      if (a.is_featured !== b.is_featured) {
        return b.is_featured ? 1 : -1
      }
      return new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
    }).slice(0, 10)

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

    // Get existing microsite data or create default
    let micrositeInfo = stateMicrositeData.get(stateCommitteeId) || {
      id: stateCommitteeId,
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
      custom_content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Update the microsite data
    micrositeInfo = {
      ...micrositeInfo,
      ...updateData,
      updated_at: new Date().toISOString(),
      state_committee: {
        id: stateCommittee.id,
        name: stateCommittee.name,
        state_name: stateCommittee.state.name,
        state_code: stateCommittee.state.short_code,
        is_active: true
      }
    }

    // Save updated data
    stateMicrositeData.set(stateCommitteeId, micrositeInfo)

    res.json({
      micrositeInfo,
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

    // Get existing news array or create new one
    let newsArray = stateMicrositeNews.get(stateCommitteeId) || []

    // Create new news article
    const news = {
      id: Date.now(), // Simple ID generation for mock data
      title,
      content,
      author_name: user.username,
      is_featured: is_featured || false,
      image_url: image_url || null,
      published_date: new Date().toISOString()
    }

    // Add to array
    newsArray.unshift(news)
    stateMicrositeNews.set(stateCommitteeId, newsArray)

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

    const stateCommitteeId = stateCommittee.id
    let newsArray = stateMicrositeNews.get(stateCommitteeId) || []

    // Find and update news article
    const newsIndex = newsArray.findIndex(article => article.id == newsId)
    if (newsIndex === -1) {
      return res.status(404).json({ message: 'News article not found' })
    }

    // Update the article
    newsArray[newsIndex] = {
      ...newsArray[newsIndex],
      ...updateData
    }

    stateMicrositeNews.set(stateCommitteeId, newsArray)

    res.json({
      news: newsArray[newsIndex],
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
    let newsArray = stateMicrositeNews.get(stateCommitteeId) || []

    // Find and delete news article
    const newsIndex = newsArray.findIndex(article => article.id == newsId)
    if (newsIndex === -1) {
      return res.status(404).json({ message: 'News article not found' })
    }

    // Remove the article
    newsArray.splice(newsIndex, 1)
    stateMicrositeNews.set(stateCommitteeId, newsArray)

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