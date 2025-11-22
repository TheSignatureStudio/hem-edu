-- Migration 0006 Part 1: Add columns to existing tables
ALTER TABLE users ADD COLUMN department_id INTEGER;
ALTER TABLE users ADD COLUMN is_super_admin INTEGER DEFAULT 0;
ALTER TABLE classes ADD COLUMN department_id INTEGER;
ALTER TABLE members ADD COLUMN department_id INTEGER;
ALTER TABLE service_types ADD COLUMN department_id INTEGER;
ALTER TABLE members ADD COLUMN parent_name TEXT;
ALTER TABLE members ADD COLUMN parent_phone TEXT;

