COURIER BOOKING AND TRACKING APP
================================

This is a courier booking and tracking application with four roles:
1. Admin – manages all shipments
2. Courier Admin – manages shipments belonging to their courier branch
3. Customer – books and tracks shipments
4. Employee (Delivery Boy) – accepts and delivers shipments

--------------------------------
FEATURES
--------------------------------
- User authentication (Admin, Courier Admin, Customer, Employee) with JWT
- Shipment booking with auto-generated AWB numbers
- Shipment tracking by AWB
- Dynamic courier pricing based on weight and pincode
- PDF invoice generation
- Google Maps integration for pickup address selection
- Role-based dashboards
- Employee panel for accepting deliveries
- Courier-admin restricted views

--------------------------------
TECH STACK
--------------------------------
Frontend: React + TailwindCSS
Backend: Node.js + Express.js
Database: PostgreSQL
Authentication: JWT
API Testing: Postman

--------------------------------
GETTING STARTED
--------------------------------

1. Clone the Repository
   git clone https://github.com/your-username/courier-app.git
   cd courier-app

2. Setup Backend
   cd server
   npm install

   Create a .env file inside /server with:
     DATABASE_URL=postgresql://yourusername:yourpassword@localhost:5432/courierdb
     JWT_SECRET=your_jwt_secret

   Start the backend:
     npm start

3. Setup Frontend
   cd client
   npm install
   npm start

--------------------------------
DATABASE SETUP
--------------------------------
1. Open pgAdmin and create a database named "courierdb".
2. Create the required tables:
   - users (stores admin, courier admins, customers, employees)
   - shipments (stores shipment details)
3. Ensure "users" has a "role" column with values:
   - admin
   - courier_admin
   - customer
   - employee

--------------------------------
USAGE
--------------------------------
- Customers: sign up, book shipments, track shipments.
- Admins: view all shipments, manage system.
- Courier Admins: view shipments for their courier only.
- Employees: view available shipments, accept deliveries, update statuses.

--------------------------------
CONTRIBUTING
--------------------------------
1. Fork the repo
2. Create a new branch
   git checkout -b feature-name
3. Commit your changes
   git commit -m "Add feature"
4. Push to your branch
   git push origin feature-name
5. Create a Pull Request
