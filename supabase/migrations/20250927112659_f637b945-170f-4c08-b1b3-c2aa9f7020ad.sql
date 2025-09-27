-- Create tables for R&D and Market Events system

-- Table for tracking R&D projects
CREATE TABLE public.research_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('exclusive_gpu', 'exclusive_sound', 'exclusive_cpu', 'exclusive_case')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  cost_invested INTEGER NOT NULL DEFAULT 0,
  total_cost_required INTEGER NOT NULL,
  start_quarter INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  completion_quarter INTEGER,
  completion_year INTEGER,
  exclusive_until_quarter INTEGER,
  exclusive_until_year INTEGER,
  component_specs JSONB NOT NULL, -- stores performance, description, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for exclusive components created through R&D
CREATE TABLE public.exclusive_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  research_project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
  component_name TEXT NOT NULL,
  component_type TEXT NOT NULL CHECK (component_type IN ('gpu', 'sound', 'cpu', 'case')),
  performance INTEGER NOT NULL,
  cost INTEGER NOT NULL,
  description TEXT NOT NULL,
  available_from_quarter INTEGER NOT NULL,
  available_from_year INTEGER NOT NULL,
  exclusive_until_quarter INTEGER NOT NULL,
  exclusive_until_year INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for market events that affect prices and market conditions
CREATE TABLE public.market_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('price_shock', 'shortage', 'surplus', 'demand_shift', 'tech_breakthrough')),
  affected_categories TEXT[] NOT NULL, -- ['ram', 'cpu', 'gpu', 'sound', 'storage']
  price_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0, -- 1.25 = +25%, 0.8 = -20%
  market_impact DECIMAL(4,2) DEFAULT 0.0, -- overall market growth/decline
  start_quarter INTEGER NOT NULL,
  start_year INTEGER NOT NULL,
  duration_quarters INTEGER NOT NULL DEFAULT 1,
  end_quarter INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_global BOOLEAN NOT NULL DEFAULT true,
  trigger_probability DECIMAL(3,2) DEFAULT 0.1, -- 10% chance per quarter
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for tracking active market events in specific game instances
CREATE TABLE public.active_market_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  market_event_id UUID NOT NULL REFERENCES public.market_events(id) ON DELETE CASCADE,
  game_quarter INTEGER NOT NULL,
  game_year INTEGER NOT NULL,
  remaining_quarters INTEGER NOT NULL,
  current_price_multiplier DECIMAL(4,2) NOT NULL,
  is_visible_to_player BOOLEAN NOT NULL DEFAULT true, -- for transparency
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_market_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for research_projects
CREATE POLICY "Users can manage their own research projects" 
ON public.research_projects 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for exclusive_components
CREATE POLICY "Users can access their own exclusive components" 
ON public.exclusive_components 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for market_events (read-only for all users)
CREATE POLICY "All users can view market events" 
ON public.market_events 
FOR SELECT 
USING (true);

-- RLS Policies for active_market_events
CREATE POLICY "Users can manage their own active market events" 
ON public.active_market_events 
FOR ALL 
USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_research_projects_updated_at
  BEFORE UPDATE ON public.research_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exclusive_components_updated_at
  BEFORE UPDATE ON public.exclusive_components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_events_updated_at
  BEFORE UPDATE ON public.market_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample market events
INSERT INTO public.market_events (event_name, description, event_type, affected_categories, price_multiplier, start_quarter, start_year, duration_quarters, end_quarter, end_year, severity, trigger_probability) VALUES
('RAM-Knappheit durch Fabrikbrand', 'Ein Großbrand in einer wichtigen RAM-Produktionsstätte führt zu weltweiter Knappheit von Arbeitsspeicher-Modulen.', 'shortage', ARRAY['ram'], 1.25, 3, 1987, 2, 1, 1988, 'high', 0.15),
('Prozessor-Durchbruch bei Intel', 'Neue Fertigungstechnologie ermöglicht günstigere CPU-Produktion und drückt die Preise.', 'tech_breakthrough', ARRAY['cpu'], 0.85, 2, 1986, 3, 1, 1987, 'medium', 0.12),
('Grafik-Chip Überangebot', 'Mehrere Hersteller überproduzierten Grafik-Chips, was zu einem Preisverfall führt.', 'surplus', ARRAY['gpu'], 0.75, 4, 1985, 2, 2, 1986, 'medium', 0.1),
('Sound-Chip Patent-Streit', 'Rechtliche Auseinandersetzungen zwischen Herstellern verzögern Produktion und erhöhen Preise.', 'shortage', ARRAY['sound'], 1.35, 1, 1984, 4, 1, 1985, 'high', 0.08),
('Festplatten-Revolution', 'Neue Speichertechnologie macht bisherige Festplatten günstiger verfügbar.', 'tech_breakthrough', ARRAY['storage'], 0.9, 3, 1988, 2, 1, 1989, 'low', 0.2);