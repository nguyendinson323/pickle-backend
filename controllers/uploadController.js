const cloudinary = require('cloudinary').v2
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Configure multer for documents (allows images and PDFs)
const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only image files and PDFs are allowed'), false)
    }
  }
})

// Configure multer for documents and certificates (allows PDFs)
const uploadCertification = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for certifications
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only image files and PDFs are allowed'), false)
    }
  }
})

const uploadClubLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'club_logos',
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' },
            { radius: 'max' } // Makes it circular
          ],
          format: 'png'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    })
  }
}

const uploadPlayerPhoto = async (req, res) => {
  try {
    console.log('🔄 Player photo upload request received')
    console.log('📁 File:', req.file ? 'File present' : 'No file')
    console.log('👤 User:', req.user ? `User ID: ${req.user.id}` : 'No user')
    console.log('📋 Headers:', req.headers.authorization ? 'Auth header present' : 'No auth header')

    if (!req.file) {
      console.log('❌ Upload failed: No file provided')
      return res.status(400).json({ message: 'No file provided' })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'player_photos',
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' },
            { radius: 'max' } // Makes it circular
          ],
          format: 'png'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    })
  }
}

const uploadPlayerDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Handle different file types differently
    const isImage = req.file.mimetype.startsWith('image/')
    const isPDF = req.file.mimetype === 'application/pdf'

    let uploadOptions = {
      folder: 'player_documents',
      quality: 'auto'
    }

    if (isImage) {
      uploadOptions.transformation = [
        { width: 800, height: 600, crop: 'limit', quality: 'auto' }
      ]
      uploadOptions.format = 'jpg'
    } else if (isPDF) {
      // For PDFs, Cloudinary will store them as-is
      uploadOptions.resource_type = 'raw'
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width || null,
      height: result.height || null
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      message: 'Upload failed',
      error: error.message
    })
  }
}

const uploadStateLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'state_logos',
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' },
            { radius: 'max' } // Makes it circular
          ],
          format: 'png'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    })
  }
}

const uploadPartnerLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'partner_logos',
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' },
            { radius: 'max' } // Makes it circular
          ],
          format: 'png'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    })
  }
}

const uploadCoachPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'coach_photos',
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' },
            { radius: 'max' } // Makes it circular
          ],
          format: 'png'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    })
  }
}

const uploadCoachDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Handle different file types differently
    const isImage = req.file.mimetype.startsWith('image/')
    const isPDF = req.file.mimetype === 'application/pdf'

    let uploadOptions = {
      folder: 'coach_documents',
      quality: 'auto'
    }

    if (isImage) {
      uploadOptions.transformation = [
        { width: 800, height: 600, crop: 'limit', quality: 'auto' }
      ]
      uploadOptions.format = 'jpg'
    } else if (isPDF) {
      // For PDFs, Cloudinary will store them as-is
      uploadOptions.resource_type = 'raw'
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width || null,
      height: result.height || null
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      message: 'Upload failed',
      error: error.message
    })
  }
}

const uploadAdminPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'admin_photos',
          transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto' },
            { radius: 'max' } // Makes it circular
          ],
          format: 'png'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      message: 'Upload failed',
      error: error.message
    })
  }
}

const uploadCoachCertification = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' })
    }

    // Handle different file types differently
    const isImage = req.file.mimetype.startsWith('image/')
    const isPDF = req.file.mimetype === 'application/pdf'

    let uploadOptions = {
      folder: 'coach_certifications',
      quality: 'auto'
    }

    if (isImage) {
      uploadOptions.transformation = [
        { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
      ]
      uploadOptions.format = 'jpg'
    } else if (isPDF) {
      // For PDFs, Cloudinary will store them as-is
      uploadOptions.resource_type = 'raw'
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(req.file.buffer)
    })

    res.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width || null,
      height: result.height || null
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
  uploadDocument: uploadDocument.single('file'),
  uploadCertification: uploadCertification.single('file'),
  uploadClubLogo,
  uploadPlayerPhoto,
  uploadPlayerDocument,
  uploadStateLogo,
  uploadPartnerLogo,
  uploadCoachPhoto,
  uploadCoachDocument,
  uploadCoachCertification,
  uploadAdminPhoto
}