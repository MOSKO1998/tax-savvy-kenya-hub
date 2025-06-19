
# Tax Compliance Hub - Complete Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [PostgreSQL Setup](#postgresql-setup)
3. [Nextcloud Configuration](#nextcloud-configuration)
4. [Application Installation](#application-installation)
5. [Security Configuration](#security-configuration)
6. [Testing & Verification](#testing-verification)
7. [Troubleshooting](#troubleshooting)

## System Requirements

### Hardware Requirements
- **CPU**: Minimum 4GB RAM, 8GB recommended
- **Storage**: 10GB free space minimum
- **Network**: Stable internet connection for Nextcloud integration

### Software Requirements
- **Node.js**: Version 18 or higher
- **PostgreSQL**: Version 13 or higher
- **pgAdmin**: Version 4 or higher (optional but recommended)
- **Git**: Latest version
- **VS Code**: Latest version (recommended IDE)

## PostgreSQL Setup

### 1. Install PostgreSQL
```bash
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib
```

### 2. Configure PostgreSQL
1. Start PostgreSQL service
2. Create a database user:
```sql
CREATE USER tax_admin WITH PASSWORD 'your_secure_password';
ALTER USER tax_admin CREATEDB;
```

3. Create the database:
```sql
CREATE DATABASE tax_compliance_hub OWNER tax_admin;
```

### 3. Import Database Schema
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on your database → Query Tool
4. Open and execute `local-setup/database-schema.sql`

## Nextcloud Configuration

### 1. Access Your Nextcloud Instance
- URL: https://cloud.audit.ke
- Username: it@csa.co.ke
- Password: Wakatiimefika@1998

### 2. Create Folder Structure
1. Login to Nextcloud
2. Create folder: "Tax Compliance Hub"
3. Inside create subfolders:
   - general
   - clients (will auto-create client-specific folders)
   - templates
   - archived

### 3. Configure API Access
1. Go to Settings → Security
2. Generate App Password for API access
3. Note down the credentials (already configured in the system)

## Application Installation

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repository-url>
cd tax-compliance-hub

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### 2. Environment Configuration
Create `.env.local` file with:
```env
# Database Configuration
DATABASE_URL=postgresql://tax_admin:your_secure_password@localhost:5432/tax_compliance_hub

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Nextcloud Configuration
NEXTCLOUD_URL=https://cloud.audit.ke
NEXTCLOUD_USERNAME=it@csa.co.ke
NEXTCLOUD_PASSWORD=Wakatiimefika@1998

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key
JWT_SECRET=your-jwt-secret-key
RATE_LIMIT_MAX=100

# Development
NODE_ENV=development
PORT=3000
```

### 3. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## Security Configuration

### 1. Firewall Setup
```bash
# Ubuntu/Debian
sudo ufw enable
sudo ufw allow 3000/tcp
sudo ufw allow 5432/tcp

# Windows: Configure Windows Defender Firewall
```

### 2. SSL Certificate (Production)
1. Obtain SSL certificate from Let's Encrypt or CA
2. Configure reverse proxy (Nginx/Apache)
3. Update environment variables with HTTPS URLs

### 3. Database Security
```sql
-- Create backup user
CREATE USER backup_user WITH PASSWORD 'backup_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;

-- Set up regular backups
-- Add to crontab: 0 2 * * * pg_dump -U backup_user tax_compliance_hub > backup_$(date +%Y%m%d).sql
```

### 4. Application Security Features
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All forms use Zod validation
- **SQL Injection Protection**: Parameterized queries only
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Built-in with NextAuth
- **Session Management**: Secure JWT tokens
- **Audit Logging**: All actions logged
- **Role-based Access Control**: Granular permissions

## Testing & Verification

### 1. Database Connection Test
```javascript
// Run in Node.js console
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'your-database-url'
});

pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
```

### 2. Nextcloud Connection Test
```bash
curl -u "it@csa.co.ke:Wakatiimefika@1998" \
  -X PROPFIND \
  "https://cloud.audit.ke/remote.php/dav/files/it@csa.co.ke/"
```

### 3. Application Test Checklist
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Client management functions
- [ ] Document upload to Nextcloud works
- [ ] Tax obligations can be created
- [ ] Notifications system works
- [ ] Security monitoring active
- [ ] User roles and permissions work

## Production Deployment

### 1. Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "tax-compliance-hub" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 2. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Backup Strategy
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="/backups/db_backup_$DATE.sql"
FILES_BACKUP="/backups/files_backup_$DATE.tar.gz"

# Database backup
pg_dump -U tax_admin tax_compliance_hub > $DB_BACKUP

# Application files backup
tar -czf $FILES_BACKUP /path/to/tax-compliance-hub

# Cleanup old backups (keep 30 days)
find /backups -name "*.sql" -mtime +30 -delete
find /backups -name "*.tar.gz" -mtime +30 -delete
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```
Error: ECONNREFUSED
```
**Solution**: 
- Check PostgreSQL service is running
- Verify connection string in .env.local
- Check firewall settings

#### 2. Nextcloud Upload Failures
```
Error: 401 Unauthorized
```
**Solution**:
- Verify Nextcloud credentials
- Check folder permissions
- Ensure API access is enabled

#### 3. Authentication Issues
**Solution**:
- Clear browser cookies
- Check NEXTAUTH_SECRET is set
- Verify database user_roles table

#### 4. Permission Denied Errors
**Solution**:
- Check user roles in database
- Verify RLS policies are correct
- Review audit logs for details

### Logs and Debugging

#### Application Logs
```bash
# View application logs
pm2 logs tax-compliance-hub

# View database logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

#### Security Monitoring
- Access `/security-dashboard` as admin
- Review audit_logs table regularly
- Monitor failed login attempts

### Support Contacts
- System Administrator: it@csa.co.ke
- Technical Support: Available during business hours
- Emergency Contact: [Your emergency contact]

---

## Quick Start Checklist

### Pre-Installation
- [ ] Install Node.js 18+
- [ ] Install PostgreSQL 13+
- [ ] Install pgAdmin (optional)
- [ ] Verify Nextcloud access

### Installation
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Create database and user
- [ ] Import database schema
- [ ] Configure environment variables
- [ ] Test database connection
- [ ] Test Nextcloud connection

### Post-Installation
- [ ] Create admin user
- [ ] Configure user roles
- [ ] Test document upload
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Train users

### Security Hardening
- [ ] Change default passwords
- [ ] Enable firewall
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up monitoring alerts

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Tax Compliance Hub Development Team
