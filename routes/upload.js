const express = require('express')
const router = express.Router()
const { upload, uploadFile } = require('../controllers/uploadController')

// Single unified upload route for all file types
// Handles both registration (public) and profile editing (authenticated)
router.post('/', upload, uploadFile)

module.exports = router