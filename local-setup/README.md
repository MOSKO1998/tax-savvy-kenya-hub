
# Tax Compliance Hub - Local Development Setup

This guide will help you set up the Tax Compliance Hub locally using PostgreSQL and pgAdmin.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v13 or higher)
3. **pgAdmin** (for database management)
4. **Git**

## Local Database Setup

### 1. Create Database

Using pgAdmin or psql, create a new database:

```sql
CREATE DATABASE tax_compliance_hub;
```

### 2. Run Database Schema

Execute the SQL file `database-schema.sql` in your PostgreSQL database to create all tables, functions, and policies.

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/tax_compliance_hub

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Nextcloud Configuration
NEXTCLOUD_URL=https://cloud.audit.ke
NEXTCLOUD_USERNAME=your-nextcloud-username
NEXTCLOUD_PASSWORD=your-nextcloud-password

# Optional: For development
NODE_ENV=development
```

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd tax-compliance-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   - Import `database-schema.sql` into your PostgreSQL database
   - Update `.env.local` with your database credentials

4. **Run the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Database: Connect via pgAdmin using your local PostgreSQL instance

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions
│   └── types/         # TypeScript types
├── local-setup/       # Local development files
│   ├── database-schema.sql
│   └── README.md
├── public/            # Static assets
└── package.json
```

## Database Management

- **pgAdmin**: Use for visual database management
- **SQL Scripts**: Located in `local-setup/sql/`
- **Migrations**: Manual execution of SQL files

## Nextcloud Integration

The system uploads documents directly to your Nextcloud instance at `cloud.audit.ke`. Make sure to:

1. Configure Nextcloud credentials in `.env.local`
2. Ensure API access is enabled in your Nextcloud instance
3. Create appropriate folders in Nextcloud for document organization

## Development Features

- **Hot Reload**: Automatic browser refresh on code changes
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Component Library**: shadcn/ui components

## Production Deployment

For production deployment:

1. Set up PostgreSQL on your production server
2. Configure environment variables
3. Build the application: `npm run build`
4. Serve using a process manager like PM2

## Troubleshooting

- **Database Connection**: Verify PostgreSQL is running and credentials are correct
- **Nextcloud Upload**: Check network connectivity and API credentials
- **Permission Issues**: Ensure proper database user permissions

## Support

For issues or questions, refer to the project documentation or contact the development team.
```
