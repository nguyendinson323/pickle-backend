const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }

    next()
  }
}

const authorizeOwner = (resourceIdParam = 'id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const resourceId = req.params[resourceIdParam]
    
    if (req.userRole === 'admin') {
      return next()
    }

    if (resourceId && resourceId != req.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    next()
  }
}

const authorizeAdminOrOwner = (resourceIdParam = 'userId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (req.userRole === 'admin') {
      return next()
    }

    const resourceId = req.params[resourceIdParam] || req.body[resourceIdParam]
    
    if (resourceId && resourceId != req.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    next()
  }
}

const authorizeClubOrPartnerOwner = (Model, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (req.userRole === 'admin') {
      return next()
    }

    if (!['club', 'partner'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Only clubs and partners can access this resource' })
    }

    try {
      const resourceId = req.params[resourceIdParam]
      const resource = await Model.findByPk(resourceId)
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' })
      }

      const ownerField = req.userRole === 'club' ? 'club_id' : 'partner_id'
      
      if (resource.owner_type !== req.userRole || resource.owner_id != req.userId) {
        return res.status(403).json({ message: 'Access denied' })
      }

      req.resource = resource
      next()
    } catch (error) {
      res.status(500).json({ message: 'Server error' })
    }
  }
}

const authorizeStateCommittee = (stateIdParam = 'stateId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    if (req.userRole === 'admin') {
      return next()
    }

    if (req.userRole !== 'state') {
      return res.status(403).json({ message: 'Only state committees can access this resource' })
    }

    const stateId = req.params[stateIdParam] || req.body[stateIdParam]
    
    const { StateCommittee } = require('../db/models')
    const committee = await StateCommittee.findOne({ where: { user_id: req.userId } })
    
    if (!committee || (stateId && committee.state_id != stateId)) {
      return res.status(403).json({ message: 'Access denied to this state' })
    }

    req.stateCommittee = committee
    next()
  }
}

module.exports = {
  authorize,
  authorizeOwner,
  authorizeAdminOrOwner,
  authorizeClubOrPartnerOwner,
  authorizeStateCommittee
}