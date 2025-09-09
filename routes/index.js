const authRoutes = require('./auth')
const userRoutes = require('./users')
const tournamentRoutes = require('./tournaments')
const courtRoutes = require('./courts')
const messageRoutes = require('./messages')
const notificationRoutes = require('./notifications')
const commonRoutes = require('./common')
const playerRoutes = require('./playerRoutes')
const playerFinderRoutes = require('./playerFinderRoutes')
const tournamentBrowseRoutes = require('./tournamentBrowseRoutes')
const courtReservationRoutes = require('./courtReservationRoutes')
const digitalCredentialsRoutes = require('./digitalCredentialsRoutes')
const coachingSessionsRoutes = require('./coachingSessionsRoutes')
const playerMessagesRoutes = require('./playerMessagesRoutes')
const playerRankingsRoutes = require('./playerRankingsRoutes')
const coachSessionsRoutes = require('./coachSessions')
const clubRoutes = require('./clubRoutes')
const stateRoutes = require('./stateRoutes')

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
  app.use('/api/tournament-browse', tournamentBrowseRoutes)
  app.use('/api/court-reservations', courtReservationRoutes)
  app.use('/api/digital-credentials', digitalCredentialsRoutes)
  app.use('/api/coaching-sessions', coachingSessionsRoutes)
  app.use('/api/player-messages', playerMessagesRoutes)
  app.use('/api/player-rankings', playerRankingsRoutes)
  app.use('/api/coach', coachSessionsRoutes)
  app.use('/api/club', clubRoutes)
  app.use('/api/state', stateRoutes)

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