
#!/bin/bash

# Tax Compliance Hub Setup Script
# This script automates the installation process

set -e

echo "🚀 Starting Tax Compliance Hub Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "npm version: $(npm -v) ✓"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL client not found. Please install PostgreSQL."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_status "PostgreSQL client found ✓"
fi

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi

print_status "Git version: $(git --version) ✓"

# Create project directory
PROJECT_DIR="tax-compliance-hub"
if [ -d "$PROJECT_DIR" ]; then
    print_warning "Directory $PROJECT_DIR already exists"
    read -p "Remove existing directory? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_DIR"
    else
        print_error "Please remove or rename the existing directory"
        exit 1
    fi
fi

print_status "Creating project directory..."
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Download project files (this would be your actual repository)
print_status "Setting up project files..."
# In a real scenario, you would clone from your repository
# git clone <your-repo-url> .

# For now, we'll create the basic structure
mkdir -p src/{components,hooks,pages,lib}
mkdir -p public
mkdir -p local-setup

# Install dependencies
print_status "Installing dependencies..."
npm init -y
npm install next@14 react@18 react-dom@18 typescript@5 @types/node@20 @types/react@18 @types/react-dom@18
npm install @supabase/supabase-js@2 @tanstack/react-query@5
npm install tailwindcss@3 autoprefixer@10 postcss@8
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-dialog
npm install react-hook-form @hookform/resolvers zod
npm install bcryptjs jsonwebtoken pg

print_status "Installing development dependencies..."
npm install -D @types/bcryptjs @types/jsonwebtoken @types/pg

# Create environment file
print_status "Creating environment configuration..."
cat > .env.local << EOF
# Database Configuration
DATABASE_URL=postgresql://tax_admin:your_secure_password@localhost:5432/tax_compliance_hub

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production

# Nextcloud Configuration
NEXTCLOUD_URL=https://cloud.audit.ke
NEXTCLOUD_USERNAME=it@csa.co.ke
NEXTCLOUD_PASSWORD=Wakatiimefika@1998

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-key-here
RATE_LIMIT_MAX=100

# Development
NODE_ENV=development
PORT=3000
EOF

print_status "Environment file created. Please update the values in .env.local"

# Create database setup script
print_status "Creating database setup script..."
cat > local-setup/create-database.sql << EOF
-- Create database user
CREATE USER tax_admin WITH PASSWORD 'your_secure_password';
ALTER USER tax_admin CREATEDB;

-- Create database
CREATE DATABASE tax_compliance_hub OWNER tax_admin;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tax_compliance_hub TO tax_admin;
EOF

# Create package.json scripts
print_status "Updating package.json scripts..."
npm pkg set scripts.dev="next dev"
npm pkg set scripts.build="next build"
npm pkg set scripts.start="next start"
npm pkg set scripts.lint="next lint"
npm pkg set scripts.db:setup="psql -U postgres -f local-setup/create-database.sql"
npm pkg set scripts.db:migrate="psql -U tax_admin -d tax_compliance_hub -f local-setup/database-schema.sql"

# Create basic Next.js configuration
print_status "Creating Next.js configuration..."
cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXTCLOUD_URL: process.env.NEXTCLOUD_URL,
    NEXTCLOUD_USERNAME: process.env.NEXTCLOUD_USERNAME,
    NEXTCLOUD_PASSWORD: process.env.NEXTCLOUD_PASSWORD,
  },
}

module.exports = nextConfig
EOF

# Create Tailwind configuration
print_status "Creating Tailwind CSS configuration..."
npx tailwindcss init -p

# Create gitignore
print_status "Creating .gitignore..."
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
/build
/.next/
/out/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Local database backups
*.sql
backups/
EOF

# Create README
print_status "Creating README..."
cat > README.md << EOF
# Tax Compliance Hub

A comprehensive tax compliance management system with Nextcloud integration.

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up PostgreSQL database:
   \`\`\`bash
   npm run db:setup
   npm run db:migrate
   \`\`\`

3. Configure environment variables in \`.env.local\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation

See \`local-setup/INSTALLATION_GUIDE.pdf.md\` for complete setup instructions.

## Security Features

- Role-based access control
- Audit logging
- Rate limiting
- Input validation
- Secure file upload to Nextcloud
- Session management

## Support

For technical support, contact: it@csa.co.ke
EOF

print_status "✅ Setup complete!"
echo
print_status "Next steps:"
echo "1. Update the database credentials in .env.local"
echo "2. Set up your PostgreSQL database:"
echo "   sudo -u postgres psql -f local-setup/create-database.sql"
echo "3. Import the database schema:"
echo "   npm run db:migrate"
echo "4. Start the development server:"
echo "   npm run dev"
echo
print_status "For complete setup instructions, see local-setup/INSTALLATION_GUIDE.pdf.md"

# Make script executable
chmod +x local-setup/scripts/setup.sh

print_status "Setup script completed successfully! 🎉"
