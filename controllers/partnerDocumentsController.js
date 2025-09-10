const { 
  Partner, Document, Payment, User
} = require('../db/models')
const { Op, fn, col, literal } = require('sequelize')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('cloudinary').v2

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Use Cloudinary storage for partner documents
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'partner-documents',
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif'],
    resource_type: 'auto'
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only PDF, Word documents, and images are allowed.'), false)
  }
}

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

const getPartnerDocuments = async (req, res) => {
  try {
    const partnerId = req.user.id

    // Get documents for this partner user
    const documents = await Document.findAll({
      where: { owner_id: partnerId },
      include: [{
        model: User,
        as: 'owner',
        attributes: ['username', 'email']
      }],
      order: [['created_at', 'DESC']]
    })

    // Get payments (invoices) for this partner
    const invoices = await Payment.findAll({
      where: { 
        user_id: partnerId
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['username', 'email']
      }],
      order: [['created_at', 'DESC']]
    })

    // Calculate statistics
    const totalDocuments = documents.length
    const pendingSignatures = 0 // Not implemented in simple Document model
    const expiringSoon = 0 // Not implemented in simple Document model

    const totalInvoices = invoices.length
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length
    const overdueInvoices = invoices.filter(inv => 
      inv.status === 'pending' && 
      new Date(inv.created_at).getTime() < Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days old
    ).length

    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0)
    const paidInvoiceAmount = invoices
      .filter(inv => inv.status === 'completed')
      .reduce((sum, inv) => sum + parseFloat(inv.amount), 0)

    const stats = {
      total_documents: totalDocuments,
      pending_signatures: pendingSignatures,
      expiring_soon: expiringSoon,
      total_invoices: totalInvoices,
      pending_invoices: pendingInvoices,
      overdue_invoices: overdueInvoices,
      total_invoice_amount: totalInvoiceAmount,
      paid_invoice_amount: paidInvoiceAmount
    }

    // Format documents for frontend (map existing Document model to expected interface)
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_name: doc.title,
      document_type: doc.file_type === 'application/pdf' ? 'contract' : 'other',
      file_url: doc.document_url,
      file_size: 0, // Not tracked in simple model
      mime_type: doc.file_type,
      uploaded_at: doc.created_at,
      is_signed: false, // Not implemented in simple model
      signed_at: null,
      expiry_date: null, // Not implemented in simple model
      status: 'active',
      description: doc.description,
      uploaded_by_name: doc.owner ? doc.owner.username : 'System'
    }))

    // Format invoices for frontend (map Payment model to expected interface)
    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoice_number: `INV-${inv.id}`,
      invoice_date: inv.created_at.toISOString().split('T')[0],
      due_date: new Date(inv.created_at.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      amount: parseFloat(inv.amount),
      tax_amount: 0,
      total_amount: parseFloat(inv.amount),
      status: inv.status === 'completed' ? 'paid' : 'pending',
      description: `Payment for ${inv.payment_type || 'service'}`,
      line_items: [{
        id: 1,
        description: `${inv.payment_type || 'service'} payment`,
        quantity: 1,
        unit_price: parseFloat(inv.amount),
        total_price: parseFloat(inv.amount)
      }],
      payment_date: inv.status === 'completed' ? inv.created_at : null,
      payment_method: inv.payment_method || 'unknown',
      document_url: null
    }))

    res.json({
      documents: formattedDocuments,
      invoices: formattedInvoices,
      stats
    })

  } catch (error) {
    console.error('Error fetching partner documents:', error)
    res.status(500).json({ message: 'Failed to fetch partner documents' })
  }
}

const uploadPartnerDocument = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { document_name, description } = req.body
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const document = await Document.create({
      owner_id: partnerId,
      title: document_name || req.file.originalname,
      description: description || null,
      document_url: req.file.path, // Cloudinary URL
      file_type: req.file.mimetype,
      is_public: false
    })

    const createdDocument = await Document.findByPk(document.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['username', 'email']
      }]
    })

    const formattedDocument = {
      id: createdDocument.id,
      document_name: createdDocument.title,
      document_type: createdDocument.file_type === 'application/pdf' ? 'contract' : 'other',
      file_url: createdDocument.document_url,
      file_size: req.file.size,
      mime_type: createdDocument.file_type,
      uploaded_at: createdDocument.created_at,
      is_signed: false,
      signed_at: null,
      expiry_date: null,
      status: 'active',
      description: createdDocument.description,
      uploaded_by_name: createdDocument.owner ? createdDocument.owner.username : 'System'
    }

    res.status(201).json(formattedDocument)

  } catch (error) {
    console.error('Error uploading document:', error)
    res.status(500).json({ message: 'Failed to upload document' })
  }
}

