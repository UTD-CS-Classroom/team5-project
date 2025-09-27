## 1. Project Overview
* Our idea is a general appointment app that we will call "AppointmentsOnTheGo" with the intention of helping any person to have an easy way to contact small or big businesses around them. We will have some locations already in the app for convenience. There will also be a calendar side feature to give notifications when the appointment they made is close.  
* There will be some extra adjustments over time that will be added to make sure the app is easy to navigate and understand. The main core will be in providing a fast and easy interface for people. In order to see if they find what they are looking for or find something they did not know needed.
* This idea will be a hybrid, because the first initial parts will be plan-driven for the core elements of the application. And then agile so we can add features according to any upcoming new ideas that will make the application more pleasant to use.

## 2. Stakeholders 
- `Business owners:` They will be able to advertise their business and see how well it is doing. 
- `Customers:` Have a centralized way to set up appointments with businesses in a convenient manner. 
- `Employees of the businesses:` Have an anticipated way to get ready for customers. 
- `Business managers:` Set a schedule and track the shop performance. 

## 3. Requirements Elicitation 
- We will gather up the necessary requirements by brainstorming within the group on the a set of questions. 
- A list of questions we will ask is: 
1. What makes it hard to set up appointments? 
2. Why are some businesses disorganized? 
3. How can an app improve upon existing methods? 
4. Are businesses usually what they advertise? 
- What features can be added to make the whole app worth it for new customers? 
- We will first bear in mind security if the customer decides to use his address, interface for easy accessibility, and efficient communication for organizing the requirements.

## 4. Requirements Specification
### Functional requirements:
  * The system shall let users search businesses by location, specialty, and next available time. 
  * The system shall let users set a budget range that is applied during the booking step without showing exact prices before booking. 
  * The system shall show a profile for each employer with specialties, experience, and a small portfolio. 
  * The system shall show a calendar for each appointment with open time slots. 
  * The system shall let a user book a slot by entering name, email, and phone number. 
  * The system shall create a unique appointment id for every booking. 
  * The system shall send booking confirmation and date reminders by email and text. 
  * The system shall provide a message thread tied to the appointment so the customer and business can talk before the service. 
  * The system shall let the customer upload up to three photos for the appointment with a total size limit of twenty-five megabytes. 
  * The system shall allow businesses to approve or decline a pending booking and add a short note if needed. 
  * The system shall let the customer reschedule or cancel an appointment. 
  * The system shall let businesses set their own availability and blackout dates. 
  * The system shall let businesses mark an appointment as confirmed, completed, or no show.

### Non-functional requirements
  * Performance
    The system shall complete 50% of page loads and actions within two seconds for at least ninety five percent of requests and within four seconds for at least ninety nine percent of requests.
    Connects to requirements 1, 3, 4, 5, 7, 9, 10, 11, 13,  

  * Security and privacy 
    The system shall protect all personal data and images by using secure connections in the browser and encryption when stored. 
 Connects to requirements 5, 6, 7, 8, 9, 11, 12. 

  * Availability 
    The system shall provide at least 99.5% uptime for booking and calendar features during posted shop hours. 
 Connects to requirements 1, 3, 4, 5, 7, 10, 13 

  * Accessibility 
    The system shall follow the Web Content Accessibility Guidelines version two point one at level double A. It shall make forms, color contrast, labels, and keyboard only navigation usable for people with disabilities. This supports requirements 1, 3, 4, 5, and 11. 

  * Upload limits
    The system shall enforce a total upload limit of 25mb/appointment and shall reject files that exceed this limit with a clear message. 
 Connects to requirements 8, 9. 

## Requirements in two formats 
### 3a. Text based in natural language 
* Calendar with bookable slots 
  We will show a simple calendar for each business that clearly lists open times you can pick. This matters because people want to see what is actually free before they enter details. We will test it by opening the page and making sure the calendar loads, shows the right free times, and blocks double bookings when two people try the same slot. 

* Message thread before the visit 
  For every appointment there will be a message thread so the customer and the business can talk first. This helps both sides agree on the style and any special needs. We will test it by creating an appointment and checking that both the customer and the business can send and read messages, and that the messages stay with that appointment. 

