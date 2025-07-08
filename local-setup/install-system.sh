
#!/bin/bash

# Tax Compliance Hub - Installation Script
# This script sets up the system without modifying package.json

set -e

echo "🚀 Tax Compliance Hub - System Installation"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

print_status "Checking system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_status "Node.js version: $(node -v) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "npm version: $(npm -v) ✓"

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Installing project dependencies..."
npm install

print_status "Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_status "Environment file created. Please review and update .env.local"
    else
        print_error ".env.example not found. Please create .env.local manually"
    fi
else
    print_status "Environment file exists ✓"
fi

print_status "✅ Installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.local with your configuration"
echo "2. Set up PostgreSQL database if using local deployment"
echo "3. Start the development server: npm run dev"
echo "4. Access the application at http://localhost:5173"
echo ""
echo "For Docker deployment, run: docker-compose -f local-setup/docker-compose.yml up -d"
echo "For complete setup guide, see: local-setup/complete-deployment-guide.md"

print_status "Installation script completed! 🎉"
