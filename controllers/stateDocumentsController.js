const { Document, User, StateCommittee } = require('../db/models')
const { Op } = require('sequelize')
const cloudinary = require('cloudinary').v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Get state documents
const getStateDocuments = async (req, res) => {
  try {
    const userId = req.user.id
    const { 
      file_type, 
      is_public, 
      start_date, 
      end_date,
      search
    } = req.query
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    // Build where conditions for documents
    const documentWhere = {
      owner_id: userId
    }

    if (file_type) {
      documentWhere.file_type = {
        [Op.iLike]: `%${file_type}%`
      }
    }

    if (is_public !== undefined) {
      documentWhere.is_public = is_public === 'true'
    }

    if (start_date && end_date) {
      documentWhere.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      }
    }

    if (search) {
      documentWhere[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ]
    }

    // Get documents
    const documents = await Document.findAll({
      where: documentWhere,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    })

    // Calculate statistics
    const totalDocuments = await Document.count({
      where: { owner_id: userId }
    })

    // Documents by type
    const documentsByType = await Document.findAll({
      where: { owner_id: userId },
      attributes: [
        'file_type',
        [Document.sequelize.fn('COUNT', Document.sequelize.col('id')), 'count']
      ],
      group: ['file_type'],
      raw: true
    })

    const documentsTypeCount = {}
    documentsByType.forEach(item => {
      const fileType = item.file_type || 'unknown'
      documentsTypeCount[fileType] = parseInt(item.count) || 0
    })

    // Public vs private documents
    const publicDocuments = await Document.count({
      where: { owner_id: userId, is_public: true }
    })

    const privateDocuments = await Document.count({
      where: { owner_id: userId, is_public: false }
    })

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await Document.count({
      where: {
        owner_id: userId,
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    })

    const stats = {
      total_documents: totalDocuments,
      documents_by_type: documentsTypeCount,
      public_documents: publicDocuments,
      private_documents: privateDocuments,
      recent_activity: recentActivity
    }

    res.json({
      documents,
      stats
    })

  } catch (error) {
    console.error('Error fetching state documents:', error)
    res.status(500).json({ message: 'Failed to fetch documents' })
  }
}

// Upload document
const uploadStateDocument = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    const {
      title,
      description,
      is_public,
      file // This should be a base64 encoded file or file data
    } = req.body

    if (!title || !file) {
      return res.status(400).json({ message: 'Title and file are required' })
    }

    // Upload to Cloudinary
    let uploadResult
    try {
      uploadResult = await cloudinary.uploader.upload(file, {
        folder: 'state-documents',
        resource_type: 'auto'
      })
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError)
      return res.status(400).json({ message: 'Failed to upload file' })
    }

    // Create document record
    const document = await Document.create({
      owner_id: userId,
      title,
      description: description || null,
      document_url: uploadResult.secure_url,
      file_type: uploadResult.format || 'unknown',
      is_public: is_public === 'true' || is_public === true
    })

    // Fetch document with user data
    const documentWithUser = await Document.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    })

    res.status(201).json({
      document: documentWithUser,
      message: 'Document uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    res.status(500).json({ message: 'Failed to upload document' })
  }
}

// Update document
const updateStateDocument = async (req, res) => {
  try {
    const { documentId } = req.params
    const userId = req.user.id
    const updateData = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    // Find and update document
    const document = await Document.findOne({
      where: {
        id: documentId,
        owner_id: userId
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    await document.update(updateData)

    // Fetch updated document with user data
    const updatedDocument = await Document.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'email']
        }
      ]
    })

    res.json({
      document: updatedDocument,
      message: 'Document updated successfully'
    })

  } catch (error) {
    console.error('Error updating document:', error)
    res.status(500).json({ message: 'Failed to update document' })
  }
}

// Delete document
const deleteStateDocument = async (req, res) => {
  try {
    const { documentId } = req.params
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee not found' })
    }

    // Find and delete document
    const document = await Document.findOne({
      where: {
        id: documentId,
        owner_id: userId
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (document.document_url && document.document_url.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = document.document_url.split('/')
        const fileWithExtension = urlParts[urlParts.length - 1]
        const fileName = fileWithExtension.split('.')[0]
        const folderPath = 'state-documents/' + fileName
        await cloudinary.uploader.destroy(folderPath)
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError)
        // Continue with database deletion even if Cloudinary fails
      }
    }

    await document.destroy()

    res.json({ message: 'Document deleted successfully' })

  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ message: 'Failed to delete document' })
  }
}

// Download document
const downloadStateDocument = async (req, res) => {
  try {
    const { documentId } = req.params
    const userId = req.user.id
    
    // Find document
    const document = await Document.findOne({
      where: {
        id: documentId,
        [Op.or]: [
          { owner_id: userId },
          { is_public: true }
        ]
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' })
    }

    // Redirect to the document URL for download
    res.redirect(document.document_url)

  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({ message: 'Failed to download document' })
  }
}

module.exports = {
  getStateDocuments,
  uploadStateDocument,
  updateStateDocument,
  deleteStateDocument,
  downloadStateDocument
}