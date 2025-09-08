'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('states', [
      {
        name: 'Aguascalientes',
        short_code: 'AG',
        created_at: new Date()
      },
      {
        name: 'Baja California',
        short_code: 'BC',
        created_at: new Date()
      },
      {
        name: 'Baja California Sur',
        short_code: 'BCS',
        created_at: new Date()
      },
      {
        name: 'Campeche',
        short_code: 'CAM',
        created_at: new Date()
      },
      {
        name: 'Chiapas',
        short_code: 'CHIS',
        created_at: new Date()
      },
      {
        name: 'Chihuahua',
        short_code: 'CHIH',
        created_at: new Date()
      },
      {
        name: 'Mexico City',
        short_code: 'CDMX',
        created_at: new Date()
      },
      {
        name: 'Coahuila',
        short_code: 'COAH',
        created_at: new Date()
      },
      {
        name: 'Colima',
        short_code: 'COL',
        created_at: new Date()
      },
      {
        name: 'Durango',
        short_code: 'DUR',
        created_at: new Date()
      },
      {
        name: 'State of Mexico',
        short_code: 'MEX',
        created_at: new Date()
      },
      {
        name: 'Guanajuato',
        short_code: 'GTO',
        created_at: new Date()
      },
      {
        name: 'Guerrero',
        short_code: 'GRO',
        created_at: new Date()
      },
      {
        name: 'Hidalgo',
        short_code: 'HID',
        created_at: new Date()
      },
      {
        name: 'Jalisco',
        short_code: 'JAL',
        created_at: new Date()
      },
      {
        name: 'Michoacan',
        short_code: 'MICH',
        created_at: new Date()
      },
      {
        name: 'Morelos',
        short_code: 'MOR',
        created_at: new Date()
      },
      {
        name: 'Nayarit',
        short_code: 'NAY',
        created_at: new Date()
      },
      {
        name: 'Nuevo Leon',
        short_code: 'NL',
        created_at: new Date()
      },
      {
        name: 'Oaxaca',
        short_code: 'OAX',
        created_at: new Date()
      },
      {
        name: 'Puebla',
        short_code: 'PUE',
        created_at: new Date()
      },
      {
        name: 'Queretaro',
        short_code: 'QRO',
        created_at: new Date()
      },
      {
        name: 'Quintana Roo',
        short_code: 'QROO',
        created_at: new Date()
      },
      {
        name: 'San Luis Potosi',
        short_code: 'SLP',
        created_at: new Date()
      },
      {
        name: 'Sinaloa',
        short_code: 'SIN',
        created_at: new Date()
      },
      {
        name: 'Sonora',
        short_code: 'SON',
        created_at: new Date()
      },
      {
        name: 'Tabasco',
        short_code: 'TAB',
        created_at: new Date()
      },
      {
        name: 'Tamaulipas',
        short_code: 'TAMP',
        created_at: new Date()
      },
      {
        name: 'Tlaxcala',
        short_code: 'TLAX',
        created_at: new Date()
      },
      {
        name: 'Veracruz',
        short_code: 'VER',
        created_at: new Date()
      },
      {
        name: 'Yucatan',
        short_code: 'YUC',
        created_at: new Date()
      },
      {
        name: 'Zacatecas',
        short_code: 'ZAC',
        created_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states', null, {});
  }
};