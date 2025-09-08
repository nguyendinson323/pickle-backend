const jwt = require('jsonwebtoken')
const { User } = require('../db/models')

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ 
      where: { 
        id: decoded.id,
        is_active: true 
      }
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication' })
    }

    req.user = user
    req.userId = user.id
    req.userRole = user.role
    next()
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' })
  }
}

const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findOne({ 
        where: { 
          id: decoded.id,
          is_active: true 
        }
      })
      
      if (user) {
        req.user = user
        req.userId = user.id
        req.userRole = user.role
      }
    }
    next()
  } catch (error) {
    next()
  }
}

module.exports = {
  authenticate,
  optionalAuthenticate
}