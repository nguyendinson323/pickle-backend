const commonService = require('../services/commonService')

const getAllCommonData = async (req, res) => {
  try {
    const data = await commonService.getAllCommonData()
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getFederationStatistics = async (req, res) => {
  try {
    const statistics = await commonService.getFederationStatistics()
    res.json(statistics)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getAllStates = async (req, res) => {
  try {
    const states = await commonService.getAllStates()
    res.json(states)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getUpcomingTournaments = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6
    const tournaments = await commonService.getUpcomingTournaments(limit)
    res.json(tournaments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getRecentTournaments = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6
    const tournaments = await commonService.getRecentTournaments(limit)
    res.json(tournaments)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getFederationInfo = async (req, res) => {
  try {
    const info = await commonService.getFederationInfo()
    res.json(info)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getPrivacyPolicy = async (req, res) => {
  try {
    const policy = await commonService.getPrivacyPolicy()
    res.json(policy)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getFeaturedContent = async (req, res) => {
  try {
    const content = await commonService.getFeaturedContent()
    res.json(content)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getNewsArticles = async (req, res) => {
  try {
    const articles = await commonService.getNewsArticles()
    res.json(articles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getAllCommonData,
  getFederationStatistics,
  getAllStates,
  getUpcomingTournaments,
  getRecentTournaments,
  getFederationInfo,
  getPrivacyPolicy,
  getFeaturedContent,
  getNewsArticles
}