* Reference photos 
  Customers can upload up to three photos with a total size of 25mb for a booking. This lets the business see what the customer wants without making the site slow. We will test by trying files inside the limit and above the limit and checking that the system accepts the first group and shows a clear message for the second group. 

* Fast enough to feel smooth 
  Most pages and actions should finish within two seconds for almost all requests, and no slower than four seconds for nearly all others. This keeps people from dropping off during booking. We will test this with a basic load test that simulates real traffic and records how long each page and action takes. 

* Protect personal data and images 
  All personal data and images will be protected in two ways. Traffic in the browser uses secure transport, and stored data uses encryption. This keeps customer and shop information safe. We will test by checking the site uses secure connections everywhere and by reviewing how the database and file storage are set up for encryption. 

### 3b. UML diagram
<img width="1177" height="1567" alt="image" style="border-radius: 10px;" src="https://github.com/user-attachments/assets/b12abdf5-296e-4860-8c3e-ad83558e64e4" />

## 5. Requirement Validation 
1. Verifiability – can you test it?  
  * Functional requirements are testable with direct actions. 
    - For search, we can test by searching for location, specialty, and next available time, and confirm the results match. 
    - For budget range, we can test by setting different ranges and confirm results respect the range without showing exact prices. 
    - For profiles, we can test by opening a business profile and confirm specialties, experience, and portfolio are displayed. 
    - For calendar slots, we can test by booking overlapping times to ensure double booking is blocked. 
    - For booking a slot, we can test by entering valid details for success and invalid details for proper error messages. 
    - For appointment IDs, we can test by creating multiple bookings and confirming each gets a unique ID. 
    - For confirmations and reminders, we can test by booking and checking that email and text confirmations and reminders are received. 
    - For message threads, we can test by sending messages from both customer and business and confirm they stay tied to the appointment.
    - For uploads, we can test by uploading within the 25MB/limit and confirm acceptance, and above the limit for rejection.
    - For approval/decline, we can test by having the businesses approve or decline a booking with a note and confirm the customer sees it.
    - For rescheduling or canceling, we can test by moving an appointment to another slot or canceling and confirming the update.
    - For business availability, we can test by setting available hours and blackout dates and confirm they show correctly in the calendar.
    - For marking status, we can test by letting the businesses mark an appointment as confirmed, completed, or no show and confirm it updates. 

  * Non-functional requirements are measurable. 
    - Performance can be tested with load simulations to confirm page actions stay within 2–4 seconds.
    - Security can be tested by checking all pages using HTTPS and stored data is encrypted.
    - Availability can be validated through uptime monitoring during shop hours.
    - For accessibility, we can test by running an accessibility audit to confirm forms, labels, color contrast, and keyboard-only navigation meet WCAG 2.1 AA standards.
    - For uploads, we can test by sending files under and over the 25MB limit to see if the system enforces rules correctly. 

2. Comprehensibility – is it clear?  
* Requirements are written in simple, natural language so all stakeholders (developers, businesses, customers, managers) can understand them. 
* Example: “The system shall let users search businesses by location, specialty, and next available time” is unambiguous and easy to grasp. 
* Even technical requirements like upload size limits are described in plain words and supported with testing criteria (“clear message when files exceed limit”). 

3. Traceability – do you know where it came from?  
* Each requirement can be traced back to a stakeholder need: 
* Customers → search businesses, upload photos, reschedule or cancel. 
* Business owners → advertise their business, track performance. 
* Employees → anticipate appointments via calendar. 
* Managers → set availability, manage performance. 

4. Non-functional requirements are linked to functional ones (as noted in your document).  
* Performance connects to requirements like calendar (4), booking (5), messaging (8). 
* Security and privacy connect to handling of personal data and uploaded files (5, 6, 7, 8, 9, 11, 12). 

5. Adaptability – can it be changed later? 
* The hybrid approach (plan-driven for core + agile for features) ensures adaptability. 
* These requirements are written generally enough that the same structure could support all appointment-based businesses in the future (e.g., salons, dentists, mechanics). 
