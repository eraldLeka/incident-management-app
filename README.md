# IT Incident Management System

A full-stack web application for managing IT incidents with role-based access control.

## Features

- **User Authentication**: Secure login/logout with JWT tokens
- **Role-Based Access Control**: Different roles (user, admin_system, admin_hardware, etc.)
- **Incident Management**: Create, read, update, delete incidents
- **Priority Management**: Critical, High, Medium, Low priority levels
- **Category Management**: Hardware, Software, Network, Security categories
- **Status Tracking**: Open, In Progress, Resolved, Closed statuses
- **Sector-Based Filtering**: Filter incidents by sector for admin users

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL/SQLite**: Database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

### Frontend
- **React**: UI framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Vite**: Build tool

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite is used by default)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/incident_management
   SECRET_KEY=your-super-secret-key-change-this-in-production
   HOST=127.0.0.1
   PORT=8000
   ```

6. **Create database tables**:
   ```bash
   python create_tables.py
   ```

7. **Create admin user**:
   ```bash
   python scripts/create_admin.py
   ```

8. **Run the backend server**:
   ```bash
   python run.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Default Admin Credentials

- **Email**: admin@system.com
- **Password**: admin123

**Important**: Change the default password after first login!

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration (admin only)
- `GET /auth/me` - Get current user info

### Incidents
- `GET /incidents/` - Get all incidents
- `POST /incidents/` - Create new incident
- `GET /incidents/{id}` - Get incident by ID
- `PUT /incidents/{id}` - Update incident
- `DELETE /incidents/{id}` - Delete incident
- `GET /incidents/my-incidents/` - Get user's incidents
- `GET /incidents/sector/{sector}` - Get incidents by sector
- `GET /incidents/selector-incidents/` - Get sector-specific incidents

## Logging System

The application includes a comprehensive logging system that tracks all actions:

### Log Files
- `logs/auth.log` - Authentication events
- `logs/incident.log` - Incident management operations
- `logs/user.log` - User management operations
- `logs/system.log` - System events and API requests
- `logs/error.log` - Error tracking

### Viewing Logs
```bash
# View all logs
python scripts/view_logs.py

# View specific log type
python scripts/view_logs.py --type auth

# Filter logs by text
python scripts/view_logs.py --filter "admin@system.com"

# Show log statistics
python scripts/view_logs.py --stats
```

For detailed logging information, see `backend/logs/README.md`.

## User Roles

- **user**: Basic user, can create and view own incidents
- **admin_system**: System administrator, can manage all users and incidents
- **admin_hardware**: Hardware admin, manages hardware incidents
- **admin_software**: Software admin, manages software incidents
- **admin_network**: Network admin, manages network incidents
- **admin_security**: Security admin, manages security incidents

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
