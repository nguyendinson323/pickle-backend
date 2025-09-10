const { Partner, User, State } = require('../db/models')

// Get partner profile data
const getPartnerProfile = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get partner profile with associated data
    const partner = await Partner.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        }
      ]
    })
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    res.json({
      partner: partner.toJSON()
    })

  } catch (error) {
    console.error('Error fetching partner profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update partner profile information
const updatePartnerProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body
    
    // Find partner profile
    const partner = await Partner.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    })
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    // Update user data if provided
    if (updateData.user_data) {
      await partner.user.update(updateData.user_data)
    }

    // Update partner data
    const partnerUpdateData = { ...updateData }
    delete partnerUpdateData.user_data

    await partner.update(partnerUpdateData)

    // Fetch updated partner with associations
    const updatedPartner = await Partner.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone', 'is_active', 'is_verified', 'is_premium', 'last_login']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        }
      ]
    })

    res.json({
      partner: updatedPartner.toJSON(),
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Error updating partner profile:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get partner affiliation status
const getPartnerAffiliationStatus = async (req, res) => {
  try {
    const userId = req.user.id
    
    const partner = await Partner.findOne({
      where: { user_id: userId },
      attributes: ['id', 'business_name', 'premium_expires_at', 'created_at']
    })
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner profile not found' })
    }

    const now = new Date()
    const isPremium = partner.premium_expires_at && new Date(partner.premium_expires_at) > now
    const daysUntilExpiry = partner.premium_expires_at ? 
      Math.ceil((new Date(partner.premium_expires_at) - now) / (1000 * 60 * 60 * 24)) : null

    res.json({
      affiliation: {
        business_name: partner.business_name,
        is_premium: isPremium,
        premium_expires_at: partner.premium_expires_at,
        days_until_expiry: daysUntilExpiry,
        member_since: partner.created_at,
        status: isPremium ? 'active' : 'expired'
      }
    })

  } catch (error) {
    console.error('Error fetching partner affiliation status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getPartnerProfile,
  updatePartnerProfile,
  getPartnerAffiliationStatus
}