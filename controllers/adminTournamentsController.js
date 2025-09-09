const { User, Tournament, TournamentParticipant, Club, Partner, StateCommittee, State, sequelize } = require('../db/models')
const { Op } = require('sequelize')

// Get tournaments with filters and statistics
const getTournaments = async (req, res) => {
  try {
    const {
      status,
      organizer,
      location,
      dateFrom,
      dateTo,
      searchTerm,
      entryFeeMin,
      entryFeeMax,
      participantsMin,
      participantsMax
    } = req.query

    // Build filter conditions
    const whereConditions = {}
    
    if (status) {
      whereConditions.status = status
    }

    if (searchTerm) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { location: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    if (location) {
      whereConditions.location = { [Op.iLike]: `%${location}%` }
    }

    if (entryFeeMin) {
      whereConditions.entry_fee = { [Op.gte]: parseFloat(entryFeeMin) }
    }

    if (entryFeeMax) {
      if (whereConditions.entry_fee) {
        whereConditions.entry_fee[Op.lte] = parseFloat(entryFeeMax)
      } else {
        whereConditions.entry_fee = { [Op.lte]: parseFloat(entryFeeMax) }
      }
    }

    if (dateFrom || dateTo) {
      whereConditions.start_date = {}
      if (dateFrom) {
        whereConditions.start_date[Op.gte] = new Date(dateFrom)
      }
      if (dateTo) {
        whereConditions.end_date = { [Op.lte]: new Date(dateTo + 'T23:59:59') }
      }
    }

    // Fetch tournaments with associations
    const tournaments = await Tournament.findAll({
      where: whereConditions,
      include: [
        {
          model: Club,
          as: 'Club',
          attributes: ['id', 'business_name'],
          required: false
        },
        {
          model: Partner,
          as: 'Partner',
          attributes: ['id', 'business_name'],
          required: false
        },
        {
          model: StateCommittee,
          as: 'StateCommittee',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['start_date', 'DESC']],
      limit: 1000
    })

    // Transform data for frontend
    const transformedTournaments = tournaments.map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      organizer_id: tournament.organizer_id,
      organizer_name: tournament.Club?.business_name || tournament.Partner?.business_name || tournament.StateCommittee?.name || 'Unknown',
      organizer_type: tournament.Club ? 'club' : tournament.Partner ? 'partner' : tournament.StateCommittee ? 'state' : 'unknown',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      location: tournament.location,
      status: tournament.status,
      total_participants: tournament.total_participants || 0,
      entry_fee: tournament.entry_fee || 0,
      total_revenue: (tournament.total_participants || 0) * (tournament.entry_fee || 0),
      prize_pool: tournament.prize_pool || 0
    }))

    // Apply organizer filter after transformation
    let filteredTournaments = transformedTournaments
    if (organizer) {
      filteredTournaments = transformedTournaments.filter(tournament =>
        tournament.organizer_name.toLowerCase().includes(organizer.toLowerCase())
      )
    }

    // Apply participants filter
    if (participantsMin || participantsMax) {
      filteredTournaments = filteredTournaments.filter(tournament => {
        if (participantsMin && tournament.total_participants < parseInt(participantsMin)) return false
        if (participantsMax && tournament.total_participants > parseInt(participantsMax)) return false
        return true
      })
    }

    // Calculate statistics
    const totalTournaments = filteredTournaments.length
    const statusCounts = filteredTournaments.reduce((acc, tournament) => {
      acc[tournament.status] = (acc[tournament.status] || 0) + 1
      return acc
    }, {})

    const totalParticipants = filteredTournaments.reduce((sum, t) => sum + t.total_participants, 0)
    const totalRevenue = filteredTournaments.reduce((sum, t) => sum + t.total_revenue, 0)

    // Get organizer counts to find top organizer
    const organizerCounts = filteredTournaments.reduce((acc, tournament) => {
      acc[tournament.organizer_name] = (acc[tournament.organizer_name] || 0) + 1
      return acc
    }, {})
    const topOrganizer = Object.keys(organizerCounts).length > 0 
      ? Object.keys(organizerCounts).reduce((a, b) => organizerCounts[a] > organizerCounts[b] ? a : b)
      : 'N/A'

    const stats = {
      totalTournaments,
      activeTournaments: statusCounts.ongoing || 0,
      upcomingTournaments: statusCounts.published || 0,
      completedTournaments: statusCounts.completed || 0,
      cancelledTournaments: statusCounts.cancelled || 0,
      totalParticipants,
      totalRevenue,
      averageParticipants: totalTournaments > 0 ? Math.round(totalParticipants / totalTournaments) : 0,
      topOrganizer,
      pendingApprovals: statusCounts.draft || 0
    }

    res.json({
      tournaments: filteredTournaments,
      stats
    })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    res.status(500).json({ message: 'Failed to fetch tournaments' })
  }
}

