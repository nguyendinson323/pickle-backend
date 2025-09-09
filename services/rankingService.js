const { Op, Sequelize } = require('sequelize')
const {
  Player,
  PlayerRanking,
  Tournament,
  TournamentMatch,
  TournamentRegistration,
  RankingPointsHistory,
  RankingPeriod,
  RankingCategory
} = require('../db/models')

class RankingService {
  // NRTP Points Distribution based on tournament level and finishing position
  static TOURNAMENT_MULTIPLIERS = {
    'local': 1.0,
    'regional': 1.5, 
    'state': 2.0,
    'national': 3.0,
    'pro': 4.0
  }

  static BASE_POINTS = {
    winner: 100,
    finalist: 70,
    semifinalist: 50,
    quarterfinalist: 35,
    round16: 25,
    round32: 15,
    round64: 10,
    participation: 5
  }

  /**
   * Calculate NRTP points for a tournament finish
   * @param {string} tournamentType - Type of tournament (local, regional, state, national, pro)
   * @param {number} totalParticipants - Total participants in category
   * @param {number} finishPosition - Player's finishing position (1 = winner)
   * @param {number} rankingMultiplier - Tournament-specific ranking multiplier
   * @returns {number} Points earned
   */
  static calculateTournamentPoints(tournamentType, totalParticipants, finishPosition, rankingMultiplier = 1) {
    const multiplier = this.TOURNAMENT_MULTIPLIERS[tournamentType] || 1.0
    let basePoints = this.BASE_POINTS.participation

    // Determine points based on finishing position
    if (finishPosition === 1) {
      basePoints = this.BASE_POINTS.winner
    } else if (finishPosition === 2) {
      basePoints = this.BASE_POINTS.finalist
    } else if (finishPosition <= 4) {
      basePoints = this.BASE_POINTS.semifinalist
    } else if (finishPosition <= 8) {
      basePoints = this.BASE_POINTS.quarterfinalist
    } else if (finishPosition <= 16) {
      basePoints = this.BASE_POINTS.round16
    } else if (finishPosition <= 32) {
      basePoints = this.BASE_POINTS.round32
    } else if (finishPosition <= 64) {
      basePoints = this.BASE_POINTS.round64
    }

    // Apply tournament and participation multipliers
    const participationMultiplier = Math.log10(totalParticipants) / Math.log10(8) // Scales with field size
    
    return Math.round(basePoints * multiplier * rankingMultiplier * participationMultiplier)
  }

  /**
   * Get player's tournament finish position in a category
   * @param {number} playerId - Player ID
   * @param {number} tournamentId - Tournament ID
   * @param {number} categoryId - Category ID
   * @returns {Object} Finish position and total participants
   */
  static async getPlayerTournamentFinish(playerId, tournamentId, categoryId) {
    // Find all matches for this player in the tournament category
    const playerMatches = await TournamentMatch.findAll({
      where: {
        tournament_id: tournamentId,
        category_id: categoryId,
        [Op.or]: [
          { player1_id: playerId },
          { player3_id: playerId },
          { player2_id: playerId },  // For doubles
          { player4_id: playerId }   // For doubles
        ],
        status: 'completed'
      },
      order: [['round', 'DESC']]
    })

    if (playerMatches.length === 0) {
      return { finishPosition: null, totalParticipants: 0 }
    }

    // Get total participants in category
    const totalParticipants = await TournamentRegistration.count({
      where: {
        tournament_id: tournamentId,
        category_id: categoryId,
        status: { [Op.in]: ['registered', 'confirmed'] }
      }
    })

    // Find highest round reached
    const lastMatch = playerMatches[0]
    const highestRound = lastMatch.round

    // Check if won the final
    if (highestRound === Math.ceil(Math.log2(totalParticipants))) {
      const isWinner = (lastMatch.player1_id === playerId || lastMatch.player2_id === playerId) 
        ? lastMatch.winner_side === 1 
        : lastMatch.winner_side === 2
      
      if (isWinner) {
        return { finishPosition: 1, totalParticipants }
      } else {
        return { finishPosition: 2, totalParticipants }
      }
    }

    // Calculate finish position based on round eliminated
    const finishPosition = Math.pow(2, Math.ceil(Math.log2(totalParticipants)) - highestRound + 1)
    
    return { finishPosition, totalParticipants }
  }

  /**
   * Calculate and update rankings for all players
   * @param {number|null} stateId - Optional state filter
   * @returns {Object} Calculation results
   */
  static async recalculateAllRankings(stateId = null) {
    try {
      // Get current ranking period
      let currentPeriod = await RankingPeriod.findOne({
        where: { status: 'active' }
      })

      if (!currentPeriod) {
        // Create new ranking period if none exists
        currentPeriod = await RankingPeriod.create({
          name: `${new Date().getFullYear()} Rankings`,
          start_date: new Date(`${new Date().getFullYear()}-01-01`),
          end_date: new Date(`${new Date().getFullYear()}-12-31`),
          status: 'active'
        })
      }

      // Get all players to recalculate
      const whereCondition = stateId ? { state_id: stateId } : {}
      const players = await Player.findAll({
        where: whereCondition,
        include: [
          {
            model: TournamentMatch,
            as: 'matches',
            where: {
              status: 'completed',
              match_date: {
                [Op.gte]: currentPeriod.start_date,
                [Op.lte]: currentPeriod.end_date
              }
            },
            include: [
              {
                model: Tournament,
                as: 'tournament',
                attributes: ['id', 'name', 'tournament_type', 'ranking_multiplier', 'is_ranking'],
                where: { is_ranking: true }
              }
            ],
            required: false
          }
        ]
      })

      const results = {
        playersProcessed: 0,
        rankingsUpdated: 0,
        pointsCalculated: 0,
        errors: []
      }

      for (const player of players) {
        try {
          await this.calculatePlayerRanking(player.id, currentPeriod.id)
          results.playersProcessed++
          results.rankingsUpdated++
        } catch (error) {
          results.errors.push({
            playerId: player.id,
            error: error.message
          })
        }
      }

      // Update ranking positions based on points
      await this.updateRankingPositions(stateId, currentPeriod.id)

      return results
    } catch (error) {
      throw new Error(`Failed to recalculate rankings: ${error.message}`)
    }
  }

