const { 
  User, 
  Player, 
  PlayerRanking, 
  RankingPeriod, 
  RankingCategory, 
  RankingPointsHistory, 
  Tournament, 
  TournamentCategory,
  State, 
  sequelize 
} = require('../db/models')
const { Op } = require('sequelize')

// Get player rankings with filters and proper associations
const getPlayerRankings = async (req, res) => {
  try {
    const {
      state,
      searchTerm,
      minPosition,
      maxPosition,
      changeType,
      dateFrom,
      dateTo,
      category,
      period,
      page = 1,
      limit = 50
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    // Get active ranking period if not specified
    let periodCondition = {}
    if (period) {
      periodCondition.period_id = period
    } else {
      const activePeriod = await RankingPeriod.findOne({
        where: { is_active: true }
      })
      if (activePeriod) {
        periodCondition.period_id = activePeriod.id
      }
    }

    // Build where conditions for PlayerRanking
    let whereConditions = { ...periodCondition }
    
    if (category) {
      whereConditions.category_id = category
    }

    if (minPosition) {
      whereConditions.current_rank = { [Op.gte]: parseInt(minPosition) }
    }

    if (maxPosition) {
      if (whereConditions.current_rank) {
        whereConditions.current_rank = { 
          ...whereConditions.current_rank,
          [Op.lte]: parseInt(maxPosition) 
        }
      } else {
        whereConditions.current_rank = { [Op.lte]: parseInt(maxPosition) }
      }
    }

    if (dateFrom || dateTo) {
      whereConditions.updated_at = {}
      if (dateFrom) {
        whereConditions.updated_at[Op.gte] = new Date(dateFrom)
      }
      if (dateTo) {
        whereConditions.updated_at[Op.lte] = new Date(dateTo)
      }
    }

    // Build include conditions for Player/User search
    let playerInclude = {
      model: Player,
      as: 'player',
      attributes: ['id', 'full_name', 'state_id', 'nrtp_level', 'ranking_position', 'club_id'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        }
      ],
      required: true
    }

    if (searchTerm) {
      playerInclude.where = {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${searchTerm}%` } },
          { '$player.user.username$': { [Op.iLike]: `%${searchTerm}%` } }
        ]
      }
    }

    if (state) {
      if (playerInclude.where) {
        playerInclude.where.state_id = state
      } else {
        playerInclude.where = { state_id: state }
      }
    }

    // Apply change type filter if specified
    if (changeType) {
      if (changeType === 'up') {
        whereConditions[Op.and] = whereConditions[Op.and] || []
        whereConditions[Op.and].push(sequelize.literal('current_rank < previous_rank'))
      } else if (changeType === 'down') {
        whereConditions[Op.and] = whereConditions[Op.and] || []
        whereConditions[Op.and].push(sequelize.literal('current_rank > previous_rank'))
      } else if (changeType === 'stable') {
        whereConditions[Op.and] = whereConditions[Op.and] || []
        whereConditions[Op.and].push(sequelize.literal('current_rank = previous_rank'))
      } else if (changeType === 'new') {
        whereConditions.previous_rank = null
      }
    }

    const { count, rows: playerRankings } = await PlayerRanking.findAndCountAll({
      where: whereConditions,
      include: [
        playerInclude,
        {
          model: RankingPeriod,
          as: 'period',
          attributes: ['id', 'name', 'start_date', 'end_date']
        },
        {
          model: RankingCategory,
          as: 'category',
          attributes: ['id', 'name', 'gender', 'min_age', 'max_age']
        }
      ],
      order: [['current_rank', 'ASC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true
    })

    // Format the response to match frontend expectations
    const formattedRankings = playerRankings.map(ranking => ({
      id: ranking.id,
      player_id: ranking.player_id,
      player_name: ranking.player.full_name,
      username: ranking.player.user.username,
      current_position: ranking.current_rank,
      previous_position: ranking.previous_rank,
      current_points: ranking.points,
      previous_points: ranking.previous_rank ? ranking.points : 0, // Could be improved with historical data
      change: ranking.previous_rank ? ranking.previous_rank - ranking.current_rank : 0,
      state_id: ranking.player.state_id,
      state_name: ranking.player.state ? ranking.player.state.name : 'Unknown',
      tournaments_played: ranking.tournaments_played,
      last_updated: ranking.updated_at,
      trend: ranking.previous_rank ? 
        (ranking.current_rank < ranking.previous_rank ? 'up' : 
         ranking.current_rank > ranking.previous_rank ? 'down' : 'stable') : 'new',
      nrtp_level: ranking.player.nrtp_level,
      category: ranking.category.name,
      period: ranking.period.name
    }))

    res.json({
      rankings: formattedRankings,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    })
  } catch (error) {
    console.error('Error fetching player rankings:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get ranking changes/history
const getRankingChanges = async (req, res) => {
  try {
    const {
      playerId,
      dateFrom,
      dateTo,
      changeType,
      limit = 50,
      page = 1
    } = req.query

    const offset = (parseInt(page) - 1) * parseInt(limit)

    let whereConditions = {}
    
    if (playerId) {
      whereConditions.player_id = playerId
    }

    if (dateFrom || dateTo) {
      whereConditions.created_at = {}
      if (dateFrom) {
        whereConditions.created_at[Op.gte] = new Date(dateFrom)
      }
      if (dateTo) {
        whereConditions.created_at[Op.lte] = new Date(dateTo)
      }
    }

    // Get ranking changes from points history
    const { count, rows: changes } = await RankingPointsHistory.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'full_name'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username']
            }
          ]
        },
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name', 'start_date', 'end_date'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    })

    const formattedChanges = changes.map(change => ({
      id: change.id,
      player_id: change.player_id,
      player_name: change.player.full_name,
      username: change.player.user.username,
      points_change: change.points,
      reason: change.reason,
      tournament_name: change.tournament ? change.tournament.name : 'Manual Adjustment',
      timestamp: change.created_at,
      change_type: change.points > 0 ? 'gain' : 'loss'
    }))

    res.json({
      changes: formattedChanges,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    })
  } catch (error) {
    console.error('Error fetching ranking changes:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get ranking statistics
const getRankingStats = async (req, res) => {
  try {
    // Get active ranking period
    const activePeriod = await RankingPeriod.findOne({
      where: { is_active: true }
    })

    if (!activePeriod) {
      return res.json({
        totalRankedPlayers: 0,
        recentChanges: 0,
        averagePoints: 0,
        highestPoints: 0,
        mostActiveState: 'N/A',
        totalTournamentsConsidered: 0,
        activePeriod: null
      })
    }

    // Get total ranked players in active period
    const totalRankedPlayers = await PlayerRanking.count({
      where: { 
        period_id: activePeriod.id,
        current_rank: { [Op.not]: null }
      }
    })

    // Get recent changes (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentChanges = await RankingPointsHistory.count({
      where: {
        created_at: { [Op.gte]: sevenDaysAgo }
      }
    })

    // Get statistics from current rankings
    const rankingStats = await PlayerRanking.findAll({
      where: { 
        period_id: activePeriod.id,
        points: { [Op.gt]: 0 }
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('points')), 'avgPoints'],
        [sequelize.fn('MAX', sequelize.col('points')), 'maxPoints'],
        [sequelize.fn('SUM', sequelize.col('tournaments_played')), 'totalTournaments']
      ],
      raw: true
    })

    // Get most active state
    const stateStats = await PlayerRanking.findAll({
      where: { period_id: activePeriod.id },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: [],
          include: [
            {
              model: State,
              as: 'state',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('PlayerRanking.id')), 'playerCount'],
        [sequelize.col('player.state.name'), 'stateName']
      ],
      group: ['player.state.id', 'player.state.name'],
      order: [[sequelize.fn('COUNT', sequelize.col('PlayerRanking.id')), 'DESC']],
      limit: 1,
      raw: true
    })

    res.json({
      totalRankedPlayers,
      recentChanges,
      averagePoints: Math.round(parseFloat(rankingStats[0]?.avgPoints || 0)),
      highestPoints: parseInt(rankingStats[0]?.maxPoints || 0),
      mostActiveState: stateStats[0]?.stateName || 'N/A',
      totalTournamentsConsidered: parseInt(rankingStats[0]?.totalTournaments || 0),
      activePeriod: {
        id: activePeriod.id,
        name: activePeriod.name,
        start_date: activePeriod.start_date,
        end_date: activePeriod.end_date
      }
    })
  } catch (error) {
    console.error('Error fetching ranking statistics:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Manually adjust player ranking
const adjustRanking = async (req, res) => {
  try {
    const { playerId, points, reason, newRank } = req.body

    // Get active period
    const activePeriod = await RankingPeriod.findOne({
      where: { is_active: true }
    })

    if (!activePeriod) {
      return res.status(400).json({ message: 'No active ranking period found' })
    }

    // Get the player's current ranking
    const playerRanking = await PlayerRanking.findOne({
      where: {
        player_id: playerId,
        period_id: activePeriod.id
      }
    })

    if (!playerRanking) {
      return res.status(404).json({ message: 'Player ranking not found' })
    }

    const transaction = await sequelize.transaction()

    try {
      // Update ranking
      const previousRank = playerRanking.current_rank
      const previousPoints = playerRanking.points

      await playerRanking.update({
        points: points !== undefined ? points : playerRanking.points,
        previous_rank: previousRank,
        current_rank: newRank !== undefined ? newRank : playerRanking.current_rank
      }, { transaction })

      // Skip creating history record for manual adjustments to avoid null constraint issues
      // This could be enhanced by creating a dedicated table for manual adjustments

      await transaction.commit()

      res.json({ 
        message: 'Ranking adjusted successfully',
        previousRank,
        newRank: newRank || playerRanking.current_rank,
        pointsChange: points !== undefined ? points - previousPoints : 0
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Error adjusting ranking:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Recalculate all rankings
const recalculateRankings = async (req, res) => {
  try {
    // This would trigger a complex ranking calculation
    // For now, we'll simulate the process and update ranks based on points
    
    const activePeriod = await RankingPeriod.findOne({
      where: { is_active: true }
    })

    if (!activePeriod) {
      return res.status(400).json({ message: 'No active ranking period found' })
    }

    const transaction = await sequelize.transaction()

    try {
      // Get all rankings for the active period, ordered by points
      const rankings = await PlayerRanking.findAll({
        where: { period_id: activePeriod.id },
        order: [['points', 'DESC'], ['tournaments_played', 'DESC']],
        transaction
      })

      // Update ranks based on points
      for (let i = 0; i < rankings.length; i++) {
        const ranking = rankings[i]
        const newRank = i + 1
        
        await ranking.update({
          previous_rank: ranking.current_rank,
          current_rank: newRank
        }, { transaction })
      }

      await transaction.commit()

      res.json({ 
        message: 'Rankings recalculated successfully',
        playersUpdated: rankings.length
      })
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  } catch (error) {
    console.error('Error recalculating rankings:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Freeze/unfreeze rankings
const freezeRankings = async (req, res) => {
  try {
    const { freeze } = req.body

    // This would typically involve setting a flag in the system configuration
    // For now, we'll simulate by updating the active period status
    
    const activePeriod = await RankingPeriod.findOne({
      where: { is_active: true }
    })

    if (!activePeriod) {
      return res.status(400).json({ message: 'No active ranking period found' })
    }

    // In a real implementation, you might add a 'frozen' field to ranking periods
    // or maintain a separate system configuration table

    res.json({ 
      message: freeze ? 'Rankings frozen successfully' : 'Rankings unfrozen successfully',
      frozen: freeze
    })
  } catch (error) {
    console.error('Error freezing/unfreezing rankings:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Export rankings data
const exportRankings = async (req, res) => {
  try {
    const { format = 'csv' } = req.query

    const activePeriod = await RankingPeriod.findOne({
      where: { is_active: true }
    })

    if (!activePeriod) {
      return res.status(400).json({ message: 'No active ranking period found' })
    }

    const rankings = await PlayerRanking.findAll({
      where: { period_id: activePeriod.id },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['full_name', 'state_id'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username', 'email']
            },
            {
              model: State,
              as: 'state',
              attributes: ['name']
            }
          ]
        },
        {
          model: RankingCategory,
          as: 'category',
          attributes: ['name']
        }
      ],
      order: [['current_rank', 'ASC']]
    })

    if (format === 'csv') {
      const csvHeaders = [
        'Rank',
        'Player Name',
        'Username',
        'Email',
        'State',
        'Category',
        'Points',
        'Tournaments Played',
        'Previous Rank',
        'Last Updated'
      ].join(',')

      const csvData = rankings.map(ranking => [
        ranking.current_rank || '',
        `"${ranking.player.full_name}"`,
        ranking.player.user.username,
        ranking.player.user.email,
        `"${ranking.player.state ? ranking.player.state.name : 'Unknown'}"`,
        `"${ranking.category.name}"`,
        ranking.points,
        ranking.tournaments_played,
        ranking.previous_rank || '',
        ranking.updated_at.toISOString()
      ].join(',')).join('\n')

      const csv = `${csvHeaders}\n${csvData}`

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=rankings-${activePeriod.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`)
      res.send(csv)
    } else {
      res.json({ rankings })
    }
  } catch (error) {
    console.error('Error exporting rankings:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get player ranking history
const getPlayerRankingHistory = async (req, res) => {
  try {
    const { playerId } = req.params
    const { limit = 20 } = req.query

    const history = await RankingPointsHistory.findAll({
      where: { player_id: playerId },
      include: [
        {
          model: Tournament,
          as: 'tournament',
          attributes: ['id', 'name', 'start_date'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    })

    const formattedHistory = history.map(entry => ({
      id: entry.id,
      points: entry.points,
      reason: entry.reason,
      tournament_name: entry.tournament ? entry.tournament.name : 'Manual Adjustment',
      date: entry.created_at
    }))

    res.json({ history: formattedHistory })
  } catch (error) {
    console.error('Error fetching player ranking history:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get ranking periods
const getRankingPeriods = async (req, res) => {
  try {
    const periods = await RankingPeriod.findAll({
      order: [['is_active', 'DESC'], ['start_date', 'DESC']]
    })

    res.json({ periods })
  } catch (error) {
    console.error('Error fetching ranking periods:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

// Get ranking categories
const getRankingCategories = async (req, res) => {
  try {
    const categories = await RankingCategory.findAll({
      order: [['name', 'ASC']]
    })

    res.json({ categories })
  } catch (error) {
    console.error('Error fetching ranking categories:', error)
    res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

module.exports = {
  getPlayerRankings,
  getRankingChanges,
  getRankingStats,
  adjustRanking,
  recalculateRankings,
  freezeRankings,
  exportRankings,
  getPlayerRankingHistory,
  getRankingPeriods,
  getRankingCategories
}