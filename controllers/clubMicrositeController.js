const { Club, User, State, Court, Player, Tournament, Microsite, MicrositeTemplate } = require('../db/models')
const { Op, Sequelize } = require('sequelize')
const cloudinary = require('cloudinary').v2
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

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

// Upload club logo with Cloudinary
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

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `clubs/${club.id}/logos`,
          transformation: [
            { width: 400, height: 400, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(req.file.buffer)
    })

    // Update club with new logo URL
    await club.update({ logo_url: uploadResult.secure_url })

    res.json({
      logo_url: uploadResult.secure_url,
      message: 'Logo uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading club logo:', error)
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    })
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

    // Get or create microsite record
    let microsite = await Microsite.findOne({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      }
    })

    const micrositeSlug = club.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const micrositeUrl = `https://pickleballclubs.com/${micrositeSlug}-${club.id}`
    
    if (!microsite) {
      // Create new microsite record
      microsite = await Microsite.create({
        owner_type: 'club',
        owner_id: club.id,
        template_id: 1, // Default template
        title: club.name,
        description: `Official microsite for ${club.name} - ${club.club_type || 'Pickleball Club'}`,
        logo_url: club.logo_url,
        subdomain: micrositeSlug,
        url: micrositeUrl,
        status: 'active',
        visibility_status: 'public',
        approval_status: 'approved',
        contact_email: null,
        contact_phone: null
      })
    } else {
      // Update existing microsite
      await microsite.update({
        title: club.name,
        description: `Official microsite for ${club.name} - ${club.club_type || 'Pickleball Club'}`,
        logo_url: club.logo_url,
        subdomain: micrositeSlug,
        url: micrositeUrl,
        status: 'active',
        visibility_status: 'public',
        last_updated: new Date()
      })
    }

    res.json({
      microsite_url: micrositeUrl,
      message: 'Microsite published successfully',
      published_at: new Date().toISOString(),
      microsite_id: microsite.id
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

// Upload banner image with Cloudinary
const uploadBannerImage = async (req, res) => {
  try {
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `clubs/${club.id}/banners`,
          transformation: [
            { width: 1200, height: 400, crop: 'fill' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(req.file.buffer)
    })

    // Update microsite with banner URL
    let microsite = await Microsite.findOne({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      }
    })

    if (microsite) {
      await microsite.update({ banner_url: uploadResult.secure_url })
    }

    res.json({
      banner_url: uploadResult.secure_url,
      message: 'Banner image uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading banner image:', error)
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    })
  }
}

// Update microsite customization settings
const updateMicrositeCustomization = async (req, res) => {
  try {
    const userId = req.user.id
    const { primary_color, secondary_color, description, banner_url } = req.body

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Get or create microsite record
    let microsite = await Microsite.findOne({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      }
    })

    if (!microsite) {
      // Create microsite if doesn't exist
      microsite = await Microsite.create({
        owner_type: 'club',
        owner_id: club.id,
        template_id: 1,
        title: club.name,
        description: description || `Official microsite for ${club.name}`,
        primary_color: primary_color || '#000000',
        secondary_color: secondary_color || '#FFFFFF',
        banner_url: banner_url || null,
        status: 'active'
      })
    } else {
      // Update existing microsite
      const updateData = {}
      if (primary_color) updateData.primary_color = primary_color
      if (secondary_color) updateData.secondary_color = secondary_color
      if (description) updateData.description = description
      if (banner_url !== undefined) updateData.banner_url = banner_url
      updateData.last_updated = new Date()

      await microsite.update(updateData)
    }

    res.json({
      microsite: microsite,
      message: 'Microsite customization updated successfully'
    })

  } catch (error) {
    console.error('Error updating microsite customization:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get microsite analytics and performance data
const getMicrositeAnalytics = async (req, res) => {
  try {
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Get microsite record
    const microsite = await Microsite.findOne({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      }
    })

    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Generate analytics data (in production, this would come from real tracking)
    const analytics = {
      pageViews: microsite.page_views || 0,
      monthlyVisitors: microsite.monthly_visitors || 0,
      contentScore: parseFloat(microsite.content_score) || 0,
      seoScore: parseFloat(microsite.seo_score) || 0,
      performanceScore: parseFloat(microsite.performance_score) || 0,
      lastAudit: microsite.last_audit_date,
      visibilityStatus: microsite.visibility_status,
      approvalStatus: microsite.approval_status,
      publicUrl: microsite.url,
      socialShares: Math.floor(Math.random() * 100) + 10,
      averageSessionDuration: '2:34',
      bounceRate: '42%',
      topPages: [
        { page: 'Home', views: Math.floor(microsite.page_views * 0.4) },
        { page: 'Courts', views: Math.floor(microsite.page_views * 0.3) },
        { page: 'Contact', views: Math.floor(microsite.page_views * 0.2) },
        { page: 'About', views: Math.floor(microsite.page_views * 0.1) }
      ]
    }

    res.json({
      analytics,
      message: 'Analytics data retrieved successfully'
    })

  } catch (error) {
    console.error('Error fetching microsite analytics:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete/unpublish microsite
const unpublishMicrosite = async (req, res) => {
  try {
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Get microsite record
    const microsite = await Microsite.findOne({
      where: { 
        owner_type: 'club',
        owner_id: club.id
      }
    })

    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Update microsite to private/inactive
    await microsite.update({
      visibility_status: 'private',
      status: 'inactive',
      last_updated: new Date()
    })

    res.json({
      message: 'Microsite unpublished successfully'
    })

  } catch (error) {
    console.error('Error unpublishing microsite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getClubMicrositeData,
  updateClubMicrositeData,
  uploadClubLogo,
  uploadBannerImage,
  updateMicrositeCustomization,
  getMicrositeAnalytics,
  publishMicrosite,
  unpublishMicrosite,
  getPublicMicrositeData,
  upload // Export multer middleware
}