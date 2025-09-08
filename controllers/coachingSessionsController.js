const { CoachingSession, Player, Coach, Club, User, State, CoachCertification, CoachAvailability } = require('../db/models');
const { Op, Sequelize } = require('sequelize');

const coachingSessionsController = {
  // Search coaching sessions based on filters
  async searchSessions(req, res) {
    try {
      const {
        session_type,
        skill_level,
        price_range,
        date_range,
        location,
        session_format,
        specialization,
        rating_min
      } = req.body;

      let whereClause = {
        status: 'scheduled',
        scheduled_date: {
          [Op.gte]: new Date().toISOString().split('T')[0] // Only future sessions
        }
      };

      if (session_type) whereClause.session_type = session_type;
      if (session_format) whereClause.session_format = session_format;
      if (location) whereClause.location = { [Op.iLike]: `%${location}%` };

      if (price_range && (price_range.min || price_range.max)) {
        const priceFilter = {};
        if (price_range.min) priceFilter[Op.gte] = price_range.min;
        if (price_range.max) priceFilter[Op.lte] = price_range.max;
        whereClause.price_per_person = priceFilter;
      }

      if (date_range && (date_range.start || date_range.end)) {
        const dateFilter = {};
        if (date_range.start) dateFilter[Op.gte] = date_range.start;
        if (date_range.end) dateFilter[Op.lte] = date_range.end;
        whereClause.scheduled_date = { ...whereClause.scheduled_date, ...dateFilter };
      }

      // Build coach filter for specialization and rating
      let coachWhere = {};
      if (specialization) {
        coachWhere.specialization = { [Op.iLike]: `%${specialization}%` };
      }
      if (rating_min) {
        coachWhere.rating = { [Op.gte]: rating_min };
      }

      const sessions = await CoachingSession.findAll({
        where: whereClause,
        include: [
          {
            model: Coach,
            as: 'coach',
            where: Object.keys(coachWhere).length > 0 ? coachWhere : undefined,
            include: [
              {
                model: Club,
                as: 'club',
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['scheduled_date', 'ASC'], ['start_time', 'ASC']]
      });

      // Filter by available spots
      const availableSessions = sessions.filter(session => 
        session.current_participants < session.max_participants
      );

      res.json(availableSessions);
    } catch (error) {
      console.error('Search coaching sessions error:', error);
      res.status(500).json({ error: 'Failed to search sessions' });
    }
  },

  // Get available coaches
  async getCoaches(req, res) {
    try {
      const coaches = await Coach.findAll({
        include: [
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          }
        ],
        order: [['rating', 'DESC'], ['total_reviews', 'DESC']]
      });

      // Add real certifications for each coach
      const coachesWithCertifications = await Promise.all(coaches.map(async (coach) => {
        const coachData = coach.toJSON();
        
        // Get actual certifications from database
        const certifications = await CoachCertification.findAll({
          where: { coach_id: coach.id },
          attributes: ['name', 'issuer', 'issue_date', 'expiry_date'],
          order: [['issue_date', 'DESC']]
        });
        
        coachData.certifications = certifications.map(cert => ({
          name: cert.name,
          issuer: cert.issuer,
          issue_date: cert.issue_date,
          expiry_date: cert.expiry_date
        }));
        
        return coachData;
      }));

      res.json(coachesWithCertifications);
    } catch (error) {
      console.error('Get coaches error:', error);
      res.status(500).json({ error: 'Failed to get coaches' });
    }
  },

  // Get coach details and availability
  async getCoachDetails(req, res) {
    try {
      const { coachId } = req.params;

      const coach = await Coach.findByPk(coachId, {
        include: [
          {
            model: Club,
            as: 'club',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!coach) {
        return res.status(404).json({ error: 'Coach not found' });
      }

      const coachData = coach.toJSON();
      
      // Get real certifications from database
      const certifications = await CoachCertification.findAll({
        where: { coach_id: coachId },
        attributes: ['name', 'issuer', 'issue_date', 'expiry_date'],
        order: [['issue_date', 'DESC']]
      });
      
      coachData.certifications = certifications.map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        issue_date: cert.issue_date,
        expiry_date: cert.expiry_date
      }));

      // Get real availability schedule from database
      const availability = await CoachAvailability.findAll({
        where: { coach_id: coachId },
        order: [['day_of_week', 'ASC']]
      });
      
      // Convert availability to schedule format
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const availabilitySchedule = {};
      
      daysOfWeek.forEach((day, index) => {
        const dayAvailability = availability.filter(av => av.day_of_week === index);
        availabilitySchedule[day] = {
          available: dayAvailability.length > 0,
          hours: dayAvailability.map(av => `${av.start_time}-${av.end_time}`)
        };
      });
      
      coachData.availability_schedule = availabilitySchedule;

      res.json(coachData);
    } catch (error) {
      console.error('Get coach details error:', error);
      res.status(500).json({ error: 'Failed to get coach details' });
    }
  },

  // Get player's coaching session bookings
  async getMyBookings(req, res) {
    try {
      const userId = req.user.id;
      
      // Get the player record
      const user = await User.findByPk(userId, {
        include: [{
          model: Player,
          as: 'player'
        }]
      });
      
      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const playerId = user.player.id;

      const bookings = await CoachingSession.findAll({
        where: { player_id: playerId },
        include: [
          {
            model: Coach,
            as: 'coach',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
              },
              {
                model: State,
                as: 'state',
                attributes: ['id', 'name', 'short_code']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(bookings);
    } catch (error) {
      console.error('Get my bookings error:', error);
      res.status(500).json({ error: 'Failed to get bookings' });
    }
  },

  // Book a coaching session
  async bookSession(req, res) {
    try {
      const userId = req.user.id;
      const { coach_id, session_date, start_time, end_time, price } = req.body;
      
      // Get the player record
      const user = await User.findByPk(userId, {
        include: [{
          model: Player,
          as: 'player'
        }]
      });
      
      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const playerId = user.player.id;

      // Check if coach exists
      const coach = await Coach.findByPk(coach_id);
      if (!coach) {
        return res.status(404).json({ error: 'Coach not found' });
      }

      // Check if player already has a session with this coach at this time
      const existingSession = await CoachingSession.findOne({
        where: {
          coach_id,
          player_id: playerId,
          session_date,
          start_time,
          status: 'scheduled'
        }
      });

      if (existingSession) {
        return res.status(400).json({ error: 'You already have a session booked at this time' });
      }

      // Create coaching session
      const session = await CoachingSession.create({
        coach_id,
        player_id: playerId,
        session_date,
        start_time,
        end_time,
        price: price || coach.hourly_rate || 50,
        payment_status: 'paid',
        stripe_payment_id: `payment_${Date.now()}`,
        status: 'scheduled'
      });

      // Get full session details
      const fullSession = await CoachingSession.findByPk(session.id, {
        include: [
          {
            model: Coach,
            as: 'coach',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
              },
              {
                model: State,
                as: 'state',
                attributes: ['id', 'name', 'short_code']
              }
            ]
          },
          {
            model: Player,
            as: 'player',
            attributes: ['id', 'full_name', 'nrtp_level']
          }
        ]
      });

      res.status(201).json(fullSession);
    } catch (error) {
      console.error('Book session error:', error);
      res.status(500).json({ error: 'Failed to book session' });
    }
  },

  // Cancel a session booking
  async cancelBooking(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      // Get the player record
      const user = await User.findByPk(userId, {
        include: [{
          model: Player,
          as: 'player'
        }]
      });
      
      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const playerId = user.player.id;

      const session = await CoachingSession.findOne({
        where: {
          id: sessionId,
          player_id: playerId
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      if (session.status === 'canceled') {
        return res.status(400).json({ error: 'Session already canceled' });
      }

      // Check if session is within 24 hours (no cancellation allowed)
      const sessionDateTime = new Date(`${session.session_date} ${session.start_time}`);
      const now = new Date();
      const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilSession < 24) {
        return res.status(400).json({ error: 'Cannot cancel within 24 hours of session' });
      }

      // Update session status
      await session.update({
        status: 'canceled',
        payment_status: 'refunded'
      });

      // Get updated session with full details
      const updatedSession = await CoachingSession.findByPk(sessionId, {
        include: [
          {
            model: Coach,
            as: 'coach',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email']
              },
              {
                model: State,
                as: 'state',
                attributes: ['id', 'name', 'short_code']
              }
            ]
          },
          {
            model: Player,
            as: 'player',
            attributes: ['id', 'full_name', 'nrtp_level']
          }
        ]
      });

      res.json(updatedSession);
    } catch (error) {
      console.error('Cancel booking error:', error);
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  },

  // Submit session review and feedback
  async submitReview(req, res) {
    try {
      const { sessionId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user.id;
      
      // Get the player record
      const user = await User.findByPk(userId, {
        include: [{
          model: Player,
          as: 'player'
        }]
      });
      
      if (!user || !user.player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const playerId = user.player.id;

      // Find the session for this player
      const session = await CoachingSession.findOne({
        where: {
          id: sessionId,
          player_id: playerId,
          status: 'completed'
        }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found or not completed' });
      }

      // Update session with rating
      await session.update({
        rating: rating
      });

      res.json({ message: 'Review submitted successfully' });
    } catch (error) {
      console.error('Submit review error:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  },

  // Get session details
  async getSessionDetails(req, res) {
    try {
      const { sessionId } = req.params;

      const session = await CoachingSession.findByPk(sessionId, {
        include: [
          {
            model: Coach,
            as: 'coach',
            include: [
              {
                model: Club,
                as: 'club',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get session with player details
      const sessionData = session.toJSON();
      
      // Add player information
      const player = await Player.findByPk(session.player_id, {
        attributes: ['id', 'full_name', 'nrtp_level'],
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['email', 'phone']
          }
        ]
      });
      
      sessionData.player = player;
      res.json(sessionData);
    } catch (error) {
      console.error('Get session details error:', error);
      res.status(500).json({ error: 'Failed to get session details' });
    }
  }
};

module.exports = coachingSessionsController;