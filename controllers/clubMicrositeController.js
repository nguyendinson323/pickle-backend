const { Club, User, State, Court, Player, Tournament } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get club microsite data
const getClubMicrositeData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get club profile with related data
    const club = await Club.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'phone']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    })
    
    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Get additional statistics
    const courtsCount = await Court.count({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      }
    })

    const membersCount = await Player.count({
      where: { club_id: club.id }
    })

    const tournamentsCount = await Tournament.count({
      where: { 
        organizer_type: 'club',
        organizer_id: club.id
      }
    })

    // Calculate profile completion percentage
    const profileFields = [
      club.name, club.manager_name, club.manager_title, 
      club.club_type, club.website, club.social_media, club.logo_url
    ]
    const completedFields = profileFields.filter(field => field && field.trim() !== '').length
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100)

    // Calculate engagement metrics (simplified)
    const hasWebsite = club.website ? 20 : 0
    const hasSocialMedia = club.social_media ? 20 : 0
    const hasLogo = club.logo_url ? 30 : 0
    const hasActiveCourts = courtsCount > 0 ? 15 : 0
    const hasMembers = membersCount > 0 ? 15 : 0
    
    const publicVisibility = hasWebsite + hasSocialMedia + hasLogo + hasActiveCourts + hasMembers
    
    // Simulate recent visitors and engagement (would be real data in production)
    const recentVisitors = Math.floor(Math.random() * 50) + courtsCount * 5 + membersCount * 2
    const socialEngagement = Math.floor(Math.random() * 20) + (hasSocialMedia > 0 ? 15 : 0)
    
    // Content freshness based on last update
    const daysSinceUpdate = Math.floor((new Date() - new Date(club.updated_at)) / (1000 * 60 * 60 * 24))
    const contentFreshness = Math.max(0, 100 - daysSinceUpdate * 2)

    const micrositeData = {
      ...club.toJSON(),
      courts_count: courtsCount,
      members_count: membersCount,
      tournaments_count: tournamentsCount
    }

    const stats = {
      profile_completion: profileCompletion,
      public_visibility: publicVisibility >= 60,
      recent_visitors: recentVisitors,
      social_engagement: socialEngagement,
      content_freshness: contentFreshness
    }

    res.json({
      micrositeData,
      stats
    })

  } catch (error) {
    console.error('Error fetching club microsite data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update club microsite data
const updateClubMicrositeData = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Filter allowed fields for microsite updates
    const allowedFields = [
      'name', 'manager_name', 'manager_title', 'club_type', 
      'website', 'social_media', 'logo_url'
    ]
    
    const filteredData = {}
    allowedFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        filteredData[field] = updateData[field]
      }
    })

    // Update club data
    await club.update(filteredData)

    // Fetch updated club with relations
    const updatedClub = await Club.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'phone']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    })

    res.json({
      micrositeData: updatedClub,
      message: 'Microsite data updated successfully'
    })

  } catch (error) {
    console.error('Error updating club microsite data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Upload club logo (simplified - in production would use cloud storage)
const uploadClubLogo = async (req, res) => {
  try {
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // In a real implementation, this would:
    // 1. Validate file type and size
    // 2. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 3. Generate optimized versions
    // 4. Return the URL

    // For now, simulate a logo upload
    const simulatedLogoUrl = `https://pickleball-logos.example.com/clubs/${club.id}/logo.jpg`
    
    await club.update({ logo_url: simulatedLogoUrl })

    res.json({
      logo_url: simulatedLogoUrl,
      message: 'Logo uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading club logo:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Publish microsite (make it publicly visible)
const publishMicrosite = async (req, res) => {
  try {
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Check if required fields are completed
    const requiredFields = ['name', 'manager_name', 'club_type']
    const missingFields = requiredFields.filter(field => !club[field] || club[field].trim() === '')
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Please complete the following fields before publishing: ${missingFields.join(', ')}` 
      })
    }

    // In a real implementation, this would:
    // 1. Generate/update the public microsite
    // 2. Update search engine indexing
    // 3. Send notifications to members
    // 4. Update analytics tracking

    // For now, simulate the publishing process
    const micrositeUrl = `https://pickleballclubs.com/${club.name.toLowerCase().replace(/\s+/g, '-')}-${club.id}`

    res.json({
      microsite_url: micrositeUrl,
      message: 'Microsite published successfully',
      published_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error publishing microsite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get public microsite data (for public access)
const getPublicMicrositeData = async (req, res) => {
  try {
    const { clubId } = req.params

    const club = await Club.findOne({
      where: { id: clubId },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    })

    if (!club) {
      return res.status(404).json({ message: 'Club not found' })
    }

    // Get additional public statistics
    const courtsCount = await Court.count({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      }
    })

    const membersCount = await Player.count({
      where: { club_id: club.id }
    })

    const completedTournaments = await Tournament.count({
      where: { 
        organizer_type: 'club',
        organizer_id: club.id,
        status: 'completed'
      }
    })

    // Return only public-safe data
    const publicData = {
      id: club.id,
      name: club.name,
      club_type: club.club_type,
      website: club.website,
      social_media: club.social_media,
      logo_url: club.logo_url,
      state: club.state,
      courts_count: courtsCount,
      members_count: membersCount,
      tournaments_completed: completedTournaments,
      established: new Date(club.created_at).getFullYear()
    }

    res.json({
      club: publicData
    })

  } catch (error) {
    console.error('Error fetching public microsite data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getClubMicrositeData,
  updateClubMicrositeData,
  uploadClubLogo,
  publishMicrosite,
  getPublicMicrositeData
}