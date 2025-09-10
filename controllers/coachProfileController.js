const { Coach, User, State } = require('../db/models')
const { Op } = require('sequelize')

// Get coach profile data
const getCoachProfile = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get coach profile with related data
    const coach = await Coach.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'is_searchable', 'last_login']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code'],
          required: false
        }
      ]
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Format response
    const profileData = {
      id: coach.id,
      user_id: coach.user_id,
      full_name: coach.full_name,
      birth_date: coach.birth_date,
      gender: coach.gender,
      state_id: coach.state_id,
      state_name: coach.state ? coach.state.name : null,
      curp: coach.curp,
      nrtp_level: coach.nrtp_level,
      profile_photo_url: coach.profile_photo_url,
      id_document_url: coach.id_document_url,
      hourly_rate: coach.hourly_rate,
      affiliation_expires_at: coach.affiliation_expires_at,
      user: coach.user
    }

    res.json({ profile: profileData })

  } catch (error) {
    console.error('Error fetching coach profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update coach profile
const updateCoachProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { 
      full_name, 
      email, 
      phone, 
      hourly_rate, 
      nrtp_level, 
      is_searchable 
    } = req.body

    // Find coach and user
    const coach = await Coach.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Update coach table
    await coach.update({
      full_name,
      nrtp_level: nrtp_level ? parseFloat(nrtp_level) : coach.nrtp_level,
      hourly_rate: hourly_rate ? parseFloat(hourly_rate) : coach.hourly_rate,
      updated_at: new Date()
    })

    // Update user table
    await coach.user.update({
      email,
      phone,
      is_searchable,
      updated_at: new Date()
    })

    // Return updated profile
    const updatedCoach = await Coach.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'is_searchable', 'last_login']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code'],
          required: false
        }
      ]
    })

    const profileData = {
      id: updatedCoach.id,
      user_id: updatedCoach.user_id,
      full_name: updatedCoach.full_name,
      birth_date: updatedCoach.birth_date,
      gender: updatedCoach.gender,
      state_id: updatedCoach.state_id,
      state_name: updatedCoach.state ? updatedCoach.state.name : null,
      curp: updatedCoach.curp,
      nrtp_level: updatedCoach.nrtp_level,
      profile_photo_url: updatedCoach.profile_photo_url,
      id_document_url: updatedCoach.id_document_url,
      hourly_rate: updatedCoach.hourly_rate,
      affiliation_expires_at: updatedCoach.affiliation_expires_at,
      user: updatedCoach.user
    }

    res.json({ 
      message: 'Coach profile updated successfully',
      profile: profileData
    })

  } catch (error) {
    console.error('Error updating coach profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Upload coach profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id
    const { profile_photo_url } = req.body
    
    // Find coach
    const coach = await Coach.findOne({
      where: { user_id: userId }
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Update profile photo URL
    await coach.update({
      profile_photo_url,
      updated_at: new Date()
    })

    res.json({ 
      message: 'Profile photo updated successfully',
      profile_photo_url 
    })

  } catch (error) {
    console.error('Error uploading profile photo:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get coach dashboard data (comprehensive profile + stats)
const getCoachDashboard = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get coach profile with all related data
    const coach = await Coach.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'is_searchable', 'last_login']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code'],
          required: false
        }
      ]
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Format profile data for dashboard
    const profileData = {
      id: coach.id,
      user_id: coach.user_id,
      full_name: coach.full_name,
      birth_date: coach.birth_date,
      gender: coach.gender,
      state_id: coach.state_id,
      state_name: coach.state ? coach.state.name : null,
      curp: coach.curp,
      nrtp_level: coach.nrtp_level,
      profile_photo_url: coach.profile_photo_url,
      id_document_url: coach.id_document_url,
      hourly_rate: coach.hourly_rate,
      affiliation_expires_at: coach.affiliation_expires_at
    }

    // Basic dashboard data structure
    const dashboardData = {
      profile: profileData,
      user: coach.user,
      stats: {
        totalSessions: 0,
        upcomingSessionsCount: 0,
        totalStudents: 0,
        activeStudents: 0,
        totalCertifications: 0,
        activeCertifications: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        completedSessions: 0,
        cancelledSessions: 0
      }
    }

    res.json(dashboardData)

  } catch (error) {
    console.error('Error fetching coach dashboard:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getCoachProfile,
  updateCoachProfile,
  uploadProfilePhoto,
  getCoachDashboard
}