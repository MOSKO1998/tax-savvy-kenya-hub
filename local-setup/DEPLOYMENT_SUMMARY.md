
# Tax Compliance Hub - Deployment Summary

## Overview
This is a comprehensive local deployment guide for running the Tax Compliance Hub on a Debian desktop machine with office-only access.

## Key Features
- ✅ **Local Database**: PostgreSQL running on your Debian machine
- ✅ **VS Code Integration**: Full TypeScript development environment
- ✅ **Network Access**: Office staff can access via local network
- ✅ **User Authentication**: Secure login with role-based permissions
- ✅ **Data Privacy**: All data stored locally, no cloud dependencies
- ✅ **Easy Maintenance**: Automated scripts for backup and user management

## Quick Setup Commands

### 1. System Prerequisites
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install VS Code
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update && sudo apt install code -y
```

### 2. Database Setup
```bash
# Create database user
sudo -u postgres createuser --interactive --pwprompt tax_admin
# Password: tax_secure_2024

# Create database
sudo -u postgres createdb tax_compliance_hub -O tax_admin
```

### 3. Project Setup
```bash
# Clone/Download project files
# Run the quick setup script
./local-setup/quick-start.sh

# Setup database schema
psql -U tax_admin -d tax_compliance_hub -h localhost -f local-setup/setup-database.sql
```

### 4. Start Application
```bash
# Start development server
npm run dev

# Application available at:
# - Local: http://localhost:5173
# - Network: http://YOUR_IP:5173
```

## Default Access
- **Email**: `demo@chandariashah.com`
- **Password**: `demo123`
- **Role**: Admin with full permissions

## Network Configuration

### For Office Staff Access:
1. Find your IP address: `ip addr show`
2. Share URL: `http://YOUR_IP_ADDRESS:5173`
3. Configure firewall (optional):
   ```bash
   sudo ufw allow from 192.168.0.0/16 to any port 5173
   ```

## File Structure
```
tax-compliance-hub/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utility libraries
│   └── services/          # Business logic
├── local-setup/           # Deployment scripts
│   ├── LOCAL_DEPLOYMENT_GUIDE.md
│   ├── quick-start.sh
│   ├── setup-database.sql
│   └── network-info.sh
├── .env.local            # Environment variables
└── package.json          # Dependencies
```

## Maintenance Scripts

### Add New User
```bash
./local-setup/add-user.sh username email@company.com "Full Name" staff
```

### Check System Status
```bash
./local-setup/status-check.sh
```

### Backup Database
```bash
./local-setup/backup-db.sh
```

### Get Network Info
```bash
./local-setup/network-info.sh
```

## Security Features
- Local database storage only
- Network access limited to office IP range
- Role-based access control
- Secure authentication system
- No external dependencies

## Development Workflow
1. **Edit Code**: Use VS Code with full TypeScript support
2. **Hot Reload**: Changes appear instantly during development
3. **Database Access**: Direct PostgreSQL access for data management
4. **User Management**: Add/remove users via command line scripts
5. **Backup**: Automated database backup scripts

## Troubleshooting

### Common Issues:
1. **Port 5173 in use**: Change port with `npm run dev -- --port 3000`
2. **Database connection**: Check PostgreSQL service status
3. **Network access**: Verify firewall settings
4. **Permission issues**: Check file ownership with `chown -R $USER:$USER ~/tax-compliance-hub`

### Support Resources:
- Full deployment guide: `local-setup/LOCAL_DEPLOYMENT_GUIDE.md`
- System status check: `./local-setup/status-check.sh`
- Network configuration: `./local-setup/network-info.sh`

## Production Considerations
- **Backup Strategy**: Schedule regular database backups
- **User Management**: Use provided scripts for adding staff
- **Network Security**: Configure firewall for office network only
- **System Updates**: Keep Node.js and PostgreSQL updated
- **Monitoring**: Use status scripts to check system health

This deployment ensures your tax compliance system runs entirely on your local infrastructure with full control over data and access.
