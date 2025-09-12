const { CoachCertification, Coach } = require('../db/models')

// Get all coach certifications data
const getCoachCertificationsData = async (req, res) => {
  try {
    const coachId = req.user.id
    
    // Get coach profile to get coach table ID
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Get all certifications for this coach
    const certifications = await CoachCertification.findAll({
      where: { coach_id: coach.id },
      order: [['issue_date', 'DESC']]
    })

    // Calculate certification statistics
    const currentDate = new Date()
    const thirtyDaysFromNow = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000))
    
    const totalCertifications = certifications.length
    let activeCertifications = 0
    let expiredCertifications = 0
    let expiringSoon = 0

    certifications.forEach(cert => {
      if (cert.expiry_date) {
        const expiryDate = new Date(cert.expiry_date)
        if (expiryDate < currentDate) {
          expiredCertifications++
        } else {
          activeCertifications++
          if (expiryDate <= thirtyDaysFromNow) {
            expiringSoon++
          }
        }
      } else {
        // No expiry date means it's active
        activeCertifications++
      }
    })

    const stats = {
      total_certifications: totalCertifications,
      active_certifications: activeCertifications,
      expired_certifications: expiredCertifications,
      expiring_soon: expiringSoon
    }

    res.json({
      certifications,
      stats
    })

  } catch (error) {
    console.error('Error fetching coach certifications data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Add new certification
const addCertification = async (req, res) => {
  try {
    const coachId = req.user.id
    const { name, issuer, issue_date, expiry_date, certificate_url } = req.body

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Create new certification
    const certification = await CoachCertification.create({
      coach_id: coach.id,
      name,
      issuer,
      issue_date,
      expiry_date: expiry_date || null,
      certificate_url
    })


    res.json({
      certification: certification.toJSON()
    })

  } catch (error) {
    console.error('Error adding certification:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update certification
const updateCertification = async (req, res) => {
  try {
    const { certificationId } = req.params
    const { name, issuer, issue_date, expiry_date, certificate_url } = req.body
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Find and update the certification
    const certification = await CoachCertification.findOne({
      where: { 
        id: certificationId,
        coach_id: coach.id 
      }
    })

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' })
    }

    // Update certification
    await certification.update({
      name: name || certification.name,
      issuer: issuer || certification.issuer,
      issue_date: issue_date || certification.issue_date,
      expiry_date: expiry_date !== undefined ? expiry_date : certification.expiry_date,
      certificate_url: certificate_url || certification.certificate_url
    })

    res.json({
      certification: certification.toJSON()
    })

  } catch (error) {
    console.error('Error updating certification:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Delete certification
const deleteCertification = async (req, res) => {
  try {
    const { certificationId } = req.params
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Find and delete certification
    const certification = await CoachCertification.findOne({
      where: { 
        id: certificationId,
        coach_id: coach.id 
      }
    })

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' })
    }

    await certification.destroy()

    res.json({ message: 'Certification deleted successfully' })

  } catch (error) {
    console.error('Error deleting certification:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Download certificate PDF
const downloadCertificate = async (req, res) => {
  try {
    const { certificationId } = req.params
    const coachId = req.user.id

    // Get coach profile
    const coach = await Coach.findOne({
      where: { user_id: coachId }
    })

    if (!coach) {
      return res.status(404).json({ message: 'Coach profile not found' })
    }

    // Find certification
    const certification = await CoachCertification.findOne({
      where: { 
        id: certificationId,
        coach_id: coach.id 
      }
    })

    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' })
    }

    if (!certification.certificate_url) {
      return res.status(404).json({ message: 'Certificate file not available' })
    }

    // For now, return the certificate URL for the frontend to handle
    // In production, you would fetch from cloud storage and stream the file
    res.json({
      download_url: certification.certificate_url,
      filename: `${certification.name}_certificate.pdf`
    })

  } catch (error) {
    console.error('Error downloading certificate:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getCoachCertificationsData,
  addCertification,
  updateCertification,
  deleteCertification,
  downloadCertificate
}