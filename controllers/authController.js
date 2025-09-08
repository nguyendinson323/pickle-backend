const authService = require('../services/authService')

const login = async (req, res) => {
  try {
    const { username, password } = req.body
    
    const result = await authService.login(username, password)
    
    res.json(result)
  } catch (error) {
    res.status(401).json({ message: error.message })
  }
}

const register = async (req, res) => {
  try {
    const { userData, profileData } = req.body
    
    const result = await authService.register(userData, profileData)
    
    res.status(201).json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    const userId = req.userId
    
    const result = await authService.changePassword(userId, oldPassword, newPassword)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    
    const result = await authService.forgotPassword(email)
    
    res.json({ message: 'Password reset token generated', resetToken: result.resetToken })
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    const result = await authService.resetPassword(token, newPassword)
    
    res.json(result)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getDashboard = async (req, res) => {
  try {
    const user = req.user
    
    const dashboardData = await authService.getDashboardData(user)
    
    res.json(dashboardData)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const refreshToken = async (req, res) => {
  try {
    const user = req.user
    
    const token = authService.generateToken(user)
    
    res.json({ token })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  login,
  register,
  changePassword,
  forgotPassword,
  resetPassword,
  getDashboard,
  refreshToken
}