const { Document, Player, Club, Tournament, CoachCertification, User, State } = require('../db/models');
const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

const digitalCredentialsController = {
  // Get player's digital credentials
  async getPlayerCredentials(req, res) {
    try {
      const userId = req.user.id;

      // Get documents that serve as digital credentials
      const credentials = await Document.findAll({
        where: { 
          owner_id: userId,
          is_public: true // Only public documents are considered credentials
        },
        order: [['created_at', 'DESC']]
      });

      // Format credentials with additional metadata
      const formattedCredentials = credentials.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        document_url: doc.document_url,
        file_type: doc.file_type,
        credential_type: doc.file_type === 'application/pdf' ? 'certificate' : 'document',
        issue_date: doc.created_at,
        is_active: true,
        qr_code_data: doc.id.toString(), // Use document ID as QR code data
        created_at: doc.created_at
      }));

      res.json(formattedCredentials);
    } catch (error) {
      console.error('Get player credentials error:', error);
      res.status(500).json({ error: 'Failed to get credentials' });
    }
  },

  // Get player profile for credential creation
  async getPlayerProfile(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Player,
            as: 'player',
            include: [
              {
                model: Club,
                as: 'club',
                attributes: ['id', 'name', 'logo_url']
              },
              {
                model: State,
                as: 'state',
                attributes: ['id', 'name', 'short_code']
              }
            ]
          }
        ]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player not found' });
      }

      const profile = {
        id: user.player.id,
        user_id: user.id,
        full_name: user.player.full_name,
        email: user.email,
        skill_level: user.player.nrtp_level || 1.0,
        profile_image: user.player.profile_photo_url,
        club: user.player.club,
        state: user.player.state,
        nationality: user.player.nationality
      };

      res.json(profile);
    } catch (error) {
      console.error('Get player profile error:', error);
      res.status(500).json({ error: 'Failed to get player profile' });
    }
  },

  // Get available credential templates
  async getCredentialTemplates(req, res) {
    try {
      // Mock templates - in a real app these would come from database
      const templates = [
        {
          type: 'player_card',
          name: 'Player ID Card',
          description: 'Official player identification card with QR code verification',
          required_fields: ['full_name', 'skill_level', 'club_name'],
          template_data: {
            background_color: '#1e40af',
            text_color: '#ffffff',
            logo_position: 'top-right'
          }
        },
        {
          type: 'tournament_badge',
          name: 'Tournament Participation Badge',
          description: 'Digital badge for tournament participation and achievements',
          required_fields: ['tournament_name', 'participation_date', 'result'],
          template_data: {
            background_color: '#059669',
            text_color: '#ffffff',
            badge_style: 'circular'
          }
        },
        {
          type: 'certification',
          name: 'Skill Certification',
          description: 'Official skill level or coaching certification',
          required_fields: ['certification_name', 'issuer', 'issue_date', 'expiry_date'],
          template_data: {
            background_color: '#7c3aed',
            text_color: '#ffffff',
            seal_position: 'bottom-center'
          }
        },
        {
          type: 'membership_card',
          name: 'Club Membership Card',
          description: 'Digital membership card for club or organization',
          required_fields: ['club_name', 'membership_type', 'expiry_date'],
          template_data: {
            background_color: '#dc2626',
            text_color: '#ffffff',
            card_style: 'premium'
          }
        }
      ];

      res.json(templates);
    } catch (error) {
      console.error('Get credential templates error:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  },

  // Create a new digital credential
  async createCredential(req, res) {
    try {
      const userId = req.user.id;
      const {
        credential_type,
        title,
        description,
        document_url,
        file_type
      } = req.body;

      // Create document as digital credential
      const credential = await Document.create({
        owner_id: userId,
        title,
        description: description || null,
        document_url,
        file_type: file_type || 'application/pdf',
        is_public: true // Digital credentials are public for verification
      });

      // Format response
      const formattedCredential = {
        id: credential.id,
        title: credential.title,
        description: credential.description,
        document_url: credential.document_url,
        file_type: credential.file_type,
        credential_type: credential_type,
        issue_date: credential.created_at,
        is_active: true,
        qr_code_data: credential.id.toString(),
        created_at: credential.created_at
      };

      res.status(201).json(formattedCredential);
    } catch (error) {
      console.error('Create credential error:', error);
      res.status(500).json({ error: 'Failed to create credential' });
    }
  },

  // Generate QR code for a credential
  async generateQrCode(req, res) {
    try {
      const { credentialId } = req.params;
      const userId = req.user.id;

      const credential = await Document.findOne({
        where: {
          id: credentialId,
          owner_id: userId
        }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      // Create verification URL with credential ID
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-credential/${credentialId}`;

      // Generate QR code image
      const qrCodeUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 256
      });

      res.json({ 
        qr_code_url: qrCodeUrl,
        verification_url: verificationUrl
      });
    } catch (error) {
      console.error('Generate QR code error:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  },

  // Verify a credential using QR code
  async verifyCredential(req, res) {
    try {
      const { credentialId } = req.params;

      const credential = await Document.findOne({
        where: { 
          id: credentialId,
          is_public: true
        },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'username', 'email', 'role'],
            include: [
              {
                model: Player,
                as: 'player',
                attributes: ['id', 'full_name', 'nrtp_level', 'nationality'],
                include: [
                  {
                    model: Club,
                    as: 'club',
                    attributes: ['id', 'name', 'logo_url']
                  },
                  {
                    model: State,
                    as: 'state',
                    attributes: ['id', 'name', 'short_code']
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!credential) {
        return res.json({
          valid: false,
          credential: null,
          message: 'Invalid credential ID'
        });
      }

      // Format credential data for verification
      const verificationData = {
        id: credential.id,
        title: credential.title,
        description: credential.description,
        document_url: credential.document_url,
        file_type: credential.file_type,
        issue_date: credential.created_at,
        owner: {
          id: credential.owner.id,
          username: credential.owner.username,
          email: credential.owner.email,
          role: credential.owner.role,
          player: credential.owner.player
        }
      };

      res.json({
        valid: true,
        credential: verificationData,
        message: 'Credential is valid'
      });
    } catch (error) {
      console.error('Verify credential error:', error);
      res.status(500).json({ error: 'Failed to verify credential' });
    }
  },

  // Update credential status (activate/deactivate)
  async updateCredentialStatus(req, res) {
    try {
      const { credentialId } = req.params;
      const { is_public } = req.body;
      const userId = req.user.id;

      const credential = await Document.findOne({
        where: {
          id: credentialId,
          owner_id: userId
        }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      await credential.update({ is_public });

      // Format response
      const formattedCredential = {
        id: credential.id,
        title: credential.title,
        description: credential.description,
        document_url: credential.document_url,
        file_type: credential.file_type,
        credential_type: credential.file_type === 'application/pdf' ? 'certificate' : 'document',
        issue_date: credential.created_at,
        is_active: credential.is_public,
        qr_code_data: credential.id.toString(),
        created_at: credential.created_at
      };

      res.json(formattedCredential);
    } catch (error) {
      console.error('Update credential status error:', error);
      res.status(500).json({ error: 'Failed to update credential status' });
    }
  },

  // Delete a credential
  async deleteCredential(req, res) {
    try {
      const { credentialId } = req.params;
      const userId = req.user.id;

      const credential = await Document.findOne({
        where: {
          id: credentialId,
          owner_id: userId
        }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      await credential.destroy();

      res.json({ message: 'Credential deleted successfully' });
    } catch (error) {
      console.error('Delete credential error:', error);
      res.status(500).json({ error: 'Failed to delete credential' });
    }
  }
};

module.exports = digitalCredentialsController;