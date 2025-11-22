-- 부모님 연락처 필드 추가
ALTER TABLE members ADD COLUMN parent_phone TEXT;
ALTER TABLE members ADD COLUMN parent_name TEXT;

