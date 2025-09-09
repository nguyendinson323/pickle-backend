require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { sequelize } = require('./db/models')
const { initializeRoutes } = require('./routes')
const socketManager = require('./sockets/socketManager')

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Initialize all routes
initializeRoutes(app)

// Initialize Socket.io
socketManager.initialize(server)

// Test database connection
const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connection has been established successfully.')
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
      console.log('Socket.io enabled for real-time messaging')
    })
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    process.exit(1)
  }
}

startServer()