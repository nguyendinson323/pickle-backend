const { CoachingSession, Player, Court, Coach, User, CoachAvailability } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get all coach sessions data (sessions, availability, stats)
const getCoachSessionsData = async (req, res) => {
  try {
    const coachId = req.user.id
    
    // Get coach profile to get coach table ID
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Get all coaching sessions for this coach
    const sessions = await CoachingSession.findAll({
      where: { coach_id: coach.id },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'phone']
            }
          ]
        },
        {
          model: Court,
          as: 'court',
          attributes: ['id', 'name', 'address'],
          required: false
        }
      ],
      order: [['session_date', 'DESC'], ['start_time', 'DESC']]
    })

    // Get coach availability
    const availability = await CoachAvailability.findAll({
      where: { coach_id: coach.id },
      order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
    })

    // Calculate session statistics
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'completed').length
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.session_date) >= new Date()).length
    const canceledSessions = sessions.filter(s => s.status === 'canceled').length
    
    // Calculate average rating from completed sessions with ratings
    const ratedSessions = sessions.filter(s => s.status === 'completed' && s.rating !== null)
    const averageRating = ratedSessions.length > 0 
      ? ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length 
      : 0

    // Calculate total earnings from paid sessions
    const totalEarnings = sessions
      .filter(s => s.payment_status === 'paid')
      .reduce((sum, s) => sum + parseFloat(s.price || 0), 0)

    // Calculate completion rate
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

    const stats = {
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      upcoming_sessions: upcomingSessions,
      canceled_sessions: canceledSessions,
      average_rating: Math.round(averageRating * 10) / 10,
      total_earnings: totalEarnings,
      completion_rate: Math.round(completionRate * 10) / 10
    }

    res.json({
      sessions,
      availability,
      stats
    })

  } catch (error) {
    console.error('Error fetching coach sessions data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update coaching session status
const updateSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params
    const { status } = req.body
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Find and update the session
    const session = await CoachingSession.findOne({
      where: { 
        id: sessionId,
        coach_id: coach.id 
      }
    })

    if (!session) {
      return res.status(404).json({ message: 'Session not found' })
    }

    // Update session status
    session.status = status
    session.updated_at = new Date()
    await session.save()

    // Recalculate stats after status update
    const allSessions = await CoachingSession.findAll({
      where: { coach_id: coach.id }
    })

    const totalSessions = allSessions.length
    const completedSessions = allSessions.filter(s => s.status === 'completed').length
    const upcomingSessions = allSessions.filter(s => s.status === 'scheduled' && new Date(s.session_date) >= new Date()).length
    const canceledSessions = allSessions.filter(s => s.status === 'canceled').length
    
    const ratedSessions = allSessions.filter(s => s.status === 'completed' && s.rating !== null)
    const averageRating = ratedSessions.length > 0 
      ? ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length 
      : 0

    const totalEarnings = allSessions
      .filter(s => s.payment_status === 'paid')
      .reduce((sum, s) => sum + parseFloat(s.price || 0), 0)

    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

    const updatedStats = {
      total_sessions: totalSessions,
      completed_sessions: completedSessions,
      upcoming_sessions: upcomingSessions,
      canceled_sessions: canceledSessions,
      average_rating: Math.round(averageRating * 10) / 10,
      total_earnings: totalEarnings,
      completion_rate: Math.round(completionRate * 10) / 10
    }

    res.json({
      message: 'Session status updated successfully',
      stats: updatedStats
    })

  } catch (error) {
    console.error('Error updating session status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Add coach availability
const addAvailability = async (req, res) => {
  try {
    const coachId = req.user.id
    const { day_of_week, start_time, end_time, is_recurring, specific_date } = req.body

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Create availability slot
    const availability = await CoachAvailability.create({
      coach_id: coach.id,
      day_of_week,
      start_time,
      end_time,
      is_recurring: is_recurring || true,
      specific_date: specific_date || null
    })

    res.json(availability)

  } catch (error) {
    console.error('Error adding availability:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Remove coach availability
const removeAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Find and delete availability
    const availability = await CoachAvailability.findOne({
      where: { 
        id: availabilityId,
        coach_id: coach.id 
      }
    })

    if (!availability) {
      return res.status(404).json({ message: 'Availability slot not found' })
    }

    await availability.destroy()

    res.json({ message: 'Availability slot removed successfully' })

  } catch (error) {
    console.error('Error removing availability:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getCoachSessionsData,
  updateSessionStatus,
  addAvailability,
  removeAvailability
}