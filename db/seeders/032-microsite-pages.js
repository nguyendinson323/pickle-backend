'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('microsite_pages', [
      // Pages for Club Pickleball Azteca (microsite_id: 1)
      {
        microsite_id: 1,
        title: 'Home',
        slug: 'home',
        content: '<h1>Welcome to Club Pickleball Azteca</h1><p>The most exclusive pickleball club in Polanco awaits you. Enjoy our world-class facilities and an exceptional sports community.</p><h2>Why Choose Azteca?</h2><ul><li>4 professional courts with LED lighting</li><li>Premium locker rooms with showers</li><li>Private parking</li><li>Cafeteria and rest area</li><li>Certified instructors</li></ul>',
        is_published: true,
        display_order: 1,
        created_at: new Date('2024-01-15 10:30:00'),
        updated_at: new Date('2024-02-10 14:20:00')
      },
      {
        microsite_id: 1,
        title: 'Services',
        slug: 'services',
        content: '<h1>Our Services</h1><h2>Memberships</h2><p>Individual Membership: $1,500 MXN/month<br>Family Membership: $2,800 MXN/month<br>Corporate Membership: $4,500 MXN/month</p><h2>Classes and Training</h2><p>Group classes for beginners<br>Individual training<br>Specialized clinics<br>Summer camps</p><h2>Events</h2><p>Monthly tournaments<br>Social nights<br>Corporate events<br>Private celebrations</p>',
        is_published: true,
        display_order: 2,
        created_at: new Date('2024-01-15 11:00:00'),
        updated_at: new Date('2024-02-05 16:30:00')
      },
      {
        microsite_id: 1,
        title: 'Schedule',
        slug: 'schedule',
        content: '<h1>Operating Hours</h1><h2>Court Availability</h2><p><strong>Monday to Friday:</strong> 6:00 AM - 10:00 PM<br><strong>Saturdays:</strong> 7:00 AM - 9:00 PM<br><strong>Sundays:</strong> 8:00 AM - 8:00 PM</p><h2>Group Classes</h2><p><strong>Beginners:</strong> Tuesday and Thursday 7:00 PM<br><strong>Intermediate:</strong> Monday and Wednesday 6:00 PM<br><strong>Advanced:</strong> Wednesday and Friday 7:30 PM</p><h2>Reservations</h2><p>Call +52 55 1234 5678 or book online.</p>',
        is_published: true,
        display_order: 3,
        created_at: new Date('2024-01-15 11:30:00'),
        updated_at: new Date('2024-02-08 12:15:00')
      },
      {
        microsite_id: 1,
        title: 'Contact',
        slug: 'contact',
        content: '<h1>Contact Us</h1><h2>Contact Information</h2><p><strong>Address:</strong> Av. Presidente Masaryk 250, Polanco, Mexico City<br><strong>Phone:</strong> +52 55 1234 5678<br><strong>Email:</strong> info@clubazteca.com<br><strong>Service Hours:</strong> Monday to Sunday 8:00 AM - 8:00 PM</p><h2>Follow Us</h2><p>Facebook: @ClubPickleballAzteca<br>Instagram: @aztecapickleball<br>Twitter: @clubazteca</p>',
        is_published: true,
        display_order: 4,
        created_at: new Date('2024-01-15 12:00:00'),
        updated_at: new Date('2024-01-20 09:45:00')
      },
      
      // Pages for Hotel Riviera Maya (microsite_id: 4)
      {
        microsite_id: 4,
        title: 'Pickleball Paradise',
        slug: 'home',
        content: '<h1>Pickleball Paradise at Riviera Maya</h1><p>Experience pickleball like never before on our oceanfront Caribbean courts. A unique sporting experience in paradise.</p><h2>Unique Experience</h2><ul><li>3 professional oceanfront courts</li><li>Non-slip acrylic surface</li><li>Panoramic Caribbean views</li><li>Certified bilingual instructors</li><li>Professional equipment included</li></ul><p>Combine luxury vacations with your passion for pickleball!</p>',
        is_published: true,
        display_order: 1,
        created_at: new Date('2024-02-01 14:20:00'),
        updated_at: new Date('2024-02-15 10:30:00')
      },
      {
        microsite_id: 4,
        title: 'Packages',
        slug: 'packages',
        content: '<h1>Pickleball Paradise Packages</h1><h2>Weekend Warrior Package</h2><p>2 nights / 3 days<br>6 hours of play<br>Technical clinic<br>All inclusive: $4,500 MXN per person</p><h2>Pro Player Package</h2><p>4 nights / 5 days<br>Unlimited play<br>Personal training<br>Video analysis<br>All inclusive: $7,800 MXN per person</p><h2>Family Fun Package</h2><p>3 nights / 4 days<br>Family activities<br>Kids classes<br>All inclusive: $12,500 MXN family of 4</p>',
        is_published: true,
        display_order: 2,
        created_at: new Date('2024-02-01 15:00:00'),
        updated_at: new Date('2024-02-12 14:45:00')
      },
      {
        microsite_id: 4,
        title: 'Reservations',
        slug: 'reservations',
        content: '<h1>Book Your Paradise Experience</h1><h2>Reservation Information</h2><p><strong>Phone:</strong> +52 984 873 4890<br><strong>Email:</strong> pickleball@rivieramayaresort.com<br><strong>WhatsApp:</strong> +52 984 123 4567</p><h2>Policies</h2><p>Free cancellation up to 48 hours before<br>Required deposit: 30%<br>We accept credit cards and PayPal</p><h2>High Season</h2><p>December - April: Book 30 days in advance<br>May - November: Book 15 days in advance</p>',
        is_published: true,
        display_order: 3,
        created_at: new Date('2024-02-01 15:30:00'),
        updated_at: new Date('2024-02-18 11:20:00')
      },
      
      // Pages for Coach Miguel (microsite_id: 8)
      {
        microsite_id: 8,
        title: 'Welcome',
        slug: 'home',
        content: '<h1>Coach Miguel Angel Fernandez</h1><p>Specialized pickleball training with over 10 years of experience developing champions.</p><h2>My Philosophy</h2><p>I believe in comprehensive player development, combining technique, tactics, physical and mental preparation to reach maximum potential.</p><h2>Certifications</h2><ul><li>IPTPA Level 3 International</li><li>CONADE National Coach</li><li>Sports Psychology Specialist</li><li>Sports First Aid</li></ul>',
        is_published: true,
        display_order: 1,
        created_at: new Date('2024-02-05 13:20:00'),
        updated_at: new Date('2024-02-18 11:10:00')
      },
      {
        microsite_id: 8,
        title: 'Training Services',
        slug: 'services',
        content: '<h1>Training Services</h1><h2>Individual Training</h2><p>Personalized 1:1 sessions<br>Detailed technical analysis<br>Personalized development plan<br>$850 MXN per hour</p><h2>Semi-Private Training</h2><p>Groups of 2-3 people<br>Focus on doubles play<br>Tactics and strategy<br>$650 MXN per hour per person</p><h2>Group Clinics</h2><p>Groups of 4-8 people<br>Fundamentals and technique<br>Fun and social environment<br>$450 MXN per hour per person</p>',
        is_published: true,
        display_order: 2,
        created_at: new Date('2024-02-05 14:00:00'),
        updated_at: new Date('2024-02-15 16:30:00')
      },
      {
        microsite_id: 8,
        title: 'Book Session',
        slug: 'book',
        content: '<h1>Book Your Training Session</h1><h2>Availability</h2><p><strong>Monday:</strong> 8:00-12:00, 16:00-20:00<br><strong>Tuesday:</strong> 9:00-13:00<br><strong>Wednesday:</strong> 8:00-12:00, 15:00-19:00<br><strong>Thursday:</strong> 10:00-14:00<br><strong>Friday:</strong> 8:00-12:00<br><strong>Saturday:</strong> 7:00-15:00<br><strong>Sunday:</strong> 9:00-13:00</p><h2>Contact</h2><p><strong>Phone:</strong> +52 55 1234 5678<br><strong>Email:</strong> coach@miguelfernandez.com<br><strong>WhatsApp:</strong> +52 55 9876 5432</p>',
        is_published: true,
        display_order: 3,
        created_at: new Date('2024-02-05 14:30:00'),
        updated_at: new Date('2024-02-20 12:45:00')
      },
      
      // Pages for CDMX Committee (microsite_id: 6)
      {
        microsite_id: 6,
        title: 'Home',
        slug: 'home',
        content: '<h1>Mexico City State Pickleball Committee</h1><p>Official organization responsible for promoting and regulating pickleball in Mexico City.</p><h2>Our Mission</h2><p>Develop pickleball in the Mexican capital, organizing official competitions, training talent and promoting sports values.</p><h2>Affiliations</h2><ul><li>Mexican Pickleball Federation</li><li>CONADE Mexico City</li><li>Mexico City Sports Institute</li></ul>',
        is_published: true,
        display_order: 1,
        created_at: new Date('2024-01-10 08:00:00'),
        updated_at: new Date('2024-02-05 12:15:00')
      },
      {
        microsite_id: 6,
        title: 'Official Tournaments',
        slug: 'tournaments',
        content: '<h1>Official Tournaments 2024</h1><h2>Competition Calendar</h2><p><strong>March 2024:</strong> Spring Open CDMX<br><strong>May 2024:</strong> Metropolitan Cup<br><strong>August 2024:</strong> Summer Tournament<br><strong>October 2024:</strong> CDMX State Championship</p><h2>Categories</h2><ul><li>Open Men\'s/Women\'s Singles</li><li>Open Men\'s/Women\'s Doubles</li><li>Mixed Doubles Open</li><li>Veterans 35+, 50+</li><li>Youth 16-18</li></ul><h2>Registration</h2><p>Registration opens 30 days before each event on our official portal.</p>',
        is_published: true,
        display_order: 2,
        created_at: new Date('2024-01-10 09:00:00'),
        updated_at: new Date('2024-02-18 14:30:00')
      },
      
      // Additional pages for other important microsites
      {
        microsite_id: 2, // Club Guadalajara
        title: 'About Us',
        slug: 'about',
        content: '<h1>Guadalajara Pickleball Sports Club</h1><p>With over 5 years of history, we are the most traditional pickleball club in Guadalajara.</p><h2>Our History</h2><p>Founded in 2019 by a group of pickleball enthusiasts, we have grown to become the reference for the sport in Jalisco.</p><h2>Achievements</h2><ul><li>3 consecutive state championships</li><li>15 players in national team</li><li>Talent development center</li></ul>',
        is_published: true,
        display_order: 1,
        created_at: new Date('2024-01-20 16:45:00'),
        updated_at: new Date('2024-02-08 11:30:00')
      },
      
      {
        microsite_id: 10, // National Championship
        title: 'General Information',
        slug: 'info',
        content: '<h1>Mexican Pickleball National Championship 2024</h1><p>The most prestigious Mexican pickleball event returns March 15-17.</p><h2>Event Details</h2><p><strong>Dates:</strong> March 15-17, 2024<br><strong>Venue:</strong> National Sports Talent Development Center<br><strong>Categories:</strong> 12 competitive divisions<br><strong>Prize Pool:</strong> $500,000 MXN</p><h2>Registration</h2><p>Registration from February 1 to March 5<br>Entry fee: $1,500 MXN per category</p>',
        is_published: true,
        display_order: 1,
        created_at: new Date('2024-01-18 12:00:00'),
        updated_at: new Date('2024-02-16 15:30:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('microsite_pages', null, {});
  }
};