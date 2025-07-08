
# Complete Tax Compliance Hub Deployment Guide

## Option 1: Docker Deployment (Recommended for Production)

### Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Git
sudo apt install git -y
```

### Deployment Steps
```bash
# 1. Clone/Download your project
git clone <your-repo-url> tax-compliance-hub
cd tax-compliance-hub

# 2. Copy environment file
cp .env.example .env.local

# 3. Start all services
docker-compose -f local-setup/docker-compose.yml up -d

# 4. Check services status
docker-compose -f local-setup/docker-compose.yml ps

# 5. View logs
docker-compose -f local-setup/docker-compose.yml logs -f
```

### Access Points
- **Main Application**: http://localhost:3000
- **pgAdmin**: http://localhost:8080 (admin@audit.ke / admin123)
- **PostgreSQL**: localhost:5432 (tax_admin / secure_password_123)

## Option 2: XAMPP + Manual Setup

### Prerequisites
```bash
# Install XAMPP
wget https://www.apachefriends.org/xampp-files/8.2.12/xampp-linux-x64-8.2.12-0-installer.run
chmod +x xampp-linux-x64-8.2.12-0-installer.run
sudo ./xampp-linux-x64-8.2.12-0-installer.run

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y
```

### Setup Steps
```bash
# 1. Start XAMPP
sudo /opt/lampp/lampp start

# 2. Setup PostgreSQL
sudo -u postgres psql -c "CREATE USER tax_admin WITH PASSWORD 'secure_password_123';"
sudo -u postgres psql -c "CREATE DATABASE tax_compliance_hub OWNER tax_admin;"

# 3. Import database schema
psql -U tax_admin -d tax_compliance_hub -h localhost -f local-setup/database-schema.sql

# 4. Install project dependencies
npm install

# 5. Start the application
npm run dev
```

## Option 3: Complete Manual Setup (Most Control)

### Step 1: Install Required Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install pgAdmin (optional)
sudo apt install pgadmin4 -y

# Install VS Code
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update && sudo apt install code -y
```

### Step 2: Database Setup
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user
sudo -u postgres psql << EOF
CREATE USER tax_admin WITH PASSWORD 'secure_password_123';
ALTER USER tax_admin CREATEDB;
CREATE DATABASE tax_compliance_hub OWNER tax_admin;
GRANT ALL PRIVILEGES ON DATABASE tax_compliance_hub TO tax_admin;
\q
EOF

# Test connection
psql -U tax_admin -d tax_compliance_hub -h localhost -c "SELECT version();"
```

### Step 3: Project Setup
```bash
# Create project directory
mkdir ~/tax-compliance-hub
cd ~/tax-compliance-hub

# Copy your project files here
# Then install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit environment file with your settings
nano .env.local
```

### Step 4: Import Database Schema
```bash
psql -U tax_admin -d tax_compliance_hub -h localhost -f local-setup/database-schema.sql
```

### Step 5: Start Application
```bash
npm run dev
```

## Network Configuration for Staff Access

### Find Your Server IP
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1
```

### Configure Firewall
```bash
# Install UFW
sudo apt install ufw -y

# Allow SSH
sudo ufw allow ssh

# Allow HTTP traffic
sudo ufw allow 80
sudo ufw allow 3000
sudo ufw allow 5173

# Allow local network access
sudo ufw allow from 192.168.0.0/16
sudo ufw allow from 10.0.0.0/8

# Enable firewall
sudo ufw enable
```

## Staff Access Setup

