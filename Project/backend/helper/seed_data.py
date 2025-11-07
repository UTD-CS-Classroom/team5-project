"""
Seed script to populate the database with dummy data for testing the frontend.
Run this script to add sample businesses, services, and time slots.
"""

import requests
import random
from datetime import datetime, time

BASE_URL = "http://localhost:8000"

# Sample data
BUSINESSES = [
    {
        "email": "hairsalon@example.com",
        "password": "password123",
        "business_name": "Luxe Hair Salon",
        "phone": "+1 (214) 555-0101",
        "address": "123 Main St, Dallas, TX 75201",
        "specialty": "Hair Salon",
        "description": "Premium hair salon offering cuts, colors, and styling. Our expert stylists are dedicated to making you look and feel your best."
    },
    {
        "email": "smilecare@example.com",
        "password": "password123",
        "business_name": "Smile Care Dental",
        "phone": "+1 (214) 555-0102",
        "address": "456 Oak Ave, Dallas, TX 75202",
        "specialty": "Dental",
        "description": "Family dental practice providing comprehensive dental care including cleanings, fillings, and cosmetic dentistry."
    },
    {
        "email": "lawfirm@example.com",
        "password": "password123",
        "business_name": "Dallas Legal Associates",
        "phone": "+1 (214) 555-0103",
        "address": "789 Commerce St, Dallas, TX 75203",
        "specialty": "Legal",
        "description": "Experienced attorneys specializing in family law, estate planning, and business law. Free initial consultation."
    },
    {
        "email": "beautyspa@example.com",
        "password": "password123",
        "business_name": "Serenity Beauty Spa",
        "phone": "+1 (214) 555-0104",
        "address": "321 Elm St, Dallas, TX 75204",
        "specialty": "Beauty",
        "description": "Luxury spa offering facials, massages, manicures, and pedicures. Relax and rejuvenate in our peaceful environment."
    },
    {
        "email": "healthclinic@example.com",
        "password": "password123",
        "business_name": "HealthFirst Clinic",
        "phone": "+1 (214) 555-0105",
        "address": "555 Medical Dr, Dallas, TX 75205",
        "specialty": "Medical",
        "description": "Walk-in medical clinic providing primary care, urgent care, and preventive health services."
    },
    {
        "email": "moderncuts@example.com",
        "password": "password123",
        "business_name": "Modern Cuts Barbershop",
        "phone": "+1 (214) 555-0106",
        "address": "888 Barber Ln, Dallas, TX 75206",
        "specialty": "Hair Salon",
        "description": "Traditional barbershop with a modern twist. Specializing in men's haircuts, beard trims, and hot towel shaves."
    },
]

# Services for each business type
SERVICES_BY_TYPE = {
    "Hair Salon": [
        {"name": "Haircut", "description": "Professional haircut and styling", "price": 45.00, "duration_minutes": 45},
        {"name": "Hair Color", "description": "Full color treatment", "price": 120.00, "duration_minutes": 120},
        {"name": "Highlights", "description": "Partial or full highlights", "price": 150.00, "duration_minutes": 150},
        {"name": "Blow Dry & Style", "description": "Professional blow dry and styling", "price": 35.00, "duration_minutes": 30},
    ],
    "Dental": [
        {"name": "Cleaning & Check-up", "description": "Regular dental cleaning and examination", "price": 100.00, "duration_minutes": 60},
        {"name": "Teeth Whitening", "description": "Professional teeth whitening treatment", "price": 300.00, "duration_minutes": 90},
        {"name": "Filling", "description": "Cavity filling procedure", "price": 150.00, "duration_minutes": 45},
        {"name": "Root Canal", "description": "Root canal treatment", "price": 800.00, "duration_minutes": 120},
    ],
    "Legal": [
        {"name": "Initial Consultation", "description": "30-minute consultation", "price": 0.00, "duration_minutes": 30},
        {"name": "Legal Consultation", "description": "One-hour legal consultation", "price": 200.00, "duration_minutes": 60},
        {"name": "Document Review", "description": "Review and analysis of legal documents", "price": 250.00, "duration_minutes": 60},
        {"name": "Estate Planning", "description": "Comprehensive estate planning session", "price": 500.00, "duration_minutes": 90},
    ],
    "Beauty": [
        {"name": "Facial Treatment", "description": "Deep cleansing facial", "price": 80.00, "duration_minutes": 60},
        {"name": "Swedish Massage", "description": "Full body relaxation massage", "price": 100.00, "duration_minutes": 60},
        {"name": "Manicure", "description": "Professional nail care and polish", "price": 35.00, "duration_minutes": 45},
        {"name": "Pedicure", "description": "Foot care and polish", "price": 45.00, "duration_minutes": 60},
    ],
    "Medical": [
        {"name": "Primary Care Visit", "description": "General medical consultation", "price": 120.00, "duration_minutes": 30},
        {"name": "Urgent Care Visit", "description": "Urgent medical attention", "price": 150.00, "duration_minutes": 45},
        {"name": "Physical Exam", "description": "Complete physical examination", "price": 200.00, "duration_minutes": 60},
        {"name": "Lab Work", "description": "Blood work and testing", "price": 75.00, "duration_minutes": 15},
    ],
}

