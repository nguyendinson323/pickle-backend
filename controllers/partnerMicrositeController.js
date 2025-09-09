const { Partner, User, Microsite, MicrositePages, Court, Tournament, TournamentCategory, CourtReservation, Payment, Sequelize } = require('../db/models')
const { Op } = require('sequelize')

// Get partner microsite data (public or private view)
const getPartnerMicrositeData = async (req, res) => {
  try {
    const { partnerId } = req.params
    let partnerProfile
    
    if (partnerId) {
      // Public view - fetch by partner ID
      partnerProfile = await Partner.findByPk(partnerId)
    } else {
      // Authenticated partner view
      const userId = req.user.id
      partnerProfile = await Partner.findOne({
        where: { user_id: userId }
      })
    }
    
    if (!partnerProfile) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Get or create microsite
    let microsite = await Microsite.findOne({
      where: {
        owner_type: 'partner',
        owner_id: partnerProfile.id
      }
    })

    if (!microsite) {
      // Create default microsite if it doesn't exist
      microsite = await Microsite.create({
        owner_type: 'partner',
        owner_id: partnerProfile.id,
        template_id: 1, // Default template
        title: `${partnerProfile.business_name} - Official Page`,
        description: `Welcome to ${partnerProfile.business_name}'s official pickleball page`,
        primary_color: '#000000',
        secondary_color: '#FFFFFF',
        is_active: true
      })
    }

    // Format microsite info with partner details
    const micrositeInfo = {
      ...microsite.toJSON(),
      partner: {
        id: partnerProfile.id,
        business_name: partnerProfile.business_name,
        contact_name: partnerProfile.contact_name,
        contact_title: partnerProfile.contact_title,
        partner_type: partnerProfile.partner_type,
        website: partnerProfile.website,
        social_media: partnerProfile.social_media,
        has_courts: partnerProfile.has_courts
      }
    }

    // Get partner's courts
    const courts = await Court.findAll({
      where: {
        owner_type: 'partner',
        owner_id: partnerProfile.id
      },
      order: [['name', 'ASC']]
    })

    // Get partner's tournaments
    const tournaments = await Tournament.findAll({
      where: {
        organizer_type: 'partner',
        organizer_id: partnerProfile.id
      },
      include: [
        {
          model: TournamentCategory,
          as: 'categories',
          attributes: ['id']
        }
      ],
      order: [['start_date', 'DESC']],
      limit: 20
    })

    // Add current participants count to tournaments
    const formattedTournaments = await Promise.all(tournaments.map(async (tournament) => {
      const participantCount = await TournamentRegistration.count({
        where: { 
          tournament_id: tournament.id,
          status: { [Op.in]: ['registered', 'confirmed'] }
        }
      })

      return {
        ...tournament.toJSON(),
        current_participants: participantCount
      }
    }))

    // Get microsite pages
    const pages = await MicrositePages.findAll({
      where: { microsite_id: microsite.id },
      order: [['display_order', 'ASC'], ['id', 'ASC']]
    })

    // Calculate statistics
    const totalCourts = courts.length
    const activeCourts = courts.filter(court => court.status === 'active').length

    const totalTournaments = tournaments.length
    const upcomingTournaments = tournaments.filter(t => 
      new Date(t.start_date) > new Date()
    ).length

    const totalReservations = await CourtReservation.count({
      include: [{
        model: Court,
        where: {
          owner_type: 'partner',
          owner_id: partnerProfile.id
        }
      }]
    })

    const totalRevenue = await Payment.sum('amount', {
      where: {
        user_id: partnerProfile.user_id,
        status: 'completed',
        payment_type: { [Op.in]: ['Court reservation', 'Tournament'] }
      }
    }) || 0

    const stats = {
      total_courts: totalCourts,
      active_courts: activeCourts,
      total_tournaments: totalTournaments,
      upcoming_tournaments: upcomingTournaments,
      total_reservations: totalReservations,
      total_revenue: totalRevenue
    }

    res.json({
      micrositeInfo,
      courts,
      tournaments: formattedTournaments,
      pages,
      stats
    })

  } catch (error) {
    console.error('Error fetching partner microsite data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update partner microsite information
const updatePartnerMicrosite = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body
    
    // Get partner profile
    const partnerProfile = await Partner.findOne({
      where: { user_id: userId }
    })
    
    if (!partnerProfile) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Find microsite
    const microsite = await Microsite.findOne({
      where: {
        owner_type: 'partner',
        owner_id: partnerProfile.id
      }
    })

    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Update microsite
    await microsite.update(updateData)

    // Return updated microsite with partner details
    const micrositeInfo = {
      ...microsite.toJSON(),
      partner: {
        id: partnerProfile.id,
        business_name: partnerProfile.business_name,
        contact_name: partnerProfile.contact_name,
        contact_title: partnerProfile.contact_title,
        partner_type: partnerProfile.partner_type,
        website: partnerProfile.website,
        social_media: partnerProfile.social_media,
        has_courts: partnerProfile.has_courts
      }
    }

    res.json({
      micrositeInfo,
      message: 'Microsite updated successfully'
    })

  } catch (error) {
    console.error('Error updating partner microsite:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create microsite page
const createMicrositePage = async (req, res) => {
  try {
    const userId = req.user.id
    const pageData = req.body
    
    // Get partner profile
    const partnerProfile = await Partner.findOne({
      where: { user_id: userId }
    })
    
    if (!partnerProfile) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Find microsite
    const microsite = await Microsite.findOne({
      where: {
        owner_type: 'partner',
        owner_id: partnerProfile.id
      }
    })

    if (!microsite) {
      return res.status(404).json({ message: 'Microsite not found' })
    }

    // Create page
    const page = await MicrositePages.create({
      ...pageData,
      microsite_id: microsite.id
    })

    res.json({
      page,
      message: 'Page created successfully'
    })

  } catch (error) {
    console.error('Error creating microsite page:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update microsite page
const updateMicrositePage = async (req, res) => {
  try {
    const { pageId } = req.params
    const userId = req.user.id
    const updateData = req.body
    
    // Get partner profile
    const partnerProfile = await Partner.findOne({
      where: { user_id: userId }
    })
    
    if (!partnerProfile) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Find page with microsite ownership check
    const page = await MicrositePages.findOne({
      where: { id: pageId },
      include: [{
        model: Microsite,
        where: {
          owner_type: 'partner',
          owner_id: partnerProfile.id
        }
      }]
    })

    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    // Update page
    await page.update(updateData)

    res.json({
      page,
      message: 'Page updated successfully'
    })

  } catch (error) {
    console.error('Error updating microsite page:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete microsite page
const deleteMicrositePage = async (req, res) => {
  try {
    const { pageId } = req.params
    const userId = req.user.id
    
    // Get partner profile
    const partnerProfile = await Partner.findOne({
      where: { user_id: userId }
    })
    
    if (!partnerProfile) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Find page with microsite ownership check
    const page = await MicrositePages.findOne({
      where: { id: pageId },
      include: [{
        model: Microsite,
        where: {
          owner_type: 'partner',
          owner_id: partnerProfile.id
        }
      }]
    })

    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    // Delete page
    await page.destroy()

    res.json({ message: 'Page deleted successfully' })

  } catch (error) {
    console.error('Error deleting microsite page:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getPartnerMicrositeData,
  updatePartnerMicrosite,
  createMicrositePage,
  updateMicrositePage,
  deleteMicrositePage
}