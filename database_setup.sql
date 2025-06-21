CREATE DATABASE IF NOT EXISTS VegePlexDB;
USE VegePlexDB;

CREATE TABLE IF NOT EXISTS users (
    userid VARCHAR(255) PRIMARY KEY,  -- This will store the email as userid
    password VARCHAR(255) NOT NULL,   -- Will store hashed password
    fullname VARCHAR(255) NOT NULL,   -- User's full name
    phone VARCHAR(15) NOT NULL,       -- User's phone number
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
