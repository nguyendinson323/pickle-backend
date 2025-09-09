const { Court, CourtSchedule, CourtReservation, Player, Club, State, Partner } = require('../db/models');
const { Op, Sequelize } = require('sequelize');

const courtReservationController = {
  // Search courts based on filters
  async searchCourts(req, res) {
    try {
      const {
        state_id,
        surface_type,
        indoor,
        lights,
        max_hourly_rate,
        owner_type,
        available_date,
        available_time_start,
        available_time_end,
        distance_km,
        location_lat,
        location_lng
      } = req.query;

      let whereClause = {
        status: 'active'
      };

      if (state_id) whereClause.state_id = state_id;
      if (surface_type) whereClause.surface_type = surface_type;
      if (indoor !== null && indoor !== undefined) whereClause.indoor = indoor;
      if (lights !== null && lights !== undefined) whereClause.lights = lights;
      if (owner_type) whereClause.owner_type = owner_type;

      const courts = await Court.findAll({
        where: whereClause,
        include: [
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          },
          {
            model: CourtSchedule,
            as: 'schedules',
            attributes: ['id', 'court_id', 'day_of_week', 'open_time', 'close_time', 'is_closed']
          }
        ]
      });

      // Add calculated fields and owner details
      const courtsWithExtras = await Promise.all(courts.map(async (court) => {
        const courtData = court.toJSON();
        
        // Default hourly rate - could be extended with a pricing table
        courtData.hourlyRate = 40; // Standard rate

        // Add distance calculation if location provided
        if (location_lat && location_lng && courtData.latitude && courtData.longitude) {
          // Use Haversine formula for more accurate distance calculation
          const R = 6371; // Earth's radius in km
          const dLat = (courtData.latitude - location_lat) * Math.PI / 180;
          const dLng = (courtData.longitude - location_lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                   Math.cos(location_lat * Math.PI / 180) * Math.cos(courtData.latitude * Math.PI / 180) *
                   Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          courtData.distance = Math.round(R * c * 10) / 10;
        }

        // Get real owner details based on type
        if (courtData.owner_type === 'club') {
          const club = await Club.findByPk(courtData.owner_id, {
            attributes: ['id', 'name', 'logo_url']
          });
          courtData.owner = club ? {
            id: club.id,
            name: club.name,
            logo_url: club.logo_url,
            type: 'club'
          } : null;
        } else if (courtData.owner_type === 'partner') {
          const partner = await Partner.findByPk(courtData.owner_id, {
            attributes: ['id', 'business_name', 'logo_url']
          });
          courtData.owner = partner ? {
            id: partner.id,
            name: partner.business_name,
            logo_url: partner.logo_url,
            type: 'partner'
          } : null;
        }

        return courtData;
      }));

      res.json(courtsWithExtras);
    } catch (error) {
      console.error('Search courts error:', error);
      res.status(500).json({ error: 'Failed to search courts' });
    }
  },

  // Get court availability for a specific date
  async getCourtAvailability(req, res) {
    try {
      const { courtId } = req.params;
      const { date } = req.query;

      // Get court schedules for the requested date
      const court = await Court.findByPk(courtId, {
        include: [{
          model: CourtSchedule,
          as: 'schedules'
        }]
      });

      if (!court) {
        return res.status(404).json({ error: 'Court not found' });
      }

      const dayOfWeek = new Date(date).getDay();
      const schedule = court.schedules.find(s => s.day_of_week === dayOfWeek);

      if (!schedule || schedule.is_closed) {
        return res.json([]);
      }

      // Get existing reservations for the date
      const existingReservations = await CourtReservation.findAll({
        where: {
          court_id: courtId,
          date: date,
          status: ['pending', 'confirmed']
        }
      });

      // Generate time slots (hourly intervals)
      const timeSlots = [];
      const openTime = new Date(`1970-01-01 ${schedule.open_time}`);
      const closeTime = new Date(`1970-01-01 ${schedule.close_time}`);
      
      for (let time = new Date(openTime); time < closeTime; time.setHours(time.getHours() + 1)) {
        const startTime = time.toTimeString().slice(0, 5);
        const endTime = new Date(time.getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5);
        
        const isReserved = existingReservations.some(res => 
          res.start_time <= startTime && res.end_time > startTime
        );

        const reservation = existingReservations.find(res => 
          res.start_time <= startTime && res.end_time > startTime
        );

        timeSlots.push({
          start_time: startTime,
          end_time: endTime,
          available: !isReserved,
          price: 40, // Standard hourly rate
          reservation_id: reservation ? reservation.id : undefined
        });
      }

      res.json(timeSlots);
    } catch (error) {
      console.error('Get court availability error:', error);
      res.status(500).json({ error: 'Failed to get court availability' });
    }
  },

  // Get court details
  async getCourtDetails(req, res) {
    try {
      const { courtId } = req.params;

      const court = await Court.findByPk(courtId, {
        include: [
          {
            model: State,
            as: 'state',
            attributes: ['id', 'name', 'short_code']
          },
          {
            model: CourtSchedule,
            as: 'schedules',
            attributes: ['id', 'court_id', 'day_of_week', 'open_time', 'close_time', 'is_closed']
          }
        ]
      });

      if (!court) {
        return res.status(404).json({ error: 'Court not found' });
      }

      const courtData = court.toJSON();
      
      // Get real owner details
      if (courtData.owner_type === 'club') {
        const club = await Club.findByPk(courtData.owner_id, {
          attributes: ['id', 'name', 'logo_url']
        });
        courtData.owner = club ? {
          id: club.id,
          name: club.name,
          logo_url: club.logo_url,
          type: 'club'
        } : null;
      } else if (courtData.owner_type === 'partner') {
        const partner = await Partner.findByPk(courtData.owner_id, {
          attributes: ['id', 'business_name', 'logo_url']
        });
        courtData.owner = partner ? {
          id: partner.id,
          name: partner.business_name,
          logo_url: partner.logo_url,
          type: 'partner'
        } : null;
      }

      res.json(courtData);
    } catch (error) {
      console.error('Get court details error:', error);
      res.status(500).json({ error: 'Failed to get court details' });
    }
  },

  // Get user's court reservations
  async getUserReservations(req, res) {
    try {
      const userId = req.user.id;
      
      // Get player from user
      const { Player: PlayerModel } = require('../db/models');
      const player = await PlayerModel.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;

      const reservations = await CourtReservation.findAll({
        where: { player_id: playerId },
        include: [
          {
            model: Court,
            as: 'court',
            include: [
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
            attributes: ['id', 'full_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json(reservations);
    } catch (error) {
      console.error('Get user reservations error:', error);
      res.status(500).json({ error: 'Failed to get reservations' });
    }
  },

  // Make a court reservation
  async makeReservation(req, res) {
    try {
      const userId = req.user.id;
      
      // Get player from user
      const { Player: PlayerModel } = require('../db/models');
      const player = await PlayerModel.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;
      const { court_id, date, start_time, end_time } = req.body;

      // Check for conflicts
      const existingReservation = await CourtReservation.findOne({
        where: {
          court_id,
          date,
          [Op.or]: [
            {
              start_time: { [Op.lt]: end_time },
              end_time: { [Op.gt]: start_time }
            }
          ],
          status: ['pending', 'confirmed']
        }
      });

      if (existingReservation) {
        return res.status(400).json({ error: 'Time slot not available' });
      }

      // Calculate amount based on time duration
      const startDate = new Date(`1970-01-01 ${start_time}`);
      const endDate = new Date(`1970-01-01 ${end_time}`);
      const durationHours = (endDate - startDate) / (1000 * 60 * 60);
      const hourlyRate = 40; // Standard rate
      const amount = durationHours * hourlyRate;

      const reservation = await CourtReservation.create({
        court_id,
        player_id: playerId,
        date,
        start_time,
        end_time,
        status: 'confirmed',
        payment_status: 'pending',
        amount,
        stripe_payment_id: null
      });

      // Get full reservation details
      const fullReservation = await CourtReservation.findByPk(reservation.id, {
        include: [
          {
            model: Court,
            as: 'court',
            include: [
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
            attributes: ['id', 'full_name']
          }
        ]
      });

      res.status(201).json(fullReservation);
    } catch (error) {
      console.error('Make reservation error:', error);
      res.status(500).json({ error: 'Failed to make reservation' });
    }
  },

  // Cancel a court reservation
  async cancelReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const userId = req.user.id;
      
      // Get player from user
      const { Player: PlayerModel } = require('../db/models');
      const player = await PlayerModel.findOne({ where: { user_id: userId } });
      
      if (!player) {
        return res.status(404).json({ error: 'Player profile not found' });
      }
      
      const playerId = player.id;

      const reservation = await CourtReservation.findOne({
        where: {
          id: reservationId,
          player_id: playerId
        }
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      if (reservation.status === 'canceled') {
        return res.status(400).json({ error: 'Reservation already canceled' });
      }

      await reservation.update({
        status: 'canceled',
        payment_status: 'refunded'
      });

      // Get updated reservation with full details
      const updatedReservation = await CourtReservation.findByPk(reservationId, {
        include: [
          {
            model: Court,
            as: 'court',
            include: [
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
            attributes: ['id', 'full_name']
          }
        ]
      });

      res.json(updatedReservation);
    } catch (error) {
      console.error('Cancel reservation error:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  }
};

module.exports = courtReservationController;