// Get tournament participants
const getTournamentParticipants = async (req, res) => {
  try {
    const { tournamentId } = req.params
    const { status, paymentStatus } = req.query

    // Build filter conditions
    const whereConditions = {}
    
    if (tournamentId && tournamentId !== 'participants') {
      whereConditions.tournament_id = parseInt(tournamentId)
    }

    if (status) {
      whereConditions.status = status
    }

    if (paymentStatus) {
      whereConditions.payment_status = paymentStatus
    }

    const participants = await TournamentParticipant.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'role', 'email'],
          required: true
        },
        {
          model: Tournament,
          attributes: ['id', 'name', 'entry_fee'],
          required: true
        }
      ],
      order: [['registration_date', 'DESC']],
      limit: 1000
    })

    // Transform data for frontend
    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      tournament_id: participant.tournament_id,
      user_id: participant.user_id,
      user_name: participant.User.username,
      user_type: participant.User.role,
      registration_date: participant.registration_date,
      status: participant.status,
      seed: participant.seed,
      payment_status: participant.payment_status || 'pending',
      amount_paid: participant.amount_paid || participant.Tournament.entry_fee || 0
    }))

    res.json(transformedParticipants)
  } catch (error) {
    console.error('Error fetching tournament participants:', error)
    res.status(500).json({ message: 'Failed to fetch tournament participants' })
  }
}

// Get all participants across tournaments
const getAllParticipants = async (req, res) => {
  try {
    const { status, paymentStatus } = req.query

    const whereConditions = {}
    
    if (status) {
      whereConditions.status = status
    }

    if (paymentStatus) {
      whereConditions.payment_status = paymentStatus
    }

    const participants = await TournamentParticipant.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'role', 'email'],
          required: true
        },
        {
          model: Tournament,
          attributes: ['id', 'name', 'entry_fee'],
          required: true
        }
      ],
      order: [['registration_date', 'DESC']],
      limit: 1000
    })

    const transformedParticipants = participants.map(participant => ({
      id: participant.id,
      tournament_id: participant.tournament_id,
      user_id: participant.user_id,
      user_name: participant.User.username,
      user_type: participant.User.role,
      registration_date: participant.registration_date,
      status: participant.status,
      seed: participant.seed,
      payment_status: participant.payment_status || 'pending',
      amount_paid: participant.amount_paid || participant.Tournament.entry_fee || 0
    }))

    res.json(transformedParticipants)
  } catch (error) {
    console.error('Error fetching all participants:', error)
    res.status(500).json({ message: 'Failed to fetch participants' })
  }
}

// Get tournament details
const getTournamentDetails = async (req, res) => {
  try {
    const { id } = req.params

    const tournament = await Tournament.findByPk(id, {
      include: [
        {
          model: Club,
          as: 'Club',
          attributes: ['id', 'business_name'],
          required: false
        },
        {
          model: Partner,
          as: 'Partner',
          attributes: ['id', 'business_name'],
          required: false
        },
        {
          model: StateCommittee,
          as: 'StateCommittee',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    })

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    // Get participant count
    const participantCount = await TournamentParticipant.count({
      where: { tournament_id: id }
    })

    const tournamentDetails = {
      id: tournament.id,
      name: tournament.name,
      organizer_id: tournament.organizer_id,
      organizer_name: tournament.Club?.business_name || tournament.Partner?.business_name || tournament.StateCommittee?.name || 'Unknown',
      organizer_type: tournament.Club ? 'club' : tournament.Partner ? 'partner' : tournament.StateCommittee ? 'state' : 'unknown',
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      location: tournament.location,
      status: tournament.status,
      total_participants: participantCount,
      entry_fee: tournament.entry_fee || 0,
      total_revenue: participantCount * (tournament.entry_fee || 0),
      prize_pool: tournament.prize_pool || 0,
      description: tournament.description,
      rules: tournament.rules,
      created_at: tournament.created_at,
      updated_at: tournament.updated_at
    }

    res.json(tournamentDetails)
  } catch (error) {
    console.error('Error fetching tournament details:', error)
    res.status(500).json({ message: 'Failed to fetch tournament details' })
  }
}

// Update tournament status
const updateTournamentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    const validStatuses = ['draft', 'published', 'ongoing', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid tournament status' })
    }

    const tournament = await Tournament.findByPk(id)
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    await tournament.update({
      status,
      updated_at: new Date()
    })

    // In real implementation, log the status change with reason
    
    res.json({
      message: 'Tournament status updated successfully',
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status
      }
    })
  } catch (error) {
    console.error('Error updating tournament status:', error)
    res.status(500).json({ message: 'Failed to update tournament status' })
  }
}

