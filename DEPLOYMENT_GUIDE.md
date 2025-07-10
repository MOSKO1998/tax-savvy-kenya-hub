
# Tax Compliance Hub - Complete Production Deployment Guide

## Overview
This comprehensive guide will deploy the Tax Compliance Hub application on Debian with Docker, including Nextcloud integration for document management, PostgreSQL database setup, and all system components working together.

## System Requirements

### Hardware Requirements
- **Minimum**: 4 CPU cores, 8GB RAM, 50GB storage
- **Recommended**: 8 CPU cores, 16GB RAM, 100GB+ storage
- **Network**: Stable internet connection, static IP recommended

### Software Requirements
- Debian 11 or 12 (Bullseye/Bookworm)
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git, curl, wget, nano/vim

## Step 1: System Preparation

### 1.1 Update Debian System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano vim htop ufw
```

### 1.2 Install Docker Engine
```bash
# Remove old Docker versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 1.3 Configure Firewall
```bash
# Install and configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5432/tcp
sudo ufw allow 8080/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

## Step 2: Application Setup

### 2.1 Create Application Directory
```bash
# Create application directory
sudo mkdir -p /opt/tax-compliance-hub
sudo chown $USER:$USER /opt/tax-compliance-hub
cd /opt/tax-compliance-hub

# Clone or copy your application files here
# If you have a git repository:
# git clone https://github.com/yourusername/tax-compliance-hub.git .
```

### 2.2 Create Environment Configuration
```bash
# Create environment file
cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=tax_compliance_hub
POSTGRES_USER=tax_admin
POSTGRES_PASSWORD=secure_password_123
DATABASE_URL=postgresql://tax_admin:secure_password_123@postgres:5432/tax_compliance_hub

# Supabase Configuration
VITE_SUPABASE_URL=https://hqjmoxufpgaulcwujruv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxam1veHVmcGdhdWxjd3VqcnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTA0NDMsImV4cCI6MjA2NTcyNjQ0M30.DMBiE8fVvq3k9PP7kwZjYfEfS2HKASbOKL3dbACAja0

# Nextcloud Configuration
NEXTCLOUD_URL=https://cloud.audit.ke
NEXTCLOUD_USERNAME=it@csa.co.ke
NEXTCLOUD_PASSWORD=Wakatiimefika@1998

# Application Configuration
NODE_ENV=production
PORT=3000
VITE_APP_URL=http://localhost:3000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-32-character-encryption-key-here
EOF

# Secure the environment file
chmod 600 .env
```

### 2.3 Create Docker Compose Configuration
```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: tax_compliance_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database-init:/docker-entrypoint-initdb.d
    networks:
      - tax_compliance_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: tax_compliance_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - tax_compliance_network
    restart: unless-stopped
    command: redis-server --appendonly yes

  # pgAdmin4 for Database Management
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: tax_compliance_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@audit.ke
      PGADMIN_DEFAULT_PASSWORD: admin123
      PGADMIN_CONFIG_SERVER_MODE: 'False'
    ports:
      - "8080:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - tax_compliance_network
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy

  # Main Application
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: tax_compliance_app
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
      VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
      NEXTCLOUD_URL: ${NEXTCLOUD_URL}
      NEXTCLOUD_USERNAME: ${NEXTCLOUD_USERNAME}
      NEXTCLOUD_PASSWORD: ${NEXTCLOUD_PASSWORD}
      PORT: ${PORT}
    ports:
      - "3000:3000"
    volumes:
      - app_uploads:/app/uploads
      - app_logs:/app/logs
    networks:
      - tax_compliance_network
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: tax_compliance_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    networks:
      - tax_compliance_network
    restart: unless-stopped
    depends_on:
      - app

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  pgadmin_data:
    driver: local
  app_uploads:
    driver: local
  app_logs:
    driver: local
  nginx_logs:
    driver: local

networks:
  tax_compliance_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF
