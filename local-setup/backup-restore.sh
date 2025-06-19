
#!/bin/bash

# Tax Compliance Hub Backup and Restore Script
# Usage: ./backup-restore.sh [backup|restore] [backup_file]

set -e

# Configuration
DB_NAME="tax_compliance_hub"
DB_USER="tax_admin"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

backup_database() {
    print_info "Starting database backup..."
    
    BACKUP_FILE="$BACKUP_DIR/tax_compliance_backup_$DATE.sql"
    
    if pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"; then
        print_info "Database backup completed: $BACKUP_FILE"
        
        # Compress the backup
        gzip "$BACKUP_FILE"
        print_info "Backup compressed: $BACKUP_FILE.gz"
        
        # Clean up old backups (keep last 30 days)
        find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
        print_info "Old backups cleaned up"
        
        return 0
    else
        print_error "Database backup failed"
        return 1
    fi
}

restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file to restore"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "This will overwrite the current database. Are you sure?"
    read -p "Type 'yes' to continue: " -r
    
    if [ "$REPLY" != "yes" ]; then
        print_info "Restore cancelled"
        return 0
    fi
    
    print_info "Starting database restore..."
    
    # Drop and recreate database
    dropdb -U "$DB_USER" -h localhost "$DB_NAME" 2>/dev/null || true
    createdb -U "$DB_USER" -h localhost "$DB_NAME"
    
    # Restore from backup
    if [ "${backup_file##*.}" = "gz" ]; then
        gunzip -c "$backup_file" | psql -U "$DB_USER" -h localhost "$DB_NAME"
    else
        psql -U "$DB_USER" -h localhost "$DB_NAME" < "$backup_file"
    fi
    
    print_info "Database restore completed"
}

backup_files() {
    print_info "Starting file backup..."
    
    FILES_BACKUP="$BACKUP_DIR/tax_compliance_files_$DATE.tar.gz"
    
    tar -czf "$FILES_BACKUP" \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=.git \
        --exclude=backups \
        .
    
    print_info "File backup completed: $FILES_BACKUP"
}

restore_files() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify a file backup to restore"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "This will overwrite current files. Are you sure?"
    read -p "Type 'yes' to continue: " -r
    
    if [ "$REPLY" != "yes" ]; then
        print_info "File restore cancelled"
        return 0
    fi
    
    print_info "Starting file restore..."
    tar -xzf "$backup_file"
    print_info "File restore completed"
}

show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  backup              Create full backup (database + files)"
    echo "  backup-db           Create database backup only"
    echo "  backup-files        Create files backup only"
    echo "  restore [file]      Restore from backup file"
    echo "  restore-db [file]   Restore database from backup file"
    echo "  restore-files [file] Restore files from backup file"
    echo "  list                List available backups"
    echo "  clean               Clean old backups (30+ days)"
    echo
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore-db backups/tax_compliance_backup_20241219_143022.sql.gz"
    echo "  $0 list"
}

list_backups() {
    print_info "Available backups:"
    echo
    
    if ls "$BACKUP_DIR"/*.sql.gz >/dev/null 2>&1; then
        echo "Database backups:"
        ls -lh "$BACKUP_DIR"/*.sql.gz | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}'
    fi
    
    echo
    
    if ls "$BACKUP_DIR"/*.tar.gz >/dev/null 2>&1; then
        echo "File backups:"
        ls -lh "$BACKUP_DIR"/*.tar.gz | awk '{print "  " $9 " (" $5 ", " $6 " " $7 " " $8 ")"}'
    fi
}

clean_backups() {
    print_info "Cleaning old backups (30+ days)..."
    
    deleted=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete -print | wc -l)
    print_info "Deleted $deleted old database backups"
    
    deleted=$(find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete -print | wc -l)
    print_info "Deleted $deleted old file backups"
}

# Main script
case "$1" in
    backup)
        backup_database && backup_files
        ;;
    backup-db)
        backup_database
        ;;
    backup-files)
        backup_files
        ;;
    restore)
        restore_database "$2" && restore_files "$2"
        ;;
    restore-db)
        restore_database "$2"
        ;;
    restore-files)
        restore_files "$2"
        ;;
    list)
        list_backups
        ;;
    clean)
        clean_backups
        ;;
    *)
        show_usage
        ;;
esac