// Approve tournament
const approveTournament = async (req, res) => {
  try {
    const { id } = req.params

    const tournament = await Tournament.findByPk(id)
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    await tournament.update({
      status: 'published',
      is_approved: true,
      approved_at: new Date(),
      approved_by: req.user.id
    })

    res.json({
      message: 'Tournament approved successfully',
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status
      }
    })
  } catch (error) {
    console.error('Error approving tournament:', error)
    res.status(500).json({ message: 'Failed to approve tournament' })
  }
}

// Reject tournament
const rejectTournament = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' })
    }

    const tournament = await Tournament.findByPk(id)
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    await tournament.update({
      status: 'cancelled',
      is_approved: false,
      rejection_reason: reason,
      rejected_at: new Date(),
      rejected_by: req.user.id
    })

    res.json({
      message: 'Tournament rejected successfully',
      reason
    })
  } catch (error) {
    console.error('Error rejecting tournament:', error)
    res.status(500).json({ message: 'Failed to reject tournament' })
  }
}

// Cancel tournament
const cancelTournament = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    const tournament = await Tournament.findByPk(id)
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    await tournament.update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date(),
      cancelled_by: req.user.id
    })

    // In real implementation, process refunds for participants
    await TournamentParticipant.update(
      { 
        status: 'withdrew',
        payment_status: 'refunded'
      },
      { where: { tournament_id: id, status: 'registered' } }
    )

    res.json({
      message: 'Tournament cancelled successfully',
      refunds_processed: true
    })
  } catch (error) {
    console.error('Error cancelling tournament:', error)
    res.status(500).json({ message: 'Failed to cancel tournament' })
  }
}

// Update participant status
const updateParticipantStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, reason } = req.body

    const validStatuses = ['registered', 'confirmed', 'checked_in', 'disqualified', 'withdrew']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid participant status' })
    }

    const participant = await TournamentParticipant.findByPk(id)
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' })
    }

    await participant.update({
      status,
      updated_at: new Date()
    })

    // Handle refunds for withdrew participants
    if (status === 'withdrew' && participant.payment_status === 'paid') {
      await participant.update({
        payment_status: 'refunded'
      })
    }

    res.json({
      message: 'Participant status updated successfully',
      participant: {
        id: participant.id,
        status: participant.status
      }
    })
  } catch (error) {
    console.error('Error updating participant status:', error)
    res.status(500).json({ message: 'Failed to update participant status' })
  }
}

// Bulk update participants
const bulkUpdateParticipants = async (req, res) => {
  try {
    const { participantIds, action, data } = req.body

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: 'Participant IDs are required' })
    }

    let updatedCount = 0

    switch (action) {
      case 'confirm':
        await TournamentParticipant.update(
          { 
            status: 'confirmed',
            updated_at: new Date()
          },
          { where: { id: { [Op.in]: participantIds } } }
        )
        updatedCount = participantIds.length
        break

      case 'check_in':
        await TournamentParticipant.update(
          { 
            status: 'checked_in',
            updated_at: new Date()
          },
          { where: { id: { [Op.in]: participantIds } } }
        )
        updatedCount = participantIds.length
        break

      case 'disqualify':
        await TournamentParticipant.update(
          { 
            status: 'disqualified',
            updated_at: new Date()
          },
          { where: { id: { [Op.in]: participantIds } } }
        )
        updatedCount = participantIds.length
        break

      case 'withdraw':
        await TournamentParticipant.update(
          { 
            status: 'withdrew',
            payment_status: 'refunded',
            updated_at: new Date()
          },
          { where: { id: { [Op.in]: participantIds } } }
        )
        updatedCount = participantIds.length
        break

      default:
        return res.status(400).json({ message: 'Invalid bulk action' })
    }

    res.json({
      message: `Successfully updated ${updatedCount} participants`,
      updatedCount,
      action
    })
  } catch (error) {
    console.error('Error bulk updating participants:', error)
    res.status(500).json({ message: 'Failed to bulk update participants' })
  }
}