```

## Step 3: Database Setup

### 3.1 Create Database Initialization Scripts
```bash
# Create database initialization directory
mkdir -p database-init

# Create database schema
cat > database-init/01-init-schema.sql << 'EOF'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'tax_staff', 'readonly', 'it');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE department_type AS ENUM ('management', 'tax', 'audit', 'it', 'finance', 'legal');
CREATE TYPE document_type AS ENUM ('tax_return', 'receipt', 'certificate', 'correspondence', 'audit_report', 'other');
CREATE TYPE obligation_status AS ENUM ('pending', 'completed', 'overdue', 'cancelled');
CREATE TYPE tax_type AS ENUM ('vat', 'paye', 'corporate_tax', 'withholding_tax', 'customs_duty', 'excise_tax');
CREATE TYPE notification_type AS ENUM ('deadline_reminder', 'system_alert', 'compliance_update', 'document_uploaded', 'user_action');

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'readonly',
    department department_type NOT NULL DEFAULT 'tax',
    status user_status NOT NULL DEFAULT 'active',
    permissions TEXT[] DEFAULT ARRAY['view_only'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    registration_number TEXT,
    tax_id TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    client_type TEXT DEFAULT 'individual',
    tax_id TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'active',
    assigned_to UUID REFERENCES profiles(id),
    company_id UUID REFERENCES companies(id),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_obligations table
CREATE TABLE tax_obligations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    tax_type tax_type NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2),
    status obligation_status DEFAULT 'pending',
    client_id UUID REFERENCES clients(id),
    assigned_to UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    document_type document_type NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    client_id UUID REFERENCES clients(id),
    obligation_id UUID REFERENCES tax_obligations(id),
    uploaded_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    event_type TEXT DEFAULT 'tax_obligation',
    client_id UUID REFERENCES clients(id),
    obligation_id UUID REFERENCES tax_obligations(id),
    created_by UUID REFERENCES profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX idx_tax_obligations_due_date ON tax_obligations(due_date);
