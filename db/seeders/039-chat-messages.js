'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('chat_messages', [
      // Chat Room 1: Direct conversation between María and Carlos
      {
        chat_room_id: 1,
        sender_id: 2, // maria_gonzalez
        content: 'Hi Carlos! How was your training yesterday?',
        sent_at: new Date('2024-01-20 10:35:00'),
        is_system_message: false
      },
      {
        chat_room_id: 1,
        sender_id: 3, // carlos_rodriguez
        content: 'Hi María! Very good, we worked on net play. Interested in training together this week?',
        sent_at: new Date('2024-01-20 11:20:00'),
        is_system_message: false
      },
      {
        chat_room_id: 1,
        sender_id: 2, // maria_gonzalez
        content: 'Sounds perfect! What day works best for you? I\'m free Wednesday and Friday afternoons.',
        sent_at: new Date('2024-01-20 11:45:00'),
        is_system_message: false
      },
      {
        chat_room_id: 1,
        sender_id: 3, // carlos_rodriguez
        content: 'Wednesday is perfect. 4 PM at the Azteca courts?',
        sent_at: new Date('2024-01-20 12:15:00'),
        is_system_message: false
      },
      {
        chat_room_id: 1,
        sender_id: 2, // maria_gonzalez
        content: 'Excellent! See you there. I\'ll arrive 15 minutes early to warm up.',
        sent_at: new Date('2024-01-20 12:30:00'),
        is_system_message: false
      },
      
      // Chat Room 2: Conversation between Coach Miguel and Ana
      {
        chat_room_id: 2,
        sender_id: 5, // coach_miguel
        content: 'Hi Ana, how did you feel after our session last week?',
        sent_at: new Date('2024-01-25 14:50:00'),
        is_system_message: false
      },
      {
        chat_room_id: 2,
        sender_id: 4, // ana_martinez
        content: 'Hi Coach! I felt great. The footwork exercises helped me a lot.',
        sent_at: new Date('2024-01-25 15:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 2,
        sender_id: 5, // coach_miguel
        content: 'I\'m very glad to hear that. For the next session we\'ll work on your volley. Does Thursday at 3 PM work for you?',
        sent_at: new Date('2024-01-25 16:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 2,
        sender_id: 4, // ana_martinez
        content: 'Perfect! I\'ll be there. Do I need to bring anything special?',
        sent_at: new Date('2024-01-25 16:45:00'),
        is_system_message: false
      },
      {
        chat_room_id: 2,
        sender_id: 5, // coach_miguel
        content: 'Just your paddle and willingness to improve 😊 See you Thursday.',
        sent_at: new Date('2024-01-25 17:15:00'),
        is_system_message: false
      },
      
      // Chat Room 6: Pickleball México - General (recent messages)
      {
        chat_room_id: 6,
        sender_id: 1, // admin_federation
        content: 'Good morning community! We remind you that National Championship registrations close on March 5th. Don\'t miss out!',
        sent_at: new Date('2024-02-18 08:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 6,
        sender_id: 3, // carlos_rodriguez
        content: 'I already registered! Anyone else participating in Men\'s Open Singles?',
        sent_at: new Date('2024-02-18 08:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 6,
        sender_id: 2, // maria_gonzalez
        content: 'I\'m going in Women\'s Singles. See you there Carlos! 💪',
        sent_at: new Date('2024-02-18 08:45:00'),
        is_system_message: false
      },
      {
        chat_room_id: 6,
        sender_id: 5, // coach_miguel
        content: 'Excellent participation! Remember there are also preparatory clinics on Saturdays.',
        sent_at: new Date('2024-02-18 09:15:00'),
        is_system_message: false
      },
      {
        chat_room_id: 6,
        sender_id: 4, // ana_martinez
        content: 'Are the clinics for all skill levels?',
        sent_at: new Date('2024-02-18 09:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 6,
        sender_id: 6, // coach_sofia
        content: 'Yes Ana, we have groups separated by level. We\'re waiting for you!',
        sent_at: new Date('2024-02-18 09:45:00'),
        is_system_message: false
      },
      
      // Chat Room 7: Training and Technique
      {
        chat_room_id: 7,
        sender_id: 5, // coach_miguel
        content: 'Today I want to share a tip about the third shot drop. The key is in the wrist...',
        sent_at: new Date('2024-02-17 14:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 7,
        sender_id: 2, // maria_gonzalez
        content: 'Coach Miguel, could you elaborate more on timing? I always struggle with that.',
        sent_at: new Date('2024-02-17 14:15:00'),
        is_system_message: false
      },
      {
        chat_room_id: 7,
        sender_id: 5, // coach_miguel
        content: 'Of course María. Timing depends on reading the opponent\'s ball well. I\'ll send you a video later.',
        sent_at: new Date('2024-02-17 14:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 7,
        sender_id: 3, // carlos_rodriguez
        content: 'I\'ve been practicing drops from baseline. Do you recommend any specific exercise?',
        sent_at: new Date('2024-02-17 15:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 7,
        sender_id: 6, // coach_sofia
        content: 'Carlos, try the target exercise. Place cones in the NVZ and practice accuracy.',
        sent_at: new Date('2024-02-17 15:20:00'),
        is_system_message: false
      },
      
      // Chat Room 8: Mexico City Playing Partners
      {
        chat_room_id: 8,
        sender_id: 2, // maria_gonzalez
        content: 'Anyone available to play tomorrow Saturday morning?',
        sent_at: new Date('2024-02-16 19:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 8,
        sender_id: 3, // carlos_rodriguez
        content: 'I am! What time and where?',
        sent_at: new Date('2024-02-16 20:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 8,
        sender_id: 7, // club_azteca
        content: 'We have courts available from 8 AM. Does that work for you?',
        sent_at: new Date('2024-02-16 20:15:00'),
        is_system_message: false
      },
      {
        chat_room_id: 8,
        sender_id: 2, // maria_gonzalez
        content: 'Perfect! Confirmed for 8 AM at Azteca. Do we need two more pairs?',
        sent_at: new Date('2024-02-16 20:30:00'),
        is_system_message: false
      },
      
      // Chat Room 11: National Championship 2024
      {
        chat_room_id: 11,
        sender_id: 1, // admin_federation
        content: 'Welcome National Championship 2024 participants! Here you will receive all official updates.',
        sent_at: new Date('2024-01-20 09:15:00'),
        is_system_message: true
      },
      {
        chat_room_id: 11,
        sender_id: 1, // admin_federation
        content: 'IMPORTANT: Technical meeting will be March 14th at 6 PM at the venue. Mandatory attendance.',
        sent_at: new Date('2024-02-15 10:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 11,
        sender_id: 3, // carlos_rodriguez
        content: 'Perfect, we\'ll be there. Will there be a bracket draw at the meeting?',
        sent_at: new Date('2024-02-15 10:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 11,
        sender_id: 1, // admin_federation
        content: 'That\'s right Carlos. The participant package with official shirt and credentials will also be distributed.',
        sent_at: new Date('2024-02-15 11:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 11,
        sender_id: 2, // maria_gonzalez
        content: 'How exciting! Is the final prize pool already defined?',
        sent_at: new Date('2024-02-15 14:20:00'),
        is_system_message: false
      },
      {
        chat_room_id: 11,
        sender_id: 1, // admin_federation
        content: 'Yes María, $500,000 MXN distributed among all categories. Details at the technical meeting.',
        sent_at: new Date('2024-02-15 15:00:00'),
        is_system_message: false
      },
      
      // Chat Room 18: Club Azteca - Members
      {
        chat_room_id: 18,
        sender_id: 7, // club_azteca
        content: 'Dear members, we inform you that courts 3 and 4 will be under maintenance tomorrow from 8 AM to 2 PM.',
        sent_at: new Date('2024-02-17 18:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 18,
        sender_id: 2, // maria_gonzalez
        content: 'Thanks for letting us know. Will courts 1 and 2 be available normally?',
        sent_at: new Date('2024-02-17 18:15:00'),
        is_system_message: false
      },
      {
        chat_room_id: 18,
        sender_id: 7, // club_azteca
        content: 'Correct María, courts 1 and 2 normal operation. We also remind you that tomorrow there are group classes at 7 PM.',
        sent_at: new Date('2024-02-17 18:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 18,
        sender_id: 5, // coach_miguel
        content: 'Tomorrow\'s class will focus on doubles strategy. I\'m waiting for you!',
        sent_at: new Date('2024-02-17 19:00:00'),
        is_system_message: false
      },
      
      // Chat Room 22: Certified Coaches Mexico
      {
        chat_room_id: 22,
        sender_id: 1, // admin_federation
        content: 'Reminder: The coaches update course will be next Saturday, February 24th.',
        sent_at: new Date('2024-02-18 09:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 22,
        sender_id: 5, // coach_miguel
        content: 'I\'m already registered. Will it cover the new international rules?',
        sent_at: new Date('2024-02-18 09:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 22,
        sender_id: 1, // admin_federation
        content: 'Exactly Miguel. Also teaching methodology for different ages and new certification system.',
        sent_at: new Date('2024-02-18 10:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 22,
        sender_id: 6, // coach_sofia
        content: 'Perfect, I\'m very interested in the children\'s methodology part.',
        sent_at: new Date('2024-02-18 10:30:00'),
        is_system_message: false
      },
      
      // Chat Room 25: New Players - Welcome
      {
        chat_room_id: 25,
        sender_id: 6, // coach_sofia
        content: 'Welcome new players! This is your space to ask questions without shame. We all started from zero!',
        sent_at: new Date('2024-02-07 10:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 25,
        sender_id: 4, // ana_martinez
        content: 'Hi! I\'m Ana, I started a month ago. Does anyone have tips to improve my serve?',
        sent_at: new Date('2024-02-07 15:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 25,
        sender_id: 6, // coach_sofia
        content: 'Hi Ana! The most important thing about serving is consistency. Practice the slow motion first, then add power.',
        sent_at: new Date('2024-02-07 15:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 25,
        sender_id: 1, // admin_federation
        content: 'Ana, I also recommend our tutorial videos on the official portal. They\'re free!',
        sent_at: new Date('2024-02-07 16:00:00'),
        is_system_message: false
      },
      {
        chat_room_id: 25,
        sender_id: 4, // ana_martinez
        content: 'Thank you so much! I\'ll check out the videos. Is there any beginner clinic soon?',
        sent_at: new Date('2024-02-07 16:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 25,
        sender_id: 6, // coach_sofia
        content: 'Yes Ana! I have a fundamentals clinic every Saturday in March. I\'ll send you the details by direct message.',
        sent_at: new Date('2024-02-07 17:00:00'),
        is_system_message: false
      },
      
      // Additional messages for more realism
      {
        chat_room_id: 1,
        sender_id: 3, // carlos_rodriguez
        content: 'By the way María, did you see the national brackets came out? We ended up in different groups.',
        sent_at: new Date('2024-02-18 17:20:00'),
        is_system_message: false
      },
      {
        chat_room_id: 1,
        sender_id: 2, // maria_gonzalez
        content: 'Yes! I got a very competitive group. I\'m going to train extra these days.',
        sent_at: new Date('2024-02-18 17:45:00'),
        is_system_message: false
      },
      
      {
        chat_room_id: 6,
        sender_id: 11, // estado_cdmx
        content: 'Attention! The Mexico City Open will have live streaming on YouTube. Share with your families!',
        sent_at: new Date('2024-02-18 11:30:00'),
        is_system_message: false
      },
      {
        chat_room_id: 6,
        sender_id: 7, // club_azteca
        content: 'Excellent initiative! How proud that our tournament has that coverage!',
        sent_at: new Date('2024-02-18 11:45:00'),
        is_system_message: false
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('chat_messages', null, {});
  }
};