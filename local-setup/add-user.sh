
#!/bin/bash

# Tax Compliance Hub - Add New User Script
# This script adds a new user to the system

set -e

echo "👤 Tax Compliance Hub - Add New User"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Get user input
if [ $# -eq 0 ]; then
    echo "Usage: $0 <username> <email> <full_name> <role> [company_name]"
    echo ""
    echo "Roles: admin, manager, staff, readonly"
    echo "Example: $0 john john@company.com \"John Doe\" staff \"My Company\""
    exit 1
fi

USERNAME=$1
EMAIL=$2
FULL_NAME=$3
ROLE=$4
COMPANY_NAME=${5:-""}

print_info "Adding new user: $FULL_NAME ($EMAIL)"

# Generate UUID for user ID
USER_ID=$(uuidgen)

# Create SQL script
SQL_SCRIPT=$(cat << EOF
-- Add new user profile
INSERT INTO profiles (id, email, full_name, username, company_name) 
VALUES ('$USER_ID', '$EMAIL', '$FULL_NAME', '$USERNAME', '$COMPANY_NAME');

-- Add user role
INSERT INTO user_roles (user_id, role, department, permissions) 
VALUES ('$USER_ID', '$ROLE', 'tax', 
  CASE 
    WHEN '$ROLE' = 'admin' THEN ARRAY['all']
    WHEN '$ROLE' = 'manager' THEN ARRAY['manage_clients', 'manage_obligations', 'view_reports']
    WHEN '$ROLE' = 'staff' THEN ARRAY['view_clients', 'manage_obligations', 'upload_documents']
    ELSE ARRAY['view_only']
  END
);
EOF
)

# Execute SQL
print_info "Creating user in database..."
if echo "$SQL_SCRIPT" | PGPASSWORD=tax_secure_2024 psql -U tax_admin -d tax_compliance_hub -h localhost; then
    print_success "User created successfully!"
    echo ""
    echo "User Details:"
    echo "  Username: $USERNAME"
    echo "  Email: $EMAIL"
    echo "  Full Name: $FULL_NAME"
    echo "  Role: $ROLE"
    echo "  Company: ${COMPANY_NAME:-"Not specified"}"
    echo ""
    echo "The user can now log in to the system using their email and password."
    echo "Note: Password must be set through the authentication system."
else
    print_error "Failed to create user"
    exit 1
fi
