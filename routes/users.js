const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize, authorizeOwner, authorizeAdminOrOwner } = require('../middlewares/authorizationMiddleware')

router.use(authenticate)

router.get('/profile', userController.getProfile)
router.put('/profile', userController.updateProfile)
router.put('/searchable', userController.updateSearchableStatus)
router.get('/stats', userController.getUserStats)

router.get('/', authorize('admin'), userController.getAllUsers)

router.get('/:id', authorizeAdminOrOwner('id'), userController.getUserById)
router.put('/:id', authorizeAdminOrOwner('id'), userController.updateUser)
router.get('/:id/stats', authorizeAdminOrOwner('id'), userController.getUserStats)

router.patch('/:id/toggle-status', authorize('admin'), userController.toggleUserStatus)
router.patch('/:id/verify', authorize('admin'), userController.verifyUser)
router.delete('/:id', authorize('admin'), userController.deleteUser)

module.exports = router