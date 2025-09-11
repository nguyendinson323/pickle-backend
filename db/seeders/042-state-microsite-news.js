'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('state_microsite_news', [
      {
        state_committee_id: 1, // Mexico City State Committee
        title: 'Torneo de Invierno CDMX 2024 - Resultados Oficiales',
        content: 'El Comité de Pickleball de la Ciudad de México se complace en compartir los resultados oficiales del Torneo de Invierno CDMX 2024, celebrado el pasado fin de semana en las canchas del Club Azteca.\n\nEste torneo contó con la participación de 60 jugadores de toda la zona metropolitana, quienes demostraron un nivel técnico excepcional y un gran espíritu deportivo.\n\nResultados por categorías:\n\n**Categoría Open Mixto:**\n🥇 1er Lugar: Carlos Rodriguez / Marina Delgado\n🥈 2do Lugar: Maria Gonzalez / Luis Herrera\n🥉 3er Lugar: Ana Martinez / Diego Sanchez\n\n**Categoría Seniors 50+:**\n🥇 1er Lugar: Roberto Mendoza / Carmen Silva\n🥈 2do Lugar: Alejandro Torres / Patricia Lopez\n🥉 3er Lugar: Miguel Ramirez / Elena Vargas\n\n**Estadísticas del Torneo:**\n- Partidos jugados: 84\n- Horas de competencia: 12\n- Asistencia de público: ~200 personas\n- Puntos de ranking otorgados: Más de 2,000 puntos distribuidos\n\nFelicitamos a todos los participantes por su excelente nivel de juego y deportividad. El próximo evento será el CDMX Open 2024, programado para el 24-25 de febrero.\n\n¡Nos vemos en las canchas!',
        author_name: 'Alejandro Miguel Hernandez Lopez',
        published_date: new Date('2024-01-22 18:00:00'),
        is_featured: true,
        image_url: 'https://example.com/news/torneo_invierno_cdmx_2024.jpg',
        created_at: new Date('2024-01-22 18:00:00'),
        updated_at: new Date('2024-01-22 18:00:00')
      },
      {
        state_committee_id: 1, // Mexico City State Committee
        title: 'Nueva Academia de Pickleball en Polanco',
        content: 'Excelentes noticias para la comunidad de pickleball de la Ciudad de México. El Comité se complace en anunciar la apertura de una nueva academia especializada en la zona de Polanco.\n\nLa **Academia Azteca Pickleball** cuenta con instalaciones de primer nivel:\n\n**Características de la Academia:**\n- 4 canchas techadas con superficie profesional\n- Iluminación LED especializada para juego nocturno\n- Vestidores con casilleros individuales\n- Área de descanso y cafetería\n- Tienda especializada en equipos\n- Estacionamiento gratuito para 50 vehículos\n\n**Programas Disponibles:**\n- Clases grupales para principiantes\n- Entrenamientos avanzados\n- Sesiones de entrenamiento personal\n- Programas especiales para jóvenes (8-17 años)\n- Clinics de fin de semana\n\n**Horarios:**\nLunes a Viernes: 6:00 AM - 10:00 PM\nSábados y Domingos: 7:00 AM - 9:00 PM\n\n**Ubicación:**\nAv. Presidente Masaryk 350, Polanco V Sección, 11560 Ciudad de México, CDMX\n\nLa inauguración oficial será el próximo sábado 3 de febrero con un clinic gratuito para toda la comunidad. ¡Los esperamos!',
        author_name: 'Maria Elena Gonzalez Ruiz',
        published_date: new Date('2024-01-28 14:30:00'),
        is_featured: false,
        image_url: 'https://example.com/news/academia_polanco.jpg',
        created_at: new Date('2024-01-28 14:30:00'),
        updated_at: new Date('2024-01-28 14:30:00')
      },
      {
        state_committee_id: 1, // Mexico City State Committee
        title: 'Clínica Técnica con Instructor Internacional',
        content: 'El Comité de Pickleball de la Ciudad de México tiene el honor de anunciar una clínica técnica especial con el instructor internacional **James Miller**, certificado IPTPA Level 4 y ex jugador profesional de pickleball de Estados Unidos.\n\n**Detalles de la Clínica:**\n📅 Fecha: Sábado 10 de febrero, 2024\n⏰ Horario: 9:00 AM - 4:00 PM\n📍 Ubicación: Club Deportivo Chapultepec\n👥 Cupo limitado: 20 participantes\n💰 Inversión: $1,500 MXN por persona\n\n**Programa de la Clínica:**\n\n**9:00 - 10:30 AM:** Análisis técnico individual\n- Evaluación personalizada de técnica\n- Identificación de áreas de mejora\n- Plan de desarrollo personalizado\n\n**10:45 - 12:15 PM:** Fundamentos avanzados\n- Técnica de voleos en zona de no-voleo\n- Estrategias de posicionamiento\n- Mejoramiento del juego de pies\n\n**1:15 - 2:45 PM:** Estrategia de juego\n- Táctica en dobles avanzado\n- Comunicación efectiva con la pareja\n- Situaciones especiales de juego\n\n**3:00 - 4:00 PM:** Sesión de preguntas y práctica dirigida\n\n**Incluye:**\n- Manual técnico especializado\n- Video análisis personal\n- Certificado de participación\n- Lunch saludable\n- Kit de productos Selkirk\n\n**Requisitos:**\n- Nivel intermedio-avanzado (mínimo 6 meses de experiencia)\n- Equipo propio (raqueta y ropa deportiva)\n\nLas inscripciones están abiertas hasta agotar lugares. ¡No te pierdas esta oportunidad única de aprender con un instructor de clase mundial!',
        author_name: 'Carlos Roberto Jimenez',
        published_date: new Date('2024-02-01 10:15:00'),
        is_featured: true,
        image_url: 'https://example.com/news/clinica_internacional.jpg',
        created_at: new Date('2024-02-01 10:15:00'),
        updated_at: new Date('2024-02-01 10:15:00')
      },
      {
        state_committee_id: 2, // Jalisco State Committee
        title: 'Liga Municipal Jalisco 2024 - Arranca la Temporada',
        content: 'El Comité de Pickleball del Estado de Jalisco se complace en anunciar el inicio oficial de la Liga Municipal 2024, la competencia más importante a nivel estatal que reunirá a los mejores jugadores de diferentes municipios.\n\n**Formato de la Liga:**\nLa liga contará con la participación de 8 municipios representativos del estado:\n- Guadalajara\n- Zapopan\n- Tlaquepaque\n- Tonalá\n- Puerto Vallarta\n- Lagos de Moreno\n- Tepatitlán\n- Chapala\n\n**Sistema de Competencia:**\n- **Fase Regular:** Cada municipio jugará contra todos los demás (7 jornadas)\n- **Playoffs:** Los mejores 4 municipios clasificarán a semifinales\n- **Final:** Se disputará en diciembre en sede neutral\n\n**Categorías Participantes:**\n🎾 Open Mixto (Edad libre)\n🎾 Veteranos 45+ Mixto\n🎾 Juvenil Sub-18 Mixto\n🎾 Femenil Open\n🎾 Varonil Open\n\n**Calendario de Jornadas:**\n- **Jornada 1:** 2-3 de marzo - Sede: Guadalajara\n- **Jornada 2:** 16-17 de marzo - Sede: Puerto Vallarta\n- **Jornada 3:** 6-7 de abril - Sede: Zapopan\n- **Jornada 4:** 20-21 de abril - Sede: Tepatitlán\n- **Jornada 5:** 4-5 de mayo - Sede: Lagos de Moreno\n- **Jornada 6:** 18-19 de mayo - Sede: Chapala\n- **Jornada 7:** 1-2 de junio - Sede: Tlaquepaque\n\n**Premios y Reconocimientos:**\n- Trofeo de Campeón Municipal por categoría\n- Medallas para subcampeones y tercer lugar\n- Reconocimiento al Mejor Jugador de la Liga\n- Puntos para ranking estatal\n- Beca deportiva para categoría juvenil ganadora\n\n**Registro de Equipos:**\nLos municipios interesados pueden registrar sus equipos hasta el 25 de febrero. Cada municipio puede inscribir hasta 3 parejas por categoría.\n\n**Costo de Inscripción:**\n$500 MXN por pareja (incluye playera oficial, seguro deportivo y premiación)\n\nEsta liga representa la oportunidad perfecta para que los jugadores jaliscienses demuestren su talento y se preparen para competencias nacionales.\n\n¡Que comience la competencia!',
        author_name: 'Patricia Elena Sanchez Rivera',
        published_date: new Date('2024-01-25 16:45:00'),
        is_featured: true,
        image_url: 'https://example.com/news/liga_municipal_jalisco.jpg',
        created_at: new Date('2024-01-25 16:45:00'),
        updated_at: new Date('2024-01-25 16:45:00')
      },
      {
        state_committee_id: 2, // Jalisco State Committee
        title: 'Programa de Talentos Juveniles - Convocatoria Abierta',
        content: 'El Comité de Pickleball del Estado de Jalisco lanza oficialmente su **Programa de Talentos Juveniles 2024**, una iniciativa innovadora para identificar, desarrollar y apoyar a las futuras estrellas del pickleball jalisciense.\n\n**Objetivo del Programa:**\nDetectar y formar jóvenes entre 10 y 17 años con aptitudes sobresalientes para el pickleball, brindándoles herramientas técnicas, táticas y mentales para alcanzar su máximo potencial deportivo.\n\n**¿Qué Incluye el Programa?**\n\n**🏆 Entrenamiento Especializado:**\n- Entrenamientos 3 veces por semana\n- Sesiones técnicas con entrenadores certificados\n- Preparación física especializada\n- Entrenamiento mental y psicología deportiva\n\n**🎯 Competencias Oficiales:**\n- Participación en torneos estatales\n- Apoyo para competencias nacionales\n- Intercambios deportivos con otros estados\n- Acceso a rankings juveniles\n\n**📚 Formación Integral:**\n- Talleres de valores deportivos\n- Educación nutricional\n- Manejo de redes sociales y medios\n- Primeros auxilios básicos\n\n**🎁 Beneficios Incluidos:**\n- Beca deportiva del 100% (sin costo)\n- Kit completo de entrenamiento\n- Raqueta profesional Selkirk\n- Uniforme oficial del programa\n- Transporte a competencias estatales\n- Seguro deportivo\n\n**Requisitos para Participar:**\n- Edad: 10 a 17 años cumplidos\n- Experiencia mínima: 6 meses jugando pickleball\n- Carta de recomendación de entrenador\n- Examen médico deportivo\n- Promedio mínimo escolar de 8.0\n- Compromiso de asistencia del 90%\n\n**Proceso de Selección:**\n\n**Fase 1 - Evaluación Técnica (Marzo 9-10):**\nPruebas técnicas básicas en 6 sedes del estado\n\n**Fase 2 - Evaluación Integral (Marzo 16-17):**\nPruebas físicas, psicológicas y entrevistas\n\n**Fase 3 - Selección Final (Marzo 23):**\nAnuncio de los 20 jóvenes seleccionados\n\n**Sedes de Evaluación:**\n- Guadalajara: Centro Deportivo Revolución\n- Zapopan: Club Azteca\n- Puerto Vallarta: Complejo Deportivo Bahía\n- Tepatitlán: Polideportivo Municipal\n- Lagos de Moreno: Gimnasio Olímpico\n- Chapala: Club de Tenis Chapala\n\n**Inscripciones:**\n📅 Período: 1 al 28 de febrero, 2024\n💻 Registro: www.pickleballjalisco.org/talentos\n📧 Informes: talentos@pickleballjalisco.org\n📞 Teléfono: +52 33 5555 6666\n\nEste programa representa una inversión en el futuro del pickleball jalisciense. Buscamos jóvenes talentosos, comprometidos y con sueños de grandeza deportiva.\n\n¡Inscríbete y forma parte de la próxima generación de campeones!',
        author_name: 'Miguel Angel Gutierrez Lopez',
        published_date: new Date('2024-01-30 12:30:00'),
        is_featured: false,
        image_url: 'https://example.com/news/programa_talentos_juveniles.jpg',
        created_at: new Date('2024-01-30 12:30:00'),
        updated_at: new Date('2024-01-30 12:30:00')
      },
      {
        state_committee_id: 2, // Jalisco State Committee
        title: 'Pickleball Playero en Puerto Vallarta - ¡Una Experiencia Única!',
        content: 'Por primera vez en México, el Comité de Pickleball del Estado de Jalisco presenta el **Torneo de Pickleball Playero Puerto Vallarta 2024**, una experiencia deportiva única que combina la pasión por el pickleball con la belleza del Pacífico mexicano.\n\n**¿Qué es el Pickleball Playero?**\nUna modalidad especial del pickleball que se juega en canchas adaptadas sobre arena de playa, donde los elementos naturales como el viento y la superficie irregular añaden un desafío técnico y táctico completamente diferente.\n\n**Detalles del Evento:**\n🏖️ **Fecha:** 16-17 de marzo, 2024\n🌊 **Ubicación:** Playa de los Muertos, Puerto Vallarta\n⏰ **Horarios:** 8:00 AM - 6:00 PM ambos días\n🎾 **Canchas:** 6 canchas profesionales sobre arena\n\n**Adaptaciones Especiales para Playa:**\n- Canchas con dimensiones oficiales sobre arena compactada\n- Redes especiales resistentes al viento marino\n- Pelotas con menor presión para adaptarse a la superficie\n- Arbitraje especializado en modalidad playera\n- Sistema de hidratación constante\n\n**Categorías de Competencia:**\n🏆 **Open Mixto Playero** (Sin límite de edad)\n🏆 **Veteranos 40+ Playero** (Mixto)\n🏆 **Recreativo Playero** (Para principiantes)\n🏆 **Infantil Playero** (8-15 años)\n\n**Programa Completo del Evento:**\n\n**Viernes 15 de marzo:**\n- 6:00 PM: Bienvenida y registro de participantes\n- 7:00 PM: Cena de inauguración frente al mar\n- 8:00 PM: Clinic técnico: \"Adaptación al pickleball playero\"\n\n**Sábado 16 de marzo:**\n- 8:00 AM: Calentamiento grupal en la playa\n- 9:00 AM: Inicio de competencias - Fase de grupos\n- 1:00 PM: Lunch playero con música en vivo\n- 3:00 PM: Continuación de competencias\n- 7:00 PM: Festival cultural vallartense\n\n**Domingo 17 de marzo:**\n- 8:00 AM: Yoga matutino en la playa (opcional)\n- 9:00 AM: Semifinales y finales\n- 2:00 PM: Ceremonia de premiación\n- 3:00 PM: Cierre con festival gastronómico\n\n**Experiencias Complementarias:**\n- Clases de surf para participantes\n- Tour por el malecón de Puerto Vallarta\n- Visita a talleres de artesanías locales\n- Excursión opcional a Islas Marietas\n\n**Premios Especiales:**\n- Trofeos artesanales hechos por artesanos vallartenses\n- Paquetes vacacionales en hoteles de la región\n- Equipos de playa premium\n- Experiencias gastronómicas en restaurantes locales\n\n**Paquetes Todo Incluido Disponibles:**\n\n**Paquete Básico** ($2,800 MXN):\n- Registro al torneo\n- 2 noches de hotel 4 estrellas\n- Desayunos incluidos\n- Transporte aeropuerto-hotel-aeropuerto\n\n**Paquete Premium** ($4,500 MXN):\n- Todo lo del paquete básico\n- Hotel frente al mar\n- Todas las comidas incluidas\n- Excursión a Islas Marietas\n- Masaje relajante post-torneo\n\n**Registro e Informes:**\n📧 Email: playero@pickleballjalisco.org\n📱 WhatsApp: +52 322 123 4567\n🌐 Web: www.pickleballplayero.mx\n\nEste evento marca un hito en la historia del pickleball mexicano. ¡Ven y sé parte de esta experiencia inolvidable donde el deporte se encuentra con el paraíso!\n\n*Espacios limitados - Registro hasta el 10 de marzo o hasta agotar lugares.*',
        author_name: 'Carmen Elena Morales Vega',
        published_date: new Date('2024-02-05 09:45:00'),
        is_featured: true,
        image_url: 'https://example.com/news/pickleball_playero_vallarta.jpg',
        created_at: new Date('2024-02-05 09:45:00'),
        updated_at: new Date('2024-02-05 09:45:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('state_microsite_news', null, {});
  }
};