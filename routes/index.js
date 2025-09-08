const authRoutes = require('./auth')
const userRoutes = require('./users')
const tournamentRoutes = require('./tournaments')
const courtRoutes = require('./courts')
const messageRoutes = require('./messages')
const notificationRoutes = require('./notifications')
const commonRoutes = require('./common')
const playerRoutes = require('./playerRoutes')
const playerFinderRoutes = require('./playerFinderRoutes')

const initializeRoutes = (app) => {
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/tournaments', tournamentRoutes)
  app.use('/api/courts', courtRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/common', commonRoutes)
  app.use('/api/player', playerRoutes)
  app.use('/api/player-finder', playerFinderRoutes)

  app.use('*', (req, res) => {
    res.status(404).json({ 
      message: 'Route not found',
      path: req.originalUrl,
      method: req.method
    })
  })

  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err)
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    })
  })
}

module.exports = {
  initializeRoutes
}