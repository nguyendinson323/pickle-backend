'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ranking_categories', [
      // Open categories (all ages)
      { name: 'Open Men\'s Singles', gender: 'Male', min_age: 18, max_age: null, created_at: new Date() },
      { name: 'Open Women\'s Singles', gender: 'Female', min_age: 18, max_age: null, created_at: new Date() },
      { name: 'Open Men\'s Doubles', gender: 'Male', min_age: 18, max_age: null, created_at: new Date() },
      { name: 'Open Women\'s Doubles', gender: 'Female', min_age: 18, max_age: null, created_at: new Date() },
      { name: 'Open Mixed Doubles', gender: 'Mixed', min_age: 18, max_age: null, created_at: new Date() },
      
      // Age-based categories
      { name: 'Veterans 35+ Men\'s', gender: 'Male', min_age: 35, max_age: null, created_at: new Date() },
      { name: 'Veterans 35+ Women\'s', gender: 'Female', min_age: 35, max_age: null, created_at: new Date() },
      { name: 'Veterans 50+ Mixed', gender: 'Mixed', min_age: 50, max_age: null, created_at: new Date() },
      { name: 'Junior 16-18 Men\'s', gender: 'Male', min_age: 16, max_age: 18, created_at: new Date() },
      { name: 'Junior 16-18 Women\'s', gender: 'Female', min_age: 16, max_age: 18, created_at: new Date() },
      { name: 'Junior 12-15 Mixed', gender: 'Mixed', min_age: 12, max_age: 15, created_at: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ranking_categories', null, {});
  }
};