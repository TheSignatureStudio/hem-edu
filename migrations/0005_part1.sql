-- Migration 0005 Part 1: Backup attendance table
CREATE TABLE IF NOT EXISTS attendance_backup AS SELECT * FROM attendance;

