const cloudinary = require('cloudinary').v2
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Single unified multer configuration for all file types
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for all files
  },
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, and documents
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('File type not supported'), false)
    }
  }
})

// Single unified upload controller
const uploadFile = async (req, res) => {
  try {
    console.log('🔄 Unified upload request received')
    console.log('📁 File:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'No file')
    console.log('📋 Body:', req.body)

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    const { fileType, fieldName } = req.body

    if (!fileType || !fieldName) {
      return res.status(400).json({
        message: 'Missing required fields: fileType and fieldName'
      })
    }

    // Determine file characteristics
    const isImage = req.file.mimetype.startsWith('image/')
    const isPDF = req.file.mimetype === 'application/pdf'
    const isDocument = isPDF || req.file.mimetype.includes('word')

    // Determine Cloudinary folder based on fileType and fieldName
    let folder
    if (fileType === 'image') {
      folder = 'images'
    } else if (fileType === 'document') {
      folder = 'documents'
    } else {
      folder = 'uploads'
    }

    // Configure upload options
    let uploadOptions = {
      folder: folder,
      quality: 'auto'
    }

    if (isImage && fileType === 'image') {
      // For profile photos and logos - apply transformations
      uploadOptions.transformation = [
        { width: 300, height: 300, crop: 'fill', quality: 'auto' }
      ]
      uploadOptions.format = 'png'
    } else if (isImage && fileType === 'document') {
      // For document images - optimize but keep readable
      uploadOptions.transformation = [
        { width: 800, height: 600, crop: 'limit', quality: 'auto' }
      ]
      uploadOptions.format = 'jpg'
    } else if (isDocument) {
      // For PDFs and docs - store as raw files
      uploadOptions.resource_type = 'raw'
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('✅ Upload successful:', result.secure_url)
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    // Return standardized response
    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width || null,
      height: result.height || null,
      resource_type: result.resource_type || 'image',
      format: result.format
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      message: 'Upload failed',
      error: error.message
    })
  }
}

module.exports = {
  upload: upload.single('file'),
  uploadFile
}