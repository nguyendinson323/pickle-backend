const { StateCommittee, Payment, User, Tournament, Player, Club, Coach } = require('../db/models')
const { Op, Sequelize } = require('sequelize')

// Get state membership/affiliation data
const getStateMembershipData = async (req, res) => {
  try {
    const userId = req.user.id

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'is_active', 'created_at']
        }
      ]
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Calculate affiliation status
    const currentDate = new Date()
    const affiliationExpiresAt = new Date(stateCommittee.affiliation_expires_at)
    const isActive = affiliationExpiresAt > currentDate
    const daysRemaining = Math.ceil((affiliationExpiresAt - currentDate) / (1000 * 60 * 60 * 24))

    // Get payment history for affiliation fees
    const paymentHistory = await Payment.findAll({
      where: {
        user_id: userId,
        payment_type: 'affiliation'
      },
      order: [['created_at', 'DESC']],
      limit: 10
    })

    // Get state statistics
    const stateId = stateCommittee.state_id

    // Count registered players in the state
    const registeredPlayers = await Player.count({
      where: { state_id: stateId }
    })

    // Count affiliated clubs in the state
    const affiliatedClubs = await Club.count({
      where: { state_id: stateId }
    })

    // Count certified coaches in the state
    const certifiedCoaches = await Coach.count({
      where: { state_id: stateId }
    })

    // Count tournaments organized by the state
    const annualTournaments = await Tournament.count({
      where: {
        organizer_type: 'state',
        organizer_id: stateCommittee.id,
        created_at: {
          [Op.gte]: new Date(new Date().getFullYear(), 0, 1) // This year
        }
      }
    })

    // Get recent activities (tournaments created this year)
    const recentActivities = await Tournament.findAll({
      where: {
        organizer_type: 'state',
        organizer_id: stateCommittee.id
      },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'start_date', 'created_at', 'status']
    })

    // Calculate annual affiliation fee (fixed for states)
    const annualAffiliationFee = 2500.00 // $2500 annual fee for state committees

    // Compliance requirements status
    const complianceStatus = {
      annualReport: {
        completed: true,
        completedDate: '2024-11-30',
        dueDate: '2024-12-01'
      },
      insurance: {
        valid: true,
        validUntil: '2025-12-31'
      },
      boardElections: {
        completed: true,
        completedDate: '2024-10-15',
        nextDue: '2025-10-15'
      },
      quarterlyReview: {
        completed: false,
        dueDate: '2025-01-15'
      }
    }

    // Build response
    const membershipData = {
      stateCommittee: {
        id: stateCommittee.id,
        name: stateCommittee.name,
        president_name: stateCommittee.president_name,
        president_title: stateCommittee.president_title,
        state_id: stateCommittee.state_id,
        logo_url: stateCommittee.logo_url,
        website: stateCommittee.website,
        social_media: stateCommittee.social_media,
        institutional_email: stateCommittee.institutional_email,
        phone: stateCommittee.phone,
        affiliation_expires_at: stateCommittee.affiliation_expires_at,
        created_at: stateCommittee.created_at
      },
      affiliationStatus: {
        isActive,
        expiresAt: stateCommittee.affiliation_expires_at,
        daysRemaining: Math.max(0, daysRemaining),
        memberSince: stateCommittee.created_at,
        annualFee: annualAffiliationFee
      },
      stateStatistics: {
        registeredPlayers,
        affiliatedClubs,
        certifiedCoaches,
        annualTournaments
      },
      paymentHistory,
      recentActivities,
      complianceStatus
    }

    res.json(membershipData)
  } catch (error) {
    console.error('Error fetching state membership data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Renew state affiliation
const renewStateAffiliation = async (req, res) => {
  try {
    const userId = req.user.id
    const { paymentData } = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Calculate new affiliation period (1 year from current expiration or today, whichever is later)
    const currentDate = new Date()
    const currentExpiration = new Date(stateCommittee.affiliation_expires_at)
    const startDate = currentExpiration > currentDate ? currentExpiration : currentDate
    const newExpirationDate = new Date(startDate)
    newExpirationDate.setFullYear(newExpirationDate.getFullYear() + 1)

    // Create payment record
    const annualFee = 2500.00
    const payment = await Payment.create({
      user_id: userId,
      amount: annualFee,
      payment_type: 'affiliation',
      status: 'completed',
      stripe_payment_id: `pi_test_${Date.now()}`, // Mock Stripe payment ID for development
      metadata: JSON.stringify({
        state_committee_id: stateCommittee.id,
        affiliation_renewal: true,
        previous_expiration: stateCommittee.affiliation_expires_at,
        new_expiration: newExpirationDate
      })
    })

    // Update affiliation expiration
    await StateCommittee.update(
      { affiliation_expires_at: newExpirationDate },
      { where: { id: stateCommittee.id } }
    )

    res.json({
      message: 'State affiliation renewed successfully',
      payment,
      newExpirationDate,
      affiliationStatus: {
        isActive: true,
        expiresAt: newExpirationDate,
        daysRemaining: 365
      }
    })
  } catch (error) {
    console.error('Error renewing state affiliation:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Submit compliance report
const submitComplianceReport = async (req, res) => {
  try {
    const userId = req.user.id
    const { reportType, reportData } = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // In a real implementation, this would save the report to a documents table
    // For now, we'll just simulate the submission

    const supportedReportTypes = ['annual', 'quarterly', 'insurance', 'board_elections']
    if (!supportedReportTypes.includes(reportType)) {
      return res.status(400).json({ message: 'Invalid report type' })
    }

    // Simulate report submission
    const reportSubmission = {
      id: Date.now(),
      state_committee_id: stateCommittee.id,
      report_type: reportType,
      submitted_at: new Date(),
      status: 'submitted',
      data: reportData
    }

    res.json({
      message: `${reportType} report submitted successfully`,
      submission: reportSubmission
    })
  } catch (error) {
    console.error('Error submitting compliance report:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Update state committee information
const updateStateCommitteeInfo = async (req, res) => {
  try {
    const userId = req.user.id
    const updateData = req.body

    // Get state committee profile
    const stateCommittee = await StateCommittee.findOne({
      where: { user_id: userId }
    })

    if (!stateCommittee) {
      return res.status(404).json({ message: 'State committee profile not found' })
    }

    // Allowed fields to update
    const allowedFields = [
      'president_name',
      'president_title',
      'logo_url',
      'website',
      'social_media',
      'institutional_email',
      'phone'
    ]

    // Filter update data to only include allowed fields
    const filteredUpdateData = {}
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field]
      }
    })

    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' })
    }

    // Update the state committee
    await StateCommittee.update(filteredUpdateData, {
      where: { id: stateCommittee.id }
    })

    // Get updated state committee
    const updatedStateCommittee = await StateCommittee.findByPk(stateCommittee.id)

    res.json({
      message: 'State committee information updated successfully',
      stateCommittee: updatedStateCommittee
    })
  } catch (error) {
    console.error('Error updating state committee information:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Get affiliation requirements and fees
const getAffiliationRequirements = async (req, res) => {
  try {
    const requirements = {
      annualFee: 2500.00,
      currency: 'USD',
      paymentSchedule: 'Annual',
      benefits: [
        'Access to national tournament hosting rights',
        'Annual grant eligibility for development programs',
        'Voting rights in national federation decisions',
        'Coach certification program administration',
        'State championship sanctioning authority',
        'Technical and compliance support',
        'State microsite and communication tools'
      ],
      complianceRequirements: [
        {
          name: 'Annual Report',
          description: 'Comprehensive state activity and financial report',
          dueDate: 'December 1st',
          frequency: 'Annual'
        },
        {
          name: 'Insurance Documentation',
          description: 'Valid liability insurance certificate',
          dueDate: 'Before expiration',
          frequency: 'Annual'
        },
        {
          name: 'Board Elections',
          description: 'Democratic board election documentation',
          dueDate: 'October 15th',
          frequency: 'Annual'
        },
        {
          name: 'Quarterly Review',
          description: 'Financial and operational quarterly reports',
          dueDate: '15th of each quarter end',
          frequency: 'Quarterly'
        }
      ]
    }

    res.json(requirements)
  } catch (error) {
    console.error('Error fetching affiliation requirements:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getStateMembershipData,
  renewStateAffiliation,
  submitComplianceReport,
  updateStateCommitteeInfo,
  getAffiliationRequirements
}