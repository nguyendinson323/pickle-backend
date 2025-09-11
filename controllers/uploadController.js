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
    if (!req.file) {
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

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'player_documents',
          transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' }
          ],
          format: 'jpg'
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

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'coach_documents',
          transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto' }
          ],
          format: 'jpg'
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

module.exports = {
  upload: upload.single('file'),
  uploadClubLogo,
  uploadPlayerPhoto,
  uploadPlayerDocument,
  uploadStateLogo,
  uploadPartnerLogo,
  uploadCoachPhoto,
  uploadCoachDocument
}