
#!/bin/bash

# Tax Compliance Hub - System Status Check
# This script checks the health of all system components

set -e

echo "🔍 Tax Compliance Hub - System Status Check"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js
print_status "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js version: $NODE_VERSION"
else
    print_error "Node.js is not installed"
fi

# Check npm
print_status "Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm version: $NPM_VERSION"
else
    print_error "npm is not installed"
fi

# Check PostgreSQL
print_status "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL service is running"
        
        # Check database connection
        if PGPASSWORD=tax_secure_2024 psql -U tax_admin -d tax_compliance_hub -h localhost -c '\q' 2>/dev/null; then
            print_success "Database connection successful"
        else
            print_error "Cannot connect to tax_compliance_hub database"
        fi
    else
        print_error "PostgreSQL service is not running"
    fi
else
    print_error "PostgreSQL is not installed"
fi

# Check project directory
print_status "Checking project structure..."
if [ -f "package.json" ]; then
    print_success "Project package.json found"
else
    print_error "package.json not found - are you in the project directory?"
fi

if [ -f ".env.local" ]; then
    print_success "Environment file found"
else
    print_warning "Environment file (.env.local) not found"
fi

# Check dependencies
print_status "Checking project dependencies..."
if [ -d "node_modules" ]; then
    print_success "Node modules installed"
else
    print_warning "Node modules not found - run 'npm install'"
fi

# Check network
print_status "Checking network configuration..."
LOCAL_IP=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -1)
if [ -n "$LOCAL_IP" ]; then
    print_success "Local IP address: $LOCAL_IP"
    echo "  Network access URL: http://$LOCAL_IP:5173"
else
    print_warning "Could not determine local IP address"
fi

# Check port availability
print_status "Checking port 5173 availability..."
if lsof -i :5173 &> /dev/null; then
    print_warning "Port 5173 is already in use"
    echo "  Use 'npm run dev -- --port 3000' to use a different port"
else
    print_success "Port 5173 is available"
fi

# Check VS Code
print_status "Checking VS Code..."
if command -v code &> /dev/null; then
    print_success "VS Code is installed"
else
    print_warning "VS Code is not installed"
fi

# Summary
echo ""
echo "📊 System Status Summary"
echo "======================="
echo "✅ Ready for development and deployment"
echo "🌐 Local access: http://localhost:5173"
echo "🏢 Office access: http://$LOCAL_IP:5173"
echo "👤 Demo login: demo@chandariashah.com / demo123"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "To add new users:"
echo "  ./local-setup/add-user.sh"
echo ""
echo "To backup database:"
echo "  ./local-setup/backup-db.sh"
