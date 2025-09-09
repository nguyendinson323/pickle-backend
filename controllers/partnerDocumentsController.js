const { 
  Partner, PartnerDocument, Invoice, InvoiceLineItem, User
} = require('../db/models')
const { Op, fn, col, literal } = require('sequelize')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/partner-documents'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname))
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

    // Get documents
    const documents = await PartnerDocument.findAll({
      where: { partner_id: partnerId },
      include: [{
        model: User,
        as: 'UploadedBy',
        attributes: ['first_name', 'last_name'],
        required: false
      }],
      order: [['uploaded_at', 'DESC']]
    })

    // Get invoices
    const invoices = await Invoice.findAll({
      where: { 
        partner_id: partnerId,
        invoice_type: 'partner_billing'
      },
      include: [{
        model: InvoiceLineItem,
        as: 'LineItems'
      }],
      order: [['invoice_date', 'DESC']]
    })

    // Calculate statistics
    const totalDocuments = documents.length
    const pendingSignatures = documents.filter(doc => 
      doc.document_type === 'contract' && !doc.is_signed
    ).length
    
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const expiringSoon = documents.filter(doc => 
      doc.expiry_date && 
      new Date(doc.expiry_date) <= thirtyDaysFromNow &&
      doc.status === 'active'
    ).length

    const totalInvoices = invoices.length
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length
    const overdueInvoices = invoices.filter(inv => 
      inv.status === 'pending' && new Date(inv.due_date) < new Date()
    ).length

    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0)
    const paidInvoiceAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0)

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

    // Format documents for frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      document_name: doc.document_name,
      document_type: doc.document_type,
      file_url: doc.file_url,
      file_size: doc.file_size,
      mime_type: doc.mime_type,
      uploaded_at: doc.uploaded_at,
      is_signed: doc.is_signed,
      signed_at: doc.signed_at,
      expiry_date: doc.expiry_date,
      status: doc.status,
      description: doc.description,
      uploaded_by_name: doc.UploadedBy ? 
        `${doc.UploadedBy.first_name} ${doc.UploadedBy.last_name}` : 
        'System'
    }))

    // Format invoices for frontend
    const formattedInvoices = invoices.map(inv => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      invoice_date: inv.invoice_date,
      due_date: inv.due_date,
      amount: parseFloat(inv.amount),
      tax_amount: parseFloat(inv.tax_amount),
      total_amount: parseFloat(inv.total_amount),
      status: inv.status,
      description: inv.description,
      line_items: inv.LineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      })),
      payment_date: inv.payment_date,
      payment_method: inv.payment_method,
      document_url: inv.document_url
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
    const { document_name, document_type, description, expiry_date } = req.body
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const document = await PartnerDocument.create({
      partner_id: partnerId,
      document_name: document_name || req.file.originalname,
      document_type: document_type || 'other',
      file_url: `/uploads/partner-documents/${req.file.filename}`,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_at: new Date(),
      is_signed: false,
      expiry_date: expiry_date || null,
      status: 'active',
      description: description || null,
      uploaded_by: req.user.id
    })

    const createdDocument = await PartnerDocument.findByPk(document.id, {
      include: [{
        model: User,
        as: 'UploadedBy',
        attributes: ['first_name', 'last_name']
      }]
    })

    const formattedDocument = {
      id: createdDocument.id,
      document_name: createdDocument.document_name,
      document_type: createdDocument.document_type,
      file_url: createdDocument.file_url,
      file_size: createdDocument.file_size,
      mime_type: createdDocument.mime_type,
      uploaded_at: createdDocument.uploaded_at,
      is_signed: createdDocument.is_signed,
      signed_at: createdDocument.signed_at,
      expiry_date: createdDocument.expiry_date,
      status: createdDocument.status,
      description: createdDocument.description,
      uploaded_by_name: createdDocument.UploadedBy ? 
        `${createdDocument.UploadedBy.first_name} ${createdDocument.UploadedBy.last_name}` : 
        'System'
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

    const document = await PartnerDocument.findOne({
      where: { 
        id: documentId,
        partner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    if (document.is_signed) {
      return res.status(400).json({ message: 'Document is already signed' })
    }

    await document.update({
      is_signed: true,
      signed_at: new Date()
    })

    const updatedDocument = await PartnerDocument.findByPk(document.id, {
      include: [{
        model: User,
        as: 'UploadedBy',
        attributes: ['first_name', 'last_name']
      }]
    })

    const formattedDocument = {
      id: updatedDocument.id,
      document_name: updatedDocument.document_name,
      document_type: updatedDocument.document_type,
      file_url: updatedDocument.file_url,
      file_size: updatedDocument.file_size,
      mime_type: updatedDocument.mime_type,
      uploaded_at: updatedDocument.uploaded_at,
      is_signed: updatedDocument.is_signed,
      signed_at: updatedDocument.signed_at,
      expiry_date: updatedDocument.expiry_date,
      status: updatedDocument.status,
      description: updatedDocument.description,
      uploaded_by_name: updatedDocument.UploadedBy ? 
        `${updatedDocument.UploadedBy.first_name} ${updatedDocument.UploadedBy.last_name}` : 
        'System'
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

    const document = await PartnerDocument.findOne({
      where: { 
        id: documentId,
        partner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    const filePath = path.join(__dirname, '../../', document.file_url)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' })
    }

    res.download(filePath, document.document_name)

  } catch (error) {
    console.error('Error downloading document:', error)
    res.status(500).json({ message: 'Failed to download document' })
  }
}

const getPartnerDocument = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { documentId } = req.params

    const document = await PartnerDocument.findOne({
      where: { 
        id: documentId,
        partner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    res.json({
      id: document.id,
      document_name: document.document_name,
      document_type: document.document_type,
      mime_type: document.mime_type
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

    const document = await PartnerDocument.findOne({
      where: { 
        id: documentId,
        partner_id: partnerId 
      }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '../../', document.file_url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
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

    const invoice = await Invoice.findOne({
      where: { 
        id: invoiceId,
        partner_id: partnerId,
        invoice_type: 'partner_billing'
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    if (!invoice.document_url) {
      return res.status(404).json({ message: 'Invoice PDF not available' })
    }

    const filePath = path.join(__dirname, '../../', invoice.document_url)
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Invoice file not found on server' })
    }

    res.download(filePath, `invoice-${invoice.invoice_number}.pdf`)

  } catch (error) {
    console.error('Error downloading invoice:', error)
    res.status(500).json({ message: 'Failed to download invoice' })
  }
}

const getPartnerInvoice = async (req, res) => {
  try {
    const partnerId = req.user.id
    const { invoiceId } = req.params

    const invoice = await Invoice.findOne({
      where: { 
        id: invoiceId,
        partner_id: partnerId,
        invoice_type: 'partner_billing'
      }
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    res.json({
      id: invoice.id,
      invoice_number: invoice.invoice_number
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

    const invoice = await Invoice.findOne({
      where: { 
        id: invoiceId,
        partner_id: partnerId,
        invoice_type: 'partner_billing'
      },
      include: [{
        model: InvoiceLineItem,
        as: 'LineItems'
      }]
    })

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid' })
    }

    await invoice.update({
      status: 'paid',
      payment_method,
      payment_date: new Date(payment_date)
    })

    const formattedInvoice = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      due_date: invoice.due_date,
      amount: parseFloat(invoice.amount),
      tax_amount: parseFloat(invoice.tax_amount),
      total_amount: parseFloat(invoice.total_amount),
      status: invoice.status,
      description: invoice.description,
      line_items: invoice.LineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      })),
      payment_date: invoice.payment_date,
      payment_method: invoice.payment_method,
      document_url: invoice.document_url
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