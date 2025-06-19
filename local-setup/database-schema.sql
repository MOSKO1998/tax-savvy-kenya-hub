
-- Tax Compliance Hub Database Schema
-- This file contains the complete database structure for local development

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'tax_staff', 'readonly', 'it');
CREATE TYPE public.department_type AS ENUM ('management', 'tax', 'audit', 'it', 'finance', 'legal');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');
CREATE TYPE public.obligation_status AS ENUM ('pending', 'completed', 'overdue', 'cancelled');
CREATE TYPE public.tax_type AS ENUM ('vat', 'paye', 'corporate_tax', 'withholding_tax', 'customs_duty', 'excise_tax');
CREATE TYPE public.document_type AS ENUM ('tax_return', 'receipt', 'certificate', 'correspondence', 'audit_report', 'other');
CREATE TYPE public.notification_type AS ENUM ('deadline_reminder', 'system_alert', 'compliance_update', 'document_uploaded', 'user_action');

-- Users table (simplified for local development)
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
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

-- Clients table
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

-- Tax obligations table
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

-- Documents table
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

-- Notifications table
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

-- System settings table
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
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

-- Create indexes for better performance
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
CREATE INDEX idx_clients_assigned_to ON public.clients(assigned_to);
CREATE INDEX idx_tax_obligations_client_id ON public.tax_obligations(client_id);
CREATE INDEX idx_tax_obligations_due_date ON public.tax_obligations(due_date);
CREATE INDEX idx_tax_obligations_status ON public.tax_obligations(status);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

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
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tax_obligations_updated_at BEFORE UPDATE ON public.tax_obligations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Utility functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
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
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('app_name', '"Tax Compliance Hub"', 'Application name'),
('default_currency', '"KES"', 'Default currency'),
('tax_year', '2024', 'Current tax year'),
('notification_settings', '{"email_enabled": true, "sms_enabled": false}', 'Notification preferences');

-- Create default admin user (password: admin123)
INSERT INTO public.users (id, email, password_hash) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@audit.ke', '$2b$10$rOcUBgx9xUxzGOVhXzQkAeD8X4vQ6YyGZgQ1XH4vQzEFnBwQxPzRa');

INSERT INTO public.profiles (id, email, full_name) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@audit.ke', 'System Administrator');

INSERT INTO public.user_roles (user_id, role, department, permissions) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin', 'management', ARRAY['all']);

-- Sample data for testing
INSERT INTO public.clients (name, email, phone, tax_id, client_type, created_by) VALUES 
('ABC Manufacturing Ltd', 'info@abcmfg.co.ke', '+254-700-123456', 'P051234567M', 'corporate', '550e8400-e29b-41d4-a716-446655440000'),
('XYZ Services Ltd', 'contact@xyzservices.co.ke', '+254-700-654321', 'P051234568N', 'corporate', '550e8400-e29b-41d4-a716-446655440000'),
('John Doe', 'john.doe@email.com', '+254-700-111222', 'A001234567P', 'individual', '550e8400-e29b-41d4-a716-446655440000');
