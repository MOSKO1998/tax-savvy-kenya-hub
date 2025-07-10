
# Tax Compliance Hub - Complete Deployment Guide

## Overview
This guide will help you deploy the Tax Compliance Hub application on a Debian machine using Docker. The application is built with React, Vite, TypeScript, and uses Supabase for backend services.

## System Requirements

### Hardware Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB+ storage
- **Network**: Stable internet connection for initial setup

### Software Requirements
- Debian 11 or 12 (Bullseye/Bookworm)
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Node.js 18+ (for development)

## Pre-Installation Setup

### 1. Update Your Debian System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git nano vim
```

### 2. Install Docker Engine
```bash
# Remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up repository
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

### 3. Install Node.js (for development)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

## Application Deployment

### 1. Clone the Repository
```bash
# Create application directory
sudo mkdir -p /opt/tax-compliance-hub
sudo chown $USER:$USER /opt/tax-compliance-hub
cd /opt/tax-compliance-hub

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/yourusername/tax-compliance-hub.git .
# OR if you have the files locally, copy them to this directory
```

### 2. Configure Environment Variables
```bash
# Create environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database Configuration
POSTGRES_DB=tax_compliance_hub
POSTGRES_USER=tax_admin
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://tax_admin:your_secure_password_here@postgres:5432/tax_compliance_hub

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# File Storage (Optional - Nextcloud)
NEXTCLOUD_URL=https://your-nextcloud-instance.com
NEXTCLOUD_USERNAME=your_username
NEXTCLOUD_PASSWORD=your_password

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

### 3. Create Docker Compose Configuration
```bash
nano docker-compose.yml
```

**Docker Compose Configuration:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: tax_compliance_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-tax_compliance_hub}
      POSTGRES_USER: ${POSTGRES_USER:-tax_admin}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    networks:
      - tax_compliance_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-tax_admin} -d ${POSTGRES_DB:-tax_compliance_hub}"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

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
      NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3000}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTCLOUD_URL: ${NEXTCLOUD_URL}
      NEXTCLOUD_USERNAME: ${NEXTCLOUD_USERNAME}
      NEXTCLOUD_PASSWORD: ${NEXTCLOUD_PASSWORD}
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
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

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
```

### 4. Create Nginx Configuration
```bash
nano nginx.conf
```

**Nginx Configuration:**
```nginx
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
    error_log /var/log/nginx/error.log;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

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
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # File upload limit
        client_max_body_size 100M;

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

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 5. Create Dockerfile
```bash
nano Dockerfile
```

**Dockerfile:**
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

## Database Setup

### 1. Create Database Schema
```bash
nano database-schema.sql
```

**Add your database schema here** (the SQL from your existing migrations)

### 2. Initialize Database
```bash
# Start only PostgreSQL first
docker compose up -d postgres

# Wait for PostgreSQL to be ready
docker compose logs -f postgres

# Once ready, the schema will be automatically applied
```

## Deployment Steps

### 1. Build and Start Services
```bash
# Build the application
docker compose build

# Start all services
docker compose up -d

# Check service status
docker compose ps
```

### 2. Monitor Logs
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f nginx
```

### 3. Verify Deployment
```bash
# Check application health
curl http://localhost/health

# Check if application is accessible
curl http://localhost

# View running containers
docker ps
```

## Post-Deployment Configuration

### 1. SSL/TLS Setup (Optional but Recommended)
```bash
# Install Certbot
sudo apt install -y certbot

# Create SSL directory
mkdir -p ssl

# Generate self-signed certificate for testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/nginx-selfsigned.key \
    -out ssl/nginx-selfsigned.crt

# Update nginx.conf to include SSL configuration
```

### 2. Firewall Configuration
```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 3. Backup Configuration
```bash
# Create backup script
nano backup.sh
```

**Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/tax-compliance-hub"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker compose exec -T postgres pg_dump -U tax_admin tax_compliance_hub > $BACKUP_DIR/database_$DATE.sql

# Backup uploads
docker compose exec -T app tar -czf - /app/uploads > $BACKUP_DIR/uploads_$DATE.tar.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x backup.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/tax-compliance-hub/backup.sh") | crontab -
```

## Maintenance Commands

### Service Management
```bash
# Stop all services
docker compose down

# Start services
docker compose up -d

# Restart a specific service
docker compose restart app

# View resource usage
docker stats

# Update application
git pull
docker compose build
docker compose up -d
```

### Monitoring and Troubleshooting
```bash
# Monitor system resources
htop
df -h
free -h

# Check service logs
docker compose logs --tail=100 app
docker compose logs --tail=100 postgres

# Access container shell
docker compose exec app sh
docker compose exec postgres psql -U tax_admin -d tax_compliance_hub

# Clean up unused Docker resources
docker system prune -a
```

## Security Considerations

### 1. Environment Variables
- Use strong passwords for database and JWT secrets
- Keep environment files secure with restricted permissions
- Regularly rotate secrets and passwords

### 2. Database Security
```bash
# Set proper file permissions
chmod 600 .env
chmod 600 database-schema.sql

# Regular security updates
sudo apt update && sudo apt upgrade -y
docker images | grep -v REPOSITORY | awk '{print $1":"$2}' | xargs -L1 docker pull
```

### 3. Network Security
- Use firewall rules to restrict access
- Consider VPN access for administrative tasks
- Implement fail2ban for brute force protection

## Performance Optimization

### 1. Docker Optimization
```bash
# Optimize Docker daemon
sudo nano /etc/docker/daemon.json
```

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
```

### 2. Database Optimization
```sql
-- Connect to database and run optimization queries
\c tax_compliance_hub

-- Analyze database
ANALYZE;

-- Vacuum database
VACUUM ANALYZE;
```

## Troubleshooting Guide

### Common Issues

**1. Port Already in Use**
```bash
sudo netstat -tulpn | grep :3000
sudo kill -9 <PID>
```

**2. Database Connection Issues**
```bash
# Check database logs
docker compose logs postgres

# Restart database
docker compose restart postgres
```

**3. Application Not Starting**
```bash
# Check application logs
docker compose logs app

# Rebuild application
docker compose build --no-cache app
docker compose up -d app
```

**4. High Memory Usage**
```bash
# Monitor memory usage
docker stats

# Restart services if needed
docker compose restart
```

## Accessing the Application

### Default Access
- **Application URL**: http://localhost (or your server IP)
- **Database**: localhost:5432 (from host machine)
- **Default Admin User**: Create via signup form

### pgAdmin4 Connection
- **Host**: localhost (or your server IP)
- **Port**: 5432
- **Database**: tax_compliance_hub
- **Username**: tax_admin
- **Password**: (as set in .env file)

## Support and Updates

### Regular Maintenance
1. Weekly system updates
2. Monthly Docker image updates
3. Quarterly security review
4. Database optimization monthly

### Monitoring Checklist
- [ ] Application accessibility
- [ ] Database connectivity
- [ ] Disk space usage
- [ ] Memory consumption
- [ ] Log file sizes
- [ ] Backup verification

## Conclusion

This guide provides a comprehensive setup for deploying the Tax Compliance Hub on Debian with Docker. Follow the steps carefully and ensure all security measures are implemented for production use.

For additional support or customization, refer to the application documentation or contact the development team.
