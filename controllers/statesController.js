const { State } = require('../db/models')

// Get all states
const getAllStates = async (req, res) => {
  try {
    const states = await State.findAll({
      attributes: ['id', 'name', 'short_code'],
      order: [['name', 'ASC']]
    })
    
    res.json(states)
  } catch (error) {
    console.error('Error fetching states:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getAllStates
}