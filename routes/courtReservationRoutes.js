const express = require('express');
const router = express.Router();
const courtReservationController = require('../controllers/courtReservationController');
const { authenticate } = require('../middlewares/authMiddleware');

// Search courts based on filters
router.post('/search', courtReservationController.searchCourts);

// Get court details
router.get('/courts/:courtId', courtReservationController.getCourtDetails);

// Get court availability for a specific date
router.get('/courts/:courtId/availability', courtReservationController.getCourtAvailability);

// Get user's court reservations (protected)
router.get('/reservations', authenticate, courtReservationController.getUserReservations);

// Make a court reservation (protected)
router.post('/reserve', authenticate, courtReservationController.makeReservation);

// Cancel a court reservation (protected)
router.put('/reservations/:reservationId/cancel', authenticate, courtReservationController.cancelReservation);

module.exports = router;