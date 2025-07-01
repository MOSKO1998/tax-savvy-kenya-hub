
#!/bin/bash

echo "=== Tax Compliance Hub - Network Information ==="
echo ""
echo "🖥️  Local Development Access:"
echo "   http://localhost:5173"
echo ""
echo "🌐 Network Access (for office staff):"

# Get all network interfaces
INTERFACES=$(ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1)

if [ -n "$INTERFACES" ]; then
    echo "   Available network addresses:"
    for IP in $INTERFACES; do
        echo "   📡 http://$IP:5173"
    done
else
    echo "   ⚠️  No network interfaces found"
fi

echo ""
echo "🔧 Quick Setup Commands:"
echo "   Start application: npm run dev"
echo "   Check system status: ./local-setup/status-check.sh"
echo "   Add new user: ./local-setup/add-user.sh"
echo "   Backup database: ./local-setup/backup-db.sh"
echo ""
echo "👤 Default Demo Login:"
echo "   Email: demo@chandariashah.com"
echo "   Password: demo123"
echo ""
echo "🔒 Firewall Configuration (optional):"
echo "   Allow office network: sudo ufw allow from 192.168.0.0/16 to any port 5173"
echo ""
echo "📚 For complete setup instructions, see:"
echo "   local-setup/LOCAL_DEPLOYMENT_GUIDE.md"