CREATE INDEX idx_tax_obligations_status ON tax_obligations(status);
CREATE INDEX idx_tax_obligations_client_id ON tax_obligations(client_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
EOF

# Create demo data script
cat > database-init/02-demo-data.sql << 'EOF'
-- Insert demo user profile
INSERT INTO profiles (id, email, full_name, username, company_name) VALUES 
('00000000-0000-0000-0000-000000000001', 'demo@chandariashah.com', 'Demo User', 'demo_user', 'Chandaria Shah & Associates');

-- Insert demo user role
INSERT INTO user_roles (user_id, role, department, permissions) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin', 'management', ARRAY['all']);

-- Insert demo company
INSERT INTO companies (id, name, registration_number, tax_id, created_by) VALUES 
('00000000-0000-0000-0000-000000000002', 'Chandaria Shah & Associates', 'CSA001', 'P051234567A', '00000000-0000-0000-0000-000000000001');

-- Insert demo clients
INSERT INTO clients (id, name, client_type, tax_id, email, phone, created_by, company_id) VALUES 
('00000000-0000-0000-0000-000000000003', 'ABC Corporation Ltd', 'corporate', 'P051234567B', 'contact@abccorp.co.ke', '+254700123456', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000004', 'John Doe', 'individual', 'A001234567Z', 'john.doe@email.com', '+254711123456', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');

-- Insert demo tax obligations
INSERT INTO tax_obligations (title, description, tax_type, due_date, amount, client_id, created_by) VALUES 
('Monthly VAT Return - December 2024', 'VAT return for December 2024', 'vat', '2025-01-20', 125000.00, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
('PAYE Returns - December 2024', 'Employee PAYE for December 2024', 'paye', '2025-01-09', 85000.00, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
('Individual Income Tax', 'Annual income tax return', 'corporate_tax', '2025-06-30', 45000.00, '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001');

-- Insert system settings
INSERT INTO system_settings (key, value, description, updated_by) VALUES 
('app_name', '"Tax Compliance Hub"', 'Application name', '00000000-0000-0000-0000-000000000001'),
('company_name', '"Chandaria Shah & Associates"', 'Company name', '00000000-0000-0000-0000-000000000001'),
('nextcloud_enabled', 'true', 'Enable Nextcloud integration', '00000000-0000-0000-0000-000000000001');

-- Create calendar events for tax obligations
INSERT INTO calendar_events (title, description, start_date, client_id, obligation_id, created_by) 
SELECT 
    title || ' - Due Date',
    'Tax obligation due: ' || description,
    due_date::timestamp,
    client_id,
    id,
    created_by
FROM tax_obligations;
EOF
```

## Step 4: Nextcloud Integration Setup

### 4.1 Nextcloud Server Configuration
If you don't have a Nextcloud server, here's how to set one up:

```bash
# Option 1: Use existing Nextcloud server (cloud.audit.ke)
# Ensure your Nextcloud credentials are correct in .env file

# Option 2: Deploy local Nextcloud with Docker
cat > nextcloud-docker-compose.yml << 'EOF'
version: '3.8'

services:
  nextcloud-db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes:
      - nextcloud_db:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: nextcloud_password
    networks:
      - nextcloud_network

  nextcloud:
    image: nextcloud:latest
    restart: unless-stopped
    ports:
      - "8081:80"
    volumes:
      - nextcloud_data:/var/www/html
    environment:
      POSTGRES_HOST: nextcloud-db
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: nextcloud_password
      NEXTCLOUD_ADMIN_USER: admin
      NEXTCLOUD_ADMIN_PASSWORD: admin123
    depends_on:
      - nextcloud-db
    networks:
      - nextcloud_network

volumes:
  nextcloud_db:
  nextcloud_data:

networks:
  nextcloud_network:
    driver: bridge
EOF

# Deploy Nextcloud (optional)
# docker compose -f nextcloud-docker-compose.yml up -d
```

### 4.2 Nextcloud Document Folder Setup
```bash
# Create script to setup Nextcloud folders
cat > setup-nextcloud.sh << 'EOF'
#!/bin/bash

NEXTCLOUD_URL="${NEXTCLOUD_URL:-https://cloud.audit.ke}"
NEXTCLOUD_USER="${NEXTCLOUD_USERNAME:-it@csa.co.ke}"
NEXTCLOUD_PASS="${NEXTCLOUD_PASSWORD:-Wakatiimefika@1998}"

echo "Setting up Nextcloud folders for Tax Compliance Hub..."

# Create folders via WebDAV
curl -X MKCOL -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" "$NEXTCLOUD_URL/remote.php/dav/files/$NEXTCLOUD_USER/TaxComplianceHub/"
curl -X MKCOL -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" "$NEXTCLOUD_URL/remote.php/dav/files/$NEXTCLOUD_USER/TaxComplianceHub/Documents/"
curl -X MKCOL -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" "$NEXTCLOUD_URL/remote.php/dav/files/$NEXTCLOUD_USER/TaxComplianceHub/TaxReturns/"
curl -X MKCOL -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" "$NEXTCLOUD_URL/remote.php/dav/files/$NEXTCLOUD_USER/TaxComplianceHub/Receipts/"
curl -X MKCOL -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" "$NEXTCLOUD_URL/remote.php/dav/files/$NEXTCLOUD_USER/TaxComplianceHub/Certificates/"
curl -X MKCOL -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" "$NEXTCLOUD_URL/remote.php/dav/files/$NEXTCLOUD_USER/TaxComplianceHub/Correspondence/"

echo "✅ Nextcloud folders created successfully!"
echo "📁 Access your documents at: $NEXTCLOUD_URL"
EOF

chmod +x setup-nextcloud.sh
```

## Step 5: Nginx Configuration

### 5.1 Create Nginx Configuration
```bash
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;

        # Main application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 300;
            proxy_connect_timeout 300;
            proxy_send_timeout 300;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Login endpoints with strict rate limiting
        location /auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

## Step 6: Application Deployment

### 6.1 Update Deploy Script
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

# Tax Compliance Hub Production Deployment Script
set -e

echo "🚀 Starting Tax Compliance Hub Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_header() { echo -e "${BLUE}=== $1 ===${NC}"; }

# Check prerequisites
print_header "Checking Prerequisites"

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found. Please create it with your configuration."
    exit 1
fi

print_status "✅ Prerequisites check passed"

# Setup Nextcloud folders
print_header "Setting up Nextcloud Integration"
if [ -f ./setup-nextcloud.sh ]; then
    print_status "Setting up Nextcloud folders..."
    ./setup-nextcloud.sh
else
    print_warning "setup-nextcloud.sh not found, skipping Nextcloud setup"
fi

# Stop existing containers
print_header "Stopping Existing Services"
print_status "Stopping existing containers..."
docker compose down --remove-orphans || true

# Clean up old images (optional)
print_status "Cleaning up old Docker images..."
docker system prune -f || true

# Pull latest images
print_header "Pulling Latest Images"
print_status "Pulling base images..."
docker compose pull postgres redis nginx pgadmin || true

# Build application
print_header "Building Application"
print_status "Building Tax Compliance Hub application..."
docker compose build --no-cache app

# Start database first
print_header "Starting Database Services"
print_status "Starting PostgreSQL database..."
docker compose up -d postgres redis

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 30

# Check database health
print_status "Checking database health..."
for i in {1..30}; do
    if docker compose exec postgres pg_isready -U tax_admin -d tax_compliance_hub; then
        print_status "✅ Database is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Database failed to start after 5 minutes"
        docker compose logs postgres
        exit 1
    fi
    sleep 10
done

# Start all services
print_header "Starting All Services"
print_status "Starting all application services..."
docker compose up -d

# Wait for services to start
print_status "Waiting for all services to start..."
sleep 60

# Health checks
print_header "Performing Health Checks"

# Check PostgreSQL
if docker compose exec postgres pg_isready -U tax_admin -d tax_compliance_hub; then
    print_status "✅ PostgreSQL: Healthy"
else
    print_error "❌ PostgreSQL: Unhealthy"
fi

# Check Redis
if docker compose exec redis redis-cli ping | grep -q PONG; then
    print_status "✅ Redis: Healthy"
else
    print_error "❌ Redis: Unhealthy"
fi

# Check Application
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    print_status "✅ Application: Healthy"
else
    print_warning "⚠️  Application: Health check failed (may still be starting)"
fi

# Check pgAdmin
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    print_status "✅ pgAdmin: Accessible"
else
    print_warning "⚠️  pgAdmin: Not accessible"
fi

# Display service status
print_header "Service Status"
docker compose ps

# Display access information
print_header "Deployment Complete! 🎉"
echo ""
echo "🌐 Access Information:"
echo "  • Main Application:    http://localhost:3000"
echo "  • Database Admin:      http://localhost:8080"
echo "  • Demo Login:          demo@chandariashah.com / demo123"
echo ""
echo "🔧 Management Commands:"
echo "  • View logs:           docker compose logs -f [service]"
echo "  • Restart service:     docker compose restart [service]"
echo "  • Stop all:            docker compose down"
echo "  • Update app:          git pull && ./deploy.sh"
echo ""
echo "🗄️  Database Connection (pgAdmin):"
echo "  • Host:               postgres"
echo "  • Port:               5432"
echo "  • Database:           tax_compliance_hub"
echo "  • Username:           tax_admin"
echo "  • Password:           secure_password_123"
echo ""
echo "☁️  Nextcloud Integration:"
echo "  • Server:             https://cloud.audit.ke"
echo "  • Username:           it@csa.co.ke"
echo "  • Documents Folder:   /TaxComplianceHub/Documents/"
echo ""
echo "📊 Monitoring:"
echo "  • Application logs:   docker compose logs -f app"
echo "  • Database logs:      docker compose logs -f postgres"
echo "  • System resources:   docker stats"
echo ""

print_status "🚀 Tax Compliance Hub is now running!"
print_status "Visit http://localhost:3000 to get started"
EOF

chmod +x deploy.sh
```

## Step 7: SSL Certificate Setup (Optional)

### 7.1 Generate SSL Certificates
```bash
# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/nginx-selfsigned.key \
    -out ssl/nginx-selfsigned.crt \
    -subj "/C=KE/ST=Nairobi/L=Nairobi/O=Chandaria Shah & Associates/CN=localhost"

# For production, use Let's Encrypt:
# sudo apt install certbot
# sudo certbot certonly --standalone -d yourdomain.com
```

## Step 8: Backup and Monitoring Setup

### 8.1 Create Backup Script
```bash
cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/tax-compliance-hub"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "🔄 Starting backup process..."

# Database backup
echo "📊 Backing up database..."
docker compose exec -T postgres pg_dump -U tax_admin tax_compliance_hub > $BACKUP_DIR/database_$DATE.sql

# Application data backup
echo "📁 Backing up application data..."
docker compose exec -T app tar -czf - /app/uploads > $BACKUP_DIR/uploads_$DATE.tar.gz

# Configuration backup
echo "⚙️  Backing up configuration..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz .env docker-compose.yml nginx.conf

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: $DATE"
echo "📍 Backup location: $BACKUP_DIR"
EOF

chmod +x backup.sh

# Setup daily backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/tax-compliance-hub/backup.sh") | crontab -
```

### 8.2 Create Monitoring Script
```bash
cat > monitor.sh << 'EOF'
#!/bin/bash

echo "=== Tax Compliance Hub System Status ==="
echo "Date: $(date)"
echo ""

# Check Docker services
echo "🐳 Docker Services:"
docker compose ps

echo ""
echo "💾 System Resources:"
echo "Memory Usage:"
free -h

echo ""
echo "Disk Usage:"
df -h /

echo ""
echo "🔍 Service Health Checks:"

# PostgreSQL
if docker compose exec postgres pg_isready -U tax_admin -d tax_compliance_hub >/dev/null 2>&1; then
    echo "✅ PostgreSQL: Healthy"
else
    echo "❌ PostgreSQL: Unhealthy"
fi

# Redis
if docker compose exec redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

# Application
if curl -f http://localhost:3000/health >/dev/null 2>&1; then
    echo "✅ Application: Healthy"
else
    echo "❌ Application: Unhealthy"
fi

# pgAdmin
if curl -f http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ pgAdmin: Accessible"
else
    echo "❌ pgAdmin: Not Accessible"
fi

echo ""
echo "📊 Container Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""
echo "📝 Recent Application Logs (last 10 lines):"
docker compose logs --tail=10 app

echo ""
echo "=== Status Check Complete ==="
EOF

chmod +x monitor.sh
```

## Step 9: Deployment Execution

### 9.1 Run the Deployment
```bash
# Execute the deployment
./deploy.sh
```

### 9.2 Post-Deployment Verification
```bash
# Check all services are running
docker compose ps

# Test application access
curl -I http://localhost:3000

# Test database connection
docker compose exec postgres psql -U tax_admin -d tax_compliance_hub -c "SELECT COUNT(*) FROM profiles;"

# Test pgAdmin access
curl -I http://localhost:8080

# Run monitoring script
./monitor.sh
```

## Step 10: Database Management with pgAdmin4

### 10.1 Access pgAdmin4
1. Open your browser and navigate to `http://localhost:8080`
2. Login with:
   - **Email**: `admin@audit.ke`
   - **Password**: `admin123`

### 10.2 Connect to PostgreSQL Database
1. Click "Add New Server"
2. General Tab:
   - **Name**: `Tax Compliance Hub`
3. Connection Tab:
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database**: `tax_compliance_hub`
   - **Username**: `tax_admin`
   - **Password**: `secure_password_123`
4. Click "Save"

### 10.3 Verify Database Setup
1. Expand the server in pgAdmin
2. Navigate to `Databases > tax_compliance_hub > Schemas > public > Tables`
3. You should see all tables: profiles, user_roles, clients, tax_obligations, documents, etc.
4. Right-click on any table and select "View/Edit Data > All Rows" to see the demo data

## Step 11: Nextcloud Document Upload Configuration

### 11.1 Test Nextcloud Connection
```bash
# Test Nextcloud connectivity
curl -u "it@csa.co.ke:Wakatiimefika@1998" "https://cloud.audit.ke/remote.php/dav/files/it@csa.co.ke/"

# Create test document folder
curl -X MKCOL -u "it@csa.co.ke:Wakatiimefika@1998" "https://cloud.audit.ke/remote.php/dav/files/it@csa.co.ke/TaxComplianceHub/"
```

### 11.2 Configure Document Upload in Application
The application is already configured to upload documents to Nextcloud via the Supabase edge function. The upload process works as follows:

1. User selects a document in the Document Manager
2. Document is uploaded via the `upload-to-nextcloud` Supabase edge function
3. File is stored in Nextcloud at `/TaxComplianceHub/Documents/`
4. Document metadata is saved in the PostgreSQL database
5. A shareable link is generated for easy access

## Step 12: Troubleshooting Guide

### 12.1 Common Issues and Solutions

**Application won't start:**
```bash
# Check logs
docker compose logs app

# Rebuild application
docker compose build --no-cache app
docker compose up -d app
```

**Database connection failed:**
```bash
# Check database status
docker compose logs postgres

# Restart database
docker compose restart postgres

# Verify connection
docker compose exec postgres psql -U tax_admin -d tax_compliance_hub -c "SELECT version();"
```

**Nextcloud upload fails:**
```bash
# Test Nextcloud connection
curl -u "your-username:your-password" "https://your-nextcloud-url/remote.php/dav/files/your-username/"

# Check application logs
docker compose logs app | grep nextcloud
```

**Port already in use:**
```bash
# Find process using port
sudo netstat -tulpn | grep :3000

# Stop the process
sudo kill -9 <PID>
```

### 12.2 Performance Optimization
```bash
# Increase Docker resources if needed
# Edit /etc/docker/daemon.json
{
    "default-runtime": "runc",
    "runtimes": {
        "runc": {
            "path": "runc"
        }
    },
    "storage-driver": "overlay2",
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    }
}

# Restart Docker
sudo systemctl restart docker
```

## Step 13: Maintenance and Updates

### 13.1 Regular Maintenance Tasks
```bash
# Weekly tasks
./backup.sh
./monitor.sh
docker system prune -f

# Monthly tasks
docker compose pull
./deploy.sh

# Update system packages
sudo apt update && sudo apt upgrade -y
```

### 13.2 Application Updates
```bash
# Update application code
git pull origin main

# Rebuild and redeploy
./deploy.sh

# Check logs for any issues
docker compose logs -f app
```

## Conclusion

This comprehensive deployment guide provides everything needed to deploy the Tax Compliance Hub on Debian with Docker. The setup includes:

✅ **Complete Application Stack**: React frontend, PostgreSQL database, Redis cache, Nginx reverse proxy
✅ **Nextcloud Integration**: Document upload/download with cloud storage
✅ **Database Management**: pgAdmin4 for easy database administration
✅ **Security**: Firewall configuration, SSL support, rate limiting
✅ **Monitoring**: Health checks, logging, resource monitoring
✅ **Backup**: Automated daily backups with retention policy
✅ **Maintenance**: Update procedures and troubleshooting guides

**Quick Start Commands:**
1. `chmod +x deploy.sh setup-nextcloud.sh backup.sh monitor.sh`
2. `./deploy.sh`
3. Access application at `http://localhost:3000`
4. Login with `demo@chandariashah.com` / `demo123`
5. Access pgAdmin at `http://localhost:8080`

For support or questions, refer to the troubleshooting section or check the application logs using `docker compose logs -f app`.
