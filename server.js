require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { sequelize } = require('./db/models')
const { initializeRoutes } = require('./routes')

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Initialize all routes
initializeRoutes(app)

// Test database connection
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
  }
}

startServer()