
-- Add company information to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create a companies table for better organization
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_number TEXT,
  tax_id TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update clients table to link to companies
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- Create calendar events table for tax obligations
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  event_type TEXT DEFAULT 'tax_obligation',
  obligation_id UUID REFERENCES public.tax_obligations(id),
  client_id UUID REFERENCES public.clients(id),
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update user_roles to give admin rights to first signup
ALTER TABLE public.user_roles ALTER COLUMN permissions SET DEFAULT ARRAY['all'];

-- Enable RLS on new tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Users can view companies they created or are assigned to" ON public.companies
  FOR SELECT USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND ('all' = ANY(permissions) OR 'company_view' = ANY(permissions)))
  );

CREATE POLICY "Users can create companies" ON public.companies
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update companies they created" ON public.companies
  FOR UPDATE USING (created_by = auth.uid());

-- Create RLS policies for calendar events
CREATE POLICY "Users can view calendar events" ON public.calendar_events
  FOR SELECT USING (
    created_by = auth.uid() OR 
    EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND ('all' = ANY(permissions) OR 'calendar_view' = ANY(permissions)))
  );

CREATE POLICY "Users can create calendar events" ON public.calendar_events
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their calendar events" ON public.calendar_events
  FOR UPDATE USING (created_by = auth.uid());

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Enable realtime for calendar events
ALTER TABLE public.calendar_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;

-- Create function to handle new user signup with company
CREATE OR REPLACE FUNCTION public.handle_new_user_with_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id UUID;
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, username, company_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'username',
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

-- Update the trigger to use new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_company();
