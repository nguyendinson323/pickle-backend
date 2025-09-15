const { 
  Partner, Court, Tournament, CourtReservation, TournamentRegistration
} = require('../db/models')
const { Op, fn, col, literal } = require('sequelize')

const getPartnerManagementData = async (req, res) => {
  try {
    const userId = req.user.id

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Get courts
    const courts = await Court.findAll({
      where: { 
        owner_type: 'partner',
        owner_id: partner.id 
      },
      order: [['created_at', 'DESC']]
    })

    // Get tournaments
    const tournaments = await Tournament.findAll({
      where: { 
        organizer_type: 'partner',
        organizer_id: partner.id 
      },
      order: [['created_at', 'DESC']]
    })

    // Calculate stats
    const activeCourts = courts.filter(court => court.status === 'active').length
    const maintenanceCourts = courts.filter(court => court.status === 'maintenance').length
    const activeTournaments = tournaments.filter(t => t.status === 'ongoing').length
    const upcomingTournaments = tournaments.filter(t => 
      t.status === 'upcoming'
    ).length

    // Get current month revenue
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyRevenue = await CourtReservation.findOne({
      include: [{
        model: Court,
        as: 'court',
        where: {
          owner_type: 'partner',
          owner_id: partner.id
        },
        attributes: []
      }],
      where: {
        payment_status: 'paid',
        created_at: { [Op.gte]: currentMonth }
      },
      attributes: [
        [fn('SUM', col('amount')), 'total_revenue']
      ],
      raw: true
    })

    const monthlyBookings = await CourtReservation.count({
      include: [{
        model: Court,
        as: 'court',
        where: {
          owner_type: 'partner',
          owner_id: partner.id
        },
        attributes: []
      }],
      where: {
        status: { [Op.ne]: 'cancelled' },
        created_at: { [Op.gte]: currentMonth }
      }
    })

    const stats = {
      total_courts: courts.length,
      active_courts: activeCourts,
      maintenance_courts: maintenanceCourts,
      total_tournaments: tournaments.length,
      active_tournaments: activeTournaments,
      upcoming_tournaments: upcomingTournaments,
      total_revenue_this_month: parseFloat(monthlyRevenue.total_revenue) || 0,
      total_bookings_this_month: monthlyBookings
    }

    // Format courts for frontend
    const formattedCourts = courts.map(court => ({
      id: court.id,
      name: court.name,
      address: court.address || '',
      court_count: court.court_count,
      surface_type: court.surface_type,
      indoor: court.indoor,
      lights: court.lights,
      description: court.description,
      status: court.status,
      amenities: court.amenities ? court.amenities.split(',').filter(a => a.trim()) : [],
      created_at: court.created_at,
      updated_at: court.updated_at
    }))

    // Format tournaments for frontend
    const formattedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    }))

    res.json({
      courts: formattedCourts,
      tournaments: formattedTournaments,
      stats
    })

  } catch (error) {
    console.error('Error fetching partner management data:', error)
    res.status(500).json({ message: 'Failed to fetch management data' })
  }
}

const createCourt = async (req, res) => {
  try {
    const userId = req.user.id

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }
    const {
      name,
      address,
      court_count,
      surface_type,
      indoor,
      lights,
      description,
      amenities
    } = req.body

    const court = await Court.create({
      owner_type: 'partner',
      owner_id: partner.id,
      state_id: partner.state_id, // Use partner's state
      name,
      address: address || '',
      court_count: parseInt(court_count) || 1,
      surface_type: surface_type || 'hard',
      indoor: Boolean(indoor),
      lights: Boolean(lights),
      description: description || '',
      status: 'active',
      amenities: Array.isArray(amenities) ? amenities.join(',') : (amenities || '')
    })

    const formattedCourt = {
      id: court.id,
      name: court.name,
      address: court.address,
      city: court.city,
      state: court.state,
      zip_code: court.zip_code,
      court_count: court.court_count,
      surface_type: court.surface_type,
      indoor: court.indoor,
      lights: court.lights,
      description: court.description,
      hourly_rate: parseFloat(court.hourly_rate),
      status: court.status,
      amenities: court.amenities || [],
      operating_hours: court.operating_hours || [],
      images: court.images || [],
      created_at: court.created_at,
      updated_at: court.updated_at
    }

    res.status(201).json({
      id: court.id,
      name: court.name,
      address: court.address || '',
      city: '', 
      state: '',
      zip_code: '',
      court_count: court.court_count,
      surface_type: court.surface_type || 'hard',
      indoor: court.indoor,
      lights: court.lights,
      description: court.description,
      hourly_rate: 0,
      status: court.status,
      amenities: court.amenities ? court.amenities.split(',').filter(a => a.trim()) : [],
      operating_hours: [],
      images: [],
      created_at: court.created_at,
      updated_at: court.updated_at
    })

  } catch (error) {
    console.error('Error creating court:', error)
    res.status(500).json({ message: 'Failed to create court' })
  }
}

