const express = require('express');
const router = express.Router();
const digitalCredentialsController = require('../controllers/digitalCredentialsController');
const { authenticate } = require('../middlewares/authMiddleware');

// Get player's digital credentials (protected)
router.get('/player', authenticate, digitalCredentialsController.getPlayerCredentials);

// Get player profile for credential creation (protected)
router.get('/profile', authenticate, digitalCredentialsController.getPlayerProfile);

// Get available credential templates
router.get('/templates', digitalCredentialsController.getCredentialTemplates);

// Create a new digital credential (protected)
router.post('/create', authenticate, digitalCredentialsController.createDigitalCredential);

// Generate QR code for a credential (protected)
router.post('/:credentialId/qr-code', authenticate, digitalCredentialsController.generateCredentialQrCode);

// Verify a credential using QR code (public - for verification by others)
router.get('/verify/:qrCodeData', digitalCredentialsController.verifyCredential);

// Generate credential card/image (protected)
router.get('/:credentialId/card', authenticate, digitalCredentialsController.generateCredentialCard);

// Update credential status (protected)
router.put('/:credentialId/status', authenticate, digitalCredentialsController.updateCredentialStatus);

// Delete a credential (protected)
router.delete('/:credentialId', authenticate, digitalCredentialsController.deleteCredential);

module.exports = router;