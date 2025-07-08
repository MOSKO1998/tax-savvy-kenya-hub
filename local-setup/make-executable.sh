
#!/bin/bash

# Make all shell scripts executable

echo "Making shell scripts executable..."

chmod +x local-setup/*.sh
chmod +x *.sh 2>/dev/null || true

echo "All shell scripts are now executable ✓"
