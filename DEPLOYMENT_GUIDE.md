
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
# Supabase Configuration
VITE_SUPABASE_URL=https://hqjmoxufpgaulcwujruv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxam1veHVmcGdhdWxjd3VqcnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTA0NDMsImV4cCI6MjA2NTcyNjQ0M30.DMBiE8fVvq3k9PP7kwZjYfEfS2HKASbOKL3dbACAja0

# Application Configuration
NODE_ENV=production
PORT=3000

# File Storage (Optional - Nextcloud)
NEXTCLOUD_URL=https://cloud.audit.ke
NEXTCLOUD_USERNAME=it@csa.co.ke
NEXTCLOUD_PASSWORD=Wakatiimefika@1998
```

### 3. Create Docker Compose Configuration
```bash
nano docker-compose.yml
```

**Docker Compose Configuration:**
```yaml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: tax_compliance_app
    environment:
      NODE_ENV: production
      VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
      VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY}
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
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
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

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## Deployment Steps

### 1. Make Scripts Executable
```bash
chmod +x deploy.sh
```

### 2. Run Deployment
```bash
./deploy.sh
```

### 3. Monitor Logs
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f app
docker compose logs -f nginx
```

### 4. Verify Deployment
```bash
# Check application health
curl http://localhost:3000

# View running containers
docker ps
```

## Post-Deployment Configuration

### 1. Firewall Configuration
```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable
```

### 2. Backup Configuration
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

# Backup uploads
docker compose exec -T app tar -czf - /app/uploads > $BACKUP_DIR/uploads_$DATE.tar.gz

# Keep only last 7 days of backups
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
docker compose logs --tail=100 nginx

# Access container shell
docker compose exec app sh

# Clean up unused Docker resources
docker system prune -a
```

## Accessing the Application

### Default Access
- **Application URL**: http://localhost:3000 (or your server IP:3000)
- **Default Demo User**: demo@chandariashah.com / demo123

### Database Connection (Supabase)
The application uses Supabase as the backend database. The database connection is configured through the environment variables and does not require local PostgreSQL installation.

## Troubleshooting Guide

### Common Issues

**1. Port Already in Use**
```bash
sudo netstat -tulpn | grep :3000
sudo kill -9 <PID>
```

**2. Application Not Starting**
```bash
# Check application logs
docker compose logs app

# Rebuild application
docker compose build --no-cache app
docker compose up -d app
```

**3. High Memory Usage**
```bash
# Monitor memory usage
docker stats

# Restart services if needed
docker compose restart
```

## Support and Updates

### Regular Maintenance
1. Weekly system updates
2. Monthly Docker image updates
3. Quarterly security review

### Monitoring Checklist
- [ ] Application accessibility
- [ ] Memory consumption
- [ ] Log file sizes
- [ ] Backup verification

## Conclusion

This guide provides a comprehensive setup for deploying the Tax Compliance Hub on Debian with Docker. The application will be accessible at http://localhost:3000 and includes automated deployment scripts, health checks, and monitoring capabilities.

For additional support or customization, refer to the application documentation or contact the development team.
