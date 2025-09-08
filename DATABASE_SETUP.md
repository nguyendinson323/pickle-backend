# 🏓 Pickleball Federation Database Setup Guide

This guide will help you set up the complete database structure for the Mexican Pickleball Federation platform.

## 📋 Prerequisites

- **PostgreSQL 12+** installed and running
- **Node.js 16+** and npm installed
- **Git** for cloning the repository

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=pickleball
DB_USER=postgres
DB_PASSWORD=your_db_password
```

### 2. Database Setup

**Option A: Automated Setup (Recommended)**
```bash
npm run db:setup
```

**Option B: Manual Step-by-Step**
```bash
npm run db:create
npm run db:migrate
npm run db:seed
```

### 3. Verify Installation
```bash
npm run db:validate
```

## 📚 Database Structure

### Core Tables
- **users** - Authentication and user management
- **states** - Mexican states (32 states)
- **players** - Player profiles with CURP and NRTP levels
- **coaches** - Coach profiles with certifications
- **clubs** - Pickleball clubs and organizations
- **partners** - Business partners (hotels, sponsors, etc.)
- **state_committees** - State federation committees

### Court Management
- **courts** - Court facilities and amenities
- **court_schedules** - Operating hours
- **court_reservations** - Booking system
- **court_maintenance** - Maintenance tracking

### Tournament System
- **tournaments** - Tournament organization
- **tournament_categories** - Age/skill divisions
- **tournament_registrations** - Player sign-ups
- **tournament_matches** - Match scheduling and results

### Additional Features
- **notifications** - System notifications
- **payments** - Payment processing
- **player_availability** - Player scheduling
- **player_match_requests** - Match-making system
- **ranking_periods** - Ranking system

## 🛠 Available Scripts

### Basic Operations
```bash
npm run db:create        # Create database
npm run db:drop         # Drop database
npm run db:migrate      # Run migrations
npm run db:seed         # Run seeders
```

### Advanced Operations
```bash
npm run db:migrate:status    # Check migration status
npm run db:migrate:undo     # Undo last migration
npm run db:seed:undo        # Undo all seeders
npm run db:reset            # Complete reset (DANGER!)
npm run db:reset:safe       # Interactive reset with confirmation
npm run db:validate         # Validate database structure
```

### Custom Scripts
```bash
npm run db:setup        # Automated initial setup
npm run db:seed:only    # Run only seeders (skip migrations)
```

## 📊 Sample Data

The seeders provide comprehensive test data:

### Users (12 total)
- **1 Admin**: Federation administrator
- **3 Players**: Various skill levels and states
- **2 Coaches**: Certified instructors
- **2 Clubs**: Pickleball organizations
- **2 Partners**: Business partners
- **2 State Committees**: State governance

### Geographic Data
- **32 Mexican States**: Complete with proper codes
- **Courts**: Facilities across major cities
- **Realistic Data**: Mexican names, CURP format, phone numbers

### Tournament Data
- **Multiple Tournaments**: Various levels and categories
- **Match Results**: Completed and ongoing matches
- **Rankings**: Player skill ratings
- **Bookings**: Court reservations with payments

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U your_user -d your_database
```

### Migration Errors
```bash
# Check migration status
npm run db:migrate:status

# Roll back last migration
npm run db:migrate:undo

# Reset and retry
npm run db:reset:safe
```

### Seeding Errors
```bash
# Clear existing data first
npm run db:seed:undo

# Run seeders only
npm run db:seed:only
```

### Permission Issues
Ensure your database user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE pickleball TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

## 🔍 Validation

After setup, verify your database:

```bash
npm run db:validate
```

Expected output:
- ✅ All 20+ tables created
- ✅ Sample data loaded
- ✅ Foreign key relationships intact
- ✅ Indexes and constraints applied

## 🌐 Production Deployment

### Environment Variables
```env
NODE_ENV=production
DB_SSL=true
DATABASE_URL=postgres://user:pass@host:port/database
```

### Deployment Commands
```bash
npm run db:migrate    # Run migrations only
# Do NOT run seeders in production
```

## 📈 Performance Considerations

### Indexes
All foreign keys have indexes for optimal performance:
- User lookups
- State filtering
- Tournament queries
- Court availability

### Connection Pooling
Configured in `config/database.js`:
- **Development**: 5 max connections
- **Production**: 20 max connections
- **Connection timeout**: 30 seconds
- **Idle timeout**: 10 seconds

## 🔐 Security

### Data Protection
- **Passwords**: Bcrypt hashed (12 rounds)
- **CURP**: Mexican national ID format validation
- **SQL Injection**: Parameterized queries via Sequelize
- **Foreign Keys**: Cascade deletion protection

### Privacy
- **Searchable Players**: Controlled via `is_searchable` flag
- **Private Data**: Separate from public profiles
- **State Committees**: Not searchable by default

## 📞 Support

For database issues:
1. Check this documentation
2. Validate your environment variables
3. Ensure PostgreSQL is running
4. Check server logs
5. Run `npm run db:validate` for diagnostics

---

**Ready to serve! 🏓** Your Mexican Pickleball Federation database is now configured and loaded with comprehensive test data.