const signPartnerDocument = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { documentId } = req.params

    const document = await Document.findOne({
      where: { 
        id: documentId,
        owner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // For simple Document model, we just return success without actual signing
    // In a real implementation, you might add a signed field to the Document model

    const updatedDocument = await Document.findByPk(document.id, {
      include: [{
        model: User,
        as: 'owner',
        attributes: ['username', 'email']
      }]
    })

    const formattedDocument = {
      id: updatedDocument.id,
      document_name: updatedDocument.title,
      document_type: updatedDocument.file_type === 'application/pdf' ? 'contract' : 'other',
      file_url: updatedDocument.document_url,
      file_size: 0,
      mime_type: updatedDocument.file_type,
      uploaded_at: updatedDocument.created_at,
      is_signed: true, // Simulate signing
      signed_at: new Date(),
      expiry_date: null,
      status: 'active',
      description: updatedDocument.description,
      uploaded_by_name: updatedDocument.owner ? updatedDocument.owner.username : 'System'
    }

    res.json(formattedDocument)

  } catch (error) {
    console.error('Error signing document:', error)
    res.status(500).json({ message: 'Failed to sign document' })
  }
}

const downloadPartnerDocument = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { documentId } = req.params

    const document = await Document.findOne({
      where: { 
        id: documentId,
        owner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // For Cloudinary URLs and external links, redirect directly
    if (document.document_url.startsWith('http')) {
      return res.redirect(document.document_url)
    }

    // This shouldn't happen with Cloudinary, but keeping as fallback
    return res.status(404).json({ message: 'Invalid document URL' })

  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({ message: 'Failed to download document' })
  }
}

const getPartnerDocument = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { documentId } = req.params

    const document = await Document.findOne({
      where: { 
        id: documentId,
        owner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    res.json({
      id: document.id,
      document_name: document.title,
      document_type: document.file_type === 'application/pdf' ? 'contract' : 'other',
      mime_type: document.file_type
    })

  } catch (error) {
    console.error('Error fetching document:', error)
    res.status(500).json({ message: 'Failed to fetch document' })
  }
}

const deletePartnerDocument = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { documentId } = req.params

    const document = await Document.findOne({
      where: { 
        id: documentId,
        owner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Delete file from Cloudinary if it's a Cloudinary URL
    if (document.document_url.includes('cloudinary.com')) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = document.document_url.split('/')
        const fileWithExt = urlParts[urlParts.length - 1]
        const publicId = `partner-documents/${fileWithExt.split('.')[0]}`
        await cloudinary.uploader.destroy(publicId)
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError)
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    await document.destroy()

    res.json({ message: 'Document deleted successfully' })

  } catch (error) {
    console.error('Error deleting document:', error)
    res.status(500).json({ message: 'Failed to delete document' })
  }
}

const downloadPartnerInvoice = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { invoiceId } = req.params

    const invoice = await Payment.findOne({
      where: { 
        id: invoiceId,
        user_id: partnerId
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    // Since Payment model doesn't have document_url, we simulate invoice generation
    res.status(400).json({ message: 'Invoice PDF generation not implemented' })

  } catch (error) {
    console.error('Error downloading invoice:', error)
    res.status(500).json({ message: 'Failed to download invoice' })
  }
}

const getPartnerInvoice = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { invoiceId } = req.params

    const invoice = await Payment.findOne({
      where: { 
        id: invoiceId,
        user_id: partnerId
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    res.json({
      id: invoice.id,
      invoice_number: `INV-${invoice.id}`
    })

  } catch (error) {
    console.error('Error fetching invoice:', error)
    res.status(500).json({ message: 'Failed to fetch invoice' })
  }
}

const markInvoiceAsPaid = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { invoiceId } = req.params
    const { payment_method, payment_date } = req.body

    const invoice = await Payment.findOne({
      where: { 
        id: invoiceId,
        user_id: partnerId
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    if (invoice.status === 'completed') {
      return res.status(400).json({ message: 'Invoice is already paid' })
    }

    await invoice.update({
      status: 'completed',
      payment_method: payment_method || invoice.payment_method
    })

    // Reload to get updated data
    await invoice.reload()

    const formattedInvoice = {
      id: invoice.id,
      invoice_number: `INV-${invoice.id}`,
      invoice_date: invoice.created_at.toISOString().split('T')[0],
      due_date: new Date(invoice.created_at.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      amount: parseFloat(invoice.amount),
      tax_amount: 0,
      total_amount: parseFloat(invoice.amount),
      status: 'paid',
      description: `Payment for ${invoice.payment_type || 'service'}`,
      line_items: [{
        id: 1,
        description: `${invoice.payment_type || 'service'} payment`,
        quantity: 1,
        unit_price: parseFloat(invoice.amount),
        total_price: parseFloat(invoice.amount)
      }],
      payment_date: invoice.created_at,
      payment_method: invoice.payment_method,
      document_url: null
    }

    res.json(formattedInvoice)

  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    res.status(500).json({ message: 'Failed to mark invoice as paid' })
  }
}

module.exports = {
  getPartnerDocuments,
  uploadPartnerDocument: [upload.single('file'), uploadPartnerDocument],
  signPartnerDocument,
  downloadPartnerDocument,
  getPartnerDocument,
  deletePartnerDocument,
  downloadPartnerInvoice,
  getPartnerInvoice,
  markInvoiceAsPaid
}