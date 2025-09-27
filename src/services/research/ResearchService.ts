import { supabase } from "@/integrations/supabase/client";
import { ResearchProject, ExclusiveComponent } from './types';
import { ProjectGenerator } from './ProjectGenerator';
import { ResearchPathsService } from './ResearchPathsService';

/**
 * Haupt-Service für Research & Development
 * Orchestriert alle F&E-bezogenen Operationen
 */
export class ResearchService {
  
  /**
   * Hole alle Forschungsprojekte für den aktuellen Benutzer
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
   * Starte ein neues Forschungsprojekt
   */
  static async startResearchProject(
    projectType: ResearchProject['project_type'],
    currentQuarter: number,
    currentYear: number,
    investmentAmount: number
  ): Promise<{ success: boolean; project?: ResearchProject; error?: string }> {
    
    const projectSpecs = ProjectGenerator.generateProjectSpecs(projectType, currentYear);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const project = {
      user_id: user.id,
      project_name: ProjectGenerator.generateProjectName(projectType),
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

    return { 
      success: true, 
      project: { 
        ...data, 
        project_type: data.project_type as ResearchProject['project_type'], 
        status: data.status as ResearchProject['status'],
        component_specs: data.component_specs as ResearchProject['component_specs']
      } 
    };
  }

  /**
   * Investiere in ein bestehendes Forschungsprojekt
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
      await this.createExclusiveComponent({ 
        ...data, 
        project_type: data.project_type as ResearchProject['project_type'], 
        status: data.status as ResearchProject['status'], 
        component_specs: data.component_specs as ResearchProject['component_specs'] 
      });
    }

    return { 
      success: true, 
      project: { 
        ...data, 
        project_type: data.project_type as ResearchProject['project_type'], 
        status: data.status as ResearchProject['status'],
        component_specs: data.component_specs as ResearchProject['component_specs']
      }, 
      completed: isCompleted 
    };
  }

  /**
   * Hole exklusive Komponenten verfügbar für den Benutzer
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
   * Hole verfügbare Forschungspfade
   */
  static getAvailableResearchPaths = ResearchPathsService.getAvailableResearchPaths;

  /**
   * Erstelle exklusive Komponente wenn Forschung abgeschlossen ist
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
}

// Re-export types and other services for backward compatibility
export type { ResearchProject, ExclusiveComponent } from './types';
export { ProjectGenerator } from './ProjectGenerator';
export { ResearchPathsService } from './ResearchPathsService';