# ?? LAN Chat Application

A complete LAN/VPN-based chat application with admin panel, real-time messaging, and support ticket system.

## ? Features

- ?? **Role-based Access Control** - Admin, Support, User roles
- ?? **Real-time Chat** - Socket.IO powered messaging
- ?? **Support Ticket System** - Complete ticket management
- ?? **Admin Panel** - User management and system monitoring
- ?? **Mobile Responsive** - Works on all devices
- ??? **Secure** - JWT authentication, input validation

## ?? Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/hinjavav/lan-chat-app.git
cd lan-chat-app
```

### 2. Configure environment
```bash
cd server
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Deploy (automated)
```bash
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

### 4. Manual setup (alternative)
```bash
# Install dependencies
npm run setup

# Setup database
mysql -u your_user -p your_database < server/migrations/initial_schema.sql

# Build client
cd client && npm run build

# Start server
cd ../server && npm start
```

## ?? Default Accounts

- **Admin**: admin@localhost / admin123
- **Support**: support@localhost / admin123  
- **User**: user@localhost / admin123

?? **Change these passwords in production!**

## ?? API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/verify` - Verify token

### Admin (requires admin role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - System statistics

## ??? Development

```bash
# Start development servers
npm run dev

# Server only
npm run server:dev

# Client only  
npm run client:dev
```

## ?? Tech Stack

**Backend:**
- Node.js + Express
- Socket.IO for real-time communication
- MySQL for database
- JWT for authentication
- bcrypt for password hashing

**Frontend:**
- React 18
- React Router for navigation
- Socket.IO client
- React Toastify for notifications

**Deployment:**
- PM2 for process management
- Nginx as reverse proxy
- Ubuntu/Linux server

## ?? Configuration

### Environment Variables (.env)
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=chat_app
DB_USER=chat_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://your_server_ip
```

### Database Setup
The application uses MySQL. Run the migration file to set up tables:

```bash
mysql -u username -p database_name < server/migrations/initial_schema.sql
```

## ?? Production Deployment

1. **Server Requirements:**
   - Ubuntu 20.04+ or similar Linux distribution
   - Node.js 18+
   - MySQL 8.0+
   - Nginx
   - PM2

2. **Automated Deployment:**
   ```bash
   ./deployment/deploy.sh
   ```

3. **Manual Steps:**
   - Configure firewall (UFW)
   - Set up SSL certificate (Let's Encrypt)
   - Configure backup strategy
   - Set up monitoring

## ?? Support

For issues and questions:
- Check the logs: `pm2 logs lan-chat-app`
- Verify database connection
- Check Nginx configuration: `sudo nginx -t`

## ?? License

MIT License - see LICENSE file for details.

---

Built with ?? for LAN/VPN chat communication
