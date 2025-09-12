const { DigitalCredential, DigitalCredentialTemplate, Player, User, State, Club, Tournament, CoachCertification } = require('../db/models');
const QRCode = require('qrcode');
const crypto = require('crypto');
const sharp = require('sharp');
const Canvas = require('canvas');

const digitalCredentialsController = {
  // Get player's digital credentials
  async getPlayerCredentials(req, res) {
    try {
      const userId = req.user.id;

      // Get player record
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Player,
            as: 'player',
            include: [
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          }
        ]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      // Get digital credentials
      const credentials = await DigitalCredential.findAll({
        where: { 
          player_id: user.player.id
        },
        include: [
          { model: Tournament, as: 'tournament' },
          { model: CoachCertification, as: 'certification' }
        ],
        order: [['created_at', 'DESC']]
      });

      // Format credentials for frontend
      const formattedCredentials = credentials.map(cred => ({
        id: cred.id,
        player_id: cred.player_id,
        credential_type: cred.credential_type,
        title: cred.title,
        description: cred.description,
        issue_date: cred.issue_date,
        expiry_date: cred.expiry_date,
        qr_code_data: cred.qr_code_data,
        qr_code_url: cred.qr_code_url,
        metadata: cred.metadata,
        is_active: cred.is_active,
        verification_count: cred.verification_count,
        last_verified_at: cred.last_verified_at,
        created_at: cred.created_at,
        updated_at: cred.updated_at,
        tournament: cred.tournament ? {
          id: cred.tournament.id,
          name: cred.tournament.name,
          tournament_type: cred.tournament.tournament_type
        } : null,
        certification: cred.certification ? {
          id: cred.certification.id,
          name: cred.certification.name,
          issuer: cred.certification.issuer
        } : null
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
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          }
        ]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const playerProfile = {
        id: user.player.id,
        user_id: user.id,
        full_name: user.player.full_name,
        nrtp_level: user.player.nrtp_level,
        profile_photo_url: user.player.profile_photo_url,
        nationality: user.player.nationality,
        ranking_position: user.player.ranking_position,
        affiliation_expires_at: user.player.affiliation_expires_at,
        state: user.player.state ? {
          id: user.player.state.id,
          name: user.player.state.name,
          short_code: user.player.state.short_code
        } : null,
        club: user.player.club ? {
          id: user.player.club.id,
          name: user.player.club.name
        } : null,
        username: user.username,
        email: user.email,
        phone: user.phone,
        is_premium: user.is_premium,
        is_verified: user.is_verified
      };

      res.json(playerProfile);
    } catch (error) {
      console.error('Get player profile error:', error);
      res.status(500).json({ error: 'Failed to get player profile' });
    }
  },

  // Get credential templates
  async getCredentialTemplates(req, res) {
    try {
      const templates = await DigitalCredentialTemplate.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']]
      });

      const formattedTemplates = templates.map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        description: template.description,
        template_config: template.template_config,
        background_url: template.background_url,
        logo_url: template.logo_url,
        design_elements: template.design_elements,
        required_fields: template.required_fields
      }));

      res.json(formattedTemplates);
    } catch (error) {
      console.error('Get credential templates error:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  },

  // Create digital credential
  async createDigitalCredential(req, res) {
    try {
      const userId = req.user.id;
      const { credential_type, title, description, expiry_date, tournament_id, certification_id, metadata } = req.body;

      // Get player record
      const user = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      // Generate unique QR code data
      const qrCodeData = crypto.randomBytes(16).toString('hex') + '-' + user.player.id + '-' + Date.now();

      // Create credential
      const credential = await DigitalCredential.create({
        player_id: user.player.id,
        credential_type,
        title,
        description,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        qr_code_data: qrCodeData,
        tournament_id: tournament_id || null,
        certification_id: certification_id || null,
        metadata: metadata || {}
      });

      // Generate QR code image
      const qrCodeUrl = await digitalCredentialsController.generateQRCodeImage(credential.qr_code_data, credential.id);
      await credential.update({ qr_code_url: qrCodeUrl });

      // Return formatted credential
      const formattedCredential = {
        id: credential.id,
        player_id: credential.player_id,
        credential_type: credential.credential_type,
        title: credential.title,
        description: credential.description,
        issue_date: credential.issue_date,
        expiry_date: credential.expiry_date,
        qr_code_data: credential.qr_code_data,
        qr_code_url: credential.qr_code_url,
        metadata: credential.metadata,
        is_active: credential.is_active,
        created_at: credential.created_at
      };

      res.status(201).json(formattedCredential);
    } catch (error) {
      console.error('Create digital credential error:', error);
      res.status(500).json({ error: 'Failed to create credential' });
    }
  },

  // Generate QR code for credential
  async generateCredentialQrCode(req, res) {
    try {
      const { credentialId } = req.params;
      const userId = req.user.id;

      // Get credential and verify ownership
      const user = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const credential = await DigitalCredential.findOne({
        where: { 
          id: credentialId,
          player_id: user.player.id
        }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      // Generate new QR code if needed
      let qrCodeUrl = credential.qr_code_url;
      if (!qrCodeUrl) {
        qrCodeUrl = await digitalCredentialsController.generateQRCodeImage(credential.qr_code_data, credential.id);
        await credential.update({ qr_code_url: qrCodeUrl });
      }

      res.json({
        credential_id: credential.id,
        qr_code_data: credential.qr_code_data,
        qr_code_url: qrCodeUrl
      });
    } catch (error) {
      console.error('Generate QR code error:', error);
      res.status(500).json({ error: 'Failed to generate QR code' });
    }
  },

  // Verify credential by QR code
  async verifyCredential(req, res) {
    try {
      const { qrCodeData } = req.params;

      const credential = await DigitalCredential.findOne({
        where: { 
          qr_code_data: qrCodeData,
          is_active: true 
        },
        include: [
          {
            model: Player,
            as: 'player',
            include: [
              { model: User, as: 'user' },
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          },
          { model: Tournament, as: 'tournament' },
          { model: CoachCertification, as: 'certification' }
        ]
      });

      if (!credential) {
        return res.status(404).json({
          valid: false,
          message: 'Invalid or expired credential'
        });
      }

      // Check if credential is expired
      const isExpired = credential.expiry_date && new Date(credential.expiry_date) < new Date();
      if (isExpired) {
        return res.json({
          valid: false,
          message: 'Credential has expired'
        });
      }

      // Update verification stats
      await credential.update({
        verification_count: credential.verification_count + 1,
        last_verified_at: new Date()
      });

      // Return verification result
      const verificationResult = {
        valid: true,
        credential: {
          id: credential.id,
          credential_type: credential.credential_type,
          title: credential.title,
          description: credential.description,
          issue_date: credential.issue_date,
          expiry_date: credential.expiry_date,
          is_expired: isExpired,
          verification_count: credential.verification_count + 1,
          player: {
            id: credential.player.id,
            full_name: credential.player.full_name,
            nrtp_level: credential.player.nrtp_level,
            profile_photo_url: credential.player.profile_photo_url,
            nationality: credential.player.nationality,
            ranking_position: credential.player.ranking_position,
            state: credential.player.state ? credential.player.state.name : null,
            club: credential.player.club ? credential.player.club.name : 'Independent'
          },
          tournament: credential.tournament ? {
            name: credential.tournament.name,
            tournament_type: credential.tournament.tournament_type,
            start_date: credential.tournament.start_date
          } : null,
          certification: credential.certification ? {
            name: credential.certification.name,
            issuer: credential.certification.issuer,
            issue_date: credential.certification.issue_date
          } : null
        }
      };

      res.json(verificationResult);
    } catch (error) {
      console.error('Verify credential error:', error);
      res.status(500).json({ 
        valid: false,
        message: 'Failed to verify credential' 
      });
    }
  },

  // Update credential status
  async updateCredentialStatus(req, res) {
    try {
      const { credentialId } = req.params;
      const { is_active } = req.body;
      const userId = req.user.id;

      // Get user and verify ownership
      const user = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const credential = await DigitalCredential.findOne({
        where: { 
          id: credentialId,
          player_id: user.player.id
        }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      await credential.update({ is_active });

      res.json({
        id: credential.id,
        is_active: credential.is_active,
        updated_at: credential.updated_at
      });
    } catch (error) {
      console.error('Update credential status error:', error);
      res.status(500).json({ error: 'Failed to update credential status' });
    }
  },

  // Delete credential
  async deleteCredential(req, res) {
    try {
      const { credentialId } = req.params;
      const userId = req.user.id;

      // Get user and verify ownership
      const user = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const credential = await DigitalCredential.findOne({
        where: { 
          id: credentialId,
          player_id: user.player.id
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
  },

  // Helper method to generate QR code image
  async generateQRCodeImage(qrCodeData, credentialId) {
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // For now, return the data URL directly
      // In production, you might want to upload to Cloudinary or save to file system
      return qrCodeDataURL;
    } catch (error) {
      console.error('Generate QR code image error:', error);
      throw error;
    }
  },

  // Generate credential image/card (for future implementation)
  async generateCredentialCard(req, res) {
    try {
      const { credentialId } = req.params;
      const userId = req.user.id;

      // Get user and verify ownership
      const user = await User.findByPk(userId, {
        include: [{ model: Player, as: 'player' }]
      });

      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }

      const credential = await DigitalCredential.findOne({
        where: { 
          id: credentialId,
          player_id: user.player.id
        },
        include: [
          {
            model: Player,
            as: 'player',
            include: [
              { model: State, as: 'state' },
              { model: Club, as: 'club' }
            ]
          }
        ]
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }

      // Get template
      const template = await DigitalCredentialTemplate.findOne({
        where: { type: credential.credential_type }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      // TODO: Implement card generation using Canvas API
      // This would create a visual representation of the credential
      // For now, return template info
      res.json({
        message: 'Card generation feature coming soon',
        template: template.template_config,
        credential_data: {
          player_name: credential.player.full_name,
          nrtp_level: credential.player.nrtp_level,
          state: credential.player.state?.name,
          club: credential.player.club?.name || 'Independent',
          ranking: credential.player.ranking_position,
          qr_code_url: credential.qr_code_url
        }
      });
    } catch (error) {
      console.error('Generate credential card error:', error);
      res.status(500).json({ error: 'Failed to generate credential card' });
    }
  }
};

module.exports = digitalCredentialsController;