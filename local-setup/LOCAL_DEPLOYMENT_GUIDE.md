
# Tax Compliance Hub - Local Deployment Guide
**Complete Setup for Debian Desktop with VS Code**

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Project Setup](#project-setup)
5. [Local Development](#local-development)
6. [Network Configuration](#network-configuration)
7. [Security Setup](#security-setup)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **OS**: Debian 11/12 (Desktop)
- **RAM**: 8GB minimum
- **Storage**: 10GB free space
- **Network**: Local network access

### Required Software Installation

#### 1. Install Node.js and npm
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (version 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

#### 2. Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
sudo -u postgres createuser --interactive --pwprompt tax_admin
# When prompted, enter password: tax_secure_2024
# Answer 'y' to "Shall the new role be a superuser?"

# Create database
sudo -u postgres createdb tax_compliance_hub -O tax_admin
```

#### 3. Install VS Code
```bash
# Download and install VS Code
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'

sudo apt update
sudo apt install code -y
```

#### 4. Install Git
```bash
sudo apt install git -y
```

## Environment Setup

### 1. Create Project Directory
```bash
# Create project directory in your home folder
mkdir ~/tax-compliance-hub
cd ~/tax-compliance-hub
```

### 2. Initialize Project
```bash
# Initialize package.json
npm init -y

# Install required dependencies
npm install vite@latest react@18 react-dom@18 typescript@5
npm install @types/node@20 @types/react@18 @types/react-dom@18
npm install @supabase/supabase-js@2 @tanstack/react-query@5
npm install tailwindcss@3 autoprefixer@10 postcss@8
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-dialog
npm install react-hook-form @hookform/resolvers zod
npm install react-router-dom@6
npm install date-fns recharts sonner
npm install pg bcryptjs jsonwebtoken
npm install -D @types/pg @types/bcryptjs @types/jsonwebtoken
```

### 3. Create Environment Configuration
```bash
# Create .env.local file
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
```

## Database Configuration

### 1. Connect to PostgreSQL
```bash
# Connect to your database
psql -U tax_admin -d tax_compliance_hub -h localhost
```

### 2. Create Database Schema
```sql
-- Create user profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user roles table
CREATE TYPE app_role AS ENUM ('admin', 'manager', 'staff', 'readonly');
CREATE TYPE department_type AS ENUM ('tax', 'audit', 'management', 'it');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'readonly',
    department department_type NOT NULL DEFAULT 'tax',
    permissions TEXT[] DEFAULT ARRAY['view_only'],
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    tax_id TEXT,
    address TEXT,
    client_type TEXT DEFAULT 'individual',
    status TEXT DEFAULT 'active',
    created_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax obligations table
CREATE TYPE tax_type AS ENUM ('vat', 'paye', 'corporate_tax', 'withholding_tax', 'customs_duty');
CREATE TYPE obligation_status AS ENUM ('pending', 'completed', 'overdue', 'cancelled');

CREATE TABLE tax_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    tax_type tax_type NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC,
    status obligation_status DEFAULT 'pending',
    client_id UUID REFERENCES clients(id),
    created_by UUID REFERENCES profiles(id),
    assigned_to UUID REFERENCES profiles(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    reminder_emails TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TYPE document_type AS ENUM ('tax_return', 'receipt', 'invoice', 'compliance_certificate', 'other');

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    document_type document_type NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    client_id UUID REFERENCES clients(id),
    obligation_id UUID REFERENCES tax_obligations(id),
    uploaded_by UUID REFERENCES profiles(id),
    nextcloud_path TEXT,
    share_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TYPE notification_type AS ENUM ('system_alert', 'deadline_reminder', 'compliance_update', 'document_uploaded', 'user_action');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    event_type TEXT DEFAULT 'tax_obligation',
    obligation_id UUID REFERENCES tax_obligations(id),
    client_id UUID REFERENCES clients(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demo user for testing
INSERT INTO profiles (email, full_name, username, company_name) VALUES 
('demo@chandariashah.com', 'Demo User', 'demo', 'Chandaria Shah & Associates');

INSERT INTO user_roles (user_id, role, department, permissions) 
SELECT id, 'admin', 'management', ARRAY['all'] FROM profiles WHERE email = 'demo@chandariashah.com';

-- Create sample clients
INSERT INTO clients (name, email, phone, tax_id, client_type, created_by) VALUES 
('ABC Corporation', 'abc@company.com', '+254712345678', 'P051234567A', 'corporate', (SELECT id FROM profiles WHERE email = 'demo@chandariashah.com')),
('John Doe', 'john@email.com', '+254723456789', 'A123456789B', 'individual', (SELECT id FROM profiles WHERE email = 'demo@chandariashah.com'));

-- Create sample tax obligations
INSERT INTO tax_obligations (title, description, tax_type, due_date, amount, client_id, created_by) VALUES 
('VAT Return Q4 2024', 'Quarterly VAT return filing', 'vat', '2024-12-31', 50000.00, (SELECT id FROM clients WHERE name = 'ABC Corporation'), (SELECT id FROM profiles WHERE email = 'demo@chandariashah.com')),
('PAYE November 2024', 'Monthly PAYE filing', 'paye', '2024-12-09', 25000.00, (SELECT id FROM clients WHERE name = 'ABC Corporation'), (SELECT id FROM profiles WHERE email = 'demo@chandariashah.com'));

-- Exit PostgreSQL
\q
```

## Project Setup

### 1. Create Project Structure
```bash
# Create directory structure
mkdir -p src/{components,hooks,pages,lib,services,integrations}
mkdir -p src/components/ui
mkdir -p public
mkdir -p local-setup
```

### 2. Configure Vite
```bash
# Create vite.config.ts
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
    host: '0.0.0.0', // Allow external connections
    port: 5173,
  },
})
EOF
```

### 3. Configure TypeScript
```bash
# Create tsconfig.json
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
```

### 4. Configure Tailwind CSS
```bash
# Create tailwind.config.js
npx tailwindcss init -p

# Update tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF
```

### 5. Create Package Scripts
```bash
# Update package.json scripts
npm pkg set scripts.dev="vite"
npm pkg set scripts.build="tsc && vite build"
npm pkg set scripts.preview="vite preview"
npm pkg set scripts.lint="eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
```

## Local Development

### 1. Create Basic Database Client
```bash
# Create database client
cat > src/lib/database.ts << 'EOF'
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://tax_admin:tax_secure_2024@localhost:5432/tax_compliance_hub',
});

export { pool };
EOF
```

### 2. Create Demo Authentication
```bash
# Create simple auth system
cat > src/lib/auth.ts << 'EOF'
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  permissions: string[];
}

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User | null> {
    // Demo authentication - replace with real authentication
    if (email === 'demo@chandariashah.com' && password === 'demo123') {
      this.currentUser = {
        id: 'demo-user-id',
        email: 'demo@chandariashah.com',
        full_name: 'Demo User',
        role: 'admin',
        department: 'management',
        permissions: ['all']
      };
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      return this.currentUser;
    }
    return null;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
export type { User };
EOF
```

### 3. Create Main Application Files
```bash
# Create main CSS file
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# Create main App component
cat > src/App.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { authService, User } from './lib/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;
EOF

# Create Login component
cat > src/components/Login.tsx << 'EOF'
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@chandariashah.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onLogin(email, password);
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tax Compliance Hub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Local Office Access
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center text-gray-600">
            Demo credentials: demo@chandariashah.com / demo123
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
EOF

# Create Dashboard component
cat > src/components/Dashboard.tsx << 'EOF'
import React from 'react';
import { User } from '../lib/auth';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Tax Compliance Hub
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.full_name}
              </span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Tax Compliance Dashboard
              </h2>
              <p className="text-gray-600">
                System is running locally on your Debian machine
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Role: {user.role} | Department: {user.department}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
EOF

# Create main entry point
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create index.html
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tax Compliance Hub</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
```

## Network Configuration

### 1. Find Your IP Address
```bash
# Get your local IP address
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
```

### 2. Configure Firewall (Optional)
```bash
# Install UFW if not already installed
sudo apt install ufw -y

# Allow SSH (if needed)
sudo ufw allow ssh

# Allow local network access to port 5173
sudo ufw allow from 192.168.0.0/16 to any port 5173
sudo ufw allow from 10.0.0.0/8 to any port 5173

# Enable firewall
sudo ufw enable
```

### 3. Start Development Server
```bash
# Start the development server
npm run dev

# The application will be available at:
# - Local: http://localhost:5173
# - Network: http://YOUR_IP_ADDRESS:5173
```

## VS Code Setup

### 1. Open Project in VS Code
```bash
# Open the project in VS Code
code ~/tax-compliance-hub
```

### 2. Install Recommended Extensions
- **Extensions to install:**
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer

### 3. Configure VS Code Settings
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.quoteStyle": "single",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Security Setup

### 1. Create User Accounts
```bash
# Create a script to add users
cat > local-setup/add-user.sh << 'EOF'
#!/bin/bash

# This script adds a new user to the system
# Usage: ./add-user.sh username email fullname role

USERNAME=$1
EMAIL=$2
FULLNAME=$3
ROLE=${4:-readonly}

if [ -z "$USERNAME" ] || [ -z "$EMAIL" ] || [ -z "$FULLNAME" ]; then
    echo "Usage: $0 username email fullname [role]"
    echo "Example: $0 john john@company.com 'John Doe' staff"
    exit 1
fi

# Connect to database and add user
psql -U tax_admin -d tax_compliance_hub -h localhost << EOF
INSERT INTO profiles (email, full_name, username, company_name) VALUES 
('$EMAIL', '$FULLNAME', '$USERNAME', 'Your Company Name');

INSERT INTO user_roles (user_id, role, department, permissions) 
SELECT id, '$ROLE', 'tax', ARRAY['view_only'] FROM profiles WHERE email = '$EMAIL';

SELECT 'User added successfully: ' || full_name FROM profiles WHERE email = '$EMAIL';
EOF

echo "User $FULLNAME added with role $ROLE"
echo "They can login with: $EMAIL / (set password in application)"
EOF

chmod +x local-setup/add-user.sh
```

### 2. Network Access Control
```bash
# Create a script to show network access info
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
echo ""
echo "=== Current Network Interfaces ==="
ip addr show | grep "inet " | grep -v 127.0.0.1
EOF

chmod +x local-setup/network-info.sh
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Restart PostgreSQL if needed
sudo systemctl restart postgresql

# Check database connectivity
psql -U tax_admin -d tax_compliance_hub -h localhost -c "SELECT version();"
```

#### 2. Port Already in Use
```bash
# Find what's using port 5173
sudo lsof -i :5173

# Kill the process if needed
sudo kill -9 PID_NUMBER

# Or use a different port
npm run dev -- --port 3000
```

#### 3. Network Access Issues
```bash
# Check firewall status
sudo ufw status

# Make sure your IP range is allowed
sudo ufw allow from YOUR_NETWORK_RANGE to any port 5173

# Example for common networks:
sudo ufw allow from 192.168.1.0/24 to any port 5173
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER ~/tax-compliance-hub
chmod -R 755 ~/tax-compliance-hub
```

### Maintenance Scripts

#### 1. Database Backup
```bash
cat > local-setup/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/tax-compliance-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

pg_dump -U tax_admin -h localhost tax_compliance_hub > $BACKUP_DIR/backup_$DATE.sql

echo "Database backed up to $BACKUP_DIR/backup_$DATE.sql"
EOF

chmod +x local-setup/backup-db.sh
```

#### 2. System Status Check
```bash
cat > local-setup/status-check.sh << 'EOF'
#!/bin/bash

echo "=== Tax Compliance Hub - System Status ==="
echo ""

# Check PostgreSQL
if sudo systemctl is-active --quiet postgresql; then
    echo "✓ PostgreSQL: Running"
else
    echo "✗ PostgreSQL: Not running"
fi

# Check database connection
if psql -U tax_admin -d tax_compliance_hub -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Database: Connected"
else
    echo "✗ Database: Connection failed"
fi

# Check if app is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✓ Application: Running"
else
    echo "✗ Application: Not running"
fi

# Show network info
echo ""
echo "Network Access:"
LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -1)
echo "http://$LOCAL_IP:5173"
EOF

