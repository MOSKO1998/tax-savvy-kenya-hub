
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'tax_staff', 'readonly', 'it');

-- Create enum for departments
CREATE TYPE public.department_type AS ENUM ('management', 'tax', 'audit', 'it', 'finance', 'legal');

-- Create enum for user status
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');

-- Create enum for tax obligation status
CREATE TYPE public.obligation_status AS ENUM ('pending', 'completed', 'overdue', 'cancelled');

-- Create enum for tax obligation types
CREATE TYPE public.tax_type AS ENUM ('vat', 'paye', 'corporate_tax', 'withholding_tax', 'customs_duty', 'excise_tax');

-- Create enum for document types
CREATE TYPE public.document_type AS ENUM ('tax_return', 'receipt', 'certificate', 'correspondence', 'audit_report', 'other');

-- Create enum for notification types
CREATE TYPE public.notification_type AS ENUM ('deadline_reminder', 'system_alert', 'compliance_update', 'document_uploaded', 'user_action');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'readonly',
    department department_type NOT NULL DEFAULT 'tax',
    status user_status NOT NULL DEFAULT 'active',
    permissions TEXT[] DEFAULT ARRAY['view_only'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create clients table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    tax_id TEXT UNIQUE,
    address TEXT,
    client_type TEXT DEFAULT 'individual',
    status TEXT DEFAULT 'active',
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tax_obligations table
CREATE TABLE public.tax_obligations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    tax_type tax_type NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2),
    status obligation_status DEFAULT 'pending',
    assigned_to UUID REFERENCES public.profiles(id),
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    obligation_id UUID REFERENCES public.tax_obligations(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    document_type document_type NOT NULL,
    file_path TEXT,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_obligations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    CASE 
      WHEN EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = user_uuid AND 'all' = ANY(permissions)) THEN TRUE
      WHEN EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = user_uuid AND permission_name = ANY(permissions)) THEN TRUE
      ELSE FALSE
    END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Create trigger function for profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.user_roles (user_id, role, department, permissions)
  VALUES (
    NEW.id, 
    'readonly', 
    'tax', 
    ARRAY['view_only']
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tax_obligations_updated_at BEFORE UPDATE ON public.tax_obligations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins and IT can view all roles" ON public.user_roles
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'user_management') OR 
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins and IT can manage roles" ON public.user_roles
  FOR ALL USING (
    public.has_permission(auth.uid(), 'user_management') OR 
    public.is_admin(auth.uid())
  );

-- RLS Policies for clients
CREATE POLICY "Users can view clients based on permissions" ON public.clients
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'client_management') OR
    public.has_permission(auth.uid(), 'view_only') OR
    public.is_admin(auth.uid()) OR
    assigned_to = auth.uid()
  );

CREATE POLICY "Users can manage clients with permission" ON public.clients
  FOR ALL USING (
    public.has_permission(auth.uid(), 'client_management') OR
    public.is_admin(auth.uid())
  );

-- RLS Policies for tax_obligations
CREATE POLICY "Users can view obligations based on permissions" ON public.tax_obligations
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'tax_management') OR
    public.has_permission(auth.uid(), 'view_only') OR
    public.is_admin(auth.uid()) OR
    assigned_to = auth.uid() OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can manage obligations with permission" ON public.tax_obligations
  FOR ALL USING (
    public.has_permission(auth.uid(), 'tax_management') OR
    public.is_admin(auth.uid())
  );

-- RLS Policies for documents
CREATE POLICY "Users can view documents based on permissions" ON public.documents
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'document_view') OR
    public.has_permission(auth.uid(), 'view_only') OR
    public.is_admin(auth.uid()) OR
    uploaded_by = auth.uid()
  );

CREATE POLICY "Users can manage documents with permission" ON public.documents
  FOR ALL USING (
    public.has_permission(auth.uid(), 'document_view') OR
    public.is_admin(auth.uid())
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for system_settings
CREATE POLICY "Users can view system settings" ON public.system_settings
  FOR SELECT USING (
    public.has_permission(auth.uid(), 'system_settings') OR
    public.has_permission(auth.uid(), 'view_only') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins and IT can manage system settings" ON public.system_settings
  FOR ALL USING (
    public.has_permission(auth.uid(), 'system_settings') OR
    public.is_admin(auth.uid())
  );

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can create audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('app_name', '"Tax Compliance Hub"', 'Application name'),
('default_currency', '"KES"', 'Default currency'),
('tax_year', '2024', 'Current tax year'),
('notification_settings', '{"email_enabled": true, "sms_enabled": false}', 'Notification preferences');

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage policies for documents bucket
CREATE POLICY "Users can view documents they have access to" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND (
      public.has_permission(auth.uid(), 'document_view') OR
      public.has_permission(auth.uid(), 'view_only') OR
      public.is_admin(auth.uid())
    )
  );

CREATE POLICY "Users can upload documents with permission" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND (
      public.has_permission(auth.uid(), 'document_view') OR
      public.is_admin(auth.uid())
    )
  );
