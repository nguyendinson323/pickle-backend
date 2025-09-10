const { User } = require('../db/models')
const bcrypt = require('bcrypt')

// Get admin profile information
const getProfile = async (req, res) => {
  try {
    const adminId = req.userId
    
    const admin = await User.findOne({
      where: { id: adminId, role: 'admin' },
      attributes: ['id', 'username', 'email', 'phone', 'role', 'is_active', 'is_verified', 'is_premium', 'is_searchable', 'last_login', 'created_at', 'updated_at']
    })

    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' })
    }

    res.json(admin)
  } catch (error) {
    console.error('Error fetching admin profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update admin profile information
const updateProfile = async (req, res) => {
  try {
    const adminId = req.userId
    const { username, email, phone } = req.body

    const admin = await User.findOne({
      where: { id: adminId, role: 'admin' }
    })

    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' })
    }

    // Check if username is already taken by another user
    if (username && username !== admin.username) {
      const existingUser = await User.findOne({
        where: { username, id: { [require('sequelize').Op.ne]: adminId } }
      })
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' })
      }
    }

    // Check if email is already taken by another user
    if (email && email !== admin.email) {
      const existingUser = await User.findOne({
        where: { email, id: { [require('sequelize').Op.ne]: adminId } }
      })
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' })
      }
    }

    // Update admin profile
    await admin.update({
      username: username || admin.username,
      email: email || admin.email,
      phone: phone || admin.phone,
      updated_at: new Date()
    })

    // Return updated admin data
    const updatedAdmin = await User.findOne({
      where: { id: adminId },
      attributes: ['id', 'username', 'email', 'phone', 'role', 'is_active', 'is_verified', 'is_premium', 'is_searchable', 'last_login', 'created_at', 'updated_at']
    })

    res.json({
      message: 'Profile updated successfully',
      user: updatedAdmin
    })
  } catch (error) {
    console.error('Error updating admin profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Change admin password
const changePassword = async (req, res) => {
  try {
    const adminId = req.userId
    const { currentPassword, newPassword } = req.body

    const admin = await User.findOne({
      where: { id: adminId, role: 'admin' }
    })

    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password)
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await admin.update({
      password: hashedNewPassword,
      updated_at: new Date()
    })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing admin password:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update admin security settings
const updateSecuritySettings = async (req, res) => {
  try {
    const adminId = req.userId
    const { is_searchable } = req.body

    const admin = await User.findOne({
      where: { id: adminId, role: 'admin' }
    })

    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' })
    }

    // Update security settings
    await admin.update({
      is_searchable: is_searchable !== undefined ? is_searchable : admin.is_searchable,
      updated_at: new Date()
    })

    // Return updated admin data
    const updatedAdmin = await User.findOne({
      where: { id: adminId },
      attributes: ['id', 'username', 'email', 'phone', 'role', 'is_active', 'is_verified', 'is_premium', 'is_searchable', 'last_login', 'created_at', 'updated_at']
    })

    res.json({
      message: 'Security settings updated successfully',
      user: updatedAdmin
    })
  } catch (error) {
    console.error('Error updating admin security settings:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get admin activity log
const getActivityLog = async (req, res) => {
  try {
    const adminId = req.userId
    const { page = 1, limit = 10 } = req.query
    const offset = (page - 1) * limit

    // This would typically come from an audit/activity log table
    // For now, we'll return basic user information
    const admin = await User.findOne({
      where: { id: adminId, role: 'admin' },
      attributes: ['id', 'username', 'email', 'last_login', 'created_at', 'updated_at']
    })

    if (!admin) {
      return res.status(404).json({ message: 'Admin profile not found' })
    }

    // Mock activity data - in a real application, this would come from an audit log
    const activities = [
      {
        id: 1,
        action: 'Profile Updated',
        timestamp: admin.updated_at,
        details: 'Updated contact information',
        ip_address: req.ip
      },
      {
        id: 2,
        action: 'Login',
        timestamp: admin.last_login || admin.created_at,
        details: 'Successful admin login',
        ip_address: req.ip
      },
      {
        id: 3,
        action: 'Account Created',
        timestamp: admin.created_at,
        details: 'Administrator account created',
        ip_address: 'System'
      }
    ]

    res.json({
      activities: activities.slice(offset, offset + parseInt(limit)),
      totalCount: activities.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(activities.length / limit)
    })
  } catch (error) {
    console.error('Error fetching admin activity log:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateSecuritySettings,
  getActivityLog
}