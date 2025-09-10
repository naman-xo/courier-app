-- Create database
CREATE DATABASE courierdb;

\c courierdb;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin','courier_admin','customer','employee')),
    courier_owner VARCHAR(100),
    login_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create shipments table
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    local_awb VARCHAR(50) UNIQUE NOT NULL,
    partner_awb VARCHAR(50),
    courier_name VARCHAR(100),
    pickup_pincode VARCHAR(10),
    delivery_pincode VARCHAR(10),
    weight NUMERIC(10,2),
    price NUMERIC(10,2),
    status VARCHAR(30) DEFAULT 'pending',
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100),
    sender_address TEXT,
    sender_phone VARCHAR(20),
    receiver_name VARCHAR(100),
    receiver_address TEXT,
    receiver_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert a default super admin
INSERT INTO users (name, email, phone, password, role)
VALUES (
    'Super Admin',
    'admin@example.com',
    '9999999999',
    '$2b$10$CwTycUXWue0Thq9StjUM0uJ8e6Mq8a0eQnB8r/8wWjOgrnJ7tHtQy', -- bcrypt hash for "admin123"
    'admin'
);
