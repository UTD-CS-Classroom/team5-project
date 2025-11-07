# Appointment Booking System - Backend

A comprehensive FastAPI-based backend for an appointment booking system with dual portal access for customers and businesses.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Dual Portals** - Separate customer and business interfaces
- 📅 **Appointment Management** - Create, reschedule, and cancel appointments
- ⏰ **Time Slot Management** - Businesses can set their availability
- 💬 **Messaging System** - Communication between customers and businesses
- 🔍 **Search Functionality** - Find businesses by specialty and location
- 📊 **Status Tracking** - Track appointment states (pending, confirmed, completed, etc.)
- 🆔 **Unique Appointment IDs** - Auto-generated tracking numbers

## Tech Stack

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database (can be switched to PostgreSQL/MySQL)
- **JWT (python-jose)** - JSON Web Tokens for authentication
- **Bcrypt (passlib)** - Password hashing
- **Pydantic** - Data validation using Python type annotations

## Project Structure

```
backend/
├── main.py              # Application entry point
├── database.py          # Database configuration
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── auth.py              # Authentication utilities
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
├── .env.example         # Example environment variables
├── test_api.py          # API endpoint tests
└── routers/             # Route handlers
    ├── auth.py          # Authentication routes
    ├── customer.py      # Customer portal routes
    ├── business.py      # Business portal routes
    ├── public.py        # Public routes (search, etc.)
    └── messages.py      # Messaging routes
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### 2. Create Virtual Environment

```powershell
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 5. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```powershell
cp .env.example .env
```

**Important:** Change the `SECRET_KEY` in production!

### 6. Run the Application

```powershell
uvicorn main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## API Documentation

### Authentication Endpoints

- `POST /customer/register` - Register a new customer
- `POST /customer/login` - Customer login
- `POST /business/register` - Register a new business
- `POST /business/login` - Business login

### Customer Portal Endpoints

- `GET /customer/me` - Get customer profile
- `GET /customer/appointments` - Get all customer appointments
- `POST /customer/appointments` - Create new appointment
- `PUT /customer/appointments/{id}/reschedule` - Reschedule appointment
- `DELETE /customer/appointments/{id}` - Cancel appointment

### Business Portal Endpoints

- `GET /business/me` - Get business profile
- `PUT /business/me` - Update business profile
- `GET /business/appointments` - Get all business appointments (with optional status filter)
- `PUT /business/appointments/{id}/status` - Update appointment status
- `POST /business/timeslots` - Create time slot
- `GET /business/timeslots` - Get business time slots
- `DELETE /business/timeslots/{id}` - Delete time slot
- `POST /business/services` - Create service
- `GET /business/services` - Get all business services
- `GET /business/services/{id}` - Get specific service
- `PUT /business/services/{id}` - Update service
- `DELETE /business/services/{id}` - Delete service

### Public Endpoints

- `GET /businesses` - Search businesses (by specialty/location)
- `GET /businesses/{id}` - Get business details
- `GET /businesses/{id}/timeslots` - Get business available slots
- `GET /businesses/{id}/services` - Get business services with pricing

### Messaging Endpoints

- `POST /appointments/{id}/messages` - Send message
- `GET /appointments/{id}/messages` - Get all messages for appointment

## Testing

Run the test suite to verify all endpoints:

```powershell
python test_api.py
```

This will test:
- User registration and authentication
- Appointment lifecycle (create, reschedule, cancel)
- Business operations
- Messaging functionality
- Authorization and security

## Database Models

### Customer
- Email, password, full name, phone
- Related appointments

### Business
- Email, password, business name, phone, address
- Specialty, description
- Related appointments and time slots

### Appointment
- Customer and business references
- Unique appointment ID
- Date, time, duration
- Status (pending, confirmed, completed, cancelled, rejected, no_show)
- Business notes

### TimeSlot
- Day of week (0-6)
- Start and end time
- Slot duration
- Active status

### Service
- Name and description
- Price
- Duration
- Active status
- Business reference

### Message
- Appointment reference
- Sender type (customer/business)
- Message content
- Timestamp

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT secret key | Change in production! |
| `ALGORITHM` | JWT algorithm | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | 30 |
| `DATABASE_URL` | Database connection string | sqlite:///./appointments.db |

## Development

### Adding New Routes

1. Create a new router file in `routers/` directory
2. Define your routes using FastAPI's router
3. Import and include the router in `main.py`

### Database Migrations

For production, consider using Alembic for database migrations:

```powershell
pip install alembic
alembic init alembic
```

## Security Considerations

- ✅ Passwords are hashed using bcrypt
- ✅ JWT tokens for authentication
- ✅ CORS configured (update for production)
- ⚠️ Change `SECRET_KEY` in production
- ⚠️ Use HTTPS in production
- ⚠️ Update CORS `allow_origins` to specific domains in production
- ⚠️ Consider rate limiting for production

## Production Deployment

### Database

Switch from SQLite to PostgreSQL/MySQL by updating `DATABASE_URL` in `.env`:

```env
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### Running in Production

Use a production ASGI server like Gunicorn:

```powershell
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Troubleshooting

### Bcrypt Error

If you encounter bcrypt errors, reinstall with:

```powershell
pip uninstall -y bcrypt passlib
pip install bcrypt==4.2.1 passlib
```

### Database Locked

If the database is locked, ensure no other processes are using it:

```powershell
# Stop the server
# Delete the database file
Remove-Item appointments.db
# Restart the server
```

## License

MIT License - feel free to use this project for learning and development.

## Contributors

Team 5 - CS 3354

## Support

For questions or issues, please open an issue in the repository or contact the development team.
