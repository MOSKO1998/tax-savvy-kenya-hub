
#!/bin/bash

# Tax Compliance Hub - Database Backup Script
# This script creates a backup of the database

set -e

echo "💾 Tax Compliance Hub - Database Backup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if PostgreSQL is running
if ! systemctl is-active --quiet postgresql; then
    print_error "PostgreSQL service is not running. Please start it first."
    exit 1
fi

# Create backups directory
mkdir -p backups

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/tax_compliance_hub_backup_$TIMESTAMP.sql"

print_info "Creating database backup..."

# Create backup
if PGPASSWORD=tax_secure_2024 pg_dump -U tax_admin -d tax_compliance_hub -h localhost > "$BACKUP_FILE"; then
    print_success "Database backup created: $BACKUP_FILE"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
    
    # Clean up old backups (keep last 10)
    print_info "Cleaning up old backups (keeping last 10)..."
    cd backups
    ls -t tax_compliance_hub_backup_*.sql | tail -n +11 | xargs -r rm
    BACKUP_COUNT=$(ls -1 tax_compliance_hub_backup_*.sql 2>/dev/null | wc -l)
    echo "Total backups: $BACKUP_COUNT"
    
else
    print_error "Failed to create backup"
    exit 1
fi

echo ""
echo "To restore from this backup:"
echo "  PGPASSWORD=tax_secure_2024 psql -U tax_admin -d tax_compliance_hub -h localhost < $BACKUP_FILE"
