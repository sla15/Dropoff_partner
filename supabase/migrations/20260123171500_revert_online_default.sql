-- Revert default value of is_online to false
ALTER TABLE drivers ALTER COLUMN is_online SET DEFAULT false;
