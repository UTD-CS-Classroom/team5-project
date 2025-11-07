import requests
import json
from datetime import date, time, datetime, timedelta
import random

# Base URL
BASE_URL = "http://localhost:8000"

# Generate random emails to avoid conflicts
random_suffix = random.randint(1000, 9999)

# Test data
customer_data = {
    "email": f"customer{random_suffix}@test.com",
    "password": "testpass123",
    "full_name": "John Doe",
    "phone": "123-456-7890"
}

business_data = {
    "email": f"business{random_suffix}@test.com",
    "password": "testpass123",
    "business_name": "Best Hair Salon",
    "phone": "098-765-4321",
    "address": "123 Main St, Dallas, TX",
    "specialty": "Hair Salon",
    "description": "Professional hair styling services"
}

# Store tokens and IDs
customer_token = None
business_token = None
customer_id = None
business_id = None
appointment_id = None
timeslot_id = None
service_id = None

def print_test(test_name):
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print('='*60)

def print_response(response):
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2, default=str)}")
    except:
        print(f"Response: {response.text}")
    return response

# ==================== Test Root ====================
def test_root():
    print_test("Root Endpoint")
    response = requests.get(f"{BASE_URL}/")
    print_response(response)
    assert response.status_code == 200

# ==================== Test Customer Registration ====================
def test_customer_register():
    global customer_id
    print_test("Customer Registration")
    response = requests.post(f"{BASE_URL}/customer/register", json=customer_data)
    print_response(response)
    assert response.status_code == 200
    customer_id = response.json()["id"]
    print(f"✓ Customer registered with ID: {customer_id}")

# ==================== Test Customer Login ====================
def test_customer_login():
    global customer_token
    print_test("Customer Login")
    login_data = {
        "email": customer_data["email"],
        "password": customer_data["password"]
    }
    response = requests.post(f"{BASE_URL}/customer/login", json=login_data)
    print_response(response)
    assert response.status_code == 200
    customer_token = response.json()["access_token"]
    print(f"✓ Customer logged in, token obtained")

# ==================== Test Customer Profile ====================
def test_customer_profile():
    print_test("Get Customer Profile")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{BASE_URL}/customer/me", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Business Registration ====================
def test_business_register():
    global business_id
    print_test("Business Registration")
    response = requests.post(f"{BASE_URL}/business/register", json=business_data)
    print_response(response)
    assert response.status_code == 200
    business_id = response.json()["id"]
    print(f"✓ Business registered with ID: {business_id}")

# ==================== Test Business Login ====================
def test_business_login():
    global business_token
    print_test("Business Login")
    login_data = {
        "email": business_data["email"],
        "password": business_data["password"]
    }
    response = requests.post(f"{BASE_URL}/business/login", json=login_data)
    print_response(response)
    assert response.status_code == 200
    business_token = response.json()["access_token"]
    print(f"✓ Business logged in, token obtained")

