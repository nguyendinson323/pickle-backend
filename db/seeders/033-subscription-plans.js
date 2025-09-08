'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('subscription_plans', [
      // Plans for Players
      {
        name: 'Basic Player',
        description: 'Ideal plan for recreational players who want to stay connected with the pickleball community.',
        for_role: 'player',
        monthly_price: 99.00,
        yearly_price: 990.00,
        features: '["Basic player profile", "Local tournament registration", "Event calendar access", "Find playing partners", "Basic statistics", "Email support"]',
        is_active: true,
        created_at: new Date('2024-01-01 10:00:00')
      },
      {
        name: 'Pro Player',
        description: 'For competitive players who want to maximize their performance and playing opportunities.',
        for_role: 'player',
        monthly_price: 199.00,
        yearly_price: 1990.00,
        features: '["Everything in Basic plan", "Priority tournament registration", "Advanced statistical analysis", "Personalized ranking system", "Exclusive clinics access", "Training discounts", "Push notifications", "Priority support"]',
        is_active: true,
        created_at: new Date('2024-01-01 10:30:00')
      },
      {
        name: 'Elite Player',
        description: 'Premium plan for professional and semi-professional players competing at the highest level.',
        for_role: 'player',
        monthly_price: 399.00,
        yearly_price: 3990.00,
        features: '["Everything in Pro plan", "National tournament access", "Virtual personal coach", "Video analysis", "Sponsorship program", "Professional network", "Exclusive VIP events", "Dedicated personal manager"]',
        is_active: true,
        created_at: new Date('2024-01-01 11:00:00')
      },
      
      // Plans for Coaches
      {
        name: 'Independent Coach',
        description: 'Perfect for coaches starting their independent practice and looking to build their clientele.',
        for_role: 'coach',
        monthly_price: 299.00,
        yearly_price: 2990.00,
        features: '["Professional coach profile", "Basic booking system", "Up to 50 students", "Schedule management", "Payment processing", "Digital certificates", "Basic teaching resources", "Technical support"]',
        is_active: true,
        created_at: new Date('2024-01-01 12:00:00')
      },
      {
        name: 'Professional Coach',
        description: 'For established coaches managing a large student base and specialized programs.',
        for_role: 'coach',
        monthly_price: 599.00,
        yearly_price: 5990.00,
        features: '["Everything in Independent plan", "Up to 200 students", "Advanced evaluation system", "Personalized training programs", "Progress analysis", "Video platform", "Automated marketing", "Social media integration", "Detailed reports"]',
        is_active: true,
        created_at: new Date('2024-01-01 12:30:00')
      },
      {
        name: 'Coach Academy',
        description: 'Complete solution for academies and coaches managing multiple programs and work teams.',
        for_role: 'coach',
        monthly_price: 1299.00,
        yearly_price: 12990.00,
        features: '["Everything in Professional plan", "Unlimited students", "Multiple coaches", "Franchise system", "Custom API", "Branded mobile app", "24/7 support", "Specialized consulting", "Accounting integration"]',
        is_active: true,
        created_at: new Date('2024-01-01 13:00:00')
      },
      
      // Plans for Clubs
      {
        name: 'Local Club',
        description: 'Ideal for small and medium clubs looking to digitize their basic operations.',
        for_role: 'club',
        monthly_price: 799.00,
        yearly_price: 7990.00,
        features: '["Member management up to 100", "Court booking system", "Event calendar", "Internal communication", "Payment processing", "Basic reports", "Basic website", "Standard support"]',
        is_active: true,
        created_at: new Date('2024-01-01 14:00:00')
      },
      {
        name: 'Premium Club',
        description: 'For large clubs requiring advanced features and better experience for their members.',
        for_role: 'club',
        monthly_price: 1599.00,
        yearly_price: 15990.00,
        features: '["Everything in Local plan", "Unlimited members", "Internal tournament system", "Custom mobile app", "Loyalty program", "Automated marketing", "Advanced analytics", "Multiple locations", "POS integration", "Priority support"]',
        is_active: true,
        created_at: new Date('2024-01-01 14:30:00')
      },
      {
        name: 'Club Enterprise',
        description: 'Enterprise solution for large sports organizations and club chains.',
        for_role: 'club',
        monthly_price: 2999.00,
        yearly_price: 29990.00,
        features: '["Everything in Premium plan", "Multi-tenant", "Complete API", "Full customization", "ERP integration", "Business Intelligence", "Dedicated support", "Guaranteed SLA", "Strategic consulting", "Staff training"]',
        is_active: true,
        created_at: new Date('2024-01-01 15:00:00')
      },
      
      // Plans for Partners (Hotels, Resorts, Stores)
      {
        name: 'Basic Partner',
        description: 'For small businesses wanting to offer pickleball-related services.',
        for_role: 'partner',
        monthly_price: 499.00,
        yearly_price: 4990.00,
        features: '["Business profile", "Service catalog", "Booking system", "Payment processing", "Customer communication", "Basic reports", "Directory listing", "Email support"]',
        is_active: true,
        created_at: new Date('2024-01-01 16:00:00')
      },
      {
        name: 'Pro Partner',
        description: 'For medium establishments looking to maximize their reach and operational efficiency.',
        for_role: 'partner',
        monthly_price: 999.00,
        yearly_price: 9990.00,
        features: '["Everything in Basic plan", "Automated marketing", "Affiliate program", "Market analysis", "Inventory integration", "Mobile app", "Phone support", "Featured promotions", "Multiple locations"]',
        is_active: true,
        created_at: new Date('2024-01-01 16:30:00')
      },
      {
        name: 'Resort Partner',
        description: 'Specialized solution for hotels, resorts and tourist destinations offering pickleball.',
        for_role: 'partner',
        monthly_price: 1999.00,
        yearly_price: 19990.00,
        features: '["Everything in Pro plan", "Tourist package system", "Hotel integration", "Event management", "Tournament coordination", "Concierge services", "International marketing", "Revenue management", "24/7 multilingual support"]',
        is_active: true,
        created_at: new Date('2024-01-01 17:00:00')
      },
      
      // Free plan
      {
        name: 'Free Player',
        description: 'Free plan with basic features for new users wanting to try the platform.',
        for_role: 'player',
        monthly_price: 0.00,
        yearly_price: 0.00,
        features: '["Basic profile", "View public events", "Connect with 10 players", "Limited statistics", "Community support", "Ads included"]',
        is_active: true,
        created_at: new Date('2024-01-01 18:00:00')
      },
      
      // Discontinued plan for testing
      {
        name: 'Coach Startup (Discontinued)',
        description: 'Initial plan for new coaches. No longer available for new subscribers.',
        for_role: 'coach',
        monthly_price: 149.00,
        yearly_price: 1490.00,
        features: '["Basic profile", "Up to 20 students", "Basic payment system", "Limited resources"]',
        is_active: false,
        created_at: new Date('2023-12-01 10:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subscription_plans', null, {});
  }
};