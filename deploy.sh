
#!/bin/bash

# Tax Compliance Hub Deployment Script
# This script automates the deployment process

set -e

echo "🚀 Starting Tax Compliance Hub Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        exit 1
    else
        print_error "No .env.example file found. Please create .env file manually."
        exit 1
    fi
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker compose down || true

# Pull latest images
print_status "Pulling latest images..."
docker compose pull || true

# Build the application
print_status "Building application..."
docker compose build --no-cache

# Start services
print_status "Starting services..."
docker compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Health check
print_status "Performing health check..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_status "✅ Application is healthy!"
else
    print_warning "Health check failed. Check logs with: docker compose logs"
fi

# Display running containers
print_status "Running containers:"
docker compose ps

# Display access information
print_status "🎉 Deployment completed!"
echo ""
echo "Access your application at:"
echo "  🌐 Web Interface: http://localhost:3000"
echo "  🗄️  Database: localhost:5432"
echo "  📊 Logs: docker compose logs -f"
echo ""
echo "Useful commands:"
echo "  • View logs: docker compose logs -f [service_name]"
echo "  • Restart: docker compose restart [service_name]"
echo "  • Stop: docker compose down"
echo "  • Update: git pull && ./deploy.sh"
echo ""
print_status "Happy coding! 🚀"
