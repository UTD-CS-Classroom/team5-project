# AppointmentsOnTheGo - Backend API

A FastAPI-based backend for managing business appointments with SQLite database.

## 📋 Features

- ✅ SQLite database with SQLAlchemy ORM
- ✅ RESTful API with FastAPI
- ✅ Full CRUD operations for Businesses, Appointments, Messages
- ✅ File upload with 25MB limit enforcement
- ✅ Auto-generated API documentation (Swagger UI)
- ✅ Input validation with Pydantic
- ✅ Proper error handling and timestamps

## 🚀 Quick Start

### 1. Activate Virtual Environment
```powershell
cd "d:\CS 3354\Project"
.\backend\venv\Scripts\activate
```

### 2. Install Dependencies (if needed)
```powershell
pip install -r backend\requirements.txt
```

### 3. Start the Server
```powershell
cd "d:\CS 3354\Project"
python -m uvicorn backend.main:app --reload
```

### 4. Access the API
- **API Documentation**: http://127.0.0.1:8000/docs
- **Alternative Docs**: http://127.0.0.1:8000/redoc
- **API Root**: http://127.0.0.1:8000/

## 🧪 Testing

### Run Simple Tests
```powershell
python backend\simple_test.py
```

### Run Comprehensive Tests
```powershell
python backend\test_api.py
```

## 📂 Project Structure

```
Project/
├── backend/
│   ├── routes/              # API endpoints
│   │   ├── businesses.py    # Business CRUD
│   │   ├── appointments.py  # Appointment CRUD
│   │   ├── messages.py      # Messages
│   │   └── files.py         # File uploads
│   ├── database.py          # SQLite & SQLAlchemy setup
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── main.py              # FastAPI application
│   ├── test_api.py          # Comprehensive tests
│   ├── simple_test.py       # Quick validation tests
│   ├── requirements.txt     # Python dependencies
│   ├── uploads/             # Uploaded files storage
│   └── venv/                # Virtual environment
├── appointments.db          # SQLite database (auto-created)
└── README.md               # This file
```

## 🌐 API Endpoints

### Businesses
- `POST   /businesses/` - Create business
- `GET    /businesses/` - List all businesses
- `GET    /businesses/{id}` - Get business by ID
- `PUT    /businesses/{id}` - Update business
- `DELETE /businesses/{id}` - Delete business

### Appointments
- `POST   /appointments/` - Create appointment
- `GET    /appointments/` - List all appointments
- `GET    /appointments/{id}` - Get appointment by ID
- `PUT    /appointments/{id}` - Update appointment
- `DELETE /appointments/{id}` - Delete appointment

### Messages
- `POST   /appointments/{id}/messages/` - Post message
- `GET    /appointments/{id}/messages/` - Get all messages

### Files
- `POST   /appointments/{id}/files` - Upload files (max 25MB total per appointment)

## 📦 Dependencies

- `fastapi` - Modern web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM for database operations
- `pydantic` - Data validation
- `python-multipart` - File upload support
- `email-validator` - Email validation

## ✅ Requirements Completed

- [x] SQLite database setup
- [x] SQLAlchemy engine, Base, and SessionLocal
- [x] Tables: Business, Appointment, Message, File
- [x] Pydantic schemas with validation
- [x] Full CRUD for businesses and appointments
- [x] Message posting and retrieval
- [x] File upload with 25MB limit
- [x] All endpoints tested and working

## 🎯 Example Usage

### Create a Business
```bash
curl -X POST "http://127.0.0.1:8000/businesses/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luxury Hair Salon",
    "specialty": "Hair Styling",
    "location": "Dallas, TX"
  }'
```

### Create an Appointment
```bash
curl -X POST "http://127.0.0.1:8000/appointments/" \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": 1,
    "customer_name": "Jane Doe",
    "customer_email": "jane@example.com",
    "date_time": "2025-12-01T10:00:00"
  }'
```

## 🔧 Development

The server runs with auto-reload enabled. Any changes to Python files will automatically restart the server.

Database tables are created automatically on first run.

## 📝 Notes

- Database file `appointments.db` is created in the project root
- Uploaded files are stored in `backend/uploads/`
- Server runs on port 8000 by default
- All timestamps are in UTC

---

**Status**: ✅ All features implemented and tested!
