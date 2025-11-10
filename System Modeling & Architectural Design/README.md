## 1. Process Model (Activity Diagram) 
<img width="624" height="353" alt="Picture1" src="https://github.com/user-attachments/assets/9bf98576-c057-4877-ac8e-ced55d0d1c5c](https://github.com/UTD-CS-Classroom/team5-project/tree/main/Project)" />


This workflow shows the core journey in our app from search to booking to completion. It includes the main roles which are the customer, the business, the system, and the two subsystems that handle calendars and notifications. It also highlights the key decision where a business approves or rejects a booking and it shows the parallel work where messages and notifications happen at the same time. 

We structured it around the functional requirements like search, booking with a unique id, reminders, messaging, upload limits, approval, rescheduling, and status updates. Modeling it this way makes the object flow clear because a request becomes a pending booking and then becomes confirmed or declined. 

## 2. Behavioral Model
Choose one of the following to illustrate dynamic behavior in your system:
<img width="624" height="585" alt="Picture3" src="https://github.com/user-attachments/assets/31b09df3-ec6e-4dcc-ba1d-4241a7b8c48d" />

We assumed a thin client that talks to a backend which orchestrates the calendar and notification subsystems. The business interacts through a portal that receives pending requests and returns an approval or a decline. We added two alternative paths which are a decline and an upload limit error because they are realistic outcomes for this app. This model stresses the unique id creation, the blocking of the time slot, and the delivery of confirmations and reminders. These choices come straight from our functional and non functional requirements.

## 3. Structural Model (Class Diagram)
<img width="624" height="594" alt="Picture4" src="https://github.com/user-attachments/assets/32294761-3828-4d45-b289-21e91314ad76" />

We separated people from bookings by using User as a general class and then Customer and BusinessUser as children. Appointment holds the lifecycle methods because status changes belong there. We used composition for the message thread and photos since they live and die with an appointment and We used aggregation for availability since a business owns its schedule. These choices reflect search, booking, unique ids, uploads, approval or decline, calendar control, and messaging from our requirements.

## 4. Architectural Design Decisions
### Requirements chosen
- The system shall protect all personal data and images by using secure connections in the browser and encryption when stored.
- Design Decision: Implement end-to-end encryption by enforcing HTTPS by using TLS certificates for all moving data. Also 
- The system shall enforce a total upload limit of 25mb/appointment and shall reject files that exceed this limit with a clear message.

## 5. High-Level Architecture (4+1 Views)

### Logical View

<img width="521" height="181" alt="Logical" src="https://github.com/user-attachments/assets/6bb57c43-023e-4560-996d-8c283258cea5" />

- The system has three main parts: the Customer App, the Business Portal, and the Backend Server.
- The Backend handles all requests, connects to the database, and manages bookings, messages, and files.
- This view shows how the main components are linked and share information.

### Process View

<img width="521" height="341" alt="Process" src="https://github.com/user-attachments/assets/7a5fac84-d86e-4efe-86a0-c57f50682856" />

- This process shows how booking moves through the system at runtime. 
- The customer sends a booking request to the backend, which checks availability and forwards it to the business. 
- The business approves or declines the request, and the backend sends a notification back to the customer. 

## 6. Use of Architectural Patterns
Client-server is the best for my system because I will be having users of the appointment app. All the appointments that are made will be put into the server so they are processed for other functions such as setting them into calendars, set up notifications, and inform the businesses of any appointments they will have.

Repository is good fit for the system as the information for users has to stay somewhere. A repository will be good to keep user data and business data and will be helpful so user devices don’t have to keep so much information about their appointments, they can just make an online account to keep their desired information save in repository. 

### Client-server
`Strength:` Easy processing for appointments sent so they can be processed remotely so user devices don’t need much processing power, and this will allow for stronger processing power for future features regardless of user device used.

`Limitation:` Multiple servers will eventually be used to keep the application going whenever a server goes down. This will cost a lot of money whenever the application gets upscaled or just to make sure the application stays up even after the only working server fails.

### Repository
`Strength:` a centralized database to keep track of all data from users and appointments so everything is easy to find.

`Limitation:` This centralized database will make for security risks if there is an attack on the repository server. This will be a flaw even if there is a lot of security protocols used.