const updateCourt = async (req, res) => {
  try {
    const userId = req.user.id
    const { courtId } = req.params
    const updateData = req.body

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    const court = await Court.findOne({
      where: { 
        id: courtId,
        owner_type: 'partner',
        owner_id: partner.id 
      }
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found' })
    }

    // Parse and clean fields
    if (updateData.court_count) {
      updateData.court_count = parseInt(updateData.court_count)
    }
    if (updateData.indoor !== undefined) {
      updateData.indoor = Boolean(updateData.indoor)
    }
    if (updateData.lights !== undefined) {
      updateData.lights = Boolean(updateData.lights)
    }
    if (updateData.amenities) {
      updateData.amenities = Array.isArray(updateData.amenities) ? updateData.amenities.join(',') : updateData.amenities
    }
    
    // Remove fields that don't exist in database
    delete updateData.city
    delete updateData.state
    delete updateData.zip_code
    delete updateData.hourly_rate
    delete updateData.operating_hours
    delete updateData.images

    await court.update(updateData)

    const formattedCourt = {
      id: court.id,
      name: court.name,
      address: court.address,
      city: court.city,
      state: court.state,
      zip_code: court.zip_code,
      court_count: court.court_count,
      surface_type: court.surface_type,
      indoor: court.indoor,
      lights: court.lights,
      description: court.description,
      hourly_rate: parseFloat(court.hourly_rate),
      status: court.status,
      amenities: court.amenities || [],
      operating_hours: court.operating_hours || [],
      images: court.images || [],
      created_at: court.created_at,
      updated_at: court.updated_at
    }

    res.json({
      id: court.id,
      name: court.name,
      address: court.address || '',
      city: '',
      state: '',
      zip_code: '',
      court_count: court.court_count,
      surface_type: court.surface_type || 'hard',
      indoor: court.indoor,
      lights: court.lights,
      description: court.description,
      hourly_rate: 0,
      status: court.status,
      amenities: court.amenities ? court.amenities.split(',').filter(a => a.trim()) : [],
      operating_hours: [],
      images: [],
      created_at: court.created_at,
      updated_at: court.updated_at
    })

  } catch (error) {
    console.error('Error updating court:', error)
    res.status(500).json({ message: 'Failed to update court' })
  }
}

const deleteCourt = async (req, res) => {
  try {
    const userId = req.user.id
    const { courtId } = req.params

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    const court = await Court.findOne({
      where: { 
        id: courtId,
        owner_type: 'partner',
        owner_id: partner.id 
      }
    })

    if (!court) {
      return res.status(404).json({ message: 'Court not found' })
    }

    // Check for active reservations
    const activeReservations = await CourtReservation.count({
      where: {
        court_id: courtId,
        status: { [Op.in]: ['confirmed', 'pending'] },
        date: { [Op.gte]: new Date().toISOString().split('T')[0] }
      }
    })

    if (activeReservations > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete court with active reservations' 
      })
    }

    await court.destroy()

    res.json({ message: 'Court deleted successfully' })

  } catch (error) {
    console.error('Error deleting court:', error)
    res.status(500).json({ message: 'Failed to delete court' })
  }
}

const createTournament = async (req, res) => {
  try {
    const userId = req.user.id

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }
    const {
      name,
      description,
      tournament_type,
      start_date,
      end_date,
      registration_start,
      registration_end,
      max_participants,
      entry_fee,
      venue_name,
      venue_address
    } = req.body

    const tournament = await Tournament.create({
      organizer_type: 'partner',
      organizer_id: partner.id,
      state_id: partner.state_id, // Use partner's state
      name,
      description: description || '',
      tournament_type: tournament_type || 'singles',
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      registration_start: new Date(registration_start),
      registration_end: new Date(registration_end),
      max_participants: max_participants ? parseInt(max_participants) : null,
      entry_fee: entry_fee ? parseFloat(entry_fee) : null,
      venue_name: venue_name || '',
      venue_address: venue_address || '',
      status: 'upcoming'
    })

    const formattedTournament = {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type,
      skill_level: tournament.skill_level,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: tournament.current_participants,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: tournament.prize_pool ? parseFloat(tournament.prize_pool) : null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: tournament.rules,
      contact_info: tournament.contact_info,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    }

    res.status(201).json({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type || 'singles',
      skill_level: 'open',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: 0,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: null,
      contact_info: null,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    })

  } catch (error) {
    console.error('Error creating tournament:', error)
    res.status(500).json({ message: 'Failed to create tournament' })
  }
}

