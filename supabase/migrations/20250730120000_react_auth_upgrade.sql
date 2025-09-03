/*
  # [Upgrade] React & Supabase Auth Integration
  This migration prepares the database for a full-featured authentication system using Supabase Auth, replacing the previous simple password check.

  ## Query Description:
  This script transitions the project from an insecure, custom password verification system to Supabase's robust, built-in authentication. It involves removing the old system and setting up a standard `profiles` table linked to `auth.users`. This change is critical for security and scalability. No user data will be lost as the old system did not store user information.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: false

  ## Structure Details:
  - **Removes:** RPC function `verify_admin_password`.
  - **Removes:** `admin_password` and `admin_user` from `site_content` table.
  - **Creates:** `profiles` table to store public user data.
  - **Links:** `profiles.id` to `auth.users.id` via a foreign key.
  - **Enables:** Row Level Security (RLS) on the `profiles` table.
  - **Adds:** RLS policies to `profiles` to control access.

  ## Security Implications:
  - RLS Status: Enabled on `profiles`.
  - Policy Changes: Yes, new policies for `profiles` are added.
  - Auth Requirements: Shifts authentication from a custom RPC to Supabase's built-in Auth.

  ## Performance Impact:
  - Indexes: Adds a primary key index on `profiles`.
  - Triggers: None.
  - Estimated Impact: Low. Improves security significantly with minimal performance overhead.
*/

-- Step 1: Create the profiles table to store public user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Stores public profile information for each user.';

-- Step 2: Enable Row Level Security for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for the profiles table
-- Policy 1: Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 4: Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 5: Clean up the old, insecure authentication system
-- Remove the RPC function
DROP FUNCTION IF EXISTS public.verify_admin_password(text);

-- Remove the old password from the site_content table
DELETE FROM public.site_content WHERE content_key = 'admin_password';
DELETE FROM public.site_content WHERE content_key = 'admin_user';

-- Grant usage to authenticated and anon roles for the profiles table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO anon;
