const express = require('express')
const router = express.Router()
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')
const clubCourtsController = require('../controllers/clubCourtsController')
const clubMembersController = require('../controllers/clubMembersController')
const clubTournamentsController = require('../controllers/clubTournamentsController')
const clubMicrositeController = require('../controllers/clubMicrositeController')
const clubMembershipController = require('../controllers/clubMembershipController')

// ==================== COURTS ROUTES ====================

// Get all club courts data (courts, schedules, reservations, maintenance, stats)
router.get('/courts', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.getClubCourtsData
)

// Create a new court
router.post('/courts', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.createCourt
)

// Update court information
router.put('/courts/:courtId', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.updateCourt
)

// Delete court
router.delete('/courts/:courtId', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.deleteCourt
)

// Update court schedule
router.put('/courts/schedules/:scheduleId', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.updateCourtSchedule
)

// Update reservation status
router.put('/courts/reservations/:reservationId/status', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.updateReservationStatus
)

// Create maintenance record
router.post('/courts/maintenance', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.createMaintenance
)

// Update maintenance record
router.put('/courts/maintenance/:maintenanceId', 
  authenticate, 
  authorize('club'), 
  clubCourtsController.updateMaintenance
)

// ==================== MEMBERS ROUTES ====================

// Get all club members data
router.get('/members', 
  authenticate, 
  authorize('club'), 
  clubMembersController.getClubMembersData
)

// Update member information
router.put('/members/:memberId', 
  authenticate, 
  authorize('club'), 
  clubMembersController.updateMemberInfo
)

// Update member status (activate/deactivate)
router.put('/members/:memberId/status', 
  authenticate, 
  authorize('club'), 
  clubMembersController.updateMemberStatus
)

// Remove member from club
router.delete('/members/:memberId', 
  authenticate, 
  authorize('club'), 
  clubMembersController.removeMember
)

// Extend membership expiry
router.put('/members/:memberId/extend', 
  authenticate, 
  authorize('club'), 
  clubMembersController.extendMembership
)

// Invite new member
router.post('/members/invite', 
  authenticate, 
  authorize('club'), 
  clubMembersController.inviteNewMember
)

// Bulk update members
router.put('/members/bulk-update', 
  authenticate, 
  authorize('club'), 
  clubMembersController.bulkUpdateMembers
)

// ==================== TOURNAMENTS ROUTES ====================

// Get all club tournaments data
router.get('/tournaments', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.getClubTournamentsData
)

// Create a new tournament
router.post('/tournaments', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.createTournament
)

// Update tournament information
router.put('/tournaments/:tournamentId', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.updateTournament
)

// Delete tournament
router.delete('/tournaments/:tournamentId', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.deleteTournament
)

// Update tournament status
router.put('/tournaments/:tournamentId/status', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.updateTournamentStatus
)

// Get tournament registrations
router.get('/tournaments/:tournamentId/registrations', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.getTournamentRegistrations
)

// Generate tournament matches
router.post('/tournaments/:tournamentId/matches/generate', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.generateTournamentMatches
)

// Get tournament matches
router.get('/tournaments/:tournamentId/matches', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.getTournamentMatches
)

// Update match result
router.put('/tournaments/matches/:matchId', 
  authenticate, 
  authorize('club'), 
  clubTournamentsController.updateMatchResult
)

// ==================== MICROSITE ROUTES ====================

// Get club microsite data
router.get('/microsite', 
  authenticate, 
  authorize('club'), 
  clubMicrositeController.getClubMicrositeData
)

// Update club microsite data
router.put('/microsite', 
  authenticate, 
  authorize('club'), 
  clubMicrositeController.updateClubMicrositeData
)

// Upload club logo
router.post('/microsite/logo', 
  authenticate, 
  authorize('club'),
  clubMicrositeController.upload.single('logo'),
  clubMicrositeController.uploadClubLogo
)

// Upload banner image
router.post('/microsite/banner', 
  authenticate, 
  authorize('club'),
  clubMicrositeController.upload.single('banner'),
  clubMicrositeController.uploadBannerImage
)

// Update microsite customization
router.put('/microsite/customization', 
  authenticate, 
  authorize('club'), 
  clubMicrositeController.updateMicrositeCustomization
)

// Get microsite analytics
router.get('/microsite/analytics', 
  authenticate, 
  authorize('club'), 
  clubMicrositeController.getMicrositeAnalytics
)

// Publish microsite
router.post('/microsite/publish', 
  authenticate, 
  authorize('club'), 
  clubMicrositeController.publishMicrosite
)

// Unpublish microsite
router.post('/microsite/unpublish', 
  authenticate, 
  authorize('club'), 
  clubMicrositeController.unpublishMicrosite
)

// ==================== MEMBERSHIP ROUTES ====================

// Get available club subscription plans (public endpoint)
router.get('/subscription-plans', 
  clubMembershipController.getAvailableClubPlans
)

// Get club membership data
router.get('/membership', 
  authenticate, 
  authorize('club'), 
  clubMembershipController.getClubMembershipData
)

// Subscribe to a plan
router.post('/membership/subscribe', 
  authenticate, 
  authorize('club'), 
  clubMembershipController.subscribeToPlan
)

// Cancel subscription
router.post('/membership/cancel', 
  authenticate, 
  authorize('club'), 
  clubMembershipController.cancelSubscription
)

// Renew subscription
router.post('/membership/renew', 
  authenticate, 
  authorize('club'), 
  clubMembershipController.renewSubscription
)

// Update payment method
router.put('/membership/payment-method', 
  authenticate, 
  authorize('club'), 
  clubMembershipController.updatePaymentMethod
)

// Change subscription plan
router.put('/membership/change-plan', 
  authenticate, 
  authorize('club'), 
  clubMembershipController.changePlan
)

module.exports = router