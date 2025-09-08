'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('messages', [
      // Messages from Federation (admin_federation - user_id: 1)
      {
        sender_id: 1,
        subject: 'Mexican Pickleball National Championship 2024 - Open Registration',
        content: 'Dear pickleball community members:\n\nWe are pleased to announce that registration is now open for the Mexican Pickleball National Championship 2024, which will be held from March 15-17 at the National Sports Talent Development Center in Mexico City.\n\nThis event will bring together the best players from across the country in all categories. Registration will be open from February 1 to March 5, 2024.\n\nFor more information and registration, visit our official website.\n\nBest regards,\nMexican Pickleball Federation',
        message_type: 'tournament_announcement',
        sent_at: new Date('2024-01-20 09:00:00'),
        has_attachments: true
      },
      {
        sender_id: 1,
        subject: 'New Official Playing Regulations 2024',
        content: 'To all players, coaches and state committees:\n\nWe inform you about updates to the official pickleball regulations that will take effect from April 1, 2024.\n\nMain changes:\n- Modification in non-volley zone dimensions\n- New specifications for official paddles\n- Update to tournament scoring system\n\nThe complete document with all modifications is attached.\n\nAll participants in official tournaments are required to know these new regulations.\n\nSincerely,\nFMP Technical Committee',
        message_type: 'regulation_update',
        sent_at: new Date('2024-02-08 14:30:00'),
        has_attachments: true
      },
      
      // Messages from Maria Gonzalez (player - user_id: 2)
      {
        sender_id: 2,
        subject: 'Request for Group Classes Information',
        content: 'Dear administrative team:\n\nI hope this finds you well. I am writing to request detailed information about pickleball group classes available in our region.\n\nI would like to know:\n- Available schedules\n- Required skill levels\n- Cost per session\n- Court locations\n\nI appreciate your time and look forward to your prompt response.\n\nBest regards,\nMaria Elena Gonzalez',
        message_type: 'inquiry',
        sent_at: new Date('2024-01-25 16:45:00'),
        has_attachments: false
      },
      {
        sender_id: 2,
        subject: 'Participation Confirmation - Mexico City Open 2024',
        content: 'Good morning:\n\nI hereby confirm my participation in the Mexico City Pickleball Open 2024 in the Women\'s Open Singles category.\n\nI have completed the corresponding payment and am attaching the receipt for verification.\n\nI remain attentive to any additional information about the event.\n\nBest regards,\nMaria Gonzalez\nFMP Registration: MG-2024-001',
        message_type: 'tournament_registration',
        sent_at: new Date('2024-02-05 11:20:00'),
        has_attachments: true
      },
      
      // Messages from Carlos Rodriguez (player - user_id: 3)
      {
        sender_id: 3,
        subject: 'Joint Training Sessions Proposal',
        content: 'Hello fellow players:\n\nI hope everyone is having an excellent season. I am writing to propose organizing joint training sessions on weekends.\n\nThe idea is to create a regular practice group where we can:\n- Improve our playing level\n- Share techniques and strategies\n- Better prepare for tournaments\n- Strengthen the pickleball community\n\nIf interested, we could meet on Saturday mornings at Club Azteca Courts.\n\nWhat do you think? I look forward to your comments.\n\nRegards,\nCarlos Rodriguez',
        message_type: 'training_proposal',
        sent_at: new Date('2024-01-30 19:15:00'),
        has_attachments: false
      },
      
      // Messages from Coach Miguel (coach - user_id: 5)
      {
        sender_id: 5,
        subject: 'Personalized Training Program - February 2024',
        content: 'Dear players:\n\nI hope you are well and motivated to continue improving your pickleball level.\n\nI am writing to inform you about my new personalized training program available during February:\n\n📋 PROGRAM INCLUDES:\n• Individualized technical analysis\n• Specific training plan\n• Directed practice sessions\n• Weekly progress tracking\n• Mental preparation for competitions\n\n🏆 BENEFITS:\n- Accelerated technical improvement\n- Common error correction\n- Game strategy development\n- Increased court confidence\n\n💰 INVESTMENT: $850 MXN per hour\n📅 AVAILABILITY: Monday to Sunday\n📍 LOCATION: Club Azteca Courts - Polanco\n\nTo schedule your session or resolve questions, you can contact me directly.\n\nSee you on the court!\n\nCoach Miguel Angel Fernandez\nIPTPA Level 3 Certification\nPhone: +52 55 1234 5678',
        message_type: 'coaching_offer',
        sent_at: new Date('2024-02-01 08:30:00'),
        has_attachments: false
      },
      {
        sender_id: 5,
        subject: 'Technical Tips: Improving Your Serve in Pickleball',
        content: 'Dear players:\n\nToday I want to share some technical tips to improve one of the most important aspects of the game: the serve.\n\n🎾 BASIC SERVE TECHNIQUE:\n\n1. INITIAL POSITION:\n   - Feet parallel to baseline\n   - Weight evenly distributed\n   - Paddle at waist height\n\n2. MOVEMENT:\n   - Pendulum motion from bottom to top\n   - Contact with ball below waist\n   - Natural follow-through toward target\n\n3. KEY POINTS:\n   - Maintain visual contact with ball\n   - Breathe before executing\n   - Aim for specific areas of opponent\'s court\n\n🎯 PRACTICE EXERCISES:\n- 20 daily serves to each corner\n- Practice deep vs. short serves\n- Vary speed and spin\n\nWant more tips like these? Write to me!\n\nSuccess on the court,\nCoach Miguel',
        message_type: 'training_tips',
        sent_at: new Date('2024-02-10 15:45:00'),
        has_attachments: false
      },
      
      // Messages from Coach Sofia (coach - user_id: 6)
      {
        sender_id: 6,
        subject: 'Fundamentals Clinic for Beginners - March 2024',
        content: 'Hello pickleball community:\n\nExcellent news! I will be teaching a specialized fundamentals clinic for beginning players during March.\n\n🏓 FUNDAMENTALS CLINIC:\n📅 Dates: Every Saturday in March\n⏰ Schedule: 9:00 AM - 12:00 PM\n📍 Location: Guadalajara Sports Center\n👥 Capacity: Maximum 12 participants\n💰 Cost: $1,200 MXN (4 sessions)\n\n📚 CURRICULUM:\n\nWeek 1: Grip and basic position\n- Correct way to hold paddle\n- Court posture and balance\n- Basic footwork\n\nWeek 2: Fundamental strokes\n- Basic forehand and backhand\n- Volley technique\n- Coordination exercises\n\nWeek 3: Serve and return\n- Underhand serve technique\n- Positioning to receive\n- Two-bounce rule\n\nWeek 4: Basic strategy\n- Court positioning\n- Non-volley zone play\n- Basic doubles tactics\n\n🎁 INCLUDES:\n- Fundamentals manual\n- Access to educational videos\n- Personalized follow-up\n\nLimited spots! Registration open.\n\nBest regards,\nCoach Sofia Ramirez\nPhysical Education License\nIPTPA Level 2 Certification',
        message_type: 'coaching_clinic',
        sent_at: new Date('2024-02-15 10:20:00'),
        has_attachments: true
      },
      
      // Messages from CDMX State Committee (state_committee - user_id: 11)
      {
        sender_id: 11,
        subject: 'Official Results - CDMX Winter Cup 2024',
        content: 'Dear Mexico City pickleball community:\n\nWe are pleased to share the official results of the CDMX Winter Cup 2024, held last weekend at Club Azteca Courts.\n\n🏆 FINAL RESULTS:\n\nCATEGORY: Winter Open Mixed\n\n🥇 1st Place: Carlos Rodriguez / Marina Delgado\n🥈 2nd Place: Maria Gonzalez / Luis Herrera  \n🥉 3rd Place: Ana Martinez / Diego Sanchez\n\n📊 TOURNAMENT STATISTICS:\n- Participants: 60 players\n- Matches played: 84\n- Competition hours: 12\n- Attending audience: ~200 people\n\n🎯 RANKING POINTS AWARDED:\n- 1st place: 380 points\n- 2nd place: 280 points  \n- 3rd place: 180 points\n- Participation: 80 points\n\n💪 SPECIAL RECOGNITIONS:\n- Fair Play: Roberto Mendoza\n- Best Progress: Ana Martinez\n- Sportsmanship: Maria Gonzalez\n\n📈 UPCOMING EVENTS:\n- CDMX Open 2024: February 24-25\n- Youth clinic: March 2-3\n- Charity tournament: March 16\n\nCongratulations to all participants for their excellent level of play and sportsmanship!\n\nBest regards,\nCDMX State Committee\nAlejandro Hernandez - President',
        message_type: 'tournament_results',
        sent_at: new Date('2024-01-22 18:00:00'),
        has_attachments: true
      },
      
      // Message from Partner Riviera Hotel (partner - user_id: 9)
      {
        sender_id: 9,
        subject: 'Special Invitation: Riviera Maya Open 2024',
        content: 'Distinguished pickleball players:\n\nIt is our honor to extend a cordial invitation to the most prestigious event in the Riviera Maya: the Riviera Maya Open - Beach Tournament 2024.\n\n🏝️ RIVIERA MAYA OPEN 2024\n📅 Dates: March 22-24, 2024\n📍 Location: Riviera Maya Resort & Spa Hotel\n🏖️ Courts: Facing the Caribbean Sea\n\n✨ UNIQUE EXPERIENCE:\n- First-level tournament with ocean view\n- Specialized non-slip acrylic surface\n- Paradise atmosphere of the Mexican Caribbean\n- Networking with international players\n\n🎁 ALL-INCLUSIVE PACKAGE:\n- 3 days / 2 nights in double room\n- All meals and beverages\n- Full access to resort facilities\n- Airport-hotel-airport transportation\n- Medical support team\n- Sports massage sessions\n\n🏆 PRIZES:\n- Prize pool: $150,000 MXN\n- Personalized crystal trophies\n- Premium sports products\n- Participation certificates\n\n💰 INVESTMENT:\n- Individual: $2,200 MXN\n- Doubles: $4,000 MXN per pair\n- Includes: registration + hotel package\n\n⭐ COMPLEMENTARY ACTIVITIES:\n- Seaside gala dinner\n- Clinic with international professionals\n- Cenotes excursion (optional)\n- Mayan cultural show\n\nThis event combines high-level competition with an unforgettable vacation in one of Mexico\'s most beautiful destinations.\n\n📞 RESERVATIONS:\n+52 984 873 4890\nreservations@rivieramayaresort.com\n\n🕐 DEADLINE: March 15, 2024\n💳 We accept: Cash, cards, transfers\n\nWe await you in paradise for a unique sports experience!\n\nGreetings from Riviera Maya,\nRiviera Maya Resort & Spa Team',
        message_type: 'event_invitation',
        sent_at: new Date('2024-02-12 12:30:00'),
        has_attachments: true
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('messages', null, {});
  }
};