# ==================== Test Business Profile ====================
def test_business_profile():
    print_test("Get Business Profile")
    headers = {"Authorization": f"Bearer {business_token}"}
    response = requests.get(f"{BASE_URL}/business/me", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Update Business Profile ====================
def test_update_business_profile():
    print_test("Update Business Profile")
    headers = {"Authorization": f"Bearer {business_token}"}
    update_data = {
        "email": business_data["email"],
        "business_name": "Best Hair Salon - Updated",
        "phone": business_data["phone"],
        "address": business_data["address"],
        "specialty": "Hair & Beauty",
        "description": "Premium hair and beauty services"
    }
    response = requests.put(f"{BASE_URL}/business/me", json=update_data, headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Create Time Slots ====================
def test_create_timeslot():
    global timeslot_id
    print_test("Create Time Slot")
    headers = {"Authorization": f"Bearer {business_token}"}
    timeslot_data = {
        "day_of_week": 1,  # Monday
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "slot_duration_minutes": 30,
        "is_active": True
    }
    response = requests.post(f"{BASE_URL}/business/timeslots", json=timeslot_data, headers=headers)
    print_response(response)
    assert response.status_code == 200
    timeslot_id = response.json()["id"]
    print(f"✓ Time slot created with ID: {timeslot_id}")

# ==================== Test Get Time Slots ====================
def test_get_timeslots():
    print_test("Get Business Time Slots")
    headers = {"Authorization": f"Bearer {business_token}"}
    response = requests.get(f"{BASE_URL}/business/timeslots", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Create Service ====================
def test_create_service():
    global service_id
    print_test("Create Service")
    headers = {"Authorization": f"Bearer {business_token}"}
    service_data = {
        "name": "Premium Haircut",
        "description": "Professional haircut with styling",
        "price": 45.00,
        "duration_minutes": 60,
        "is_active": True
    }
    response = requests.post(f"{BASE_URL}/business/services", json=service_data, headers=headers)
    print_response(response)
    assert response.status_code == 200
    service_id = response.json()["id"]
    print(f"✓ Service created with ID: {service_id}")

# ==================== Test Get Business Services ====================
def test_get_business_services():
    print_test("Get Business Services")
    headers = {"Authorization": f"Bearer {business_token}"}
    response = requests.get(f"{BASE_URL}/business/services", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Update Service ====================
def test_update_service():
    print_test("Update Service")
    headers = {"Authorization": f"Bearer {business_token}"}
    update_data = {
        "price": 50.00,
        "description": "Premium haircut with styling and consultation"
    }
    response = requests.put(f"{BASE_URL}/business/services/{service_id}", json=update_data, headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Get Public Business Services ====================
def test_get_public_business_services():
    print_test("Get Business Services (Public)")
    response = requests.get(f"{BASE_URL}/businesses/{business_id}/services")
    print_response(response)
    assert response.status_code == 200

# ==================== Test Search Businesses ====================
def test_search_businesses():
    print_test("Search Businesses")
    response = requests.get(f"{BASE_URL}/businesses?specialty=Hair")
    print_response(response)
    assert response.status_code == 200

# ==================== Test Get Business Detail ====================
def test_get_business_detail():
    print_test("Get Business Detail")
    response = requests.get(f"{BASE_URL}/businesses/{business_id}")
    print_response(response)
    assert response.status_code == 200

# ==================== Test Get Business Available Slots (Public) ====================
def test_get_business_available_slots():
    print_test("Get Business Available Slots (Public)")
    response = requests.get(f"{BASE_URL}/businesses/{business_id}/timeslots")
    print_response(response)
    assert response.status_code == 200

# ==================== Test Create Appointment ====================
def test_create_appointment():
    global appointment_id
    print_test("Create Appointment")
    headers = {"Authorization": f"Bearer {customer_token}"}
    tomorrow = (datetime.now() + timedelta(days=1)).date()
    appointment_data = {
        "business_id": business_id,
        "appointment_date": str(tomorrow),
        "appointment_time": "10:00:00",
        "duration_minutes": 60
    }
    response = requests.post(f"{BASE_URL}/customer/appointments", json=appointment_data, headers=headers)
    print_response(response)
    assert response.status_code == 200
    appointment_id = response.json()["id"]
    print(f"✓ Appointment created with ID: {appointment_id}")
    print(f"✓ Unique Appointment ID: {response.json()['appointment_id']}")

# ==================== Test Get Customer Appointments ====================
def test_get_customer_appointments():
    print_test("Get Customer Appointments")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{BASE_URL}/customer/appointments", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Get Business Appointments ====================
def test_get_business_appointments():
    print_test("Get Business Appointments")
    headers = {"Authorization": f"Bearer {business_token}"}
    response = requests.get(f"{BASE_URL}/business/appointments", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Get Business Appointments by Status ====================
def test_get_business_appointments_by_status():
    print_test("Get Business Appointments (Pending Only)")
    headers = {"Authorization": f"Bearer {business_token}"}
    response = requests.get(f"{BASE_URL}/business/appointments?status=pending", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Send Message ====================
def test_send_message_customer():
    print_test("Send Message (Customer)")
    headers = {"Authorization": f"Bearer {customer_token}"}
    message_data = {
        "message": "Hi, I have a question about my appointment."
    }
    response = requests.post(f"{BASE_URL}/appointments/{appointment_id}/messages", json=message_data, headers=headers)
    print_response(response)
    assert response.status_code == 200

def test_send_message_business():
    print_test("Send Message (Business)")
    headers = {"Authorization": f"Bearer {business_token}"}
    message_data = {
        "message": "Hello! How can I help you?"
    }
    response = requests.post(f"{BASE_URL}/appointments/{appointment_id}/messages", json=message_data, headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Get Messages ====================
def test_get_messages():
    print_test("Get Appointment Messages")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{BASE_URL}/appointments/{appointment_id}/messages", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Update Appointment Status ====================
def test_update_appointment_status():
    print_test("Update Appointment Status (Confirm)")
    headers = {"Authorization": f"Bearer {business_token}"}
    status_data = {
        "status": "confirmed",
        "business_note": "Looking forward to seeing you!"
    }
    response = requests.put(f"{BASE_URL}/business/appointments/{appointment_id}/status", json=status_data, headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Reschedule Appointment ====================
def test_reschedule_appointment():
    print_test("Reschedule Appointment")
    headers = {"Authorization": f"Bearer {customer_token}"}
    tomorrow = (datetime.now() + timedelta(days=2)).date()
    reschedule_data = {
        "appointment_date": str(tomorrow),
        "appointment_time": "14:00:00"
    }
    response = requests.put(f"{BASE_URL}/customer/appointments/{appointment_id}/reschedule", json=reschedule_data, headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Mark as Completed ====================
def test_mark_completed():
    print_test("Mark Appointment as Completed")
    headers = {"Authorization": f"Bearer {business_token}"}
    status_data = {
        "status": "completed",
        "business_note": "Service completed successfully!"
    }
    response = requests.put(f"{BASE_URL}/business/appointments/{appointment_id}/status", json=status_data, headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Cancel Appointment ====================
def test_cancel_appointment():
    print_test("Cancel Appointment")
    # Create a new appointment first
    headers = {"Authorization": f"Bearer {customer_token}"}
    tomorrow = (datetime.now() + timedelta(days=3)).date()
    appointment_data = {
        "business_id": business_id,
        "appointment_date": str(tomorrow),
        "appointment_time": "11:00:00",
        "duration_minutes": 30
    }
    response = requests.post(f"{BASE_URL}/customer/appointments", json=appointment_data, headers=headers)
    new_appointment_id = response.json()["id"]
    
    # Now cancel it
    response = requests.delete(f"{BASE_URL}/customer/appointments/{new_appointment_id}", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Delete Time Slot ====================
def test_delete_timeslot():
    print_test("Delete Time Slot")
    headers = {"Authorization": f"Bearer {business_token}"}
    response = requests.delete(f"{BASE_URL}/business/timeslots/{timeslot_id}", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Delete Service ====================
def test_delete_service():
    print_test("Delete Service")
    headers = {"Authorization": f"Bearer {business_token}"}
    response = requests.delete(f"{BASE_URL}/business/services/{service_id}", headers=headers)
    print_response(response)
    assert response.status_code == 200

# ==================== Test Unauthorized Access ====================
def test_unauthorized_access():
    print_test("Test Unauthorized Access")
    response = requests.get(f"{BASE_URL}/customer/me")
    print_response(response)
    assert response.status_code == 401
    print("✓ Correctly blocked unauthorized access")

# ==================== Run All Tests ====================
def run_all_tests():
    print("\n" + "="*60)
    print("STARTING API ENDPOINT TESTS")
    print("="*60)
    
    try:
        # Basic tests
        test_root()
        
        # Customer tests
        test_customer_register()
        test_customer_login()
        test_customer_profile()
        
        # Business tests
        test_business_register()
        test_business_login()
        test_business_profile()
        test_update_business_profile()
        
        # Time slot tests
        test_create_timeslot()
        test_get_timeslots()
        
        # Service tests
        test_create_service()
        test_get_business_services()
        test_update_service()
        test_get_public_business_services()
        
        # Public business search
        test_search_businesses()
        test_get_business_detail()
        test_get_business_available_slots()
        
        # Appointment tests
        test_create_appointment()
        test_get_customer_appointments()
        test_get_business_appointments()
        test_get_business_appointments_by_status()
        
        # Messaging tests
        test_send_message_customer()
        test_send_message_business()
        test_get_messages()
        
        # Appointment management
        test_update_appointment_status()
        test_reschedule_appointment()
        test_mark_completed()
        test_cancel_appointment()
        
        # Cleanup
        test_delete_timeslot()
        test_delete_service()
        
        # Security test
        test_unauthorized_access()
        
        print("\n" + "="*60)
        print("✓ ALL TESTS PASSED!")
        print("="*60)
        
    except AssertionError as e:
        print(f"\n✗ TEST FAILED: {e}")
    except Exception as e:
        print(f"\n✗ ERROR: {e}")

if __name__ == "__main__":
    run_all_tests()
