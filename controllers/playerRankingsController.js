const { Player, PlayerRanking, TournamentMatch, Tournament, Club, State, RankingPeriod, RankingCategory, RankingPointsHistory } = require('../db/models');
const { Op, Sequelize } = require('sequelize');

const playerRankingsController = {
  // Get player's comprehensive statistics
  async getPlayerStats(req, res) {
    try {
      const userId = req.userId;
      const player = await Player.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;
      const { timeframe = '30d' } = req.query;

      // Calculate date range based on timeframe
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3m':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '6m':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date('2020-01-01');
      }

      // Get actual match results for this player in the timeframe
      const playerMatches = await TournamentMatch.findAll({
        where: {
          [Op.or]: [
            { player1_id: playerId },
            { player3_id: playerId }
          ],
          status: 'completed',
          match_date: {
            [Op.gte]: startDate
          }
        },
        include: [
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['name', 'tournament_type']
          }
        ],
        order: [['match_date', 'DESC']]
      });

      // Calculate comprehensive stats from actual data
      let wins = 0;
      let losses = 0;
      let currentStreakType = null;
      let currentStreakCount = 0;
      let longestWinStreak = 0;
      let longestLossStreak = 0;
      let tempWinStreak = 0;
      let tempLossStreak = 0;
      let totalTournaments = new Set();
      let tournamentWins = 0;

      playerMatches.forEach((match, index) => {
        const isPlayerOnSide1 = match.player1_id === playerId;
        const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
        
        if (didWin) {
          wins++;
          tempWinStreak++;
          tempLossStreak = 0;
          if (tempWinStreak > longestWinStreak) longestWinStreak = tempWinStreak;
          if (index === 0) {
            currentStreakType = 'win';
            currentStreakCount = 1;
          } else if (currentStreakType === 'win') {
            currentStreakCount++;
          }
        } else {
          losses++;
          tempLossStreak++;
          tempWinStreak = 0;
          if (tempLossStreak > longestLossStreak) longestLossStreak = tempLossStreak;
          if (index === 0) {
            currentStreakType = 'loss';
            currentStreakCount = 1;
          } else if (currentStreakType === 'loss') {
            currentStreakCount++;
          }
        }
        
        if (match.tournament) {
          totalTournaments.add(match.tournament.id);
        }
      });

      const totalMatches = playerMatches.length;
      const winPercentage = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;
      
      // Calculate total points scored and average
      let pointsScored = 0;
      let pointsAgainst = 0;
      
      playerMatches.forEach(match => {
        // Simple point calculation from score (would need more detailed scoring data)
        if (match.score) {
          const scoreMatch = match.score.match(/(\d+)-(\d+)/);
          if (scoreMatch) {
            const isPlayerOnSide1 = match.player1_id === playerId;
            const playerScore = isPlayerOnSide1 ? parseInt(scoreMatch[1]) : parseInt(scoreMatch[2]);
            const opponentScore = isPlayerOnSide1 ? parseInt(scoreMatch[2]) : parseInt(scoreMatch[1]);
            pointsScored += playerScore;
            pointsAgainst += opponentScore;
          }
        }
      });
      
      const averagePointsPerMatch = totalMatches > 0 ? pointsScored / totalMatches : 0;
      const pointDifferential = pointsScored - pointsAgainst;

      const stats = {
        player_id: playerId,
        total_matches: totalMatches,
        wins,
        losses,
        win_percentage: Math.round(winPercentage * 10) / 10,
        current_streak: currentStreakType === 'win' ? currentStreakCount : -currentStreakCount,
        longest_win_streak: longestWinStreak,
        longest_loss_streak: longestLossStreak,
        total_tournaments: totalTournaments.size,
        tournament_wins: tournamentWins,
        finals_appearances: 0, // Would need tournament results data
        semifinal_appearances: 0, // Would need tournament results data
        points_scored: pointsScored,
        points_against: pointsAgainst,
        point_differential: pointDifferential,
        average_points_per_match: Math.round(averagePointsPerMatch * 10) / 10,
        games_won: 0, // Would need detailed match data
        games_lost: 0, // Would need detailed match data
        sets_won: 0, // Would need detailed match data
        sets_lost: 0, // Would need detailed match data
        aces: 0, // Would need detailed match statistics
        double_faults: 0, // Would need detailed match statistics
        unforced_errors: 0, // Would need detailed match statistics
        winners: 0, // Would need detailed match statistics
        break_points_won: 0, // Would need detailed match statistics
        break_points_faced: 0, // Would need detailed match statistics
        service_points_won: 0, // Would need detailed match statistics
        service_points_played: 0, // Would need detailed match statistics
        return_points_won: 0, // Would need detailed match statistics
        return_points_played: 0, // Would need detailed match statistics
        net_points_won: 0, // Would need detailed match statistics
        net_points_played: 0, // Would need detailed match statistics
        updated_at: new Date().toISOString()
      };

      res.json(stats);
    } catch (error) {
      console.error('Get player stats error:', error);
      res.status(500).json({ error: 'Failed to get player statistics' });
    }
  },

  // Get player's current rankings across different categories
  async getPlayerRankings(req, res) {
    try {
      const userId = req.userId;
      const player = await Player.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;

      // Get player info for rankings - refresh with associations
      const playerWithAssociations = await Player.findByPk(playerId, {
        include: [
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ]
      });

      if (!playerWithAssociations) {
        return res.status(404).json({ error: 'Player not found' });
      }

      // Get current active ranking period
      const activePeriod = await RankingPeriod.findOne({
        where: { is_active: true },
        order: [['start_date', 'DESC']]
      });

      if (!activePeriod) {
        return res.json([]);
      }

      // Get player's current rankings across different categories
      const playerRankings = await PlayerRanking.findAll({
        where: {
          player_id: playerId,
          period_id: activePeriod.id
        },
        include: [
          {
            model: RankingCategory,
            as: 'category',
            attributes: ['name', 'gender', 'min_age', 'max_age']
          }
        ],
        order: [['points', 'DESC']]
      });

      // Get recent performance data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentMatches = await TournamentMatch.findAll({
        where: {
          [Op.or]: [
            { player1_id: playerId },
            { player3_id: playerId }
          ],
          status: 'completed',
          match_date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        include: [
          {
            model: Tournament,
            as: 'tournament'
          }
        ]
      });

      // Calculate recent performance
      let recentWins = 0;
      let recentTournaments = new Set();
      
      recentMatches.forEach(match => {
        const isPlayerOnSide1 = match.player1_id === playerId;
        const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
        if (didWin) recentWins++;
        if (match.tournament) recentTournaments.add(match.tournament.id);
      });

      // Get recent points earned
      const recentPointsHistory = await RankingPointsHistory.findAll({
        where: {
          player_id: playerId,
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

      const recentPointsEarned = recentPointsHistory.reduce((sum, record) => sum + record.points, 0);

      // Format rankings with proper field names
      const rankings = playerRankings.map(ranking => {
        const prev = ranking.previous_rank;
        const curr = ranking.current_rank;
        
        let rankChange, rankChangeAmount;
        if (prev === null || prev === undefined) {
          rankChange = 'new';
          rankChangeAmount = 0;
        } else if (curr < prev) {
          rankChange = 'up';
          rankChangeAmount = prev - curr;
        } else if (curr > prev) {
          rankChange = 'down';
          rankChangeAmount = curr - prev;
        } else {
          rankChange = 'same';
          rankChangeAmount = 0;
        }

        return {
          player_id: playerId,
          ranking_position: ranking.current_rank,
          previous_position: ranking.previous_rank,
          points: ranking.points,
          previous_points: ranking.points, // TODO: Calculate from history
          ranking_type: 'overall',
          category: ranking.category ? ranking.category.name : 'Open',
          region: 'National',
          last_updated: ranking.updated_at,
          player: {
            id: playerWithAssociations.id,
            full_name: playerWithAssociations.full_name,
            profile_image: playerWithAssociations.profile_photo_url,
            skill_level: playerWithAssociations.nrtp_level,
            club: playerWithAssociations.club,
            state: playerWithAssociations.state
          },
          matches_played_period: ranking.tournaments_played,
          recent_performance: {
            last_30_days: {
              matches: recentMatches.length,
              wins: recentWins,
              tournaments: recentTournaments.size,
              points_earned: recentPointsEarned
            }
          },
          rank_change: rankChange,
          rank_change_amount: rankChangeAmount
        };
      });

      res.json(rankings);
    } catch (error) {
      console.error('Get player rankings error:', error);
      res.status(500).json({ error: 'Failed to get player rankings' });
    }
  },

  // Get recent match results
  async getRecentMatches(req, res) {
    try {
      const userId = req.userId;
      const player = await Player.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;
      const { limit = 10 } = req.query;

      // Get actual recent matches from database
      const recentMatches = await TournamentMatch.findAll({
        where: {
          [Op.or]: [
            { player1_id: playerId },
            { player3_id: playerId }
          ],
          status: 'completed'
        },
        include: [
          {
            model: Tournament,
            as: 'tournament',
            attributes: ['id', 'name', 'tournament_type']
          },
          {
            model: Player,
            as: 'player1',
            attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level']
          },
          {
            model: Player,
            as: 'player3',
            attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level']
          }
        ],
        order: [['match_date', 'DESC']],
        limit: parseInt(limit)
      });

      // Get points earned for these matches
      const matchIds = recentMatches.map(match => match.tournament_id).filter(id => id);
      const pointsEarned = await RankingPointsHistory.findAll({
        where: {
          player_id: playerId,
          tournament_id: {
            [Op.in]: matchIds
          }
        }
      });

      // Create a map of tournament points for quick lookup
      const pointsMap = pointsEarned.reduce((map, record) => {
        map[record.tournament_id] = record.points;
        return map;
      }, {});

      // Format matches for response
      const formattedMatches = recentMatches.map(match => {
        const isPlayerOnSide1 = match.player1_id === playerId;
        const opponent = isPlayerOnSide1 ? match.player3 : match.player1;
        const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
        
        // Determine match format based on presence of player2_id and player4_id
        const matchFormat = (match.player2_id || match.player4_id) ? 'doubles' : 'singles';
        
        return {
          id: match.id,
          player1_id: match.player1_id,
          player2_id: match.player2_id,
          player3_id: match.player3_id,
          player4_id: match.player4_id,
          winner_side: match.winner_side,
          match_type: 'tournament',
          match_format: matchFormat,
          match_date: match.match_date,
          final_score: match.score,
          tournament: match.tournament ? {
            id: match.tournament.id,
            name: match.tournament.name,
            level: match.tournament.tournament_type
          } : null,
          opponent: opponent ? {
            id: opponent.id,
            full_name: opponent.full_name,
            profile_image: opponent.profile_photo_url,
            skill_level: opponent.nrtp_level
          } : null,
          result: didWin ? 'win' : 'loss',
          points_earned: pointsMap[match.tournament_id] || 0,
          round: match.round,
          match_number: match.match_number,
          status: match.status
        };
      });

      res.json(formattedMatches);
    } catch (error) {
      console.error('Get recent matches error:', error);
      res.status(500).json({ error: 'Failed to get recent matches' });
    }
  },

  // Get tournament performance history
  async getTournamentHistory(req, res) {
    try {
      const userId = req.userId;
      const player = await Player.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;
      const { timeframe = '1y' } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case '3m':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '6m':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date('2020-01-01');
      }

      // Get tournaments the player participated in
      const playerTournaments = await Tournament.findAll({
        include: [
          {
            model: TournamentMatch,
            as: 'matches',
            where: {
              [Op.or]: [
                { player1_id: playerId },
                { player3_id: playerId }
              ]
            },
            required: true
          }
        ],
        where: {
          start_date: {
            [Op.gte]: startDate
          },
          status: {
            [Op.in]: ['completed', 'ongoing']
          }
        },
        order: [['start_date', 'DESC']]
      });

      // Get points earned from tournaments
      const tournamentIds = playerTournaments.map(t => t.id);
      const pointsHistory = await RankingPointsHistory.findAll({
        where: {
          player_id: playerId,
          tournament_id: {
            [Op.in]: tournamentIds
          }
        }
      });

      const pointsMap = pointsHistory.reduce((map, record) => {
        map[record.tournament_id] = record.points;
        return map;
      }, {});

      // Process each tournament to calculate performance
      const tournamentHistory = [];
      
      for (const tournament of playerTournaments) {
        // Get all matches for this player in this tournament
        const tournamentMatches = await TournamentMatch.findAll({
          where: {
            tournament_id: tournament.id,
            [Op.or]: [
              { player1_id: playerId },
              { player3_id: playerId }
            ]
          },
          order: [['round', 'ASC'], ['match_number', 'ASC']]
        });

        let matchesWon = 0;
        let matchesLost = 0;
        let lastRound = 0;
        
        // Calculate wins/losses and determine final position
        tournamentMatches.forEach(match => {
          const isPlayerOnSide1 = match.player1_id === playerId;
          const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
          
          if (match.status === 'completed') {
            if (didWin) {
              matchesWon++;
            } else {
              matchesLost++;
            }
            lastRound = Math.max(lastRound, match.round);
          }
        });

        // Determine final position based on last round reached
        let finalPosition = 'Participant';
        if (matchesWon > 0) {
          switch (lastRound) {
            case 1:
              finalPosition = 'First Round';
              break;
            case 2:
              finalPosition = 'Round of 16';
              break;
            case 3:
              finalPosition = 'Quarterfinalist';
              break;
            case 4:
              finalPosition = 'Semifinalist';
              break;
            case 5:
              finalPosition = matchesLost === 0 ? 'Winner' : 'Runner-up';
              break;
            default:
              finalPosition = 'Participant';
          }
        }

        tournamentHistory.push({
          tournament_id: tournament.id,
          tournament_name: tournament.name,
          tournament_level: tournament.tournament_type,
          tournament_date: tournament.start_date,
          final_position: finalPosition,
          matches_won: matchesWon,
          matches_lost: matchesLost,
          points_earned: pointsMap[tournament.id] || 0,
          venue_name: tournament.venue_name,
          category: 'Open'
        });
      }

      res.json(tournamentHistory);
    } catch (error) {
      console.error('Get tournament history error:', error);
      res.status(500).json({ error: 'Failed to get tournament history' });
    }
  },

  // Get detailed performance metrics
  async getPerformanceMetrics(req, res) {
    try {
      const userId = req.userId;
      const player = await Player.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;
      const { timeframe = '30d' } = req.query;

      // Calculate date ranges
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get last 10 matches
      const last10Matches = await TournamentMatch.findAll({
        where: {
          [Op.or]: [
            { player1_id: playerId },
            { player3_id: playerId }
          ],
          status: 'completed'
        },
        order: [['match_date', 'DESC']],
        limit: 10
      });

      // Get last 30 days matches
      const last30DaysMatches = await TournamentMatch.findAll({
        where: {
          [Op.or]: [
            { player1_id: playerId },
            { player3_id: playerId }
          ],
          status: 'completed',
          match_date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        include: [
          {
            model: Tournament,
            as: 'tournament'
          }
        ]
      });

      // Get current ranking for comparison
      const currentRanking = await PlayerRanking.findOne({
        where: { player_id: playerId },
        include: [{
          model: RankingPeriod,
          as: 'period',
          where: { is_active: true }
        }],
        order: [['updated_at', 'DESC']]
      });

      // Calculate last 10 matches performance
      let last10Wins = 0;
      let currentStreakType = null;
      let currentStreakCount = 0;
      
      last10Matches.forEach((match, index) => {
        const isPlayerOnSide1 = match.player1_id === playerId;
        const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
        
        if (didWin) last10Wins++;
        
        // Calculate current streak from most recent match
        if (index === 0) {
          currentStreakType = didWin ? 'win' : 'loss';
          currentStreakCount = 1;
        } else if (currentStreakType === (didWin ? 'win' : 'loss')) {
          currentStreakCount++;
        }
      });

      // Calculate last 30 days performance
      let last30DaysWins = 0;
      const tournamentSet = new Set();
      
      last30DaysMatches.forEach(match => {
        const isPlayerOnSide1 = match.player1_id === playerId;
        const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
        if (didWin) last30DaysWins++;
        if (match.tournament) tournamentSet.add(match.tournament.id);
      });

      // Get ranking change (simplified - compare current vs previous)
      const rankingChange = currentRanking ? 
        (currentRanking.previous_rank ? currentRanking.previous_rank - currentRanking.current_rank : 0) : 0;

      const metrics = {
        current_form: {
          last_10_matches: {
            wins: last10Wins,
            losses: last10Matches.length - last10Wins,
            win_percentage: last10Matches.length > 0 ? (last10Wins / last10Matches.length) * 100 : 0
          },
          last_30_days: {
            matches: last30DaysMatches.length,
            wins: last30DaysWins,
            tournaments: tournamentSet.size,
            ranking_change: rankingChange
          },
          current_streak: {
            type: currentStreakType || 'none',
            count: currentStreakCount
          }
        },
        skill_breakdown: {
          // These would need to be calculated from detailed match statistics
          // For now, using player's NRTP level as base
          serve_rating: 75,
          return_rating: 75,
          net_play_rating: 75,
          groundstroke_rating: 75,
          consistency_rating: 75,
          power_rating: 75,
          placement_rating: 75,
          mental_rating: 75
        },
        comparative_stats: {
          // These would require opponent ranking comparison
          vs_higher_ranked: {
            matches: 0,
            wins: 0,
            win_percentage: 0
          },
          vs_lower_ranked: {
            matches: 0,
            wins: 0,
            win_percentage: 0
          },
          vs_same_level: {
            matches: 0,
            wins: 0,
            win_percentage: 0
          }
        }
      };

      res.json(metrics);
    } catch (error) {
      console.error('Get performance metrics error:', error);
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  },

  // Get leaderboards for different ranking types
  async getLeaderboard(req, res) {
    try {
      const { rankingType } = req.params;
      const { limit = 50 } = req.query;

      // Get current active ranking period
      const activePeriod = await RankingPeriod.findOne({
        where: { is_active: true },
        order: [['start_date', 'DESC']]
      });

      if (!activePeriod) {
        return res.json([]);
      }

      // Get leaderboard from actual rankings
      const rankings = await PlayerRanking.findAll({
        where: {
          period_id: activePeriod.id,
          current_rank: {
            [Op.not]: null
          }
        },
        include: [
          {
            model: Player,
            as: 'player',
            attributes: ['id', 'full_name', 'profile_photo_url', 'nrtp_level'],
            include: [
              {
                model: Club,
                as: 'club',
                attributes: ['id', 'name']
              },
              {
                model: State,
                as: 'state',
                attributes: ['id', 'name', 'short_code']
              }
            ]
          },
          {
            model: RankingCategory,
            as: 'category',
            attributes: ['name', 'gender']
          }
        ],
        order: [['current_rank', 'ASC']],
        limit: parseInt(limit)
      });

      // Get recent performance for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const playerIds = rankings.map(r => r.player_id);
      
      // Get recent matches for all players in leaderboard
      const recentMatches = await TournamentMatch.findAll({
        where: {
          [Op.or]: [
            { player1_id: { [Op.in]: playerIds } },
            { player3_id: { [Op.in]: playerIds } }
          ],
          status: 'completed',
          match_date: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        include: [
          {
            model: Tournament,
            as: 'tournament'
          }
        ]
      });

      // Get recent points for all players
      const recentPoints = await RankingPointsHistory.findAll({
        where: {
          player_id: { [Op.in]: playerIds },
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

      // Group data by player for quick lookup
      const playerMatchesMap = {};
      const playerPointsMap = {};
      
      recentMatches.forEach(match => {
        [match.player1_id, match.player3_id].forEach(playerId => {
          if (playerIds.includes(playerId)) {
            if (!playerMatchesMap[playerId]) playerMatchesMap[playerId] = [];
            playerMatchesMap[playerId].push(match);
          }
        });
      });
      
      recentPoints.forEach(point => {
        if (!playerPointsMap[point.player_id]) playerPointsMap[point.player_id] = [];
        playerPointsMap[point.player_id].push(point);
      });

      // Format leaderboard response
      const leaderboard = rankings.map(ranking => {
        const player = ranking.player;
        const playerMatches = playerMatchesMap[ranking.player_id] || [];
        const playerPoints = playerPointsMap[ranking.player_id] || [];
        
        // Calculate recent performance
        let recentWins = 0;
        const tournamentSet = new Set();
        
        playerMatches.forEach(match => {
          const isPlayerOnSide1 = match.player1_id === ranking.player_id;
          const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
          if (didWin) recentWins++;
          if (match.tournament) tournamentSet.add(match.tournament.id);
        });
        
        const recentPointsEarned = playerPoints.reduce((sum, p) => sum + p.points, 0);
        
        const prev = ranking.previous_rank;
        const curr = ranking.current_rank;
        
        let rankChange, rankChangeAmount;
        if (prev === null || prev === undefined) {
          rankChange = 'new';
          rankChangeAmount = 0;
        } else if (curr < prev) {
          rankChange = 'up';
          rankChangeAmount = prev - curr;
        } else if (curr > prev) {
          rankChange = 'down';
          rankChangeAmount = curr - prev;
        } else {
          rankChange = 'same';
          rankChangeAmount = 0;
        }

        return {
          player_id: ranking.player_id,
          ranking_position: ranking.current_rank,
          previous_position: ranking.previous_rank,
          points: ranking.points,
          previous_points: ranking.points, // TODO: Calculate from history
          ranking_type: rankingType,
          category: ranking.category ? ranking.category.name : 'Open',
          region: rankingType === 'state' ? player.state?.name : rankingType === 'club' ? player.club?.name : 'National',
          last_updated: ranking.updated_at,
          player: {
            id: player.id,
            full_name: player.full_name,
            profile_image: player.profile_photo_url,
            skill_level: player.nrtp_level,
            club: player.club,
            state: player.state
          },
          matches_played_period: ranking.tournaments_played,
          recent_performance: {
            last_30_days: {
              matches: playerMatches.length,
              wins: recentWins,
              tournaments: tournamentSet.size,
              points_earned: recentPointsEarned
            }
          },
          rank_change: rankChange,
          rank_change_amount: rankChangeAmount
        };
      });

      res.json(leaderboard);
    } catch (error) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  },

  // Search players for comparison
  async searchPlayers(req, res) {
    try {
      const { q } = req.query;
      const userId = req.userId;
      const player = await Player.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;

      if (!q || q.length < 2) {
        return res.json([]);
      }

      const players = await Player.findAll({
        where: {
          id: { [Op.ne]: playerId },
          [Op.or]: [
            { full_name: { [Op.iLike]: `%${q}%` } }
          ]
        },
        include: [
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          }
        ],
        limit: 10,
        attributes: ['id', 'full_name', 'profile_image', 'skill_level']
      });

      // Get actual ranking data for these players
      const activePeriod = await RankingPeriod.findOne({
        where: { is_active: true },
        order: [['start_date', 'DESC']]
      });
      
      const playerIds = players.map(p => p.id);
      let playerRankings = [];
      
      if (activePeriod) {
        playerRankings = await PlayerRanking.findAll({
          where: {
            player_id: { [Op.in]: playerIds },
            period_id: activePeriod.id
          },
          include: [
            {
              model: RankingCategory,
              as: 'category',
              attributes: ['name']
            }
          ]
        });
      }
      
      // Create a map for quick ranking lookup
      const rankingMap = playerRankings.reduce((map, ranking) => {
        map[ranking.player_id] = ranking;
        return map;
      }, {});

      // Format players with their ranking data
      const playersWithRankings = players.map(player => {
        const ranking = rankingMap[player.id];
        
        let rankChange = 'new';
        let rankChangeAmount = 0;
        
        if (ranking && ranking.previous_rank && ranking.current_rank) {
          if (ranking.current_rank < ranking.previous_rank) {
            rankChange = 'up';
            rankChangeAmount = ranking.previous_rank - ranking.current_rank;
          } else if (ranking.current_rank > ranking.previous_rank) {
            rankChange = 'down';
            rankChangeAmount = ranking.current_rank - ranking.previous_rank;
          } else {
            rankChange = 'same';
          }
        }
        
        return {
          player_id: player.id,
          ranking_position: ranking ? ranking.current_rank : null,
          previous_position: ranking ? ranking.previous_rank : null,
          points: ranking ? ranking.points : 0,
          previous_points: ranking ? ranking.points : 0,
          ranking_type: 'overall',
          category: ranking && ranking.category ? ranking.category.name : 'Open',
          region: 'National',
          last_updated: ranking ? ranking.updated_at : new Date().toISOString(),
          player: {
            id: player.id,
            full_name: player.full_name,
            profile_image: player.profile_photo_url,
            skill_level: player.nrtp_level,
            club: player.club,
            state: player.state
          },
          matches_played_period: ranking ? ranking.tournaments_played : 0,
          recent_performance: {
            last_30_days: {
              matches: 0, // TODO: Calculate from actual data
              wins: 0,
              tournaments: 0,
              points_earned: 0
            }
          },
          rank_change: rankChange,
          rank_change_amount: rankChangeAmount
        };
      });

      res.json(playersWithRankings);
    } catch (error) {
      console.error('Search players error:', error);
      res.status(500).json({ error: 'Failed to search players' });
    }
  },

  // Get detailed comparison between two players
  async getPlayerComparison(req, res) {
    try {
      const { player1Id, player2Id } = req.params;
      const { timeframe = '1y' } = req.query;

      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case '6m':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date('2020-01-01');
      }

      // Get both players' data
      const [player1, player2] = await Promise.all([
        Player.findByPk(player1Id, {
          include: [{
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          }, {
            model: State,
            as: 'state',
            attributes: ['id', 'name']
          }]
        }),
        Player.findByPk(player2Id, {
          include: [{
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          }, {
            model: State,
            as: 'state',
            attributes: ['id', 'name']
          }]
        })
      ]);

      if (!player1 || !player2) {
        return res.status(404).json({ error: 'One or both players not found' });
      }

      // Get current rankings for both players
      const activePeriod = await RankingPeriod.findOne({
        where: { is_active: true },
        order: [['start_date', 'DESC']]
      });

      let player1Ranking = null;
      let player2Ranking = null;

      if (activePeriod) {
        [player1Ranking, player2Ranking] = await Promise.all([
          PlayerRanking.findOne({
            where: {
              player_id: player1Id,
              period_id: activePeriod.id
            }
          }),
          PlayerRanking.findOne({
            where: {
              player_id: player2Id,
              period_id: activePeriod.id
            }
          })
        ]);
      }

      // Get match statistics for both players in the timeframe
      const [player1Matches, player2Matches] = await Promise.all([
        TournamentMatch.findAll({
          where: {
            [Op.or]: [
              { player1_id: player1Id },
              { player3_id: player1Id }
            ],
            status: 'completed',
            match_date: {
              [Op.gte]: startDate
            }
          }
        }),
        TournamentMatch.findAll({
          where: {
            [Op.or]: [
              { player1_id: player2Id },
              { player3_id: player2Id }
            ],
            status: 'completed',
            match_date: {
              [Op.gte]: startDate
            }
          }
        })
      ]);

      // Get head-to-head matches
      const headToHeadMatches = await TournamentMatch.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  [Op.and]: [
                    { [Op.or]: [{ player1_id: player1Id }, { player3_id: player1Id }] },
                    { [Op.or]: [{ player1_id: player2Id }, { player3_id: player2Id }] }
                  ]
                }
              ]
            }
          ],
          status: 'completed'
        },
        order: [['match_date', 'DESC']]
      });

      // Calculate stats for both players
      const calculatePlayerStats = (matches, playerId) => {
        let wins = 0;
        let tournamentWins = 0;
        
        matches.forEach(match => {
          const isPlayerOnSide1 = match.player1_id === playerId;
          const didWin = (isPlayerOnSide1 && match.winner_side === 1) || (!isPlayerOnSide1 && match.winner_side === 2);
          if (didWin) wins++;
        });
        
        return {
          total_matches: matches.length,
          wins,
          win_percentage: matches.length > 0 ? (wins / matches.length) * 100 : 0,
          tournament_wins: tournamentWins,
          ranking_position: null,
          points: 0
        };
      };

      const player1Stats = calculatePlayerStats(player1Matches, parseInt(player1Id));
      const player2Stats = calculatePlayerStats(player2Matches, parseInt(player2Id));

      // Add ranking data
      if (player1Ranking) {
        player1Stats.ranking_position = player1Ranking.current_rank;
        player1Stats.points = player1Ranking.points;
      }
      if (player2Ranking) {
        player2Stats.ranking_position = player2Ranking.current_rank;
        player2Stats.points = player2Ranking.points;
      }

      // Calculate head-to-head
      let player1HeadToHeadWins = 0;
      let player2HeadToHeadWins = 0;
      let lastMatchDate = null;

      headToHeadMatches.forEach(match => {
        const isPlayer1OnSide1 = match.player1_id === parseInt(player1Id) || match.player2_id === parseInt(player1Id);
        const didPlayer1Win = (isPlayer1OnSide1 && match.winner_side === 1) || (!isPlayer1OnSide1 && match.winner_side === 2);
        
        if (didPlayer1Win) {
          player1HeadToHeadWins++;
        } else {
          player2HeadToHeadWins++;
        }
        
        if (!lastMatchDate || match.match_date > lastMatchDate) {
          lastMatchDate = match.match_date;
        }
      });

      const comparison = {
        player1: {
          id: parseInt(player1Id),
          info: {
            full_name: player1.full_name,
            profile_image: player1.profile_photo_url,
            skill_level: player1.nrtp_level,
            club: player1.club,
            state: player1.state
          },
          stats: player1Stats,
          performance: {
            serve_rating: 75, // Default values - would need detailed match data
            return_rating: 75,
            consistency_rating: 75
          }
        },
        player2: {
          id: parseInt(player2Id),
          info: {
            full_name: player2.full_name,
            profile_image: player2.profile_photo_url,
            skill_level: player2.nrtp_level,
            club: player2.club,
            state: player2.state
          },
          stats: player2Stats,
          performance: {
            serve_rating: 75,
            return_rating: 75,
            consistency_rating: 75
          }
        },
        head_to_head: {
          total_matches: headToHeadMatches.length,
          player1_wins: player1HeadToHeadWins,
          player2_wins: player2HeadToHeadWins,
          last_match_date: lastMatchDate
        }
      };

      res.json(comparison);
    } catch (error) {
      console.error('Get player comparison error:', error);
      res.status(500).json({ error: 'Failed to get player comparison' });
    }
  }
};

module.exports = playerRankingsController;