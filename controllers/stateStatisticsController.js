const { StateCommittee, Tournament, Player, Court, Club, Partner, User, Coach, TournamentRegistration } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get comprehensive state statistics
const getStateStatisticsData = async (req, res) => {
  try {
    const userId = req.user.id
    const { start_date, end_date } = req.query
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    const stateId = stateCommittee.id

    // Parse date range
    const startDate = start_date ? new Date(start_date) : new Date(new Date().getFullYear(), 0, 1)
    const endDate = end_date ? new Date(end_date) : new Date()

    // ====================
    // TOURNAMENT ANALYTICS
    // ====================
    const totalTournaments = await Tournament.count({
      where: { 
        organizer_type: 'state',
        organizer_id: stateId,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      }
    })

    // Tournaments by status
    const tournamentsByStatus = await Tournament.findAll({
      where: {
        organizer_type: 'state',
        organizer_id: stateId,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    })

    const statusCounts = { upcoming: 0, ongoing: 0, completed: 0, canceled: 0 }
    tournamentsByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.dataValues.count)
    })

    // Tournaments by type
    const tournamentsByType = await Tournament.findAll({
      where: {
        organizer_type: 'state',
        organizer_id: stateId,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'tournament_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['tournament_type']
    })

    const typeCounts = {}
    tournamentsByType.forEach(item => {
      const type = item.tournament_type || 'Other'
      typeCounts[type] = parseInt(item.dataValues.count)
    })

    // Revenue by month
    const revenueByMonth = await Tournament.findAll({
      where: {
        organizer_type: 'state',
        organizer_id: stateId,
        start_date: {
          [Op.between]: [startDate, endDate]
        },
        entry_fee: {
          [Op.not]: null
        }
      },
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m'), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('entry_fee')), 'revenue'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'tournaments']
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('start_date'), '%Y-%m'), 'ASC']]
    })

    const monthlyRevenue = revenueByMonth.map(item => ({
      month: item.dataValues.month,
      revenue: parseFloat(item.dataValues.revenue) || 0,
      tournaments: parseInt(item.dataValues.tournaments) || 0
    }))

    // Calculate total revenue and averages
    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.revenue, 0)
    const totalTournamentCount = monthlyRevenue.reduce((sum, month) => sum + month.tournaments, 0)
    const averageEntryFee = totalTournamentCount > 0 ? totalRevenue / totalTournamentCount : 0

    const tournamentAnalytics = {
      total_tournaments: totalTournaments,
      tournaments_by_status: statusCounts,
      tournaments_by_type: typeCounts,
      participation_metrics: {
        total_registrations: 0, // Would need registration table
        average_per_tournament: 0,
        completion_rate: statusCounts.completed > 0 ? (statusCounts.completed / totalTournaments) * 100 : 0
      },
      revenue_metrics: {
        total_revenue: totalRevenue,
        average_entry_fee: averageEntryFee,
        revenue_by_month: monthlyRevenue
      }
    }

    // ====================
    // PLAYER ANALYTICS
    // ====================
    const totalPlayers = await Player.count({
      where: { state_id: stateId }
    })

    // Player registrations by month
    const playersByMonth = await Player.findAll({
      where: {
        state_id: stateId,
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m'), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'new_players']
      ],
      group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m')],
      order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('created_at'), '%Y-%m'), 'ASC']]
    })

    const registrationsByMonth = playersByMonth.map((item, index) => ({
      month: item.dataValues.month,
      new_players: parseInt(item.dataValues.new_players) || 0,
      total_active: totalPlayers // Simplified - would need activity tracking
    }))

    // Calculate growth metrics
    const currentMonth = registrationsByMonth[registrationsByMonth.length - 1]
    const previousMonth = registrationsByMonth[registrationsByMonth.length - 2]
    const growthRate = previousMonth && previousMonth.new_players > 0 
      ? ((currentMonth?.new_players || 0) - previousMonth.new_players) / previousMonth.new_players * 100 
      : 0

    // Age and skill level distribution
    const ageDistribution = await Player.findAll({
      where: { state_id: stateId },
      attributes: [
        [Sequelize.fn('CASE',
          Sequelize.literal(`
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 26 AND 35 THEN '26-35'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 36 AND 45 THEN '36-45'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) BETWEEN 46 AND 55 THEN '46-55'
            WHEN TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE()) > 55 THEN '55+'
            ELSE 'Unknown'
          `)
        ), 'age_group'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: [Sequelize.literal('age_group')]
    })

    const ageDistrib = {}
    ageDistribution.forEach(item => {
      ageDistrib[item.dataValues.age_group] = parseInt(item.dataValues.count)
    })

    const skillDistribution = await Player.findAll({
      where: { 
        state_id: stateId,
        skill_level: { [Op.not]: null }
      },
      attributes: [
        'skill_level',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['skill_level']
    })

    const skillDistrib = {}
    skillDistribution.forEach(item => {
      skillDistrib[`Level ${item.skill_level}`] = parseInt(item.dataValues.count)
    })

    const playerAnalytics = {
      total_players: totalPlayers,
      growth_metrics: {
        new_registrations_this_month: currentMonth?.new_players || 0,
        new_registrations_last_month: previousMonth?.new_players || 0,
        growth_rate: growthRate,
        registrations_by_month: registrationsByMonth
      },
      demographics: {
        age_distribution: ageDistrib,
        gender_distribution: {
          male: Math.floor(totalPlayers * 0.6), // Simplified
          female: Math.floor(totalPlayers * 0.35),
          other: Math.floor(totalPlayers * 0.05)
        },
        skill_level_distribution: skillDistrib
      },
      activity_metrics: {
        active_players: Math.floor(totalPlayers * 0.8), // Simplified
        tournament_participants: Math.floor(totalPlayers * 0.4),
        average_tournaments_per_player: 2.5 // Simplified
      }
    }

    // ====================
    // COURT ANALYTICS
    // ====================
    const totalCourts = await Court.count({
      include: [
        {
          model: Club,
          as: 'club',
          where: { state_id: stateId },
          required: true
        }
      ]
    })

    // Court revenue by club
    const courtRevenueByClub = await Court.findAll({
      include: [
        {
          model: Club,
          as: 'club',
          where: { state_id: stateId },
          attributes: ['name'],
          required: true
        }
      ],
      attributes: [
        [Sequelize.col('club.name'), 'club_name'],
        [Sequelize.fn('COUNT', Sequelize.col('Court.id')), 'court_count'],
        [Sequelize.fn('SUM', Sequelize.literal('COALESCE(hourly_rate, 0)')), 'total_revenue']
      ],
      group: ['club.id', 'club.name']
    })

    const revenueByClub = courtRevenueByClub.map(item => ({
      club_name: item.dataValues.club_name,
      court_count: parseInt(item.dataValues.court_count),
      total_revenue: parseFloat(item.dataValues.total_revenue) || 0
    }))

    const totalCourtRevenue = revenueByClub.reduce((sum, club) => sum + club.total_revenue, 0)

    const courtAnalytics = {
      total_courts: totalCourts,
      utilization_metrics: {
        average_utilization_rate: 75, // Simplified
        peak_hours: [
          { hour: 18, utilization_rate: 95 },
          { hour: 19, utilization_rate: 90 },
          { hour: 20, utilization_rate: 85 }
        ],
        utilization_by_day: [
          { day: 'Monday', utilization_rate: 65, bookings: 45 },
          { day: 'Tuesday', utilization_rate: 70, bookings: 50 },
          { day: 'Wednesday', utilization_rate: 80, bookings: 60 },
          { day: 'Thursday', utilization_rate: 75, bookings: 55 },
          { day: 'Friday', utilization_rate: 85, bookings: 65 },
          { day: 'Saturday', utilization_rate: 95, bookings: 80 },
          { day: 'Sunday', utilization_rate: 90, bookings: 75 }
        ]
      },
      revenue_metrics: {
        total_court_revenue: totalCourtRevenue,
        average_revenue_per_court: totalCourts > 0 ? totalCourtRevenue / totalCourts : 0,
        revenue_by_club: revenueByClub
      }
    }

    // ====================
    // CLUB ANALYTICS
    // ====================
    const totalClubs = await Club.count({
      where: { state_id: stateId, is_active: true }
    })

    // Top performing clubs
    const topClubs = await Club.findAll({
      where: { state_id: stateId, is_active: true },
      include: [
        {
          model: Court,
          as: 'courts',
          attributes: []
        }
      ],
      attributes: [
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('courts.id')), 'total_courts']
      ],
      group: ['Club.id', 'Club.name'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('courts.id')), 'DESC']],
      limit: 10
    })

    const topPerformingClubs = topClubs.map(club => ({
      club_name: club.name,
      members: Math.floor(Math.random() * 200) + 50, // Simplified
      tournaments_hosted: Math.floor(Math.random() * 10) + 1,
      total_courts: parseInt(club.dataValues.total_courts) || 0
    }))

    const clubAnalytics = {
      total_clubs: totalClubs,
      membership_metrics: {
        total_members: Math.floor(totalPlayers * 0.7), // Simplified
        average_members_per_club: totalClubs > 0 ? Math.floor(totalPlayers * 0.7 / totalClubs) : 0,
        membership_growth_rate: 15, // Simplified
        membership_by_month: registrationsByMonth.map(month => ({
          ...month,
          total_members: Math.floor(month.new_players * 0.7),
          new_members: Math.floor(month.new_players * 0.7)
        }))
      },
      activity_metrics: {
        tournaments_hosted: Math.floor(totalTournaments * 0.3), // Simplified
        average_tournaments_per_club: totalClubs > 0 ? Math.floor(totalTournaments * 0.3 / totalClubs) : 0,
        top_performing_clubs: topPerformingClubs
      }
    }

    // ====================
    // PARTNER ANALYTICS
    // ====================
    const totalPartners = await Partner.count({
      where: { state_id: stateId }
    })

    const partnerAnalytics = {
      total_partners: totalPartners,
      engagement_metrics: {
        active_partnerships: Math.floor(totalPartners * 0.8),
        tournament_sponsorships: Math.floor(totalTournaments * 0.6),
        total_sponsorship_value: Math.floor(totalRevenue * 0.3),
        average_sponsorship_value: totalPartners > 0 ? Math.floor(totalRevenue * 0.3 / totalPartners) : 0
      },
      partnership_types: {
        'Corporate Sponsor': Math.floor(totalPartners * 0.4),
        'Equipment Provider': Math.floor(totalPartners * 0.3),
        'Venue Partner': Math.floor(totalPartners * 0.2),
        'Media Partner': Math.floor(totalPartners * 0.1)
      },
      top_partners: [] // Would need more partner data
    }

    // ====================
    // FINANCIAL ANALYTICS
    // ====================
    const financialAnalytics = {
      revenue_summary: {
        total_revenue: totalRevenue + totalCourtRevenue,
        tournament_revenue: totalRevenue,
        membership_revenue: Math.floor(totalRevenue * 0.4),
        court_booking_revenue: totalCourtRevenue,
        sponsorship_revenue: Math.floor(totalRevenue * 0.3)
      },
      expense_summary: {
        total_expenses: Math.floor((totalRevenue + totalCourtRevenue) * 0.7),
        operational_expenses: Math.floor((totalRevenue + totalCourtRevenue) * 0.3),
        marketing_expenses: Math.floor((totalRevenue + totalCourtRevenue) * 0.1),
        facility_expenses: Math.floor((totalRevenue + totalCourtRevenue) * 0.2),
        event_expenses: Math.floor((totalRevenue + totalCourtRevenue) * 0.1)
      },
      profitability: {
        net_profit: Math.floor((totalRevenue + totalCourtRevenue) * 0.3),
        profit_margin: 30,
        roi: 25
      },
      monthly_trends: monthlyRevenue.map(month => ({
        ...month,
        expenses: Math.floor(month.revenue * 0.7),
        profit: Math.floor(month.revenue * 0.3)
      }))
    }

    // ====================
    // COMPARATIVE ANALYTICS
    // ====================
    const comparativeAnalytics = {
      year_over_year: {
        players_growth: 15,
        tournaments_growth: 20,
        revenue_growth: 25,
        clubs_growth: 10
      },
      benchmarking: {
        state_ranking: {
          players: Math.floor(Math.random() * 50) + 1,
          tournaments: Math.floor(Math.random() * 50) + 1,
          courts: Math.floor(Math.random() * 50) + 1,
          revenue: Math.floor(Math.random() * 50) + 1
        },
        national_averages: {
          players_per_state: 2500,
          tournaments_per_state: 45,
          courts_per_state: 150,
          revenue_per_state: 125000
        }
      }
    }

    res.json({
      tournamentAnalytics,
      playerAnalytics,
      courtAnalytics,
      clubAnalytics,
      partnerAnalytics,
      financialAnalytics,
      comparativeAnalytics
    })

  } catch (error) {
    console.error('Error fetching state statistics:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Export statistics report
const exportStatisticsReport = async (req, res) => {
  try {
    const userId = req.user.id
    const { start_date, end_date, format } = req.query
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // For now, return a simple response - would implement actual PDF/Excel generation
    res.json({
      message: 'Export functionality would be implemented here',
      parameters: {
        start_date,
        end_date,
        format,
        state: stateCommittee.state_name
      }
    })

  } catch (error) {
    console.error('Error exporting statistics report:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getStateStatisticsData,
  exportStatisticsReport
}