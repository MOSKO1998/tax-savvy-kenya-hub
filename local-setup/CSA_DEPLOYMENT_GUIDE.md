
# CSA Tax Compliance Hub - Complete Deployment Guide
**Chandaria Shah & Associates LLP**

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Debian Server Setup](#debian-server-setup)
3. [Docker Deployment](#docker-deployment)
4. [Database Configuration](#database-configuration)
5. [Domain Configuration (taxcsa.co.ke)](#domain-configuration)
6. [Security Implementation](#security-implementation)
7. [Production Deployment](#production-deployment)
8. [Backup & Maintenance](#backup-maintenance)
9. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Hardware Requirements
- **CPU**: 4 cores, 2.4GHz
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 50GB SSD minimum
- **Network**: Stable internet connection with static IP

### Software Requirements
- **OS**: Debian 11/12 (Bullseye/Bookworm)
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **PostgreSQL**: 15+ (via Docker)
- **Nginx**: Latest (via Docker)

## Debian Server Setup

### 1. Initial Server Configuration
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nano htop ufw fail2ban

# Create application user
sudo adduser csaadmin
sudo usermod -aG sudo csaadmin
sudo su - csaadmin
```

### 2. Install Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Configure Firewall
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (only if external access needed)
sudo ufw enable
```

## Docker Deployment

### 1. Clone and Setup Project
```bash
# Create project directory
mkdir -p /home/csaadmin/csa-tax-hub
cd /home/csaadmin/csa-tax-hub

# Clone your project (replace with your actual repository)
git clone https://github.com/your-org/csa-tax-hub.git .

# Create environment file
cp .env.example .env.production
```

### 2. Environment Configuration
Create `/home/csaadmin/csa-tax-hub/.env.production`:
```env
# Database Configuration
POSTGRES_DB=csa_tax_hub
POSTGRES_USER=csa_admin
POSTGRES_PASSWORD=YourSecurePassword123!
DATABASE_URL=postgresql://csa_admin:YourSecurePassword123!@postgres:5432/csa_tax_hub

# Application Configuration
NODE_ENV=production
PORT=3000
NEXTAUTH_URL=https://taxcsa.co.ke
NEXTAUTH_SECRET=your-super-secret-nextauth-key-min-32-chars

# CSA Company Configuration
COMPANY_NAME=Chandaria Shah & Associates LLP
COMPANY_DOMAIN=taxcsa.co.ke

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key-here
JWT_SECRET=your-jwt-secret-key-here
RATE_LIMIT_MAX=100

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/taxcsa.co.ke.crt
SSL_KEY_PATH=/etc/nginx/ssl/taxcsa.co.ke.key
```

### 3. Docker Compose Configuration
Create `docker-compose.production.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: csa_tax_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./local-setup/database-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backups:/backups
    networks:
      - csa_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3

  app:
    build: 
      context: .
      dockerfile: local-setup/Dockerfile
    container_name: csa_tax_app
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - COMPANY_NAME=${COMPANY_NAME}
      - COMPANY_DOMAIN=${COMPANY_DOMAIN}
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    networks:
      - csa_network
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy

  nginx:
    image: nginx:alpine
    container_name: csa_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    networks:
      - csa_network
    restart: unless-stopped
    depends_on:
      - app

  redis:
    image: redis:7-alpine
    container_name: csa_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - csa_network
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-defaultpassword}

volumes:
  postgres_data:
  redis_data:

networks:
  csa_network:
    driver: bridge
```

### 4. Nginx Configuration
Create `nginx/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name taxcsa.co.ke www.taxcsa.co.ke;
        return 301 https://taxcsa.co.ke$request_uri;
    }
    
    # Main HTTPS server
    server {
        listen 443 ssl http2;
        server_name taxcsa.co.ke www.taxcsa.co.ke;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/taxcsa.co.ke.crt;
        ssl_certificate_key /etc/nginx/ssl/taxcsa.co.ke.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # Security configurations
        client_max_body_size 10M;
        
        # Rate limiting for specific endpoints
        location /api/auth {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Main application
        location / {
            # Check if request is from allowed domain
            if ($host !~ ^(taxcsa\.co\.ke|www\.taxcsa\.co\.ke)$) {
                return 403;
            }
            
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }
        
        # Block access to sensitive files
        location ~ /\. {
            deny all;
        }
        
        location ~ \.(env|sql|log)$ {
            deny all;
        }
    }
    
    # Block all other domains
    server {
        listen 80 default_server;
        listen 443 ssl default_server;
        server_name _;
        ssl_certificate /etc/nginx/ssl/taxcsa.co.ke.crt;
        ssl_certificate_key /etc/nginx/ssl/taxcsa.co.ke.key;
        return 403;
    }
}
```

## Database Configuration

### 1. Setup PostgreSQL with pgAdmin
```bash
# Create database initialization script
mkdir -p /home/csaadmin/csa-tax-hub/database-init

# Access the running PostgreSQL container
docker exec -it csa_tax_db psql -U csa_admin -d csa_tax_hub

# Or use pgAdmin (install on your local machine)
# Connection details:
# Host: your-server-ip
# Port: 5432
# Database: csa_tax_hub
# Username: csa_admin
# Password: YourSecurePassword123!
```

### 2. Database Backup Script
Create `/home/csaadmin/csa-tax-hub/scripts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/csaadmin/csa-tax-hub/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="csa_tax_hub"
DB_USER="csa_admin"

# Create backup
docker exec csa_tax_db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/csa_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/csa_backup_$DATE.sql

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: csa_backup_$DATE.sql.gz"
```

Make it executable and schedule:
```bash
chmod +x /home/csaadmin/csa-tax-hub/scripts/backup.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /home/csaadmin/csa-tax-hub/scripts/backup.sh
```

## Domain Configuration (taxcsa.co.ke)

### 1. DNS Configuration
Configure your domain DNS settings:
```
A Record: taxcsa.co.ke → Your-Server-IP
A Record: www.taxcsa.co.ke → Your-Server-IP
```

### 2. SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Stop nginx temporarily
docker stop csa_nginx

# Get SSL certificate
sudo certbot certonly --standalone -d taxcsa.co.ke -d www.taxcsa.co.ke

# Copy certificates to nginx directory
sudo mkdir -p /home/csaadmin/csa-tax-hub/nginx/ssl
sudo cp /etc/letsencrypt/live/taxcsa.co.ke/fullchain.pem /home/csaadmin/csa-tax-hub/nginx/ssl/taxcsa.co.ke.crt
sudo cp /etc/letsencrypt/live/taxcsa.co.ke/privkey.pem /home/csaadmin/csa-tax-hub/nginx/ssl/taxcsa.co.ke.key
sudo chown -R csaadmin:csaadmin /home/csaadmin/csa-tax-hub/nginx/ssl

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker restart csa_nginx" | sudo crontab -
```

## Security Implementation

### 1. Firewall Configuration
```bash
# Additional security rules
sudo ufw deny from any to any port 5432  # Block external PostgreSQL access
sudo ufw limit ssh  # Rate limit SSH

# Allow only specific IPs for admin access (optional)
# sudo ufw allow from YOUR_OFFICE_IP to any port 22
```

### 2. Fail2Ban Configuration
Create `/etc/fail2ban/jail.local`:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /home/csaadmin/csa-tax-hub/logs/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /home/csaadmin/csa-tax-hub/logs/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /home/csaadmin/csa-tax-hub/logs/nginx/access.log
maxretry = 2
```

Restart fail2ban:
```bash
sudo systemctl restart fail2ban
```

### 3. Additional Security Measures
```bash
# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no (use key-based auth)

# Restart SSH
sudo systemctl restart sshd

# Install additional security tools
sudo apt install -y rkhunter chkrootkit logwatch

# Setup automated security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Production Deployment

### 1. Deploy the Application
```bash
cd /home/csaadmin/csa-tax-hub

# Build and start services
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f app
```

### 2. Application Monitoring
Create monitoring script `/home/csaladmin/csa-tax-hub/scripts/monitor.sh`:
```bash
#!/bin/bash
LOGFILE="/home/csaadmin/csa-tax-hub/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if application is responding
if curl -f -s https://taxcsa.co.ke > /dev/null; then
    echo "$DATE - Application is running" >> $LOGFILE
else
    echo "$DATE - Application is DOWN! Restarting..." >> $LOGFILE
    docker-compose -f /home/csaadmin/csa-tax-hub/docker-compose.production.yml restart app
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$DATE - WARNING: Disk usage is at $DISK_USAGE%" >> $LOGFILE
fi
```

Add to crontab:
```bash
chmod +x /home/csaadmin/csa-tax-hub/scripts/monitor.sh
crontab -e
# Add: */5 * * * * /home/csaadmin/csa-tax-hub/scripts/monitor.sh
```

### 3. Log Management
```bash
# Setup log rotation
sudo nano /etc/logrotate.d/csa-tax-hub

# Add:
/home/csaadmin/csa-tax-hub/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 csaadmin csaladmin
    postrotate
        docker-compose -f /home/csaadmin/csa-tax-hub/docker-compose.production.yml restart nginx
    endscript
}
```

## Backup & Maintenance

### 1. Complete Backup Script
Create `/home/csaadmin/csa-tax-hub/scripts/full-backup.sh`:
```bash
#!/bin/bash
BACKUP_ROOT="/home/csaadmin/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/full_backup_$DATE"

mkdir -p $BACKUP_DIR

# Backup database
docker exec csa_tax_db pg_dump -U csa_admin csa_tax_hub > $BACKUP_DIR/database.sql

# Backup application files
tar -czf $BACKUP_DIR/application.tar.gz -C /home/csaadmin/csa-tax-hub \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    --exclude=backups \
    .

# Backup uploads
if [ -d "/home/csaadmin/csa-tax-hub/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads.tar.gz -C /home/csaadmin/csa-tax-hub uploads
fi

# Create archive
cd $BACKUP_ROOT
tar -czf "csa_full_backup_$DATE.tar.gz" "full_backup_$DATE"
rm -rf "full_backup_$DATE"

# Clean old backups
find $BACKUP_ROOT -name "csa_full_backup_*.tar.gz" -mtime +7 -delete

echo "Full backup completed: csa_full_backup_$DATE.tar.gz"
```

### 2. Update Script
Create `/home/csaadmin/csa-tax-hub/scripts/update.sh`:
```bash
#!/bin/bash
cd /home/csaadmin/csa-tax-hub

# Backup before update
./scripts/full-backup.sh

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build

echo "Application updated successfully"
```

## Troubleshooting

### Common Issues and Solutions

1. **Application won't start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.production.yml logs app
   
   # Check database connection
   docker exec csa_tax_db pg_isready -U csa_admin
   ```

2. **SSL Certificate issues**
   ```bash
   # Renew certificate
   sudo certbot renew
   
   # Copy new certificates
   sudo cp /etc/letsencrypt/live/taxcsa.co.ke/fullchain.pem /home/csaadmin/csa-tax-hub/nginx/ssl/taxcsa.co.ke.crt
   sudo cp /etc/letsencrypt/live/taxcsa.co.ke/privkey.pem /home/csaadmin/csa-tax-hub/nginx/ssl/taxcsa.co.ke.key
   
   # Restart nginx
   docker restart csa_nginx
   ```

3. **Database connection issues**
   ```bash
   # Check PostgreSQL status
   docker exec csa_tax_db pg_isready -U csa_admin -d csa_tax_hub
   
   # Reset database connection
   docker-compose -f docker-compose.production.yml restart postgres
   ```

4. **High resource usage**
   ```bash
   # Check resource usage
   docker stats
   
   # Optimize PostgreSQL
   docker exec csa_tax_db psql -U csa_admin -d csa_tax_hub -c "VACUUM ANALYZE;"
   ```

### Emergency Procedures

1. **System Recovery**
   ```bash
   # Stop all services
   docker-compose -f docker-compose.production.yml down
   
   # Restore from backup
   cd /home/csaadmin/backups
   tar -xzf csa_full_backup_YYYYMMDD_HHMMSS.tar.gz
   
   # Restore database
   docker-compose -f docker-compose.production.yml up -d postgres
   docker exec -i csa_tax_db psql -U csa_admin -d csa_tax_hub < full_backup_YYYYMMDD_HHMMSS/database.sql
   
   # Start all services
   docker-compose -f docker-compose.production.yml up -d
   ```

2. **Security Breach Response**
   ```bash
   # Immediately block suspicious IPs
   sudo ufw insert 1 deny from SUSPICIOUS_IP
   
   # Check for intrusions
   sudo rkhunter --check
   sudo chkrootkit
   
   # Review logs
   sudo tail -f /var/log/auth.log
   tail -f /home/csaladmin/csa-tax-hub/logs/nginx/access.log
   ```

### Maintenance Schedule

- **Daily**: Automated backups, security updates
- **Weekly**: Full system backup, log review
- **Monthly**: Security audit, performance review
- **Quarterly**: System updates, dependency updates

### Support Contacts
- **System Administrator**: admin@chandariashah.com
- **Technical Lead**: tech@chandariashah.com
- **Emergency**: +254-XXX-XXXXXX

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Prepared for**: Chandaria Shah & Associates LLP  
**Domain**: taxcsa.co.ke
