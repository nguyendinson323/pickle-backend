const { StateCommittee, StateDocument, StateInvoice, StateDocumentTemplate, User, Tournament, Club, Partner, Player, Coach } = require('../db/models')
const { Op, Sequelize } = require('sequelize')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/state-documents/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow common document types
    const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png']
    const fileExt = path.extname(file.originalname).toLowerCase()
    
    if (allowedTypes.includes(fileExt)) {
      return cb(null, true)
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG'))
    }
  }
})

// Get state documents, invoices, and templates
const getStateDocumentsData = async (req, res) => {
  try {
    const userId = req.user.id
    const { 
      document_type, 
      related_entity_type, 
      is_public, 
      start_date, 
      end_date 
    } = req.query
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    const stateId = stateCommittee.id

    // Build where conditions for documents
    const documentWhere = {
      state_committee_id: stateId
    }

    if (document_type) {
      documentWhere.document_type = document_type
    }

    if (related_entity_type) {
      documentWhere.related_entity_type = related_entity_type
    }

    if (is_public !== undefined) {
      documentWhere.is_public = is_public === 'true'
    }

    if (start_date && end_date) {
      documentWhere.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      }
    }

    // Get documents
    const documents = await StateDocument.findAll({
      where: documentWhere,
      include: [
        {
          model: User,
          as: 'created_by_user',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    })

    // Get invoices
    const invoices = await StateInvoice.findAll({
      where: { state_committee_id: stateId },
      order: [['created_at', 'DESC']],
      limit: 100
    })

    // Get document templates
    const templates = await StateDocumentTemplate.findAll({
      where: { 
        state_committee_id: stateId,
        is_active: true
      },
      order: [['created_at', 'DESC']]
    })

    // Calculate statistics
    const totalDocuments = await StateDocument.count({
      where: { state_committee_id: stateId }
    })

    // Documents by type
    const documentsByType = await StateDocument.findAll({
      where: { state_committee_id: stateId },
      attributes: [
        'document_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['document_type']
    })

    const documentsTypeCount = {}
    documentsByType.forEach(item => {
      documentsTypeCount[item.document_type] = parseInt(item.dataValues.count)
    })

    const totalInvoices = await StateInvoice.count({
      where: { state_committee_id: stateId }
    })

    // Invoices by status
    const invoicesByStatus = await StateInvoice.findAll({
      where: { state_committee_id: stateId },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    })

    const invoicesStatusCount = { draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0 }
    invoicesByStatus.forEach(item => {
      invoicesStatusCount[item.status] = parseInt(item.dataValues.count)
    })

    // Financial summary
    const financialSummary = await StateInvoice.findOne({
      where: { state_committee_id: stateId },
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'total_invoiced'],
        [Sequelize.fn('SUM', 
          Sequelize.literal('CASE WHEN status = "paid" THEN total_amount ELSE 0 END')
        ), 'total_paid'],
        [Sequelize.fn('SUM', 
          Sequelize.literal('CASE WHEN status IN ("sent", "overdue") THEN total_amount ELSE 0 END')
        ), 'total_outstanding'],
        [Sequelize.fn('SUM', 
          Sequelize.literal('CASE WHEN status = "overdue" THEN total_amount ELSE 0 END')
        ), 'overdue_amount']
      ]
    })

    const financial = {
      total_invoiced: parseFloat(financialSummary?.dataValues.total_invoiced) || 0,
      total_paid: parseFloat(financialSummary?.dataValues.total_paid) || 0,
      total_outstanding: parseFloat(financialSummary?.dataValues.total_outstanding) || 0,
      overdue_amount: parseFloat(financialSummary?.dataValues.overdue_amount) || 0
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await StateDocument.count({
      where: {
        state_committee_id: stateId,
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    }) + await StateInvoice.count({
      where: {
        state_committee_id: stateId,
        created_at: {
          [Op.gte]: sevenDaysAgo
        }
      }
    })

    const stats = {
      total_documents: totalDocuments,
      documents_by_type: documentsTypeCount,
      total_invoices: totalInvoices,
      invoices_by_status: invoicesStatusCount,
      financial_summary: financial,
      recent_activity: recentActivity
    }

    res.json({
      documents,
      invoices,
      templates,
      stats
    })

  } catch (error) {
    console.error('Error fetching state documents data:', error)
    res.status(500).json({ message: 'Internal server error' })
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
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Use multer middleware
    upload.single('document')(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err.message })
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' })
      }

      const {
        title,
        description,
        document_type,
        related_entity_type,
        related_entity_id,
        is_public
      } = req.body

      try {
        const document = await StateDocument.create({
          state_committee_id: stateCommittee.id,
          title,
          description: description || null,
          file_name: req.file.originalname,
          file_path: req.file.path,
          file_size: req.file.size,
          file_type: req.file.mimetype,
          document_type,
          related_entity_type: related_entity_type || null,
          related_entity_id: related_entity_id || null,
          is_public: is_public === 'true',
          created_by: userId
        })

        // Fetch document with user data
        const documentWithUser = await StateDocument.findByPk(document.id, {
          include: [
            {
              model: User,
              as: 'created_by_user',
              attributes: ['id', 'username', 'email']
            }
          ]
        })

        res.status(201).json({
          document: documentWithUser,
          message: 'Document uploaded successfully'
        })

      } catch (dbError) {
        // Delete uploaded file if database operation fails
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
        }
        throw dbError
      }
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    res.status(500).json({ message: 'Internal server error' })
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
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and update document
    const document = await StateDocument.findOne({
      where: {
        id: documentId,
        state_committee_id: stateCommittee.id
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    await document.update(updateData)

    // Fetch updated document with user data
    const updatedDocument = await StateDocument.findByPk(document.id, {
      include: [
        {
          model: User,
          as: 'created_by_user',
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
    res.status(500).json({ message: 'Internal server error' })
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
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and delete document
    const document = await StateDocument.findOne({
      where: {
        id: documentId,
        state_committee_id: stateCommittee.id
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path)
    }

    await document.destroy()

    res.json({ message: 'Document deleted successfully' })

  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create invoice
const createStateInvoice = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      invoice_type,
      recipient_type,
      recipient_id,
      recipient_name,
      amount,
      tax_amount,
      due_date,
      description
    } = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Generate invoice number
    const invoiceCount = await StateInvoice.count({
      where: { state_committee_id: stateCommittee.id }
    })
    
    const invoiceNumber = `INV-${stateCommittee.state_code}-${Date.now()}-${(invoiceCount + 1).toString().padStart(3, '0')}`

    const totalAmount = parseFloat(amount) + (parseFloat(tax_amount) || 0)

    const invoice = await StateInvoice.create({
      state_committee_id: stateCommittee.id,
      invoice_number: invoiceNumber,
      invoice_type,
      recipient_type,
      recipient_id: parseInt(recipient_id),
      recipient_name,
      amount: parseFloat(amount),
      tax_amount: tax_amount ? parseFloat(tax_amount) : null,
      total_amount: totalAmount,
      due_date: new Date(due_date),
      status: 'draft',
      description: description || null
    })

    res.status(201).json({
      invoice,
      message: 'Invoice created successfully'
    })

  } catch (error) {
    console.error('Error creating invoice:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update invoice
const updateStateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params
    const userId = req.user.id
    const updateData = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and update invoice
    const invoice = await StateInvoice.findOne({
      where: {
        id: invoiceId,
        state_committee_id: stateCommittee.id
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    // Recalculate total if amount or tax changes
    if (updateData.amount !== undefined || updateData.tax_amount !== undefined) {
      const amount = updateData.amount !== undefined ? parseFloat(updateData.amount) : invoice.amount
      const taxAmount = updateData.tax_amount !== undefined ? parseFloat(updateData.tax_amount) || 0 : (invoice.tax_amount || 0)
      updateData.total_amount = amount + taxAmount
    }

    await invoice.update(updateData)

    res.json({
      invoice,
      message: 'Invoice updated successfully'
    })

  } catch (error) {
    console.error('Error updating invoice:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete invoice
const deleteStateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params
    const userId = req.user.id
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Find and delete invoice
    const invoice = await StateInvoice.findOne({
      where: {
        id: invoiceId,
        state_committee_id: stateCommittee.id
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    await invoice.destroy()

    res.json({ message: 'Invoice deleted successfully' })

  } catch (error) {
    console.error('Error deleting invoice:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Create document template
const createDocumentTemplate = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, description, template_type, template_content, variables } = req.body
    
    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })
    
    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    const template = await StateDocumentTemplate.create({
      state_committee_id: stateCommittee.id,
      name,
      description: description || null,
      template_type,
      template_content,
      variables: JSON.stringify(variables || []),
      is_active: true
    })

    res.status(201).json({
      template,
      message: 'Document template created successfully'
    })

  } catch (error) {
    console.error('Error creating document template:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getStateDocumentsData,
  uploadStateDocument,
  updateStateDocument,
  deleteStateDocument,
  createStateInvoice,
  updateStateInvoice,
  deleteStateInvoice,
  createDocumentTemplate
}