### Create Staff Users
```bash
# Create user addition script
cat > add-staff-user.sh << 'EOF'
#!/bin/bash
EMAIL=$1
NAME=$2
ROLE=${3:-staff}

if [ -z "$EMAIL" ] || [ -z "$NAME" ]; then
    echo "Usage: $0 email 'Full Name' [role]"
    exit 1
fi

psql -U tax_admin -d tax_compliance_hub -h localhost << SQL
-- Insert user profile
INSERT INTO profiles (id, email, full_name, company_name) 
VALUES (gen_random_uuid(), '$EMAIL', '$NAME', 'Chandaria Shah & Associates')
ON CONFLICT (email) DO UPDATE SET full_name = '$NAME';

-- Insert user role
INSERT INTO user_roles (user_id, role, department, permissions) 
SELECT id, '$ROLE'::app_role, 'tax'::department_type, 
       CASE WHEN '$ROLE' = 'admin' THEN ARRAY['all'] 
            ELSE ARRAY['view_only', 'client_management', 'tax_management'] END
FROM profiles WHERE email = '$EMAIL'
ON CONFLICT (user_id) DO UPDATE SET role = '$ROLE'::app_role;

SELECT 'User created: ' || full_name || ' (' || email || ')' FROM profiles WHERE email = '$EMAIL';
SQL
EOF

chmod +x add-staff-user.sh

# Add staff members
./add-staff-user.sh "manager@chandariashah.com" "Manager Name" admin
./add-staff-user.sh "staff1@chandariashah.com" "Staff Member 1" tax_staff
./add-staff-user.sh "staff2@chandariashah.com" "Staff Member 2" tax_staff
```

## System Maintenance

### Daily Startup
```bash
# For Docker deployment
cd ~/tax-compliance-hub
docker-compose -f local-setup/docker-compose.yml up -d

# For manual deployment
cd ~/tax-compliance-hub
npm run dev
```

### Backup System
```bash
# Create backup script
cat > backup-system.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="$HOME/tax-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U tax_admin -h localhost tax_compliance_hub > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz ~/tax-compliance-hub --exclude=node_modules

echo "Backup completed:"
echo "Database: $BACKUP_DIR/db_backup_$DATE.sql"
echo "Application: $BACKUP_DIR/app_backup_$DATE.tar.gz"
EOF

chmod +x backup-system.sh
```

### System Status Check
```bash
# Create status check script
cat > check-system.sh << 'EOF'
#!/bin/bash
echo "=== Tax Compliance Hub System Status ==="
echo

# Check PostgreSQL
echo "PostgreSQL Status:"
sudo systemctl status postgresql --no-pager -l

# Check application port
echo -e "\nApplication Status:"
if curl -s http://localhost:3000 > /dev/null 2>&1 || curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "✓ Application is running"
else
    echo "✗ Application is not responding"
fi

# Check database connection
echo -e "\nDatabase Connection:"
if psql -U tax_admin -d tax_compliance_hub -h localhost -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Database connection successful"
else
    echo "✗ Database connection failed"
fi

# Check disk space
echo -e "\nDisk Space:"
df -h / | tail -1

# Check memory usage
echo -e "\nMemory Usage:"
free -h
EOF

chmod +x check-system.sh
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   npm run dev
   # or for Docker
   docker-compose -f local-setup/docker-compose.yml logs app
   ```

2. **Database connection failed**
   ```bash
   # Restart PostgreSQL
   sudo systemctl restart postgresql
   
   # Check status
   sudo systemctl status postgresql
   ```

3. **Staff can't access system**
   ```bash
   # Check firewall
   sudo ufw status
   
   # Check IP address
   ip addr show
   ```

4. **pgAdmin not working**
   ```bash
   # For Docker
   docker-compose -f local-setup/docker-compose.yml restart pgadmin
   
   # Check logs
   docker-compose -f local-setup/docker-compose.yml logs pgadmin
   ```

## Staff Instructions

Share this information with your staff:

### Access Information
- **Application URL**: http://YOUR_SERVER_IP:3000 (or :5173 for development)
- **pgAdmin URL**: http://YOUR_SERVER_IP:8080
- **Demo Login** (for testing):
  - Email: demo@chandariashah.com
  - Password: demo123

### Browser Requirements
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No special plugins required

### Features Available
- Client management
- Tax obligation tracking
- Document upload/download via Nextcloud
- Calendar view of tax deadlines
- Reporting and analytics
- User management (for admins)

This guide provides multiple deployment options to suit your needs. Choose the one that best fits your technical comfort level and requirements.
