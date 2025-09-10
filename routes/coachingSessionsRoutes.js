const express = require('express');
const router = express.Router();
const coachingSessionsController = require('../controllers/coachingSessionsController');
const { authenticate } = require('../middlewares/authMiddleware');

// Search coaching sessions based on filters
router.post('/search', coachingSessionsController.searchSessions);

// Get available coaches
router.get('/coaches', coachingSessionsController.getCoaches);

// Get coach details and availability
router.get('/coaches/:coachId', coachingSessionsController.getCoachDetails);

// Get session details
router.get('/:sessionId', coachingSessionsController.getSessionDetails);

// Get player's coaching session bookings (protected)
router.get('/my-bookings', authenticate, coachingSessionsController.getMyBookings);

// Book a coaching session (protected)
router.post('/book', authenticate, coachingSessionsController.bookSession);

// Cancel a session booking (protected)
router.put('/bookings/:sessionId/cancel', authenticate, coachingSessionsController.cancelBooking);

// Submit session review and feedback (protected)
router.post('/:sessionId/review', authenticate, coachingSessionsController.submitReview);

module.exports = router;