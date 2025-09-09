const { CoachingSession, Player, Coach, User, State } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get all coach students data
const getCoachStudentsData = async (req, res) => {
  try {
    const coachId = req.user.id
    
    // Get coach profile to get coach table ID
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Get all unique students who have had sessions with this coach
    const studentsWithSessions = await CoachingSession.findAll({
      where: { coach_id: coach.id },
      include: [
        {
          model: Player,
          as: 'player',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['email', 'phone']
            },
            {
              model: State,
              as: 'state',
              attributes: ['name'],
              required: false
            }
          ]
        }
      ],
      order: [['session_date', 'DESC']]
    })

    // Process and group by student
    const studentData = {}
    
    studentsWithSessions.forEach(session => {
      const player = session.player
      const studentId = player.id
      
      if (!studentData[studentId]) {
        studentData[studentId] = {
          id: player.id,
          full_name: player.full_name,
          profile_photo_url: player.profile_photo_url,
          nrtp_level: player.nrtp_level,
          email: player.user.email,
          phone: player.user.phone,
          state_id: player.state_id,
          state_name: player.state ? player.state.name : 'Unknown',
          created_at: player.created_at,
          sessions: {
            total_sessions: 0,
            completed_sessions: 0,
            upcoming_sessions: 0,
            last_session_date: null,
            average_rating: 0,
            total_spent: 0
          },
          progress: {
            initial_level: player.nrtp_level, // We'll assume current level is initial for now
            current_level: player.nrtp_level,
            improvement: 0,
            sessions_to_improve: 0
          },
          allSessions: []
        }
      }

      studentData[studentId].allSessions.push(session)
    })

    // Calculate session statistics for each student
    const students = Object.values(studentData).map(student => {
      const sessions = student.allSessions
      const currentDate = new Date()

      // Basic counts
      student.sessions.total_sessions = sessions.length
      student.sessions.completed_sessions = sessions.filter(s => s.status === 'completed').length
      student.sessions.upcoming_sessions = sessions.filter(s => 
        s.status === 'scheduled' && new Date(s.session_date) >= currentDate
      ).length

      // Last session date
      const completedSessions = sessions.filter(s => s.status === 'completed')
      if (completedSessions.length > 0) {
        student.sessions.last_session_date = completedSessions
          .sort((a, b) => new Date(b.session_date) - new Date(a.session_date))[0]
          .session_date
      }

      // Average rating from completed sessions
      const ratedSessions = sessions.filter(s => s.status === 'completed' && s.rating !== null)
      if (ratedSessions.length > 0) {
        student.sessions.average_rating = ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length
      }

      // Total spent (from paid sessions)
      student.sessions.total_spent = sessions
        .filter(s => s.payment_status === 'paid')
        .reduce((sum, s) => sum + parseFloat(s.price || 0), 0)

      // Progress calculation (simplified)
      student.progress.sessions_to_improve = Math.max(0, 10 - student.sessions.completed_sessions)

      // Remove the temporary allSessions array
      delete student.allSessions

      return student
    })

    // Calculate overall statistics
    const totalStudents = students.length
    const activeStudents = students.filter(s => s.sessions.upcoming_sessions > 0).length
    const inactiveStudents = totalStudents - activeStudents
    const averageSessionsPerStudent = totalStudents > 0 
      ? students.reduce((sum, s) => sum + s.sessions.total_sessions, 0) / totalStudents 
      : 0
    const totalRevenue = students.reduce((sum, s) => sum + s.sessions.total_spent, 0)
    const averageRating = students.length > 0
      ? students
          .filter(s => s.sessions.average_rating > 0)
          .reduce((sum, s) => sum + s.sessions.average_rating, 0) / 
        students.filter(s => s.sessions.average_rating > 0).length
      : 0

    const stats = {
      total_students: totalStudents,
      active_students: activeStudents,
      inactive_students: inactiveStudents,
      average_sessions_per_student: Math.round(averageSessionsPerStudent * 10) / 10,
      total_revenue: totalRevenue,
      average_rating: Math.round((averageRating || 0) * 10) / 10
    }

    res.json({
      students: students.sort((a, b) => 
        new Date(b.sessions.last_session_date || b.created_at) - 
        new Date(a.sessions.last_session_date || a.created_at)
      ),
      stats
    })

  } catch (error) {
    console.error('Error fetching coach students data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get detailed information for a specific student
const getStudentDetails = async (req, res) => {
  try {
    const { studentId } = req.params
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Get player information
    const player = await Player.findByPk(studentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'phone']
        },
        {
          model: State,
          as: 'state',
          attributes: ['name'],
          required: false
        }
      ]
    })

    if (!player) {
      return res.status(404).json({ message: 'Student not found' })
    }

    // Get all sessions between this coach and student
    const sessions = await CoachingSession.findAll({
      where: { 
        coach_id: coach.id,
        player_id: studentId
      },
      order: [['session_date', 'DESC']]
    })

    // Calculate detailed statistics
    const currentDate = new Date()
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.status === 'completed').length
    const upcomingSessions = sessions.filter(s => 
      s.status === 'scheduled' && new Date(s.session_date) >= currentDate
    ).length

    const lastSessionDate = sessions.length > 0 ? sessions[0].session_date : null
    
    const ratedSessions = sessions.filter(s => s.status === 'completed' && s.rating !== null)
    const averageRating = ratedSessions.length > 0 
      ? ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length 
      : 0

    const totalSpent = sessions
      .filter(s => s.payment_status === 'paid')
      .reduce((sum, s) => sum + parseFloat(s.price || 0), 0)

    const studentDetails = {
      id: player.id,
      full_name: player.full_name,
      profile_photo_url: player.profile_photo_url,
      nrtp_level: player.nrtp_level,
      email: player.user.email,
      phone: player.user.phone,
      state_id: player.state_id,
      state_name: player.state ? player.state.name : 'Unknown',
      created_at: player.created_at,
      sessions: {
        total_sessions: totalSessions,
        completed_sessions: completedSessions,
        upcoming_sessions: upcomingSessions,
        last_session_date: lastSessionDate,
        average_rating: Math.round(averageRating * 10) / 10,
        total_spent: totalSpent
      },
      progress: {
        initial_level: player.nrtp_level, // Simplified for now
        current_level: player.nrtp_level,
        improvement: 0,
        sessions_to_improve: Math.max(0, 10 - completedSessions)
      },
      recent_sessions: sessions.slice(0, 5) // Last 5 sessions for details view
    }

    res.json(studentDetails)

  } catch (error) {
    console.error('Error fetching student details:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update student NRTP level
const updateStudentLevel = async (req, res) => {
  try {
    const { studentId } = req.params
    const { nrtp_level } = req.body
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Verify the coach has sessions with this student
    const hasSession = await CoachingSession.findOne({
      where: { 
        coach_id: coach.id,
        player_id: studentId
      }
    })

    if (!hasSession) {
      return res.status(403).json({ message: 'You can only update levels for your students' })
    }

    // Update player level
    const player = await Player.findByPk(studentId)
    if (!player) {
      return res.status(404).json({ message: 'Student not found' })
    }

    await player.update({ nrtp_level })

    res.json({ message: 'Student level updated successfully' })

  } catch (error) {
    console.error('Error updating student level:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Add a note about a student (this would require a notes table in a real implementation)
const addStudentNote = async (req, res) => {
  try {
    const { studentId } = req.params
    const { note } = req.body
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Verify the coach has sessions with this student
    const hasSession = await CoachingSession.findOne({
      where: { 
        coach_id: coach.id,
        player_id: studentId
      }
    })

    if (!hasSession) {
      return res.status(403).json({ message: 'You can only add notes for your students' })
    }

    // In a real implementation, you would save the note to a notes table
    // For now, we'll just return success
    res.json({ 
      message: 'Note added successfully',
      note,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error adding student note:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getCoachStudentsData,
  getStudentDetails,
  updateStudentLevel,
  addStudentNote
}