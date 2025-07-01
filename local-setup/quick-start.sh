
#!/bin/bash

# Tax Compliance Hub - Quick Start Script
# This script sets up the basic project structure for local development

set -e

echo "🚀 Tax Compliance Hub - Quick Start Setup"
echo "========================================"

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

# Get project directory
PROJECT_DIR=${1:-"tax-compliance-hub"}
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

print_status "Creating project directory: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create basic project structure
print_status "Setting up project structure..."
mkdir -p src/{components,hooks,pages,lib,services}
mkdir -p src/components/ui
mkdir -p public
mkdir -p local-setup

# Initialize package.json
print_status "Initializing package.json..."
npm init -y

# Install dependencies
print_status "Installing dependencies..."
npm install vite@latest react@18 react-dom@18 typescript@5
npm install @types/node@20 @types/react@18 @types/react-dom@18
npm install @supabase/supabase-js@2 @tanstack/react-query@5
npm install tailwindcss@3 autoprefixer@10 postcss@8
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-dialog
npm install react-hook-form @hookform/resolvers zod
npm install react-router-dom@6 date-fns recharts sonner
npm install pg bcryptjs jsonwebtoken

print_status "Installing development dependencies..."
npm install -D @types/pg @types/bcryptjs @types/jsonwebtoken @vitejs/plugin-react

# Create environment file
print_status "Creating environment configuration..."
cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://tax_admin:tax_secure_2024@localhost:5432/tax_compliance_hub

# Application Configuration
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
PORT=5173

# Security Configuration
VITE_ENCRYPTION_KEY=your-32-character-encryption-key-here
VITE_JWT_SECRET=your-jwt-secret-key-here

# Demo Mode (for testing)
VITE_ENABLE_DEMO=true
EOF

# Create Vite config
print_status "Creating Vite configuration..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
})
EOF

# Create TypeScript config
print_status "Creating TypeScript configuration..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create tsconfig.node.json
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

# Create Tailwind config
npx tailwindcss init -p

# Create package.json scripts
print_status "Updating package.json scripts..."
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.lint="eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"

# Create gitignore
print_status "Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
/build
/dist
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
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
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

# Create database setup script
print_status "Creating database setup script..."
cat > local-setup/setup-database.sql << 'EOF'
-- Create user profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table
DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'manager', 'staff', 'readonly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE department_type AS ENUM ('tax', 'audit', 'management', 'it');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'readonly',
    department department_type NOT NULL DEFAULT 'tax',
    permissions TEXT[] DEFAULT ARRAY['view_only'],
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demo user
INSERT INTO profiles (email, full_name, username, company_name) VALUES 
('demo@chandariashah.com', 'Demo User', 'demo', 'Chandaria Shah & Associates')
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role, department, permissions) 
SELECT id, 'admin', 'management', ARRAY['all'] FROM profiles WHERE email = 'demo@chandariashah.com'
ON CONFLICT DO NOTHING;
EOF

# Create network info script
cat > local-setup/network-info.sh << 'EOF'
#!/bin/bash

echo "=== Tax Compliance Hub - Network Information ==="
echo ""
echo "Local Access:"
echo "http://localhost:5173"
echo ""
echo "Network Access (for office staff):"
LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -1)
echo "http://$LOCAL_IP:5173"
echo ""
echo "Share this URL with your office staff to access the system"
echo "Make sure they are connected to the same network"
EOF

chmod +x local-setup/network-info.sh

# Create README
print_status "Creating README..."
cat > README.md << 'EOF'
# Tax Compliance Hub - Local Installation

A comprehensive tax compliance management system for local office deployment.

## Quick Start

1. **Setup Database** (PostgreSQL must be installed):
   ```bash
   sudo -u postgres createuser --interactive --pwprompt tax_admin
   sudo -u postgres createdb tax_compliance_hub -O tax_admin
   psql -U tax_admin -d tax_compliance_hub -h localhost -f local-setup/setup-database.sql
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Access the Application**:
   - Local: http://localhost:5173
   - Network: http://YOUR_IP:5173

## Default Login
- Email: `demo@chandariashah.com`
- Password: `demo123`

## Network Access
Run `./local-setup/network-info.sh` to get your network access URL for office staff.

## Documentation
See `local-setup/LOCAL_DEPLOYMENT_GUIDE.md` for complete setup instructions.

## Support
- All data stored locally on your machine
- No internet connection required
- Full VS Code editing support
- Secure office-only access
EOF

print_status "✅ Setup complete!"
echo
print_status "Next steps:"
echo "1. Set up your PostgreSQL database (see README.md)"
echo "2. Start the development server: npm run dev"
echo "3. Access the application at http://localhost:5173"
echo "4. Share network access with office staff: ./local-setup/network-info.sh"
echo
print_status "For complete setup instructions, see local-setup/LOCAL_DEPLOYMENT_GUIDE.md"
echo
print_status "Default demo login: demo@chandariashah.com / demo123"

# Make all scripts executable
chmod +x local-setup/*.sh

print_status "Setup script completed successfully! 🎉"
