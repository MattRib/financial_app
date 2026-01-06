-- Script to remove all existing users and their data from Supabase
-- WARNING: This will permanently delete all users and their associated data
-- Run this script with caution!

-- Step 1: Delete all user-related data (in order to respect foreign key constraints)
DELETE FROM debts;
DELETE FROM goals;
DELETE FROM investments;
DELETE FROM budgets;
DELETE FROM transactions;
DELETE FROM categories;
DELETE FROM profiles;

-- Step 2: Delete all users from Supabase Auth
-- Note: This requires admin privileges and should be run via Supabase Dashboard or API
-- The auth.users table is managed by Supabase and requires service role key

-- If you have access to the auth schema (using service role):
-- DELETE FROM auth.users;

-- Alternative: You can also delete users via Supabase Dashboard:
-- 1. Go to https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to Authentication > Users
-- 4. Delete each user manually or use the SQL Editor with service role

SELECT 'All user data has been deleted from application tables' AS status;
SELECT 'Please delete users from auth.users via Supabase Dashboard or with service role privileges' AS next_step;
