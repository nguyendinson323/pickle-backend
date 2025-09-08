const { 
  Player, 
  User, 
  State, 
  Club 
} = require('../db/models')

// GET /api/player/states - Get list of all states
const getStates = async (req, res) => {
  try {
    const states = await State.findAll({
      attributes: ['id', 'name', 'short_code'],
      order: [['name', 'ASC']]
    })

    res.status(200).json(states)
  } catch (error) {
    console.error('Error fetching states:', error)
    res.status(500).json({ message: 'Failed to fetch states' })
  }
}

// GET /api/player/profile - Get current player's profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id

    const player = await Player.findOne({
      where: { user_id: userId },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        },
        {
          model: Club,
          as: 'club',
          attributes: ['id', 'name', 'logo_url']
        }
      ]
    })

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    res.status(200).json(player)
  } catch (error) {
    console.error('Error fetching player profile:', error)
    res.status(500).json({ message: 'Failed to fetch profile' })
  }
}

// PUT /api/player/profile - Update player profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      full_name,
      birth_date,
      gender,
      state_id,
      curp,
      nrtp_level,
      profile_photo_url,
      nationality,
      club_id
    } = req.body

    const player = await Player.findOne({
      where: { user_id: userId }
    })

    if (!player) {
      return res.status(404).json({ message: 'Player profile not found' })
    }

    // Update player profile fields
    const updateData = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (birth_date !== undefined) updateData.birth_date = birth_date
    if (gender !== undefined) updateData.gender = gender
    if (state_id !== undefined) updateData.state_id = state_id
    if (curp !== undefined) updateData.curp = curp
    if (nrtp_level !== undefined) updateData.nrtp_level = nrtp_level
    if (profile_photo_url !== undefined) updateData.profile_photo_url = profile_photo_url
    if (nationality !== undefined) updateData.nationality = nationality
    if (club_id !== undefined) updateData.club_id = club_id

    await player.update(updateData)

    // Fetch updated player with associations
    const updatedPlayer = await Player.findOne({
      where: { user_id: userId },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name', 'short_code']
        },
        {
          model: Club,
          as: 'club',
          attributes: ['id', 'name', 'logo_url']
        }
      ]
    })

    res.status(200).json(updatedPlayer)
  } catch (error) {
    console.error('Error updating player profile:', error)
    
    // Handle unique constraint violations (like CURP)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'CURP already exists for another player' 
      })
    }
    
    res.status(500).json({ message: 'Failed to update profile' })
  }
}

// PUT /api/player/account - Update user account information
const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id
    const { username, email, phone } = req.body

    const user = await User.findByPk(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update user account fields
    const updateData = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone

    await user.update(updateData)

    // Return updated user data (exclude password)
    const updatedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified,
      is_premium: user.is_premium,
      is_searchable: user.is_searchable
    }

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error('Error updating user account:', error)
    
    // Handle unique constraint violations (username/email)
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.fields.username ? 'Username' : 'Email'
      return res.status(400).json({ 
        message: `${field} already exists` 
      })
    }
    
    res.status(500).json({ message: 'Failed to update account' })
  }
}

module.exports = {
  getStates,
  getProfile,
  updateProfile,
  updateAccount
}