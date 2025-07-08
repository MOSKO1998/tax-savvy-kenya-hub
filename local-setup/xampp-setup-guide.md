
# XAMPP Setup Guide for Tax Compliance Hub

## Installation Steps

### 1. Download and Install XAMPP
```bash
# Download XAMPP
wget https://www.apachefriends.org/xampp-files/8.2.12/xampp-linux-x64-8.2.12-0-installer.run

# Make executable
chmod +x xampp-linux-x64-8.2.12-0-installer.run

# Install (requires sudo)
sudo ./xampp-linux-x64-8.2.12-0-installer.run
```

### 2. Install Node.js
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PostgreSQL (Since XAMPP uses MySQL, we need PostgreSQL separately)
```bash
sudo apt install postgresql postgresql-contrib -y
```

### 4. Configure PostgreSQL
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Setup database
sudo -u postgres psql << EOF
CREATE USER tax_admin WITH PASSWORD 'secure_password_123';
ALTER USER tax_admin CREATEDB;
CREATE DATABASE tax_compliance_hub OWNER tax_admin;
GRANT ALL PRIVILEGES ON DATABASE tax_compliance_hub TO tax_admin;
\q
EOF
```

### 5. Start XAMPP Services
```bash
# Start XAMPP
sudo /opt/lampp/lampp start

# Check status
sudo /opt/lampp/lampp status
```

### 6. Setup Project
```bash
# Navigate to XAMPP htdocs or create project directory
mkdir ~/tax-compliance-hub
cd ~/tax-compliance-hub

# Copy your project files here
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 7. Configure Environment for XAMPP
Edit `.env.local`:
```env
# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://tax_admin:secure_password_123@localhost:5432/tax_compliance_hub

# Application Configuration
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
PORT=5173

# Nextcloud Configuration
NEXTCLOUD_URL=https://cloud.audit.ke
NEXTCLOUD_USERNAME=it@csa.co.ke
NEXTCLOUD_PASSWORD=Wakatiimefika@1998

# Supabase Configuration
VITE_SUPABASE_URL=https://hqjmoxufpgaulcwujruv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxam1veHVmcGdhdWxjd3VqcnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTA0NDMsImV4cCI6MjA2NTcyNjQ0M30.DMBiE8fVvq3k9PP7kwZjYfEfS2HKASbOKL3dbACAja0
```

### 8. Import Database Schema
```bash
psql -U tax_admin -d tax_compliance_hub -h localhost -f local-setup/database-schema.sql
```

### 9. Start Application
```bash
npm run dev
```

## XAMPP Control Panel

### Start Services
```bash
sudo /opt/lampp/lampp start
```

### Stop Services
```bash
sudo /opt/lampp/lampp stop
```

### Restart Services
```bash
sudo /opt/lampp/lampp restart
```

### Check Status
```bash
sudo /opt/lampp/lampp status
```

## Access Points

- **XAMPP Control Panel**: http://localhost/dashboard
- **phpMyAdmin**: http://localhost/phpmyadmin (for MySQL if needed)
- **Tax Compliance App**: http://localhost:5173
- **PostgreSQL**: localhost:5432

## Notes

- XAMPP provides Apache and MySQL, but we use PostgreSQL for our application
- You can use XAMPP's Apache for serving additional web content if needed
- The Tax Compliance Hub runs on Node.js (port 5173) alongside XAMPP services
- Both systems can run simultaneously without conflicts
