
#!/bin/bash

# Database Setup Script for Tax Compliance Hub

set -e

echo "🗄️  Tax Compliance Hub - Database Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
DB_NAME="tax_compliance_hub"
DB_USER="tax_admin"
DB_PASSWORD="tax_secure_2024"
DB_HOST="localhost"
DB_PORT="5432"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL client (psql) is not installed"
    print_error "Please install PostgreSQL first:"
    print_error "  sudo apt install postgresql postgresql-contrib"
    exit 1
fi

print_status "PostgreSQL client found ✓"

# Check if PostgreSQL service is running
if ! sudo systemctl is-active --quiet postgresql; then
    print_warning "PostgreSQL service is not running. Starting it..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

print_status "PostgreSQL service is running ✓"

# Create database user and database
print_status "Setting up database user and database..."

sudo -u postgres psql << EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
        ALTER USER $DB_USER CREATEDB;
        RAISE NOTICE 'User $DB_USER created successfully';
    ELSE
        RAISE NOTICE 'User $DB_USER already exists';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DB_NAME OWNER $DB_USER'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

print_status "Database user and database created ✓"

# Test connection
print_status "Testing database connection..."
if PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h $DB_HOST -c "SELECT version();" > /dev/null 2>&1; then
    print_status "Database connection successful ✓"
else
    print_error "Database connection failed"
    exit 1
fi

# Import schema if exists
if [ -f "local-setup/database-schema.sql" ]; then
    print_status "Importing database schema..."
    PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h $DB_HOST -f local-setup/database-schema.sql
    print_status "Database schema imported ✓"
else
    print_warning "Database schema file not found at local-setup/database-schema.sql"
    print_warning "You may need to run migrations manually"
fi

print_status "✅ Database setup completed successfully!"
echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Connection string:"
echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "Update your .env.local file with these database settings"

print_status "Database setup completed! 🎉"
