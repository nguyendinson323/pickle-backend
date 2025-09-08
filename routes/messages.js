const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageController')
const { authenticate } = require('../middlewares/authMiddleware')
const { authorize } = require('../middlewares/authorizationMiddleware')

router.use(authenticate)

router.get('/inbox', messageController.getInbox)
router.get('/sent', messageController.getSentMessages)
router.get('/unread-count', messageController.getUnreadCount)
router.patch('/mark-all-read', messageController.markAllAsRead)

router.post('/', messageController.sendMessage)
router.post('/bulk', authorize('admin', 'state', 'club'), messageController.sendBulkMessage)

router.get('/:id', messageController.getMessage)
router.patch('/:id/read', messageController.markAsRead)
router.delete('/:id', messageController.deleteMessage)

module.exports = router