'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('coach_certifications', [
      // Miguel Ángel Fernández Castro (Coach ID 1) - Certifications
      {
        coach_id: 1,
        name: 'International Pickleball Instructor Certification Level 3',
        issuer: 'International Pickleball Teaching Professional Association (IPTPA)',
        issue_date: '2022-03-15',
        expiry_date: '2025-03-15',
        certificate_url: 'https://example.com/certificates/miguel_iptpa_level3.pdf',
        created_at: new Date('2022-03-20 10:30:00')
      },
      {
        coach_id: 1,
        name: 'National Sports Coach Certification',
        issuer: 'Comisión Nacional de Cultura Física y Deporte (CONADE)',
        issue_date: '2020-11-28',
        expiry_date: '2024-11-28',
        certificate_url: 'https://example.com/certificates/miguel_conade_entrenador.pdf',
        created_at: new Date('2020-12-05 14:45:00')
      },
      {
        coach_id: 1,
        name: 'Certificación en Primeros Auxilios Deportivos',
        issuer: 'Cruz Roja Mexicana',
        issue_date: '2023-06-12',
        expiry_date: '2025-06-12',
        certificate_url: 'https://example.com/certificates/miguel_primeros_auxilios.pdf',
        created_at: new Date('2023-06-18 09:20:00')
      },
      {
        coach_id: 1,
        name: 'Certificación en Psicología Deportiva Aplicada',
        issuer: 'Universidad Nacional Autónoma de México (UNAM)',
        issue_date: '2021-09-05',
        expiry_date: null,
        certificate_url: 'https://example.com/certificates/miguel_psicologia_deportiva.pdf',
        created_at: new Date('2021-09-12 16:15:00')
      },
      {
        coach_id: 1,
        name: 'Certified Professional Pickleball Instructor (CPPI)',
        issuer: 'Professional Pickleball Instructors Association (PPIA)',
        issue_date: '2023-01-20',
        expiry_date: '2026-01-20',
        certificate_url: 'https://example.com/certificates/miguel_cppi.pdf',
        created_at: new Date('2023-01-25 11:40:00')
      },
      
      // Sofía Isabel Ramírez Mendoza (Coach ID 2) - Certificaciones
      {
        coach_id: 2,
        name: 'Certificación Internacional de Instructor de Pickleball Nivel 2',
        issuer: 'International Pickleball Teaching Professional Association (IPTPA)',
        issue_date: '2022-08-10',
        expiry_date: '2025-08-10',
        certificate_url: 'https://example.com/certificates/sofia_iptpa_level2.pdf',
        created_at: new Date('2022-08-18 13:25:00')
      },
      {
        coach_id: 2,
        name: 'Licenciatura en Educación Física y Deportes',
        issuer: 'Universidad de Guadalajara',
        issue_date: '2005-07-15',
        expiry_date: null,
        certificate_url: 'https://example.com/certificates/sofia_licenciatura_ef.pdf',
        created_at: new Date('2005-07-22 12:00:00')
      },
      {
        coach_id: 2,
        name: 'Certificación de Entrenamiento Funcional',
        issuer: 'National Academy of Sports Medicine (NASM)',
        issue_date: '2021-04-22',
        expiry_date: '2024-04-22',
        certificate_url: 'https://example.com/certificates/sofia_nasm_functional.pdf',
        created_at: new Date('2021-04-28 15:30:00')
      },
      {
        coach_id: 2,
        name: 'Certificación en Rehabilitación Deportiva',
        issuer: 'Instituto Mexicano del Seguro Social (IMSS)',
        issue_date: '2020-02-18',
        expiry_date: '2024-02-18',
        certificate_url: 'https://example.com/certificates/sofia_rehabilitacion.pdf',
        created_at: new Date('2020-02-25 08:45:00')
      },
      {
        coach_id: 2,
        name: 'Certificación de Instructor de Yoga Deportivo',
        issuer: 'Yoga Alliance Mexico',
        issue_date: '2019-11-30',
        expiry_date: null,
        certificate_url: 'https://example.com/certificates/sofia_yoga_deportivo.pdf',
        created_at: new Date('2019-12-08 17:20:00')
      },
      {
        coach_id: 2,
        name: 'Certified Pickleball Referee Level 1',
        issuer: 'USA Pickleball Association (USAPA)',
        issue_date: '2023-03-08',
        expiry_date: '2025-03-08',
        certificate_url: 'https://example.com/certificates/sofia_referee_level1.pdf',
        created_at: new Date('2023-03-15 14:10:00')
      },
      {
        coach_id: 2,
        name: 'Especialización en Nutrición Deportiva',
        issuer: 'Colegio Mexicano de Nutriólogos Deportivos',
        issue_date: '2022-05-12',
        expiry_date: '2025-05-12',
        certificate_url: 'https://example.com/certificates/sofia_nutricion_deportiva.pdf',
        created_at: new Date('2022-05-20 10:55:00')
      },
      
      // Certificaciones adicionales recientes
      {
        coach_id: 1,
        name: 'Certificación Avanzada en Biomecánica del Pickleball',
        issuer: 'Pickleball Biomechanics Institute',
        issue_date: '2023-09-15',
        expiry_date: '2026-09-15',
        certificate_url: 'https://example.com/certificates/miguel_biomecanica_avanzada.pdf',
        created_at: new Date('2023-09-22 12:30:00')
      },
      {
        coach_id: 2,
        name: 'Certificación en Entrenamiento de Alto Rendimiento',
        issuer: 'Centro Nacional de Desarrollo de Talentos Deportivos',
        issue_date: '2023-10-20',
        expiry_date: '2027-10-20',
        certificate_url: 'https://example.com/certificates/sofia_alto_rendimiento.pdf',
        created_at: new Date('2023-10-28 16:45:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('coach_certifications', null, {});
  }
};