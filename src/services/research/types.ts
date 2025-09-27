/**
 * Research & Development Type Definitions
 */

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

export interface ResearchPath {
  type: ResearchProject['project_type'];
  name: string;
  description: string;
  estimatedCost: string;
  estimatedTime: string;
  benefits: string[];
}

export interface ProjectSpecs {
  totalCost: number;
  specs: {
    performance: number;
    cost: number;
    description: string;
    bonusFeatures?: string[];
  };
}