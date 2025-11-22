-- Migration 0006 Part 8: Insert service types
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
SELECT '유초등부 예배', 1, id FROM departments WHERE name = '유초등부' LIMIT 1;
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
SELECT '젊은이 예배', 2, id FROM departments WHERE name = '젊은이부' LIMIT 1;
INSERT OR IGNORE INTO service_types (name, display_order, department_id) 
VALUES ('통합예배', 3, NULL);

