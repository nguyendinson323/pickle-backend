const { sequelize, Payment, User } = require('./db/models');

async function addSamplePayments() {
  try {
    // Find existing users to associate with payments
    const users = await User.findAll({ limit: 10 });
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    const samplePayments = [];
    const statuses = ['pending', 'completed', 'failed', 'refunded', 'cancelled'];
    const methods = ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer'];
    const currencies = ['MXN', 'USD'];

    // Create 20 sample payments
    for (let i = 0; i < 20; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomMethod = methods[Math.floor(Math.random() * methods.length)];
      const randomAmount = Math.floor(Math.random() * 5000) + 100; // 100-5100 MXN
      const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      
      // Create payment date within last 6 months
      const randomDaysAgo = Math.floor(Math.random() * 180);
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - randomDaysAgo);

      samplePayments.push({
        user_id: randomUser.id,
        amount: randomAmount,
        currency: randomCurrency,
        status: randomStatus,
        payment_method: randomMethod,
        payment_type: 'membership_fee',
        reference_type: 'user_subscription',
        reference_id: randomUser.id,
        created_at: paymentDate,
        updated_at: new Date()
      });
    }

    // Insert sample payments
    await Payment.bulkCreate(samplePayments);
    console.log(`Created ${samplePayments.length} sample payments successfully!`);
    
    // Show summary
    const paymentStats = await Payment.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['status'],
      raw: true
    });

    console.log('\nPayment Statistics:');
    paymentStats.forEach(stat => {
      console.log(`${stat.status}: ${stat.count} payments, Total: $${stat.total}`);
    });

  } catch (error) {
    console.error('Error creating sample payments:', error);
  } finally {
    await sequelize.close();
  }
}

addSamplePayments();