-- Migration 0006 Part 4: Create trainings indexes
CREATE INDEX IF NOT EXISTS idx_trainings_department ON trainings(department_id);
CREATE INDEX IF NOT EXISTS idx_trainings_dates ON trainings(start_date, end_date);

