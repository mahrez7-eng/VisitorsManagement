CREATE DATABASE IF NOT EXISTS visitors_db;
USE visitors_db;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','receptionist') NOT NULL DEFAULT 'receptionist',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS experts (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  department VARCHAR(255) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS visitors (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255) DEFAULT NULL,
  idType VARCHAR(100) DEFAULT NULL,
  idNumber VARCHAR(255) DEFAULT NULL,
  expertId INT UNSIGNED DEFAULT NULL,
  personToVisit VARCHAR(255) DEFAULT NULL,
  purpose VARCHAR(255) NOT NULL,
  recordedBy VARCHAR(255) DEFAULT NULL,
  checkInDate DATETIME NOT NULL,
  checkOutDate DATETIME DEFAULT NULL
);

INSERT INTO users (id, fullname, username, password, role, created_at)
VALUES
  ('u-1', 'Admin', 'admin', 'admin', 'admin', NOW()),
  ('u-2', 'Receptionist', 'receptionist', 'receptionist', 'receptionist', NOW())
  ON DUPLICATE KEY UPDATE fullname = VALUES(fullname), password = VALUES(password), role = VALUES(role);