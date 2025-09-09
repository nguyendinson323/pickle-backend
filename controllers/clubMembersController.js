const { Player, User, Club, State } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get all club members data
const getClubMembersData = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })
    
    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Get all members of this club
    const members = await Player.findAll({
      where: { club_id: club.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone', 'is_active']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    })

    // Calculate statistics
    const totalMembers = members.length
    const activeMembers = members.filter(member => member.user.is_active).length
    
    // Count expired memberships
    const currentDate = new Date()
    const expiredMembers = members.filter(member => 
      member.affiliation_expires_at && new Date(member.affiliation_expires_at) < currentDate
    ).length

    // Calculate average NRTP level
    const averageLevel = totalMembers > 0
      ? members.reduce((sum, member) => sum + member.nrtp_level, 0) / totalMembers
      : 0

    // Membership revenue calculation (simplified - could be based on actual payment records)
    const membershipRevenue = activeMembers * 50 // Assuming $50 per active member

    // New members this month
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const newMembersThisMonth = members.filter(member => 
      new Date(member.created_at) >= firstDayOfMonth
    ).length

    const stats = {
      total_members: totalMembers,
      active_members: activeMembers,
      expired_members: expiredMembers,
      average_level: Math.round(averageLevel * 10) / 10,
      membership_revenue: membershipRevenue,
      new_members_this_month: newMembersThisMonth
    }

    res.json({
      members,
      stats
    })

  } catch (error) {
    console.error('Error fetching club members data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update member status (activate/deactivate)
const updateMemberStatus = async (req, res) => {
  try {
    const { memberId } = req.params
    const { is_active } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find member and verify club ownership
    const member = await Player.findOne({
      where: { 
        id: memberId,
        club_id: club.id
      },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    })

    if (!member) {
      return res.status(404).json({ message: 'Member not found or access denied' })
    }

    // Update user status
    await member.user.update({ is_active })

    res.json({ message: 'Member status updated successfully' })

  } catch (error) {
    console.error('Error updating member status:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Remove member from club
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find member and verify club ownership
    const member = await Player.findOne({
      where: { 
        id: memberId,
        club_id: club.id
      }
    })

    if (!member) {
      return res.status(404).json({ message: 'Member not found or access denied' })
    }

    // Remove member from club by setting club_id to null
    await member.update({ club_id: null })

    res.json({ message: 'Member removed from club successfully' })

  } catch (error) {
    console.error('Error removing member:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Extend membership expiry
const extendMembership = async (req, res) => {
  try {
    const { memberId } = req.params
    const { affiliation_expires_at } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Find member and verify club ownership
    const member = await Player.findOne({
      where: { 
        id: memberId,
        club_id: club.id
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'phone', 'is_active']
        },
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    })

    if (!member) {
      return res.status(404).json({ message: 'Member not found or access denied' })
    }

    // Update membership expiry
    await member.update({ affiliation_expires_at })

    res.json({
      member,
      message: 'Membership extended successfully'
    })

  } catch (error) {
    console.error('Error extending membership:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Invite new member
const inviteNewMember = async (req, res) => {
  try {
    const { email, full_name, phone, message } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({
      where: { email }
    })

    if (existingUser) {
      // Check if they're already a player
      const existingPlayer = await Player.findOne({
        where: { user_id: existingUser.id }
      })

      if (existingPlayer && existingPlayer.club_id === club.id) {
        return res.status(400).json({ message: 'User is already a member of this club' })
      }

      if (existingPlayer && existingPlayer.club_id) {
        return res.status(400).json({ message: 'User is already affiliated with another club' })
      }

      // If they're a player without a club, invite them to join
      if (existingPlayer) {
        await existingPlayer.update({ club_id: club.id })
        return res.json({ 
          message: 'Existing player added to club successfully',
          type: 'direct_add'
        })
      }
    }

    // In a real implementation, you would:
    // 1. Send an email invitation
    // 2. Create a temporary invitation record
    // 3. Provide a registration link
    
    // For now, we'll simulate sending an invitation
    res.json({
      message: 'Invitation sent successfully',
      type: 'invitation_sent',
      invitation_details: {
        email,
        full_name,
        phone,
        club_name: club.name,
        custom_message: message
      }
    })

  } catch (error) {
    console.error('Error inviting member:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Bulk update members
const bulkUpdateMembers = async (req, res) => {
  try {
    const { member_ids, action, expiry_date } = req.body
    const userId = req.user.id

    // Get club profile
    const club = await Club.findOne({
      where: { user_id: userId }
    })

    if (!club) {
      return res.status(404).json({ message: 'Club profile not found' })
    }

    // Verify all members belong to this club
    const members = await Player.findAll({
      where: { 
        id: { [Op.in]: member_ids },
        club_id: club.id
      },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    })

    if (members.length !== member_ids.length) {
      return res.status(400).json({ message: 'Some members not found or access denied' })
    }

    let updateCount = 0

    switch (action) {
      case 'activate':
        for (const member of members) {
          await member.user.update({ is_active: true })
          updateCount++
        }
        break

      case 'deactivate':
        for (const member of members) {
          await member.user.update({ is_active: false })
          updateCount++
        }
        break

      case 'extend_membership':
        if (!expiry_date) {
          return res.status(400).json({ message: 'Expiry date required for membership extension' })
        }
        for (const member of members) {
          await member.update({ affiliation_expires_at: expiry_date })
          updateCount++
        }
        break

      default:
        return res.status(400).json({ message: 'Invalid action specified' })
    }

    res.json({
      message: `Successfully updated ${updateCount} members`,
      updated_count: updateCount,
      action
    })

  } catch (error) {
    console.error('Error bulk updating members:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getClubMembersData,
  updateMemberStatus,
  removeMember,
  extendMembership,
  inviteNewMember,
  bulkUpdateMembers
}