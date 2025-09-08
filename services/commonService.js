const { Op, Sequelize } = require('sequelize')
const {
  User,
  Player,
  Coach, 
  Club,
  Partner,
  StateCommittee,
  State,
  Tournament,
  TournamentRegistration,
  Court,
  TournamentMatch,
  PrivacyPolicy
} = require('../db/models')

const getFederationStatistics = async () => {
  try {
    const [
      totalPlayers,
      totalCoaches,
      totalClubs,
      totalPartners,
      totalStateCommittees,
      totalCourts,
      activeTournaments,
      totalTournaments,
      totalMatches,
      registeredThisMonth,
      totalStates
    ] = await Promise.all([
      Player.count(),
      Coach.count(),
      Club.count(),
      Partner.count(),
      StateCommittee.count(),
      Court.count({ where: { status: 'active' } }),
      Tournament.count({ where: { status: 'ongoing' } }),
      Tournament.count(),
      TournamentMatch.count(),
      User.count({
        where: {
          created_at: {
            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      }),
      State.count()
    ])

    return {
      total_players: totalPlayers,
      total_coaches: totalCoaches,
      total_clubs: totalClubs,
      total_partners: totalPartners,
      total_state_committees: totalStateCommittees,
      total_courts: totalCourts,
      active_tournaments: activeTournaments,
      total_tournaments: totalTournaments,
      total_matches_played: totalMatches,
      registered_this_month: registeredThisMonth,
      total_states: totalStates
    }
  } catch (error) {
    throw new Error('Failed to get federation statistics: ' + error.message)
  }
}

const getAllStates = async () => {
  try {
    return await State.findAll({
      attributes: ['id', 'name', 'short_code', 'created_at'],
      order: [['name', 'ASC']]
    })
  } catch (error) {
    throw new Error('Failed to get states: ' + error.message)
  }
}

const getUpcomingTournaments = async (limit = 6) => {
  try {
    const tournaments = await Tournament.findAll({
      where: {
        status: ['upcoming', 'ongoing'],
        start_date: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name']
        },
        {
          model: TournamentRegistration,
          as: 'registrations',
          attributes: ['id'],
          separate: true
        }
      ],
      order: [['start_date', 'ASC']],
      limit
    })

    return tournaments.map(tournament => ({
      ...tournament.toJSON(),
      current_participants: tournament.registrations ? tournament.registrations.length : 0
    }))
  } catch (error) {
    throw new Error('Failed to get upcoming tournaments: ' + error.message)
  }
}

const getRecentTournaments = async (limit = 6) => {
  try {
    const tournaments = await Tournament.findAll({
      where: {
        status: 'completed',
        end_date: {
          [Op.lte]: new Date(),
          [Op.gte]: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      include: [
        {
          model: State,
          as: 'state',
          attributes: ['id', 'name']
        },
        {
          model: TournamentRegistration,
          as: 'registrations',
          attributes: ['id'],
          separate: true
        }
      ],
      order: [['end_date', 'DESC']],
      limit
    })

    return tournaments.map(tournament => ({
      ...tournament.toJSON(),
      current_participants: tournament.registrations ? tournament.registrations.length : 0
    }))
  } catch (error) {
    throw new Error('Failed to get recent tournaments: ' + error.message)
  }
}

const getFederationInfo = async () => {
  try {
    return {
      name: 'Mexican Pickleball Federation',
      description: 'The official governing body for pickleball in Mexico, dedicated to promoting and developing the sport nationwide.',
      contact_email: 'info@pickleballmexico.org',
      contact_phone: '+52 55 1234 5678',
      address: 'Ciudad de México, México',
      website: 'https://pickleballmexico.org',
      social_media: {
        facebook: 'https://facebook.com/PickleballMexico',
        twitter: 'https://twitter.com/PickleballMX',
        instagram: 'https://instagram.com/PickleballMexico',
        youtube: 'https://youtube.com/PickleballMexico'
      },
      president_name: 'Carlos Rodriguez',
      president_title: 'Federation President',
      mission: 'To promote, develop, and regulate pickleball as a sport for all Mexicans, fostering community engagement and athletic excellence.',
      vision: 'To establish Mexico as a leading nation in international pickleball competition while making the sport accessible to all communities.',
      founded_year: 2020
    }
  } catch (error) {
    throw new Error('Failed to get federation info: ' + error.message)
  }
}

const getPrivacyPolicy = async () => {
  try {
    return await PrivacyPolicy.findOne({
      where: { is_active: true },
      order: [['created_at', 'DESC']]
    })
  } catch (error) {
    throw new Error('Failed to get privacy policy: ' + error.message)
  }
}

const getFeaturedContent = async () => {
  try {
    return [
      {
        id: 1,
        title: 'Join the Mexican Pickleball Community',
        description: 'Connect with players, coaches, and clubs across Mexico',
        image_url: '/images/featured/community.jpg',
        link_url: '/register',
        type: 'promotion',
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Find Courts Near You',
        description: 'Discover and reserve pickleball courts in your area',
        image_url: '/images/featured/courts.jpg',
        link_url: '/courts',
        type: 'feature',
        is_active: true,
        display_order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Tournament Registration Open',
        description: 'Register for upcoming tournaments and compete with the best',
        image_url: '/images/featured/tournaments.jpg',
        link_url: '/tournaments',
        type: 'promotion',
        is_active: true,
        display_order: 3,
        created_at: new Date().toISOString()
      }
    ]
  } catch (error) {
    throw new Error('Failed to get featured content: ' + error.message)
  }
}

const getNewsArticles = async () => {
  try {
    return [
      {
        id: 1,
        title: 'Mexican Open 2024 Registration Now Open',
        content: 'The biggest pickleball tournament in Mexico is accepting registrations...',
        author: 'Federation Staff',
        image_url: '/images/news/mexican-open-2024.jpg',
        published_at: new Date().toISOString(),
        is_featured: true,
        category: 'tournaments'
      },
      {
        id: 2,
        title: 'New Courts Opening in Guadalajara',
        content: 'Three new state-of-the-art pickleball courts are opening in Guadalajara...',
        author: 'Federation Staff',
        image_url: '/images/news/guadalajara-courts.jpg',
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        category: 'facilities'
      },
      {
        id: 3,
        title: 'Coach Certification Program Launch',
        content: 'New certification program for pickleball coaches now available...',
        author: 'Federation Staff',
        image_url: '/images/news/coach-certification.jpg',
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        is_featured: false,
        category: 'education'
      }
    ]
  } catch (error) {
    throw new Error('Failed to get news articles: ' + error.message)
  }
}

const getAllCommonData = async () => {
  try {
    const [
      states,
      federationStatistics,
      upcomingTournaments,
      recentTournaments,
      federationInfo,
      privacyPolicy,
      featuredContent,
      newsArticles
    ] = await Promise.all([
      getAllStates(),
      getFederationStatistics(),
      getUpcomingTournaments(),
      getRecentTournaments(),
      getFederationInfo(),
      getPrivacyPolicy(),
      getFeaturedContent(),
      getNewsArticles()
    ])

    return {
      states,
      federation_statistics: federationStatistics,
      upcoming_tournaments: upcomingTournaments,
      recent_tournaments: recentTournaments,
      federation_info: federationInfo,
      privacy_policy: privacyPolicy,
      featured_content: featuredContent,
      news_articles: newsArticles
    }
  } catch (error) {
    throw new Error('Failed to get common data: ' + error.message)
  }
}

module.exports = {
  getFederationStatistics,
  getAllStates,
  getUpcomingTournaments,
  getRecentTournaments,
  getFederationInfo,
  getPrivacyPolicy,
  getFeaturedContent,
  getNewsArticles,
  getAllCommonData
}