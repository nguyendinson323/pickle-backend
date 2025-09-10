const { CoachingSession, Player, Coach, User, State, CoachAvailability } = require('../db/models');
const { Op, Sequelize } = require('sequelize');

const coachingSessionsController = {
  // Search coaching sessions based on filters (available coach time slots)
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

      // Build coach filter for specialization and rating
      let coachWhere = {};
      if (specialization) {
        coachWhere.specialization = { [Op.iLike]: `%${specialization}%` };
      }
      if (rating_min) {
        coachWhere.rating = { [Op.gte]: rating_min };
      }
      
      if (price_range && (price_range.min || price_range.max)) {
        if (price_range.min) coachWhere.hourly_rate = { [Op.gte]: price_range.min };
        if (price_range.max) {
          coachWhere.hourly_rate = { 
            ...coachWhere.hourly_rate, 
            [Op.lte]: price_range.max 
          };
        }
      }

      // Get coaches that match the criteria
      const coaches = await Coach.findAll({
        where: Object.keys(coachWhere).length > 0 ? coachWhere : {},
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name']
          },
          {
            model: CoachAvailability,
            as: 'availabilities',
            required: false
          }
        ],
        order: [['hourly_rate', 'ASC']]
      });

      // Generate available time slots based on coach availability
      const availableSessions = [];
      const startDate = date_range?.start ? new Date(date_range.start) : new Date();
      const endDate = date_range?.end ? new Date(date_range.end) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

      for (const coach of coaches) {
        const coachData = coach.toJSON();
        
        // Get coach's availability schedule
        const availabilities = coachData.availabilities || [];
        
        // Generate sessions for each day in the date range
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const dateStr = d.toISOString().split('T')[0];
          
          // Skip past dates
          if (d < new Date()) continue;
          
          // Find availability for this day of week
          const dayAvailability = availabilities.filter(av => av.day_of_week === dayOfWeek);
          
          // Check if coach has existing sessions on this date
          const existingSessions = await CoachingSession.findAll({
            where: {
              coach_id: coachData.id,
              session_date: dateStr
            }
          });
          
          // Create available time slots based on availability
          for (const availability of dayAvailability) {
            // Check if this time slot is already booked
            const isBooked = existingSessions.some(session => {
              return session.start_time <= availability.start_time && 
                     session.end_time > availability.start_time;
            });
            
            if (!isBooked) {
              // Calculate duration in minutes  
              const start = new Date(`1970-01-01T${availability.start_time}`);
              const end = new Date(`1970-01-01T${availability.end_time}`);
              const durationMinutes = (end - start) / (1000 * 60);
              
              const sessionId = `${coachData.id}_${dateStr}_${availability.start_time}`.replace(/[:-]/g, '');
              
              availableSessions.push({
                id: parseInt(sessionId.substring(0, 10)), // Create unique ID
                coach_id: coachData.id,
                player_id: null,
                session_type: 'individual',
                title: `Coaching Session with ${coachData.full_name || coachData.user?.username}`,
                description: 'One-on-one coaching session',
                scheduled_date: dateStr,
                start_time: availability.start_time,
                end_time: availability.end_time,
                duration_minutes: durationMinutes,
                location: 'TBD',
                session_format: 'in_person',
                skill_focus: [],
                max_participants: 1,
                current_participants: 0,
                price_per_person: parseFloat(coachData.hourly_rate || 50) * (durationMinutes / 60),
                status: 'available',
                payment_status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                coach: {
                  id: coachData.id,
                  full_name: coachData.full_name || coachData.user?.username,
                  email: coachData.user?.email,
                  specialization: coachData.specialization,
                  experience_years: coachData.experience_years,
                  hourly_rate: coachData.hourly_rate,
                  bio: coachData.bio,
                  profile_image: coachData.profile_image,
                  certifications: [],
                  rating: coachData.rating || 5,
                  total_reviews: coachData.total_reviews || 0,
                  availability_schedule: null,
                  club: null
                }
              });
            }
          }
        }
      }

      // Sort by date and time
      availableSessions.sort((a, b) => {
        const dateCompare = a.scheduled_date.localeCompare(b.scheduled_date);
        if (dateCompare !== 0) return dateCompare;
        return a.start_time.localeCompare(b.start_time);
      });

      res.json(availableSessions.slice(0, 50)); // Limit to 50 results
    } catch (error) {
      console.error('Search coaching sessions error:', error);
      res.status(500).json({ error: 'Failed to search sessions' });
    }
  },

  // Get available coaches
  async getCoaches(req, res) {
    try {
      const coaches = await Coach.findAll({
        order: [['hourly_rate', 'ASC']]
      });

      // Transform coaches data for frontend
      const coachesData = coaches.map(coach => {
        const coachData = coach.toJSON();
        
        // Add mock certifications if none exist
        coachData.certifications = coachData.certifications || [
          'USAPA Certified',
          'Level 3 Professional'
        ];
        
        // Add mock rating and reviews data
        coachData.rating = Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 to 5.0
        coachData.total_reviews = Math.floor(Math.random() * 50) + 10; // 10 to 60
        
        // Ensure we have all required fields for frontend
        coachData.club = null; // No club association for now
        coachData.specialization = coachData.specialization || 'General Coach';
        
        return coachData;
      });

      res.json(coachesData);
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
        include: []
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
          as: 'PlayerProfile'
        }]
      });
      
      if (!user || !user.PlayerProfile) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const playerId = user.PlayerProfile.id;

      const sessions = await CoachingSession.findAll({
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
          },
          {
            model: Court,
            as: 'court',
            required: false,
            attributes: ['id', 'name', 'location']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Transform sessions to match frontend expectations
      const bookings = sessions.map(session => {
        const sessionData = session.toJSON();
        
        // Calculate duration in minutes
        const start = new Date(`1970-01-01T${sessionData.start_time}`);
        const end = new Date(`1970-01-01T${sessionData.end_time}`);
        const durationMinutes = (end - start) / (1000 * 60);
        
        // Transform to match SessionBooking interface
        return {
          id: sessionData.id,
          session_id: sessionData.id,
          player_id: sessionData.player_id,
          booking_date: sessionData.created_at,
          payment_status: sessionData.payment_status,
          payment_amount: parseFloat(sessionData.price || 0),
          stripe_payment_id: sessionData.stripe_payment_id,
          status: sessionData.status === 'scheduled' ? 'confirmed' : 
                  sessionData.status === 'canceled' ? 'canceled' : 'confirmed',
          created_at: sessionData.created_at,
          session: {
            id: sessionData.id,
            coach_id: sessionData.coach_id,
            player_id: sessionData.player_id,
            session_type: 'individual',
            title: `Coaching Session with ${sessionData.coach?.full_name || 'Coach'}`,
            description: `One-on-one coaching session`,
            scheduled_date: sessionData.session_date,
            start_time: sessionData.start_time,
            end_time: sessionData.end_time,
            duration_minutes: durationMinutes,
            location: sessionData.court?.location || 'TBD',
            session_format: 'in_person',
            skill_focus: [],
            max_participants: 1,
            current_participants: 1,
            price_per_person: parseFloat(sessionData.price || 0),
            status: sessionData.status,
            payment_status: sessionData.payment_status,
            created_at: sessionData.created_at,
            updated_at: sessionData.updated_at,
            coach: {
              id: sessionData.coach?.id,
              full_name: sessionData.coach?.full_name || sessionData.coach?.user?.username,
              email: sessionData.coach?.user?.email,
              specialization: sessionData.coach?.specialization,
              experience_years: sessionData.coach?.experience_years,
              hourly_rate: sessionData.coach?.hourly_rate,
              bio: sessionData.coach?.bio,
              profile_image: sessionData.coach?.profile_image,
              certifications: [],
              rating: sessionData.coach?.rating || 5,
              total_reviews: sessionData.coach?.total_reviews || 0,
              availability_schedule: null,
              club: null
            },
            feedback_rating: sessionData.rating,
            feedback_comment: null
          }
        };
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
      const { coach_id, session_date, start_time, end_time, price, payment_method } = req.body;
      
      // Get the player record
      const user = await User.findByPk(userId, {
        include: [{
          model: Player,
          as: 'PlayerProfile'
        }]
      });
      
      if (!user || !user.PlayerProfile) {
        return res.status(404).json({ error: 'Player not found' });
      }
      
      const playerId = user.PlayerProfile.id;

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

      // Check if coach is available at this time
      const coachConflict = await CoachingSession.findOne({
        where: {
          coach_id,
          session_date,
          start_time,
          status: 'scheduled'
        }
      });

      if (coachConflict) {
        return res.status(400).json({ error: 'Coach is not available at this time' });
      }

      // Create new coaching session
      const newSession = await CoachingSession.create({
        coach_id,
        player_id: playerId,
        session_date,
        start_time,
        end_time,
        price: price || coach.hourly_rate || 50,
        payment_status: 'paid',
        stripe_payment_id: `payment_${Date.now()}_${coach_id}`,
        status: 'scheduled'
      });

      // Get full session details for response
      const fullSession = await CoachingSession.findByPk(newSession.id, {
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

      // Transform to match frontend expectations  
      const sessionData = fullSession.toJSON();
      const start = new Date(`1970-01-01T${sessionData.start_time}`);
      const end = new Date(`1970-01-01T${sessionData.end_time}`);
      const durationMinutes = (end - start) / (1000 * 60);
      
      const bookingResponse = {
        id: sessionData.id,
        session_id: sessionData.id,
        player_id: sessionData.player_id,
        booking_date: sessionData.updated_at,
        payment_status: sessionData.payment_status,
        payment_amount: parseFloat(sessionData.price || 0),
        stripe_payment_id: sessionData.stripe_payment_id,
        status: 'confirmed',
        created_at: sessionData.created_at,
        session: {
          id: sessionData.id,
          coach_id: sessionData.coach_id,
          player_id: sessionData.player_id,
          session_type: 'individual',
          title: `Coaching Session with ${sessionData.coach?.full_name || sessionData.coach?.user?.username || 'Coach'}`,
          description: `One-on-one coaching session`,
          scheduled_date: sessionData.session_date,
          start_time: sessionData.start_time,
          end_time: sessionData.end_time,
          duration_minutes: durationMinutes,
          location: 'TBD',
          session_format: 'in_person',
          skill_focus: [],
          max_participants: 1,
          current_participants: 1,
          price_per_person: parseFloat(sessionData.price || 0),
          status: sessionData.status,
          payment_status: sessionData.payment_status,
          created_at: sessionData.created_at,
          updated_at: sessionData.updated_at,
          coach: {
            id: sessionData.coach?.id,
            full_name: sessionData.coach?.full_name || sessionData.coach?.user?.username,
            email: sessionData.coach?.user?.email,
            specialization: sessionData.coach?.specialization,
            experience_years: sessionData.coach?.experience_years,
            hourly_rate: sessionData.coach?.hourly_rate,
            bio: sessionData.coach?.bio,
            profile_image: sessionData.coach?.profile_image,
            certifications: [],
            rating: sessionData.coach?.rating || 5,
            total_reviews: sessionData.coach?.total_reviews || 0,
            availability_schedule: null,
            club: null
          }
        }
      };

      res.status(201).json(bookingResponse);
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
            include: []
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