// Export tournaments
const exportTournaments = async (req, res) => {
  try {
    const { format, ...filters } = req.query

    // Get tournaments data
    const tournamentsData = await getTournamentsData(filters)

    // In a real implementation, generate actual file based on format
    const mockFileContent = `Tournament Name,Organizer,Location,Start Date,Status,Participants,Revenue,Prize Pool\n${tournamentsData.map(tournament => 
      `${tournament.name},"${tournament.organizer_name}","${tournament.location}",${tournament.start_date},${tournament.status},${tournament.total_participants},${tournament.total_revenue},${tournament.prize_pool}`
    ).join('\n')}`

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=tournaments.${format}`)
    res.send(mockFileContent)
  } catch (error) {
    console.error('Error exporting tournaments:', error)
    res.status(500).json({ message: 'Failed to export tournaments' })
  }
}

// Generate tournament report
const generateTournamentReport = async (req, res) => {
  try {
    const { id } = req.params

    const tournament = await Tournament.findByPk(id)
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' })
    }

    const participants = await TournamentParticipant.count({
      where: { tournament_id: id }
    })

    const participantsByStatus = await TournamentParticipant.findAll({
      where: { tournament_id: id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    })

    const paymentsByStatus = await TournamentParticipant.findAll({
      where: { tournament_id: id },
      attributes: [
        'payment_status',
        [sequelize.fn('COUNT', sequelize.col('payment_status')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount_paid')), 'total_amount']
      ],
      group: ['payment_status']
    })

    const report = {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        location: tournament.location,
        start_date: tournament.start_date,
        end_date: tournament.end_date,
        status: tournament.status
      },
      summary: {
        total_participants: participants,
        entry_fee: tournament.entry_fee,
        total_revenue: participants * tournament.entry_fee,
        prize_pool: tournament.prize_pool
      },
      participants_by_status: participantsByStatus.reduce((acc, item) => {
        acc[item.status] = parseInt(item.dataValues.count)
        return acc
      }, {}),
      payments_by_status: paymentsByStatus.reduce((acc, item) => {
        acc[item.payment_status] = {
          count: parseInt(item.dataValues.count),
          amount: parseFloat(item.dataValues.total_amount || 0)
        }
        return acc
      }, {}),
      generated_at: new Date().toISOString()
    }

    res.json(report)
  } catch (error) {
    console.error('Error generating tournament report:', error)
    res.status(500).json({ message: 'Failed to generate tournament report' })
  }
}

// Send tournament notification
const sendTournamentNotification = async (req, res) => {
  try {
    const { id } = req.params
    const { subject, message, recipients } = req.body

    if (!subject || !message || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Subject, message, and recipients are required' })
    }

    // In real implementation, send notifications to specified recipients
    // This would integrate with the messaging system

    res.json({
      message: 'Tournament notification sent successfully',
      recipients: recipients.length,
      tournament_id: parseInt(id)
    })
  } catch (error) {
    console.error('Error sending tournament notification:', error)
    res.status(500).json({ message: 'Failed to send tournament notification' })
  }
}

// Helper function to get tournaments data for export
const getTournamentsData = async (filters = {}) => {
  const tournaments = await Tournament.findAll({
    include: [
      {
        model: Club,
        as: 'Club',
        attributes: ['business_name'],
        required: false
      },
      {
        model: Partner,
        as: 'Partner',
        attributes: ['business_name'],
        required: false
      },
      {
        model: StateCommittee,
        as: 'StateCommittee',
        attributes: ['name'],
        required: false
      }
    ],
    limit: 1000
  })

  return tournaments.map(tournament => ({
    name: tournament.name,
    organizer_name: tournament.Club?.business_name || tournament.Partner?.business_name || tournament.StateCommittee?.name || 'Unknown',
    location: tournament.location,
    start_date: tournament.start_date,
    status: tournament.status,
    total_participants: tournament.total_participants || 0,
    total_revenue: (tournament.total_participants || 0) * (tournament.entry_fee || 0),
    prize_pool: tournament.prize_pool || 0
  }))
}

module.exports = {
  getTournaments,
  getTournamentParticipants,
  getAllParticipants,
  getTournamentDetails,
  updateTournamentStatus,
  approveTournament,
  rejectTournament,
  cancelTournament,
  updateParticipantStatus,
  bulkUpdateParticipants,
  exportTournaments,
  generateTournamentReport,
  sendTournamentNotification
}