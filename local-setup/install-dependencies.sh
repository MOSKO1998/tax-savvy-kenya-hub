
#!/bin/bash

# Tax Compliance Hub - Install System Dependencies
# This script installs required system dependencies on Debian

set -e

echo "📦 Installing System Dependencies for Tax Compliance Hub"
echo "===================================================="

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

print_status "Updating package list..."
sudo apt update

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    print_status "Node.js installed: $(node -v)"
else
    print_status "Node.js already installed: $(node -v)"
fi

# Install PostgreSQL
print_status "Installing PostgreSQL..."
if ! command -v psql &> /dev/null; then
    sudo apt install postgresql postgresql-contrib -y
    print_status "PostgreSQL installed"
    
    # Start and enable PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_status "PostgreSQL service started and enabled"
else
    print_status "PostgreSQL already installed"
fi

# Install VS Code
print_status "Installing VS Code..."
if ! command -v code &> /dev/null; then
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
    sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
    sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
    sudo apt update
    sudo apt install code -y
    print_status "VS Code installed"
else
    print_status "VS Code already installed"
fi

# Install additional useful tools
print_status "Installing additional tools..."
sudo apt install -y git curl wget unzip uuid-runtime

print_status "✅ All system dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database user and database"
echo "2. Clone or download the Tax Compliance Hub project"
echo "3. Run the quick-start script: ./local-setup/quick-start.sh"
echo ""
echo "For complete setup instructions, see local-setup/LOCAL_DEPLOYMENT_GUIDE.md"