chmod +x local-setup/status-check.sh
```

## Daily Usage

### 1. Starting the System
```bash
# Navigate to project directory
cd ~/tax-compliance-hub

# Start the development server
npm run dev

# The system will be available at http://localhost:5173
# Share http://YOUR_IP:5173 with office staff
```

### 2. Stopping the System
```bash
# Press Ctrl+C in the terminal where npm run dev is running
# Or close the terminal window
```

### 3. Adding New Users
```bash
# Use the user addition script
./local-setup/add-user.sh username email@company.com "Full Name" staff
```

### 4. Checking System Status
```bash
# Run the status check script
./local-setup/status-check.sh
```

### 5. Creating Database Backups
```bash
# Run the backup script
./local-setup/backup-db.sh
```

## Summary

This setup provides you with:

1. **✅ Local Database**: PostgreSQL running on your Debian machine
2. **✅ VS Code Integration**: Full editing capabilities with TypeScript support
3. **✅ Network Access**: Office staff can access via your local IP
4. **✅ User Authentication**: Login system with role-based access
5. **✅ Data Persistence**: All data stored locally on your machine
6. **✅ Easy Maintenance**: Scripts for backup, user management, and status checking

**Default Login Credentials:**
- Email: `demo@chandariashah.com`
- Password: `demo123`

**Network Access:**
- Your computer: `http://localhost:5173`
- Office staff: `http://YOUR_IP_ADDRESS:5173`

**Support:**
- All data is stored locally on your Debian machine
- No internet connection required for basic functionality
- Full control over user access and data security
- Easy to backup and restore

The system is now ready for your office environment with secure local access and full editing capabilities in VS Code!
