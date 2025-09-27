import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  Zap, 
  Cpu, 
  Volume2, 
  Monitor,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { ResearchService, type ResearchProject, type ExclusiveComponent } from "@/services/ResearchService";
import { useToast } from "@/hooks/use-toast";

interface ResearchDevelopmentTabProps {
  budget: {
    research: number;
    development: number;
  };
  currentQuarter: number;
  currentYear: number;
  onBudgetChange: (newBudget: { research: number; development: number }) => void;
}

export const ResearchDevelopmentTab = ({ 
  budget, 
  currentQuarter, 
  currentYear, 
  onBudgetChange 
}: ResearchDevelopmentTabProps) => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [exclusiveComponents, setExclusiveComponents] = useState<ExclusiveComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadResearchData();
  }, [currentQuarter, currentYear]);

  const loadResearchData = async () => {
    setLoading(true);
    try {
      const [projectsData, componentsData] = await Promise.all([
        ResearchService.getUserResearchProjects(),
        ResearchService.getUserExclusiveComponents(currentQuarter, currentYear)
      ]);
      
      setProjects(projectsData);
      setExclusiveComponents(componentsData);
    } catch (error) {
      console.error('Error loading research data:', error);
      toast({
        title: "Fehler",
        description: "Konnte F&E-Daten nicht laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async (projectType: ResearchProject['project_type']) => {
    if (budget.research < 25000) {
      toast({
        title: "Unzureichendes Budget",
        description: "Mindestens $25,000 Forschungsbudget erforderlich",
        variant: "destructive"
      });
      return;
    }

    const result = await ResearchService.startResearchProject(
      projectType,
      currentQuarter,
      currentYear,
      25000 // Initial investment
    );

    if (result.success) {
      toast({
        title: "Projekt gestartet!",
        description: `${result.project?.project_name} wurde erfolgreich gestartet`,
        variant: "default"
      });
      
      // Update budget
      onBudgetChange({
        research: budget.research - 25000,
        development: budget.development
      });
      
      loadResearchData();
    } else {
      toast({
        title: "Fehler",
        description: result.error || "Projekt konnte nicht gestartet werden",
        variant: "destructive"
      });
    }
  };

  const handleInvestInProject = async (projectId: string) => {
    const amount = investmentAmount[projectId] || 0;
    
    if (amount <= 0) {
      toast({
        title: "Ungültiger Betrag",
        description: "Bitte geben Sie einen positiven Investitionsbetrag ein",
        variant: "destructive"
      });
      return;
    }

    if (amount > budget.research) {
      toast({
        title: "Unzureichendes Budget",
        description: "Nicht genügend Forschungsbudget verfügbar",
        variant: "destructive"
      });
      return;
    }

    const result = await ResearchService.investInProject(projectId, amount);

    if (result.success) {
      const message = result.completed 
        ? "Projekt abgeschlossen! Exklusive Komponente verfügbar!"
        : "Investition erfolgreich!";
      
      toast({
        title: message,
        description: result.completed 
          ? "Die neue Komponente ist jetzt in der Entwicklung verfügbar"
          : `$${amount.toLocaleString()} investiert`,
        variant: "default"
      });
      
      // Update budget
      onBudgetChange({
        research: budget.research - amount,
        development: budget.development
      });
      
      // Clear investment amount
      setInvestmentAmount(prev => ({ ...prev, [projectId]: 0 }));
      
      loadResearchData();
    } else {
      toast({
        title: "Fehler",
        description: "Investition fehlgeschlagen",
        variant: "destructive"
      });
    }
  };

  const getProjectIcon = (type: ResearchProject['project_type']) => {
    const icons = {
      exclusive_gpu: Monitor,
      exclusive_sound: Volume2,
      exclusive_cpu: Cpu,
      exclusive_case: Package
    };
    return icons[type];
  };

  const getStatusColor = (status: ResearchProject['status']) => {
    const colors = {
      in_progress: 'text-yellow-400',
      completed: 'text-neon-green',
      cancelled: 'text-red-400'
    };
    return colors[status];
  };

  const getStatusText = (status: ResearchProject['status']) => {
    const texts = {
      in_progress: 'In Entwicklung',
      completed: 'Abgeschlossen',
      cancelled: 'Abgebrochen'
    };
    return texts[status];
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <TestTube className="w-8 h-8 text-neon-cyan mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Lade F&E-Daten...</p>
        </div>
      </div>
    );
  }

  const availablePaths = ResearchService.getAvailableResearchPaths(currentYear);

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <Card className="retro-border bg-card/80">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-cyan">
              <TestTube className="w-5 h-5" />
              F&E Budget
            </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Forschungsbudget</p>
              <p className="text-2xl font-bold text-neon-green font-mono">
                {formatCurrency(budget.research)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entwicklungsbudget</p>
              <p className="text-2xl font-bold text-neon-cyan font-mono">
                {formatCurrency(budget.development)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="research" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="research" className="retro-tab">Forschung</TabsTrigger>
          <TabsTrigger value="projects" className="retro-tab">Aktive Projekte</TabsTrigger>
          <TabsTrigger value="exclusive" className="retro-tab">Exklusive Komponenten</TabsTrigger>
        </TabsList>

        {/* Research Paths */}
        <TabsContent value="research" className="space-y-4">
          <Card className="retro-border bg-card/80">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-cyan">
              <TestTube className="w-5 h-5" />
              Verfügbare Forschungspfade
            </CardTitle>
              <p className="text-sm text-muted-foreground">
                Entwickeln Sie exklusive Komponenten für Wechselstvorteile
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availablePaths.map((path) => {
                  const IconComponent = getProjectIcon(path.type);
                  const hasActiveProject = projects.some(p => 
                    p.project_type === path.type && p.status === 'in_progress'
                  );
                  
                  return (
                    <Card key={path.type} className="border border-border/50 bg-card/40">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <IconComponent className="w-6 h-6 text-neon-cyan mt-1" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{path.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {path.description}
                              </p>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-muted-foreground">Kosten: </span>
                                  <span className="font-mono">{path.estimatedCost}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Dauer: </span>
                                  <span className="font-mono">{path.estimatedTime}</span>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-1">Vorteile:</p>
                                <ul className="text-xs text-muted-foreground space-y-1">
                                  {path.benefits.map((benefit, idx) => (
                                    <li key={idx} className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-neon-green" />
                                      {benefit}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="ml-4">
                            <Button
                              onClick={() => handleStartProject(path.type)}
                              disabled={hasActiveProject || budget.research < 25000}
                              className="glow-button"
                              size="sm"
                            >
                              {hasActiveProject ? 'Läuft bereits' : 'Starten'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Projects */}
        <TabsContent value="projects" className="space-y-4">
          <Card className="retro-border bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-cyan">
                <Clock className="w-5 h-5" />
                Aktive Forschungsprojekte
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
              <div className="text-center py-8">
                <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Keine aktiven Projekte</p>
                <p className="text-sm text-muted-foreground">
                  Starten Sie ein neues Forschungsprojekt im "Forschung" Tab
                </p>
              </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const IconComponent = getProjectIcon(project.project_type);
                    const progress = (project.cost_invested / project.total_cost_required) * 100;
                    const isCompleted = project.status === 'completed';
                    
                    return (
                      <Card key={project.id} className="border border-border/50 bg-card/40">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              <IconComponent className="w-6 h-6 text-neon-cyan mt-1" />
                              <div>
                                <h4 className="font-semibold text-lg">{project.project_name}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(project.status)}`}
                                >
                                  {getStatusText(project.status)}
                                </Badge>
                              </div>
                            </div>
                            
                            {isCompleted && (
                              <CheckCircle className="w-6 h-6 text-neon-green" />
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Fortschritt</span>
                                <span>{progress.toFixed(1)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Investiert: </span>
                                <span className="font-mono text-neon-green">
                                  {formatCurrency(project.cost_invested)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Benötigt: </span>
                                <span className="font-mono">
                                  {formatCurrency(project.total_cost_required)}
                                </span>
                              </div>
                            </div>
                            
                            {!isCompleted && (
                              <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                                <Input
                                  type="number"
                                  placeholder="Investitionsbetrag"
                                  value={investmentAmount[project.id] || ''}
                                  onChange={(e) => setInvestmentAmount(prev => ({
                                    ...prev,
                                    [project.id]: parseInt(e.target.value) || 0
                                  }))}
                                  className="flex-1"
                                  min="0"
                                  max={budget.research}
                                />
                                <Button
                                  onClick={() => handleInvestInProject(project.id)}
                                  disabled={!investmentAmount[project.id] || investmentAmount[project.id] > budget.research}
                                  size="sm"
                                  className="glow-button"
                                >
                                  Investieren
                                </Button>
                              </div>
                            )}
                            
                            {isCompleted && project.exclusive_until_year && (
                              <div className="text-xs text-neon-green bg-neon-green/10 p-2 rounded">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Exklusiv bis Q{project.exclusive_until_quarter} {project.exclusive_until_year}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exclusive Components */}
        <TabsContent value="exclusive" className="space-y-4">
          <Card className="retro-border bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-cyan">
                <Star className="w-5 h-5" />
                Ihre exklusiven Komponenten
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Komponenten, die nur Sie verwenden können
              </p>
            </CardHeader>
            <CardContent>
              {exclusiveComponents.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Keine exklusiven Komponenten</p>
                  <p className="text-sm text-muted-foreground">
                    Schließen Sie Forschungsprojekte ab, um exklusive Komponenten zu erhalten
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {exclusiveComponents.map((component) => {
                    const IconComponent = getProjectIcon(`exclusive_${component.component_type}` as ResearchProject['project_type']);
                    
                    return (
                      <Card key={component.id} className="border border-neon-green/30 bg-neon-green/5">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <IconComponent className="w-6 h-6 text-neon-green mt-1" />
                              <div>
                                <h4 className="font-semibold text-lg text-neon-green">
                                  {component.component_name}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {component.description}
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Performance: </span>
                                    <span className="font-mono text-neon-green">
                                      {component.performance}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Kosten: </span>
                                    <span className="font-mono text-neon-cyan">
                                      ${component.cost}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="mt-2 text-xs text-neon-green">
                                  <Star className="w-3 h-3 inline mr-1" />
                                  Exklusiv bis Q{component.exclusive_until_quarter} {component.exclusive_until_year}
                                </div>
                              </div>
                            </div>
                            
                            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                              Exklusiv
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};