
-- Phase 1: Critical RLS Policy Fixes
-- Remove overpermissive policies and fix conflicts

-- Drop conflicting policies on clients table
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Authenticated users can insert clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update their created clients" ON public.clients;
DROP POLICY IF EXISTS "Users can delete their created clients" ON public.clients;

-- Drop conflicting policies on tax_obligations table
DROP POLICY IF EXISTS "Users can view all tax obligations" ON public.tax_obligations;
DROP POLICY IF EXISTS "Authenticated users can insert tax obligations" ON public.tax_obligations;
DROP POLICY IF EXISTS "Users can update their created tax obligations" ON public.tax_obligations;
DROP POLICY IF EXISTS "Users can delete their created tax obligations" ON public.tax_obligations;

-- Keep only the restrictive permission-based policies for clients
-- The "Users can manage clients with permission" policy already handles all operations securely
-- Add a specific view policy for better granularity
CREATE POLICY "Users can view clients with permission" ON public.clients
  FOR SELECT USING (
    has_permission(auth.uid(), 'client_management') OR
    has_permission(auth.uid(), 'view_only') OR
    is_admin(auth.uid()) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

-- Keep only the restrictive permission-based policies for tax_obligations
-- The "Users can manage obligations with permission" policy already handles all operations securely
-- Add a specific view policy for better granularity
CREATE POLICY "Users can view obligations with permission" ON public.tax_obligations
  FOR SELECT USING (
    has_permission(auth.uid(), 'tax_management') OR
    has_permission(auth.uid(), 'view_only') OR
    is_admin(auth.uid()) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

-- Add rate limiting function for authentication attempts
CREATE OR REPLACE FUNCTION public.check_rate_limit(user_identifier TEXT, max_attempts INTEGER DEFAULT 5, window_minutes INTEGER DEFAULT 15)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Clean up old attempts outside the window
  DELETE FROM public.audit_logs 
  WHERE action = 'rate_limit_attempt' 
    AND new_values->>'identifier' = user_identifier
    AND created_at < NOW() - INTERVAL '1 minute' * window_minutes;

  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_logs
  WHERE action = 'rate_limit_attempt'
    AND new_values->>'identifier' = user_identifier
    AND created_at >= NOW() - INTERVAL '1 minute' * window_minutes;

  -- Log this attempt
  INSERT INTO public.audit_logs (action, table_name, new_values)
  VALUES ('rate_limit_attempt', 'auth_attempts', 
    jsonb_build_object('identifier', user_identifier, 'timestamp', NOW()));

  -- Return whether limit is exceeded
  RETURN attempt_count < max_attempts;
END;
$$;

-- Add function to validate email format
CREATE OR REPLACE FUNCTION public.validate_email(email_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN email_input ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Add function to sanitize user input
CREATE OR REPLACE FUNCTION public.sanitize_input(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove potential script tags and dangerous characters
  RETURN regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '<[^>]*>', '', 'g'),
      '[<>"\''&]', '', 'g'
    ),
    '\s+', ' ', 'g'
  );
END;
$$;

-- Add validation constraints for clients table
ALTER TABLE public.clients 
ADD CONSTRAINT clients_email_valid 
CHECK (email IS NULL OR validate_email(email));

-- Add validation trigger for input sanitization on clients
CREATE OR REPLACE FUNCTION public.sanitize_client_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.name = sanitize_input(NEW.name);
  NEW.address = sanitize_input(NEW.address);
  
  IF NEW.email IS NOT NULL THEN
    NEW.email = lower(trim(NEW.email));
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sanitize_client_data_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION sanitize_client_data();

-- Add validation trigger for input sanitization on tax_obligations  
CREATE OR REPLACE FUNCTION public.sanitize_obligation_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.title = sanitize_input(NEW.title);
  NEW.description = sanitize_input(NEW.description);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER sanitize_obligation_data_trigger
  BEFORE INSERT OR UPDATE ON public.tax_obligations
  FOR EACH ROW EXECUTE FUNCTION sanitize_obligation_data();
