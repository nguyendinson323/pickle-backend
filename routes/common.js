const express = require('express')
const router = express.Router()
const commonController = require('../controllers/commonController')

// Public routes - no authentication required for common data
router.get('/data', commonController.getAllCommonData)
router.get('/statistics', commonController.getFederationStatistics)
router.get('/states', commonController.getAllStates)
router.get('/tournaments/upcoming', commonController.getUpcomingTournaments)
router.get('/tournaments/recent', commonController.getRecentTournaments)
router.get('/federation-info', commonController.getFederationInfo)
router.get('/privacy-policy', commonController.getPrivacyPolicy)
router.get('/featured-content', commonController.getFeaturedContent)
router.get('/news', commonController.getNewsArticles)

module.exports = router