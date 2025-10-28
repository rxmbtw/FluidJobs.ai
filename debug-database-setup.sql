-- Database Setup and Verification Script
-- Run this in PostgreSQL to ensure proper setup

-- Create database (run as superuser)
-- CREATE DATABASE fluidjobs_db;

-- Connect to fluidjobs_db and run the following:

-- Check if candidates table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'candidates'
);

-- Create candidates table if it doesn't exist
CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    candidate_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    work_status VARCHAR(50),
    current_company VARCHAR(255),
    notice_period VARCHAR(50),
    current_ctc VARCHAR(50),
    last_company VARCHAR(255),
    previous_ctc VARCHAR(50),
    city VARCHAR(100),
    work_mode VARCHAR(50),
    profile_image_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify table structure
\d candidates;

-- Test connection with a simple query
SELECT COUNT(*) as total_candidates FROM candidates;