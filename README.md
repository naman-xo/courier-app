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
   git clone https://github.com/naman-xo/courier-app.git
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
DATABASE SETUP GUIDE
--------------------------------

STEP 1: CREATE DATABASE USING SQL FILE

1. Save the provided file "setup.sql" to your system.

2. Run the file to automatically create the database, tables, and default admin user.

   Using psql:
   psql -U your_username -d postgres -f setup.sql

   (Replace "your_username" with your PostgreSQL username.)

3. This will create a database called "courierdb" with the required tables.


STEP 2: STRUCTURE OF TABLES


1. USERS TABLE
   - Stores admin, courier admins, customers, and employees.
   - Important columns:
       id (Primary key)
       name
       email
       phone
       password (hashed)
       role (admin / courier_admin / customer / employee)
       courier_owner (branch name for courier admins)
       login_id (auto-generated unique ID for courier admins)

2. SHIPMENTS TABLE
   - Stores shipment details.
   - Important columns:
       id (Primary key)
       local_awb (internal shipment number)
       partner_awb (external partner number)
       courier_name
       pickup_pincode / delivery_pincode
       weight
       price
       status (pending, accepted, out_for_delivery, delivered)
       user_id (who created shipment)
       assigned_to (employee handling it)
       sender & receiver details
       created_at (timestamp)


STEP 3: DEFAULT ADMIN LOGIN

After setup, one admin account is created automatically:

Email: admin@example.com
Password: admin123

(Password is stored securely using bcrypt hashing.)


STEP 4: HOW TO RESET / RECREATE

- If you want to reset everything:
  1. Drop the database:
     DROP DATABASE courierdb;
  2. Re-run setup.sql:
     psql -U your_username -d postgres -f setup.sql


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
