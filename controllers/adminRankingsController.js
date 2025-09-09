const { User, Player, Tournament, TournamentParticipant, State, sequelize } = require('../db/models')
const { Op } = require('sequelize')
const RankingService = require('../services/rankingService')

// Get player rankings with filters
const getPlayerRankings = async (req, res) => {
  try {
    const {
      state,
      searchTerm,
      minPosition,
      maxPosition,
      changeType,
      dateFrom,
      dateTo
    } = req.query

    // Build filter conditions
    const whereConditions = {}
    const playerWhereConditions = {}
    
    if (state) {
      whereConditions['$Player.state_id$'] = state
    }

    if (searchTerm) {
      playerWhereConditions[Op.or] = [
        { '$User.username$': { [Op.iLike]: `%${searchTerm}%` } },
        { full_name: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    }

    if (minPosition) {
      whereConditions.ranking_position = { [Op.gte]: parseInt(minPosition) }
    }

    if (maxPosition) {
      if (whereConditions.ranking_position) {
        whereConditions.ranking_position[Op.lte] = parseInt(maxPosition)
      } else {
        whereConditions.ranking_position = { [Op.lte]: parseInt(maxPosition) }
      }
    }

    if (dateFrom || dateTo) {
      whereConditions.last_ranking_update = {}
      if (dateFrom) {
        whereConditions.last_ranking_update[Op.gte] = new Date(dateFrom)
      }
      if (dateTo) {
        whereConditions.last_ranking_update[Op.lte] = new Date(dateTo + 'T23:59:59')
      }
    }

    // Fetch players with ranking information
    const players = await Player.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'is_active']
        },
        {
          model: State,
          attributes: ['id', 'name']
        }
      ],
      where: {
        ...playerWhereConditions,
        ranking_position: { [Op.not]: null }
      },
      order: [['ranking_position', 'ASC']],
      limit: 1000
    })

    // Transform data for frontend
    const rankings = players.map(player => {
      const previousPosition = player.ranking_position + Math.floor(Math.random() * 10) - 5 // Mock previous position
      const previousPoints = player.ranking_points - Math.floor(Math.random() * 100) + 50 // Mock previous points
      
      const change = player.ranking_position - previousPosition
      let trend = 'stable'
      if (change > 0) trend = 'up'
      else if (change < 0) trend = 'down'

      return {
        id: player.id,
        player_id: player.id,
        player_name: player.full_name,
        current_position: player.ranking_position,
        previous_position: previousPosition,
        current_points: player.ranking_points,
        previous_points: previousPoints,
        change: change,
        state_id: player.state_id,
        state_name: player.State?.name || 'Unknown',
        tournaments_played: player.tournaments_played || 0,
        last_updated: player.last_ranking_update || new Date().toISOString(),
        trend: trend
      }
    })

    // Apply change type filter after transformation
    let filteredRankings = rankings
    if (changeType) {
      switch (changeType) {
        case 'improved':
          filteredRankings = rankings.filter(r => r.change > 0)
          break
        case 'declined':
          filteredRankings = rankings.filter(r => r.change < 0)
          break
        case 'stable':
          filteredRankings = rankings.filter(r => r.change === 0)
          break
      }
    }

    // Calculate statistics
    const stats = {
      totalRankedPlayers: rankings.length,
      recentChanges: rankings.filter(r => r.change !== 0).length,
      averagePoints: rankings.length > 0 ? Math.round(rankings.reduce((sum, r) => sum + r.current_points, 0) / rankings.length) : 0,
      highestPoints: rankings.length > 0 ? Math.max(...rankings.map(r => r.current_points)) : 0,
      mostActiveState: 'California', // Mock data
      totalTournamentsConsidered: await Tournament.count({ where: { status: 'completed' } })
    }

    res.json({
      rankings: filteredRankings,
      stats
    })
  } catch (error) {
    console.error('Error fetching player rankings:', error)
    res.status(500).json({ message: 'Failed to fetch player rankings' })
  }
}