# Time slots (weekdays)
TIME_SLOTS = [
    {"day_of_week": 1, "start_time": "09:00", "end_time": "17:00"},  # Monday
    {"day_of_week": 2, "start_time": "09:00", "end_time": "17:00"},  # Tuesday
    {"day_of_week": 3, "start_time": "09:00", "end_time": "17:00"},  # Wednesday
    {"day_of_week": 4, "start_time": "09:00", "end_time": "17:00"},  # Thursday
    {"day_of_week": 5, "start_time": "09:00", "end_time": "17:00"},  # Friday
]

def register_businesses():
    """Register all businesses and return their tokens"""
    print("🏢 Registering businesses...")
    business_tokens = []
    
    for business_data in BUSINESSES:
        try:
            # Try to register business
            response = requests.post(
                f"{BASE_URL}/auth/business/register",
                json=business_data
            )
            
            if response.status_code == 200:
                print(f"   ✓ Registered: {business_data['business_name']}")
            else:
                print(f"   ⚠ {business_data['business_name']}: {response.json().get('detail', 'Already exists')}")
            
            # Login to get token (works whether just registered or already existed)
            login_response = requests.post(
                f"{BASE_URL}/auth/business/login",
                json={
                    "email": business_data["email"],
                    "password": business_data["password"]
                }
            )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                business_tokens.append({
                    "name": business_data["business_name"],
                    "specialty": business_data["specialty"],
                    "token": token_data["access_token"],
                    "business_id": token_data["user_id"]
                })
                
        except Exception as e:
            print(f"   ✗ Error with {business_data['business_name']}: {str(e)}")
    
    return business_tokens

def add_services(business_tokens):
    """Add services for each business"""
    print("\n💼 Adding services...")
    
    for business in business_tokens:
        token = business["token"]
        specialty = business["specialty"]
        services = SERVICES_BY_TYPE.get(specialty, [])
        
        headers = {"Authorization": f"Bearer {token}"}
        
        for service_data in services:
            try:
                response = requests.post(
                    f"{BASE_URL}/business/services",
                    json=service_data,
                    headers=headers
                )
                
                if response.status_code == 200:
                    print(f"   ✓ {business['name']}: Added '{service_data['name']}'")
                else:
                    print(f"   ⚠ {business['name']}: {response.json().get('detail', 'Error')}")
                    
            except Exception as e:
                print(f"   ✗ Error adding service: {str(e)}")

def add_time_slots(business_tokens):
    """Add time slots for each business"""
    print("\n⏰ Adding time slots...")
    
    for business in business_tokens:
        token = business["token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        for slot in TIME_SLOTS:
            slot_data = {
                **slot,
                "slot_duration_minutes": 30,
                "is_active": True
            }
            
            try:
                response = requests.post(
                    f"{BASE_URL}/business/timeslots",
                    json=slot_data,
                    headers=headers
                )
                
                if response.status_code == 200:
                    day_name = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][slot["day_of_week"]]
                    print(f"   ✓ {business['name']}: {day_name} {slot['start_time']}-{slot['end_time']}")
                    
            except Exception as e:
                print(f"   ✗ Error adding time slot: {str(e)}")

def register_sample_customers():
    """Register a few sample customers"""
    print("\n👤 Registering sample customers...")
    
    customers = [
        {
            "email": "john.doe@example.com",
            "password": "password123",
            "full_name": "John Doe",
            "phone": "+1 (214) 555-1001"
        },
        {
            "email": "jane.smith@example.com",
            "password": "password123",
            "full_name": "Jane Smith",
            "phone": "+1 (214) 555-1002"
        },
        {
            "email": "bob.johnson@example.com",
            "password": "password123",
            "full_name": "Bob Johnson",
            "phone": "+1 (214) 555-1003"
        },
    ]
    
    for customer_data in customers:
        try:
            response = requests.post(
                f"{BASE_URL}/auth/customer/register",
                json=customer_data
            )
            
            if response.status_code == 200:
                print(f"   ✓ Registered: {customer_data['full_name']}")
            else:
                print(f"   ⚠ {customer_data['full_name']}: {response.json().get('detail', 'Already exists')}")
                
        except Exception as e:
            print(f"   ✗ Error: {str(e)}")

def main():
    print("=" * 60)
    print("🌱 SEEDING DATABASE WITH DUMMY DATA")
    print("=" * 60)
    print(f"\nConnecting to: {BASE_URL}")
    print("Make sure the backend server is running!\n")
    
    try:
        # Check if server is running
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("❌ Backend server is not responding!")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend server: {str(e)}")
        print("Please start the backend with: uvicorn main:app --reload")
        return
    
    # Seed data
    business_tokens = register_businesses()
    
    if business_tokens:
        add_services(business_tokens)
        add_time_slots(business_tokens)
    
    register_sample_customers()
    
    print("\n" + "=" * 60)
    print("✅ DATABASE SEEDING COMPLETE!")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"   - {len(BUSINESSES)} businesses registered")
    print(f"   - Services added for each business")
    print(f"   - Time slots configured (Mon-Fri, 9AM-5PM)")
    print(f"   - 3 sample customers registered")
    print(f"\n🔐 Test Credentials:")
    print(f"\n   Businesses:")
    for b in BUSINESSES[:3]:
        print(f"   • {b['business_name']}")
        print(f"     Email: {b['email']}")
        print(f"     Password: {b['password']}")
    print(f"\n   Customers:")
    print(f"   • Email: john.doe@example.com")
    print(f"   • Email: jane.smith@example.com")
    print(f"   • Password: password123 (for all)")
    print(f"\n🌐 Frontend: http://localhost:5173")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
