require('dotenv').config();

// module.exports = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     dialectOptions: process.env.DB_SSL === 'true' ? {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false, // allow self-signed certs, needed for Render
//       },
//     } : {},
//   },
// };

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'a',
    database: process.env.DB_NAME || 'pickleball',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};