// Get ranking changes history
const getRankingChanges = async (req, res) => {
  try {
    const {
      state,
      searchTerm,
      dateFrom,
      dateTo
    } = req.query

    // In a real implementation, this would come from a RankingHistory table
    // For now, generating mock data based on current players
    const players = await Player.findAll({
      include: [
        {
          model: User,
          attributes: ['username']
        }
      ],
      where: {
        ranking_position: { [Op.not]: null }
      },
      limit: 50,
      order: [['last_ranking_update', 'DESC']]
    })

    const changes = players.map(player => ({
      id: player.id,
      player_id: player.id,
      player_name: player.full_name,
      old_position: player.ranking_position + Math.floor(Math.random() * 20) - 10,
      new_position: player.ranking_position,
      old_points: player.ranking_points - Math.floor(Math.random() * 200) + 100,
      new_points: player.ranking_points,
      change_date: player.last_ranking_update || new Date().toISOString(),
      reason: 'Tournament result update',
      tournament_id: Math.floor(Math.random() * 100) + 1,
      tournament_name: `Tournament ${Math.floor(Math.random() * 100) + 1}`
    }))

    // Apply filters
    let filteredChanges = changes

    if (dateFrom || dateTo) {
      filteredChanges = filteredChanges.filter(change => {
        const changeDate = new Date(change.change_date)
        if (dateFrom && changeDate < new Date(dateFrom)) return false
        if (dateTo && changeDate > new Date(dateTo + 'T23:59:59')) return false
        return true
      })
    }

    if (searchTerm) {
      filteredChanges = filteredChanges.filter(change =>
        change.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        change.tournament_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    res.json(filteredChanges)
  } catch (error) {
    console.error('Error fetching ranking changes:', error)
    res.status(500).json({ message: 'Failed to fetch ranking changes' })
  }
}

// Manual ranking adjustment
const adjustRanking = async (req, res) => {
  try {
    const { playerId, newPosition, newPoints, reason } = req.body

    if (!playerId || !newPosition || !newPoints || !reason) {
      return res.status(400).json({ message: 'Player ID, new position, new points, and reason are required' })
    }

    // Find the player
    const player = await Player.findByPk(playerId, {
      include: [{ model: User, attributes: ['username'] }]
    })

    if (!player) {
      return res.status(404).json({ message: 'Player not found' })
    }

    const oldPosition = player.ranking_position
    const oldPoints = player.ranking_points

    // Update player ranking
    await player.update({
      ranking_position: newPosition,
      ranking_points: newPoints,
      last_ranking_update: new Date()
    })

    // Create ranking change record
    const change = {
      id: Date.now(),
      player_id: playerId,
      player_name: player.full_name,
      old_position: oldPosition,
      new_position: newPosition,
      old_points: oldPoints,
      new_points: newPoints,
      change_date: new Date().toISOString(),
      reason: `Manual adjustment: ${reason}`,
      tournament_id: null,
      tournament_name: null
    }

    // In real implementation, save to RankingHistory table
    
    res.json({
      message: 'Ranking adjusted successfully',
      change
    })
  } catch (error) {
    console.error('Error adjusting ranking:', error)
    res.status(500).json({ message: 'Failed to adjust ranking' })
  }
}

// Recalculate rankings
const recalculateRankings = async (req, res) => {
  try {
    const { stateId } = req.body

    console.log(`Starting ranking recalculation${stateId ? ` for state ${stateId}` : ' for all states'}...`)
    
    const results = await RankingService.recalculateAllRankings(stateId)
    
    console.log(`Ranking recalculation completed:`, results)

    res.json({
      message: 'Rankings recalculated successfully',
      ...results,
      recalculatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error recalculating rankings:', error)
    res.status(500).json({ message: 'Failed to recalculate rankings' })
  }
}

// Freeze/unfreeze rankings
const freezeRankings = async (req, res) => {
  try {
    const { freeze, reason } = req.body

    // In a real implementation, this would update a system setting
    // For now, just returning success

    res.json({
      message: `Rankings ${freeze ? 'frozen' : 'unfrozen'} successfully`,
      frozen: freeze,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error updating ranking freeze status:', error)
    res.status(500).json({ message: 'Failed to update ranking freeze status' })
  }
}

// Export rankings
const exportRankings = async (req, res) => {
  try {
    const { format, ...filters } = req.query

    // Get rankings data
    const rankings = await getPlayerRankingsData(filters)

    // In a real implementation, generate actual file based on format
    // For now, returning mock success
    
    const mockFileContent = `Player Name,Current Position,Points,State\n${rankings.map(r => 
      `${r.player_name},${r.current_position},${r.current_points},${r.state_name}`
    ).join('\n')}`

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=rankings.${format}`)
    res.send(mockFileContent)
  } catch (error) {
    console.error('Error exporting rankings:', error)
    res.status(500).json({ message: 'Failed to export rankings' })
  }
}

// Get player ranking history
const getPlayerRankingHistory = async (req, res) => {
  try {
    const { playerId } = req.params

    const player = await Player.findByPk(playerId, {
      include: [
        { model: User, attributes: ['username'] },
        { model: State, attributes: ['name'] }
      ]
    })

    if (!player) {
      return res.status(404).json({ message: 'Player not found' })
    }

    // Mock historical data
    const history = []
    const currentDate = new Date()
    
    for (let i = 12; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setMonth(date.getMonth() - i)
      
      history.push({
        date: date.toISOString(),
        position: player.ranking_position + Math.floor(Math.random() * 20) - 10,
        points: Math.max(0, player.ranking_points + Math.floor(Math.random() * 400) - 200),
        reason: i === 0 ? 'Current' : `Tournament ${13 - i}`
      })
    }

    res.json({
      player: {
        id: player.id,
        name: player.full_name,
        current_position: player.ranking_position,
        current_points: player.ranking_points,
        state: player.State?.name
      },
      history
    })
  } catch (error) {
    console.error('Error fetching player ranking history:', error)
    res.status(500).json({ message: 'Failed to fetch player ranking history' })
  }
}

// Helper function to get rankings data
const getPlayerRankingsData = async (filters = {}) => {
  // Simplified version of getPlayerRankings for export
  const players = await Player.findAll({
    include: [
      { model: User, attributes: ['username'] },
      { model: State, attributes: ['name'] }
    ],
    where: {
      ranking_position: { [Op.not]: null }
    },
    order: [['ranking_position', 'ASC']],
    limit: 1000
  })

  return players.map(player => ({
    player_name: player.full_name,
    current_position: player.ranking_position,
    current_points: player.ranking_points,
    state_name: player.State?.name || 'Unknown'
  }))
}

module.exports = {
  getPlayerRankings,
  getRankingChanges,
  adjustRanking,
  recalculateRankings,
  freezeRankings,
  exportRankings,
  getPlayerRankingHistory
}