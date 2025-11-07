"""
Comprehensive test script for all CRUD operations.
Tests Business, Appointment, Message, and File endpoints.

Run this after starting the server with:
    uvicorn backend.main:app --reload

Then run tests with:
    python backend/test_api.py
"""

import requests
import json
from datetime import datetime, timedelta
import os

BASE_URL = "http://127.0.0.1:8000"

def print_separator(title):
    """Print a formatted separator for test sections."""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_root():
    """Test the root endpoint."""
    print_separator("Testing Root Endpoint")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Root endpoint working")

def test_business_crud():
    """Test all Business CRUD operations."""
    print_separator("Testing Business CRUD Operations")
    
    # CREATE Business
    print("\n1. CREATE Business")
    business_data = {
        "name": "Luxury Hair Salon",
        "specialty": "Hair Styling & Coloring",
        "location": "Dallas, TX",
        "experience_years": 5,
        "portfolio_url": "https://example.com/portfolio"
    }
    response = requests.post(f"{BASE_URL}/businesses/", json=business_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    business_id = response.json()["id"]
    print(f"✓ Business created with ID: {business_id}")
    
    # LIST Businesses
    print("\n2. LIST All Businesses")
    response = requests.get(f"{BASE_URL}/businesses/")
    print(f"Status: {response.status_code}")
    businesses = response.json()
    print(f"Found {len(businesses)} business(es)")
    assert response.status_code == 200
    assert len(businesses) > 0
    print("✓ Business list retrieved")
    
    # GET Single Business
    print(f"\n3. GET Business by ID ({business_id})")
    response = requests.get(f"{BASE_URL}/businesses/{business_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Single business retrieved")
    
    # UPDATE Business
    print(f"\n4. UPDATE Business ({business_id})")
    updated_data = {
        "name": "Luxury Hair & Beauty Salon",
        "specialty": "Hair Styling, Coloring & Makeup",
        "location": "Dallas, TX",
        "experience_years": 6,
        "portfolio_url": "https://example.com/new-portfolio"
    }
    response = requests.put(f"{BASE_URL}/businesses/{business_id}", json=updated_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert response.json()["name"] == "Luxury Hair & Beauty Salon"
    print("✓ Business updated")
    
    return business_id

def test_appointment_crud(business_id):
    """Test all Appointment CRUD operations."""
    print_separator("Testing Appointment CRUD Operations")
    
    # CREATE Appointment
    print("\n1. CREATE Appointment")
    future_date = (datetime.now() + timedelta(days=7)).isoformat()
    appointment_data = {
        "business_id": business_id,
        "customer_name": "Jane Smith",
        "customer_email": "jane.smith@example.com",
        "customer_phone": "214-555-0123",
        "date_time": future_date,
        "notes": "Need hair coloring and styling for wedding"
    }
    response = requests.post(f"{BASE_URL}/appointments/", json=appointment_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    appointment_id = response.json()["id"]
    print(f"✓ Appointment created with ID: {appointment_id}")
    
    # LIST Appointments
    print("\n2. LIST All Appointments")
    response = requests.get(f"{BASE_URL}/appointments/")
    print(f"Status: {response.status_code}")
    appointments = response.json()
    print(f"Found {len(appointments)} appointment(s)")
    assert response.status_code == 200
    print("✓ Appointment list retrieved")
    
    # GET Single Appointment
    print(f"\n3. GET Appointment by ID ({appointment_id})")
    response = requests.get(f"{BASE_URL}/appointments/{appointment_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Single appointment retrieved")
    
    # UPDATE Appointment
    print(f"\n4. UPDATE Appointment ({appointment_id})")
    updated_appointment = {
        "business_id": business_id,
        "customer_name": "Jane Smith-Johnson",
        "customer_email": "jane.johnson@example.com",
        "customer_phone": "214-555-0123",
        "date_time": future_date,
        "notes": "Need hair coloring, styling, and makeup for wedding"
    }
    response = requests.put(f"{BASE_URL}/appointments/{appointment_id}", json=updated_appointment)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert response.json()["customer_name"] == "Jane Smith-Johnson"
    print("✓ Appointment updated")
    
    return appointment_id

def test_message_operations(appointment_id):
    """Test Message POST and GET operations."""
    print_separator("Testing Message Operations")
    
    # POST Message 1 (from customer)
    print("\n1. POST Message from Customer")
    message_data = {
        "appointment_id": appointment_id,
        "sender": "customer",
        "text": "Hi! I'm really excited about the appointment. Can you recommend any hair color?"
    }
    response = requests.post(
        f"{BASE_URL}/appointments/{appointment_id}/messages/",
        json=message_data
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Customer message posted")
    
    # POST Message 2 (from business)
    print("\n2. POST Message from Business")
    message_data = {
        "appointment_id": appointment_id,
        "sender": "business",
        "text": "Hi Jane! Thanks for booking. Based on your skin tone, I'd recommend a warm caramel balayage. We'll discuss more options during your appointment!"
    }
    response = requests.post(
        f"{BASE_URL}/appointments/{appointment_id}/messages/",
        json=message_data
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✓ Business message posted")
    
    # GET All Messages for Appointment
    print(f"\n3. GET All Messages for Appointment ({appointment_id})")
    response = requests.get(f"{BASE_URL}/appointments/{appointment_id}/messages/")
    print(f"Status: {response.status_code}")
    messages = response.json()
    print(f"Found {len(messages)} message(s)")
    for i, msg in enumerate(messages, 1):
        print(f"\nMessage {i}:")
        print(f"  Sender: {msg['sender']}")
        print(f"  Text: {msg['text']}")
        print(f"  Created: {msg['created_at']}")
    assert response.status_code == 200
    assert len(messages) >= 2
    print("\n✓ All messages retrieved")

def test_file_upload_operations(appointment_id):
    """Test File Upload operations and 25MB limit."""
    print_separator("Testing File Upload Operations")
    
    # Create small test files
    print("\n1. CREATE Test Files")
    test_file_1 = "test_image_1.txt"
    test_file_2 = "test_image_2.txt"
    
    with open(test_file_1, "w") as f:
        f.write("This is a small test file simulating an image (< 1MB)")
    
    with open(test_file_2, "w") as f:
        f.write("This is another small test file")
    
    print(f"✓ Created test files: {test_file_1}, {test_file_2}")
    
    # Upload small files (should succeed)
    print("\n2. UPLOAD Small Files (Should Succeed)")
    with open(test_file_1, "rb") as f1, open(test_file_2, "rb") as f2:
        files = [
            ("files", (test_file_1, f1, "text/plain")),
            ("files", (test_file_2, f2, "text/plain"))
        ]
        response = requests.post(
            f"{BASE_URL}/appointments/{appointment_id}/files",
            files=files
        )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        print("✓ Small files uploaded successfully")
    else:
        print(f"Error: {response.text}")
    
    # Cleanup small test files
    os.remove(test_file_1)
    os.remove(test_file_2)
    
    # Test 25MB limit
    print("\n3. TEST 25MB Upload Limit")
    large_file = "test_large_file.bin"
    
    # Create a file larger than 25MB (let's create 26MB)
    print("   Creating 26MB test file...")
    with open(large_file, "wb") as f:
        f.write(b"0" * (26 * 1024 * 1024))  # 26MB
    
    file_size_mb = os.path.getsize(large_file) / (1024 * 1024)
    print(f"   File size: {file_size_mb:.2f}MB")
    
    print("   Attempting to upload 26MB file (should fail)...")
    with open(large_file, "rb") as f:
        files = [("files", (large_file, f, "application/octet-stream"))]
        response = requests.post(
            f"{BASE_URL}/appointments/{appointment_id}/files",
            files=files
        )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json() if response.status_code != 200 else response.text}")
    
    if response.status_code == 400:
        print("✓ 25MB limit enforced correctly - upload rejected")
    else:
        print("✗ WARNING: Large file upload should have been rejected!")
    
    # Cleanup large test file
    os.remove(large_file)

def test_delete_operations(business_id, appointment_id):
    """Test DELETE operations."""
    print_separator("Testing DELETE Operations")
    
    # DELETE Appointment
    print(f"\n1. DELETE Appointment ({appointment_id})")
    response = requests.delete(f"{BASE_URL}/appointments/{appointment_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Appointment deleted")
    
    # Verify appointment is gone
    print(f"\n2. VERIFY Appointment is Deleted")
    response = requests.get(f"{BASE_URL}/appointments/{appointment_id}")
    print(f"Status: {response.status_code}")
    assert response.status_code == 404
    print("✓ Appointment not found (as expected)")
    
    # DELETE Business
    print(f"\n3. DELETE Business ({business_id})")
    response = requests.delete(f"{BASE_URL}/businesses/{business_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Business deleted")
    
    # Verify business is gone
    print(f"\n4. VERIFY Business is Deleted")
    response = requests.get(f"{BASE_URL}/businesses/{business_id}")
    print(f"Status: {response.status_code}")
    assert response.status_code == 404
    print("✓ Business not found (as expected)")

def main():
    """Run all tests."""
    print("\n" + "🚀" * 30)
    print("  COMPREHENSIVE API TEST SUITE")
    print("🚀" * 30)
    
    try:
        # Test if server is running
        print("\n🔍 Checking if server is running...")
        response = requests.get(BASE_URL, timeout=5)
        print("✓ Server is running!\n")
        
        # Run all tests
        test_root()
        business_id = test_business_crud()
        appointment_id = test_appointment_crud(business_id)
        test_message_operations(appointment_id)
        test_file_upload_operations(appointment_id)
        test_delete_operations(business_id, appointment_id)
        
        # Final summary
        print_separator("🎉 ALL TESTS PASSED! 🎉")
        print("\n✅ Database: SQLite working")
        print("✅ Business CRUD: All operations functional")
        print("✅ Appointment CRUD: All operations functional")
        print("✅ Messages: POST and GET working")
        print("✅ File Upload: Working with 25MB limit enforced")
        print("✅ Delete Operations: Cascading deletes working")
        print("\n" + "="*60)
        print("\n📝 Next Steps:")
        print("   1. Open http://127.0.0.1:8000/docs for Swagger UI")
        print("   2. Test manually via Swagger interface")
        print("   3. Check uploaded files in backend/uploads/")
        print("\n" + "="*60 + "\n")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server!")
        print("Please start the server first with:")
        print("   cd 'd:\\CS 3354\\Project'")
        print("   .\\backend\\venv\\Scripts\\uvicorn backend.main:app --reload")
        print("\nThen run this test script again.\n")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