const updateTournament = async (req, res) => {
  try {
    const userId = req.user.id
    const { tournamentId } = req.params
    const updateData = req.body

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    const tournament = await Tournament.findOne({
      where: { 
        id: tournamentId,
        organizer_type: 'partner',
        organizer_id: partner.id 
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    // Parse dates and numeric fields
    const dateFields = ['start_date', 'end_date', 'registration_start', 'registration_end']
    dateFields.forEach(field => {
      if (updateData[field]) {
        updateData[field] = new Date(updateData[field])
      }
    })

    if (updateData.max_participants) {
      updateData.max_participants = parseInt(updateData.max_participants)
    }
    if (updateData.entry_fee) {
      updateData.entry_fee = parseFloat(updateData.entry_fee)
    }
    
    // Remove fields that don't exist in database
    delete updateData.skill_level
    delete updateData.current_participants
    delete updateData.prize_pool
    delete updateData.rules
    delete updateData.contact_info

    await tournament.update(updateData)

    const formattedTournament = {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type,
      skill_level: tournament.skill_level,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: tournament.current_participants,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: tournament.prize_pool ? parseFloat(tournament.prize_pool) : null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: tournament.rules,
      contact_info: tournament.contact_info,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    }

    res.json({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type || 'singles',
      skill_level: 'open',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: 0,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: null,
      contact_info: null,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    })

  } catch (error) {
    console.error('Error updating tournament:', error)
    res.status(500).json({ message: 'Failed to update tournament' })
  }
}

const deleteTournament = async (req, res) => {
  try {
    const userId = req.user.id
    const { tournamentId } = req.params

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    const tournament = await Tournament.findOne({
      where: { 
        id: tournamentId,
        organizer_type: 'partner',
        organizer_id: partner.id 
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    // Check if tournament has registrations
    const registrationCount = await TournamentRegistration.count({
      where: { tournament_id: tournamentId }
    })

    if (registrationCount > 0 && tournament.status !== 'upcoming') {
      return res.status(400).json({ 
        message: 'Cannot delete tournament with registrations. Cancel it instead.' 
      })
    }

    await tournament.destroy()

    res.json({ message: 'Tournament deleted successfully' })

  } catch (error) {
    console.error('Error deleting tournament:', error)
    res.status(500).json({ message: 'Failed to delete tournament' })
  }
}

const publishTournament = async (req, res) => {
  try {
    const userId = req.user.id
    const { tournamentId } = req.params

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    const tournament = await Tournament.findOne({
      where: { 
        id: tournamentId,
        organizer_type: 'partner',
        organizer_id: partner.id 
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Only upcoming tournaments can be published' })
    }

    // Check if registration period is valid  
    const now = new Date()
    const registrationStart = new Date(tournament.registration_start)
    
    const newStatus = registrationStart <= now ? 'ongoing' : 'upcoming'

    await tournament.update({ status: newStatus })

    const formattedTournament = {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type,
      skill_level: tournament.skill_level,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: tournament.current_participants,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: tournament.prize_pool ? parseFloat(tournament.prize_pool) : null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: tournament.rules,
      contact_info: tournament.contact_info,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    }

    res.json({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type || 'singles',
      skill_level: 'open',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: 0,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: null,
      contact_info: null,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    })

  } catch (error) {
    console.error('Error publishing tournament:', error)
    res.status(500).json({ message: 'Failed to publish tournament' })
  }
}

const cancelTournament = async (req, res) => {
  try {
    const userId = req.user.id
    const { tournamentId } = req.params

    // Get partner record first
    const partner = await Partner.findOne({
      where: { user_id: userId }
    })

    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    const tournament = await Tournament.findOne({
      where: { 
        id: tournamentId,
        organizer_type: 'partner',
        organizer_id: partner.id 
      }
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    if (tournament.status === 'completed' || tournament.status === 'canceled') {
      return res.status(400).json({ message: 'Cannot cancel completed or already cancelled tournament' })
    }

    await tournament.update({ status: 'canceled' })

    const formattedTournament = {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type,
      skill_level: tournament.skill_level,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: tournament.current_participants,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: tournament.prize_pool ? parseFloat(tournament.prize_pool) : null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: tournament.rules,
      contact_info: tournament.contact_info,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    }

    res.json({
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournament_type: tournament.tournament_type || 'singles',
      skill_level: 'open',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_start: tournament.registration_start,
      registration_end: tournament.registration_end,
      max_participants: tournament.max_participants,
      current_participants: 0,
      entry_fee: tournament.entry_fee ? parseFloat(tournament.entry_fee) : null,
      prize_pool: null,
      venue_name: tournament.venue_name,
      venue_address: tournament.venue_address,
      status: tournament.status,
      rules: null,
      contact_info: null,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    })

  } catch (error) {
    console.error('Error cancelling tournament:', error)
    res.status(500).json({ message: 'Failed to cancel tournament' })
  }
}

module.exports = {
  getPartnerManagementData,
  createCourt,
  updateCourt,
  deleteCourt,
  createTournament,
  updateTournament,
  deleteTournament,
  publishTournament,
  cancelTournament
}