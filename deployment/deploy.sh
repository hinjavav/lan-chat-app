#!/bin/bash

# Simple deployment script for LAN Chat App
# Run this on your server after git clone

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_header "DEPLOYING LAN CHAT APP"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Install server dependencies
print_status "Installing server dependencies..."
cd server
npm install

# Setup database
print_status "Setting up database..."
if [ -f ".env" ]; then
    # Extract database credentials from .env
    DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
    DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)
    DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
    
    print_status "Running database migration..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < migrations/initial_schema.sql
    print_status "Database setup complete!"
else
    echo "Warning: .env file not found. Please copy .env.example to .env and configure it."
fi

# Build client
print_status "Installing client dependencies and building..."
cd ../client
npm install
npm run build

# Setup PM2
print_status "Setting up PM2..."
cd ..
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup nginx (basic)
print_status "Basic Nginx setup..."
sudo tee /etc/nginx/sites-available/lan-chat-app > /dev/null << 'NGINXCONF'
server {
    listen 80;
    server_name _;
    
    location / {
        root /var/www/lan-chat-app/client/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
NGINXCONF

sudo ln -sf /etc/nginx/sites-available/lan-chat-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

print_header "DEPLOYMENT COMPLETE!"
echo ""
echo "?? LAN Chat App deployed successfully!"
echo ""
echo "Access your app at: http://$(curl -s ifconfig.me)"
echo ""
echo "Default admin login:"
echo "Email: admin@localhost"
echo "Password: admin123"
echo ""
echo "Management commands:"
echo "- View logs: pm2 logs lan-chat-app"
echo "- Restart: pm2 restart lan-chat-app"
echo "- Stop: pm2 stop lan-chat-app"
echo ""
