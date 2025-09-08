const userService = require('../services/userService')

const getProfile = async (req, res) => {
  try {
    const userId = req.userId
    const role = req.userRole
    
    const profile = await userService.getProfile(userId, role)
    
    res.json(profile)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId
    const role = req.userRole
    const updates = req.body
    
    const profile = await userService.updateProfile(userId, role, updates)
    
    res.json(profile)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const filters = req.query
    
    const users = await userService.getAllUsers(filters)
    
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getUserById = async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await userService.getUserById(id)
    
    res.json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await userService.getUserById(id)
    const updates = req.body
    
    const updatedUser = await userService.updateProfile(id, user.user.role, updates)
    
    res.json(updatedUser)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await userService.toggleUserStatus(id)
    
    res.json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const verifyUser = async (req, res) => {
  try {
    const { id } = req.params
    
    const user = await userService.verifyUser(id)
    
    res.json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await userService.deleteUser(id)
    
    res.json(result)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

const updateSearchableStatus = async (req, res) => {
  try {
    const userId = req.userId
    const { isSearchable } = req.body
    
    const user = await userService.updateSearchableStatus(userId, isSearchable)
    
    res.json(user)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

const getUserStats = async (req, res) => {
  try {
    const userId = req.userId || req.params.id
    const role = req.userRole || req.query.role
    
    const stats = await userService.getUserStats(userId, role)
    
    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  verifyUser,
  deleteUser,
  updateSearchableStatus,
  getUserStats
}