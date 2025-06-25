
-- Fix the username constraint issue by dropping the constraint first, then creating a partial index
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Create a unique partial index instead to allow multiple NULL values
CREATE UNIQUE INDEX profiles_username_unique_idx ON public.profiles (username) WHERE username IS NOT NULL;

-- Fix foreign key cascade issues for proper user deletion
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_created_by_fkey;
ALTER TABLE public.companies ADD CONSTRAINT companies_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also fix other potential cascade issues
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_created_by_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_assigned_to_fkey;
ALTER TABLE public.clients ADD CONSTRAINT clients_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tax_obligations DROP CONSTRAINT IF EXISTS tax_obligations_created_by_fkey;
ALTER TABLE public.tax_obligations ADD CONSTRAINT tax_obligations_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tax_obligations DROP CONSTRAINT IF EXISTS tax_obligations_assigned_to_fkey;
ALTER TABLE public.tax_obligations ADD CONSTRAINT tax_obligations_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Update the user creation function to handle username conflicts better
CREATE OR REPLACE FUNCTION public.handle_new_user_with_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id UUID;
  safe_username TEXT;
BEGIN
  -- Generate a safe username by appending timestamp if needed
  safe_username := NEW.raw_user_meta_data->>'username';
  
  -- If username already exists, make it unique
  IF safe_username IS NOT NULL AND EXISTS(SELECT 1 FROM public.profiles WHERE username = safe_username) THEN
    safe_username := safe_username || '_' || EXTRACT(EPOCH FROM NOW())::text;
  END IF;
  
  -- Insert into profiles with safe username
  INSERT INTO public.profiles (id, email, full_name, username, company_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    safe_username,
    NEW.raw_user_meta_data->>'company_name'
  );
  
  -- Create company if company_name is provided
  IF NEW.raw_user_meta_data->>'company_name' IS NOT NULL THEN
    INSERT INTO public.companies (name, created_by)
    VALUES (NEW.raw_user_meta_data->>'company_name', NEW.id)
    RETURNING id INTO company_id;
  END IF;
  
  -- Insert user role with admin permissions for new signups
  INSERT INTO public.user_roles (user_id, role, department, permissions)
  VALUES (
    NEW.id, 
    'admin', 
    'management', 
    ARRAY['all']
  );
  
  RETURN NEW;
END;
$$;