  /**
   * Calculate ranking points for a specific player
   * @param {number} playerId - Player ID
   * @param {number} rankingPeriodId - Ranking period ID
   * @returns {Object} Calculated ranking data
   */
  static async calculatePlayerRanking(playerId, rankingPeriodId) {
    // Get all tournament results for this player in the ranking period
    const period = await RankingPeriod.findByPk(rankingPeriodId)
    
    // Find all tournaments this player participated in during the period
    const participatedTournaments = await Tournament.findAll({
      where: {
        start_date: {
          [Op.gte]: period.start_date,
          [Op.lte]: period.end_date
        },
        is_ranking: true
      },
      include: [
        {
          model: TournamentRegistration,
          as: 'registrations',
          where: { player_id: playerId },
          required: true
        }
      ]
    })

    let totalPoints = 0
    const tournamentResults = []

    for (const tournament of participatedTournaments) {
      for (const registration of tournament.registrations) {
        const finishData = await this.getPlayerTournamentFinish(
          playerId, 
          tournament.id, 
          registration.category_id
        )

        if (finishData.finishPosition) {
          const points = this.calculateTournamentPoints(
            tournament.tournament_type,
            finishData.totalParticipants,
            finishData.finishPosition,
            tournament.ranking_multiplier
          )

          totalPoints += points

          tournamentResults.push({
            tournamentId: tournament.id,
            tournamentName: tournament.name,
            categoryId: registration.category_id,
            finishPosition: finishData.finishPosition,
            totalParticipants: finishData.totalParticipants,
            points: points
          })

          // Record points history
          await RankingPointsHistory.create({
            player_id: playerId,
            tournament_id: tournament.id,
            category_id: registration.category_id,
            points_earned: points,
            finish_position: finishData.finishPosition,
            total_participants: finishData.totalParticipants,
            ranking_period_id: rankingPeriodId,
            created_at: new Date()
          })
        }
      }
    }

    // Update or create player ranking record
    const [playerRanking, created] = await PlayerRanking.findOrCreate({
      where: {
        player_id: playerId,
        ranking_period_id: rankingPeriodId
      },
      defaults: {
        total_points: totalPoints,
        tournaments_played: participatedTournaments.length,
        best_finish: tournamentResults.length > 0 ? Math.min(...tournamentResults.map(r => r.finishPosition)) : null,
        last_updated: new Date()
      }
    })

    if (!created) {
      await playerRanking.update({
        total_points: totalPoints,
        tournaments_played: participatedTournaments.length,
        best_finish: tournamentResults.length > 0 ? Math.min(...tournamentResults.map(r => r.finishPosition)) : null,
        last_updated: new Date()
      })
    }

    return {
      playerId,
      totalPoints,
      tournamentsPlayed: participatedTournaments.length,
      tournamentResults
    }
  }

  /**
   * Update ranking positions based on points
   * @param {number|null} stateId - Optional state filter
   * @param {number} rankingPeriodId - Ranking period ID
   */
  static async updateRankingPositions(stateId, rankingPeriodId) {
    const whereCondition = {
      ranking_period_id: rankingPeriodId
    }

    if (stateId) {
      whereCondition['$player.state_id$'] = stateId
    }

    const rankings = await PlayerRanking.findAll({
      where: whereCondition,
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'state_id']
        }
      ],
      order: [['total_points', 'DESC'], ['tournaments_played', 'DESC']]
    })

    // Update positions
    for (let i = 0; i < rankings.length; i++) {
      const previousPosition = rankings[i].ranking_position
      const newPosition = i + 1
      
      await rankings[i].update({
        ranking_position: newPosition,
        position_change: previousPosition ? newPosition - previousPosition : 0
      })
    }
  }

  /**
   * Trigger ranking update when match is completed
   * @param {Object} match - Completed match object
   */
  static async onMatchCompleted(match) {
    try {
      const tournament = await Tournament.findByPk(match.tournament_id)
      
      // Only process ranking tournaments
      if (!tournament.is_ranking) {
        return
      }

      // Get current active ranking period
      const currentPeriod = await RankingPeriod.findOne({
        where: { status: 'active' }
      })

      if (!currentPeriod) {
        return
      }

      // Get all players in this match
      const playerIds = [
        match.player1_id,
        match.player2_id,
        match.player3_id,
        match.player4_id
      ].filter(Boolean)

      // Recalculate rankings for affected players
      for (const playerId of playerIds) {
        await this.calculatePlayerRanking(playerId, currentPeriod.id)
      }

      // Update positions for the entire tournament's state
      if (tournament.state_id) {
        await this.updateRankingPositions(tournament.state_id, currentPeriod.id)
      }

      console.log(`Rankings updated for match ${match.id} completion`)
    } catch (error) {
      console.error('Error updating rankings after match completion:', error)
    }
  }
}

module.exports = RankingService