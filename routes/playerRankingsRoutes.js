const express = require('express');
const router = express.Router();
const playerRankingsController = require('../controllers/playerRankingsController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get player's comprehensive statistics (protected)
router.get('/stats', authenticate, playerRankingsController.getPlayerStats);

// Get player's current rankings across different categories (protected)
router.get('/my-rankings', authenticate, playerRankingsController.getPlayerRankings);

// Get recent match results (protected)
router.get('/recent-matches', authenticate, playerRankingsController.getRecentMatches);

// Get tournament performance history (protected)
router.get('/tournaments', authenticate, playerRankingsController.getTournamentHistory);

// Get detailed performance metrics (protected)
router.get('/performance', authenticate, playerRankingsController.getPerformanceMetrics);

// Get leaderboards for different ranking types
router.get('/leaderboard/:rankingType', playerRankingsController.getLeaderboard);

// Search players for comparison (protected)
router.get('/search', authenticate, playerRankingsController.searchPlayers);

// Get detailed comparison between two players (protected)
router.get('/compare/:player1Id/:player2Id', authenticate, playerRankingsController.getPlayerComparison);

module.exports = router;