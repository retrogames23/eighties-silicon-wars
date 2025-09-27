import { supabase } from "@/integrations/supabase/client";

export interface ResearchProject {
  id: string;
  user_id: string;
  project_name: string;
  project_type: 'exclusive_gpu' | 'exclusive_sound' | 'exclusive_cpu' | 'exclusive_case';
  status: 'in_progress' | 'completed' | 'cancelled';
  cost_invested: number;
  total_cost_required: number;
  start_quarter: number;
  start_year: number;
  completion_quarter?: number;
  completion_year?: number;
  exclusive_until_quarter?: number;
  exclusive_until_year?: number;
  component_specs: {
    performance: number;
    cost: number;
    description: string;
    bonusFeatures?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface ExclusiveComponent {
  id: string;
  user_id: string;
  research_project_id: string;
  component_name: string;
  component_type: 'gpu' | 'sound' | 'cpu' | 'case';
  performance: number;
  cost: number;
  description: string;
  available_from_quarter: number;
  available_from_year: number;
  exclusive_until_quarter: number;
  exclusive_until_year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export class ResearchService {
  
  /**
   * Get all research projects for the current user
   */
  static async getUserResearchProjects(): Promise<ResearchProject[]> {
    const { data, error } = await supabase
      .from('research_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching research projects:', error);
      return [];
    }

    return (data || []).map(project => ({
      ...project,
      project_type: project.project_type as ResearchProject['project_type'],
      status: project.status as ResearchProject['status'],
      component_specs: project.component_specs as ResearchProject['component_specs']
    }));
  }

  /**
   * Start a new research project
   */
  static async startResearchProject(
    projectType: ResearchProject['project_type'],
    currentQuarter: number,
    currentYear: number,
    investmentAmount: number
  ): Promise<{ success: boolean; project?: ResearchProject; error?: string }> {
    
    const projectSpecs = this.generateProjectSpecs(projectType, currentYear);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const project = {
      user_id: user.id,
      project_name: this.generateProjectName(projectType),
      project_type: projectType,
      status: 'in_progress' as const,
      cost_invested: investmentAmount,
      total_cost_required: projectSpecs.totalCost,
      start_quarter: currentQuarter,
      start_year: currentYear,
      component_specs: projectSpecs.specs
    };

    const { data, error } = await supabase
      .from('research_projects')
      .insert([project])
      .select()
      .single();

    if (error) {
      console.error('Error creating research project:', error);
      return { success: false, error: error.message };
    }

    return { success: true, project: { 
      ...data, 
      project_type: data.project_type as ResearchProject['project_type'], 
      status: data.status as ResearchProject['status'],
      component_specs: data.component_specs as ResearchProject['component_specs']
    } };
  }

  /**
   * Invest in an existing research project
   */
  static async investInProject(
    projectId: string,
    amount: number
  ): Promise<{ success: boolean; project?: ResearchProject; completed?: boolean }> {
    
    const { data: project, error: fetchError } = await supabase
      .from('research_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      return { success: false };
    }

    const newInvestment = project.cost_invested + amount;
    const isCompleted = newInvestment >= project.total_cost_required;
    
    const updateData: any = {
      cost_invested: newInvestment
    };

    if (isCompleted) {
      updateData.status = 'completed';
      updateData.completion_quarter = new Date().getMonth() / 3 + 1; // Current quarter
      updateData.completion_year = new Date().getFullYear();
      updateData.exclusive_until_quarter = updateData.completion_quarter;
      updateData.exclusive_until_year = updateData.completion_year + 2; // 2 years exclusivity
    }

    const { data, error } = await supabase
      .from('research_projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      return { success: false };
    }

    // If completed, create the exclusive component
    if (isCompleted) {
      await this.createExclusiveComponent({ ...data, project_type: data.project_type as any, status: data.status as any, component_specs: data.component_specs as any });
    }

    return { success: true, project: { 
      ...data, 
      project_type: data.project_type as ResearchProject['project_type'], 
      status: data.status as ResearchProject['status'],
      component_specs: data.component_specs as ResearchProject['component_specs']
    }, completed: isCompleted };
  }

  /**
   * Get exclusive components available to the user
   */
  static async getUserExclusiveComponents(
    currentQuarter: number,
    currentYear: number
  ): Promise<ExclusiveComponent[]> {
    const { data, error } = await supabase
      .from('exclusive_components')
      .select('*')
      .eq('is_active', true)
      .gte('exclusive_until_year', currentYear);

    if (error) {
      console.error('Error fetching exclusive components:', error);
      return [];
    }

    return (data || []).map(component => ({
      ...component,
      component_type: component.component_type as ExclusiveComponent['component_type']
    })).filter(component => {
      const isAvailable = (
        component.available_from_year < currentYear ||
        (component.available_from_year === currentYear && component.available_from_quarter <= currentQuarter)
      );
      
      const isStillExclusive = (
        component.exclusive_until_year > currentYear ||
        (component.exclusive_until_year === currentYear && component.exclusive_until_quarter >= currentQuarter)
      );

      return isAvailable && isStillExclusive;
    });
  }

  /**
   * Generate project specifications based on type and year
   */
  private static generateProjectSpecs(
    type: ResearchProject['project_type'],
    year: number
  ): { totalCost: number; specs: any } {
    const baseCost = 50000;
    const yearMultiplier = 1 + (year - 1983) * 0.3;
    
    const specifications: Record<string, { totalCost: number; specs: any }> = {
      exclusive_gpu: {
        totalCost: Math.round(baseCost * 2.5 * yearMultiplier),
        specs: {
          performance: 85 + Math.floor(Math.random() * 15), // 85-100
          cost: 180 + Math.floor(Math.random() * 50), // 180-230
          description: `Exklusiver High-Performance Grafik-Chip ${year}`,
          bonusFeatures: ['Hardware-Beschleunigung', 'Erweiterte Farbpalette', 'Anti-Aliasing']
        }
      },
      exclusive_sound: {
        totalCost: Math.round(baseCost * 1.8 * yearMultiplier),
        specs: {
          performance: 80 + Math.floor(Math.random() * 20), // 80-100
          cost: 120 + Math.floor(Math.random() * 40), // 120-160
          description: `Exklusiver Premium Audio-Chip ${year}`,
          bonusFeatures: ['16-Bit Audio', 'Surround Sound', 'Hardware-Reverb']
        }
      },
      exclusive_cpu: {
        totalCost: Math.round(baseCost * 3.5 * yearMultiplier),
        specs: {
          performance: 90 + Math.floor(Math.random() * 10), // 90-100
          cost: 350 + Math.floor(Math.random() * 100), // 350-450
          description: `Exklusiver Hochleistungs-Prozessor ${year}`,
          bonusFeatures: ['Erweiterte Instruction Sets', 'Cache-Optimierung', 'Pipeline Enhancement']
        }
      },
      exclusive_case: {
        totalCost: Math.round(baseCost * 1.2 * yearMultiplier),
        specs: {
          performance: 75 + Math.floor(Math.random() * 25), // 75-100 (design rating)
          cost: 250 + Math.floor(Math.random() * 150), // 250-400
          description: `Exklusives Premium-Gehäuse Design ${year}`,
          bonusFeatures: ['Modulares Design', 'Premium-Materialien', 'Tool-free Assembly']
        }
      }
    };

    return specifications[type];
  }

  /**
   * Generate attractive project names
   */
  private static generateProjectName(type: ResearchProject['project_type']): string {
    const prefixes = ['Projekt', 'Codename', 'Operation'];
    const names = {
      exclusive_gpu: ['Phoenix', 'Titan', 'Vortex', 'Quantum', 'Nexus'],
      exclusive_sound: ['Harmony', 'Resonance', 'Crystal', 'Symphony', 'Echo'],
      exclusive_cpu: ['Lightning', 'Thunder', 'Velocity', 'Apex', 'Prime'],
      exclusive_case: ['Phantom', 'Elite', 'Prestige', 'Infinity', 'Zenith']
    };

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const name = names[type][Math.floor(Math.random() * names[type].length)];
    
    return `${prefix} ${name}`;
  }

  /**
   * Create exclusive component when research is completed
   */
  private static async createExclusiveComponent(project: ResearchProject): Promise<void> {
    const componentType = project.project_type.replace('exclusive_', '') as ExclusiveComponent['component_type'];
    
    const component = {
      user_id: project.user_id,
      research_project_id: project.id,
      component_name: project.component_specs.description,
      component_type: componentType,
      performance: project.component_specs.performance,
      cost: project.component_specs.cost,
      description: project.component_specs.description,
      available_from_quarter: project.completion_quarter!,
      available_from_year: project.completion_year!,
      exclusive_until_quarter: project.exclusive_until_quarter!,
      exclusive_until_year: project.exclusive_until_year!,
      is_active: true
    };

    const { error } = await supabase
      .from('exclusive_components')
      .insert([component]);

    if (error) {
      console.error('Error creating exclusive component:', error);
    }
  }

  /**
   * Get available research paths based on current year and technology level
   */
  static getAvailableResearchPaths(currentYear: number): Array<{
    type: ResearchProject['project_type'];
    name: string;
    description: string;
    estimatedCost: string;
    estimatedTime: string;
    benefits: string[];
  }> {
    const paths: Array<{
      type: ResearchProject['project_type'];
      name: string;
      description: string;
      estimatedCost: string;
      estimatedTime: string;
      benefits: string[];
    }> = [
      {
        type: 'exclusive_gpu' as const,
        name: 'Exklusiver Grafik-Chip',
        description: 'Entwickeln Sie einen proprietären Grafik-Prozessor mit überlegener Performance',
        estimatedCost: '$75,000 - $200,000',
        estimatedTime: '3-4 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          '+15-30% bessere Grafik-Performance',
          'Einzigartige Features für Marketing',
          'Höhere Gewinnmargen'
        ]
      },
      {
        type: 'exclusive_sound' as const,
        name: 'Exklusiver Audio-Chip',
        description: 'Revolutionäre Sound-Technologie für Premium-Audioerlebnis',
        estimatedCost: '$45,000 - $120,000',
        estimatedTime: '2-3 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          'Premium Audio-Qualität',
          'Wettbewerbsvorteil bei Multimedia-PCs',
          'Markendifferenzierung'
        ]
      }
    ];

    // Add CPU research for later years
    if (currentYear >= 1985) {
      paths.push({
        type: 'exclusive_cpu' as const,
        name: 'Exklusiver Prozessor',
        description: 'Entwicklung eines hochspezialisierten CPU-Designs',
        estimatedCost: '$150,000 - $400,000',
        estimatedTime: '4-6 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          'Branchenführende Performance',
          'Proprietäre Instruction Sets',
          'Technologieführerschaft'
        ]
      });
    }

    // Add case research for design-focused markets
    if (currentYear >= 1984) {
      paths.push({
        type: 'exclusive_case' as const,
        name: 'Premium-Gehäuse Design',
        description: 'Innovative Gehäuse-Technologie mit modularem Design',
        estimatedCost: '$30,000 - $80,000',
        estimatedTime: '2 Quartale',
        benefits: [
          'Exklusiver Zugang für 2 Jahre',
          'Premium-Positionierung',
          'Verbesserte Kühlung & Ergonomie',
          'Designpreis-Potential'
        ]
      });
    }

    return paths;
  }
}