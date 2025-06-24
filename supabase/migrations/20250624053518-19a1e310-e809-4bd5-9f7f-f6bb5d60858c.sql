
-- Enable RLS on existing tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_obligations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients table
CREATE POLICY "Users can view all clients" 
  ON public.clients 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their created clients" 
  ON public.clients 
  FOR UPDATE 
  USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their created clients" 
  ON public.clients 
  FOR DELETE 
  USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- Create RLS policies for tax_obligations table
CREATE POLICY "Users can view all tax obligations" 
  ON public.tax_obligations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert tax obligations" 
  ON public.tax_obligations 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their created tax obligations" 
  ON public.tax_obligations 
  FOR UPDATE 
  USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their created tax obligations" 
  ON public.tax_obligations 
  FOR DELETE 
  USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_tax_obligations_updated_at
  BEFORE UPDATE ON public.tax_obligations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
