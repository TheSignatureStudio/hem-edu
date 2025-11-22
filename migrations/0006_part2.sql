-- Migration 0006 Part 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department_id);
CREATE INDEX IF NOT EXISTS idx_members_department ON members(department_id);
CREATE INDEX IF NOT EXISTS idx_service_types_department ON service_types(department_id);

