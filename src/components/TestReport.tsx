import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { translateText } from "@/lib/germanToEnglish";
import { 
  Gamepad2, 
  Briefcase, 
  Cpu, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign
} from "lucide-react";

export interface TestResult {
  overallScore: number;
  categories: {
    gaming: { score: number; rating: string; comments: string[]; priceValue: number };
    business: { score: number; rating: string; comments: string[]; priceValue: number };
    workstation: { score: number; rating: string; comments: string[]; priceValue: number };
  };
  compatibility: {
    score: number;
    rating: string;
    bottlenecks: string[];
    synergies: string[];
  };
  buildQuality: {
    score: number;
    rating: string;
    components: string[];
    caseMatch: boolean;
  };
  marketImpact: {
    reputationChange: number;
    expectedSalesBoost: number;
    competitorResponse: string;
    marketPosition: string;
  };
  finalVerdict: string;
  priceRecommendation?: {
    currentPrice: number;
    recommendedPrice: number;
    reasoning: string;
  };
}

interface TestReportProps {
  model: any;
  testResult: TestResult;
  onContinue: () => void;
  onRevise: () => void;
}

export const TestReport = ({ model, testResult, onContinue, onRevise }: TestReportProps) => {
  const { t } = useTranslation();
  const getRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'exzellent': case 'hervorragend': return 'text-green-400';
      case 'sehr gut': case 'gut': return 'text-neon-green';
      case 'befriedigend': case 'durchschnittlich': return 'text-yellow-400';
      case 'ausreichend': return 'text-orange-400';
      case 'mangelhaft': case 'ungenügend': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Award className="w-4 h-4 text-yellow-400" />;
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (score >= 70) return <Star className="w-4 h-4 text-neon-cyan" />;
    if (score >= 60) return <Zap className="w-4 h-4 text-yellow-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-crt p-6">
      <div className="crt-screen">
        <div className="scanline" />
        
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card className="retro-border bg-card/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold neon-text text-neon-green">
                {t('reviews:testReport.magazinTitle')}
              </CardTitle>
              <p className="text-neon-cyan font-mono">{t('reviews:testReport.subtitle')}</p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {model.name}
                </Badge>
                <div className="flex items-center gap-2">
                  {getScoreIcon(testResult.overallScore)}
                  <span className="text-2xl font-bold font-mono text-neon-green">
                    {testResult.overallScore}/100
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Zielgruppen-Bewertungen */}
            <div className="space-y-6">
              {/* Gaming */}
              <Card className="retro-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-cyan">
                    <Gamepad2 className="w-5 h-5" />
                    {t('reviews:testReport.gamingTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t('reviews:testReport.rating')}:</span>
                    <span className={`text-lg font-bold ${getRatingColor(testResult.categories.gaming.rating)}`}>
                      {translateText(testResult.categories.gaming.rating)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.performance')}:</span>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(testResult.categories.gaming.score)}
                      <span className="font-mono">{testResult.categories.gaming.score}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.priceValue')}:</span>
                    <span className={`font-mono ${testResult.categories.gaming.priceValue >= 80 ? 'text-green-400' : 
                      testResult.categories.gaming.priceValue >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {testResult.categories.gaming.priceValue}/100
                    </span>
                  </div>
                  
                  <Progress value={testResult.categories.gaming.score} className="h-2" />
                  
                  <div className="text-sm space-y-1">
                    {testResult.categories.gaming.comments.map((comment, idx) => (
                      <p key={idx} className="text-muted-foreground">• {translateText(comment)}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Business */}
              <Card className="retro-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-cyan">
                    <Briefcase className="w-5 h-5" />
                    {t('reviews:testReport.businessTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t('reviews:testReport.rating')}:</span>
                    <span className={`text-lg font-bold ${getRatingColor(testResult.categories.business.rating)}`}>
                      {translateText(testResult.categories.business.rating)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.performance')}:</span>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(testResult.categories.business.score)}
                      <span className="font-mono">{testResult.categories.business.score}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.priceValue')}:</span>
                    <span className={`font-mono ${testResult.categories.business.priceValue >= 80 ? 'text-green-400' : 
                      testResult.categories.business.priceValue >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {testResult.categories.business.priceValue}/100
                    </span>
                  </div>
                  
                  <Progress value={testResult.categories.business.score} className="h-2" />
                  
                  <div className="text-sm space-y-1">
                    {testResult.categories.business.comments.map((comment, idx) => (
                      <p key={idx} className="text-muted-foreground">• {translateText(comment)}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Workstation */}
              <Card className="retro-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-cyan">
                    <Cpu className="w-5 h-5" />
                    {t('reviews:testReport.workstationTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t('reviews:testReport.rating')}:</span>
                    <span className={`text-lg font-bold ${getRatingColor(testResult.categories.workstation.rating)}`}>
                      {translateText(testResult.categories.workstation.rating)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.performance')}:</span>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(testResult.categories.workstation.score)}
                      <span className="font-mono">{testResult.categories.workstation.score}/100</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.priceValue')}:</span>
                    <span className={`font-mono ${testResult.categories.workstation.priceValue >= 80 ? 'text-green-400' : 
                      testResult.categories.workstation.priceValue >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {testResult.categories.workstation.priceValue}/100
                    </span>
                  </div>
                  
                  <Progress value={testResult.categories.workstation.score} className="h-2" />
                  
                  <div className="text-sm space-y-1">
                    {testResult.categories.workstation.comments.map((comment, idx) => (
                      <p key={idx} className="text-muted-foreground">• {translateText(comment)}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technische Analyse */}
            <div className="space-y-6">
              {/* Komponentenharmonie */}
              <Card className="retro-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-cyan">
                    <Zap className="w-5 h-5" />
                    {t('reviews:testReport.harmony')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t('reviews:testReport.harmonyShort')}:</span>
                    <span className={`text-lg font-bold ${getRatingColor(testResult.compatibility.rating)}`}>
                      {translateText(testResult.compatibility.rating)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.tuning')}:</span>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(testResult.compatibility.score)}
                      <span className="font-mono">{testResult.compatibility.score}/100</span>
                    </div>
                  </div>
                  
                  <Progress value={testResult.compatibility.score} className="h-2" />
                  
                  {testResult.compatibility.synergies.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('reviews:testReport.synergies')}
                      </h4>
                      {testResult.compatibility.synergies.map((synergy, idx) => (
                        <p key={idx} className="text-sm text-green-300">• {translateText(synergy)}</p>
                      ))}
                    </div>
                  )}
                  
                  {testResult.compatibility.bottlenecks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {t('reviews:testReport.bottlenecks')}
                      </h4>
                      {testResult.compatibility.bottlenecks.map((bottleneck, idx) => (
                        <p key={idx} className="text-sm text-red-300">• {translateText(bottleneck)}</p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verarbeitungsqualität */}
              <Card className="retro-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-cyan">
                    <Award className="w-5 h-5" />
                    {t('reviews:testReport.buildQuality')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{t('reviews:testReport.quality')}:</span>
                    <span className={`text-lg font-bold ${getRatingColor(testResult.buildQuality.rating)}`}>
                      {translateText(testResult.buildQuality.rating)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>{t('reviews:testReport.overallScore')}:</span>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(testResult.buildQuality.score)}
                      <span className="font-mono">{testResult.buildQuality.score}/100</span>
                    </div>
                  </div>
                  
                  <Progress value={testResult.buildQuality.score} className="h-2" />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-neon-cyan">{t('reviews:testReport.componentDetails')}</h4>
                    {testResult.buildQuality.components.map((component, idx) => (
                      <p key={idx} className="text-sm text-muted-foreground">• {translateText(component)}</p>
                    ))}
                    
                    {testResult.buildQuality.caseMatch ? (
                      <p className="text-sm text-green-400">{t('reviews:testReport.caseFits')}</p>
                    ) : (
                      <p className="text-sm text-yellow-400">{t('reviews:testReport.caseMismatch')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Marktauswirkungen */}
              <Card className="retro-border bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-neon-cyan">
                    <TrendingUp className="w-5 h-5" />
                    {t('reviews:testReport.marketImpact')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('reviews:testReport.reputation')}</p>
                      <p className={`font-bold text-lg ${testResult.marketImpact.reputationChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {testResult.marketImpact.reputationChange >= 0 ? '+' : ''}{testResult.marketImpact.reputationChange}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{t('reviews:testReport.salesBoost')}</p>
                      <p className={`font-bold text-lg ${testResult.marketImpact.expectedSalesBoost >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {testResult.marketImpact.expectedSalesBoost >= 0 ? '+' : ''}{testResult.marketImpact.expectedSalesBoost}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t('reviews:testReport.marketPosition')}</span>
                      <span className="text-neon-green font-semibold">{translateText(testResult.marketImpact.marketPosition)}</span>
                    </p>
                    
                    <p className="text-sm">
                      <span className="text-muted-foreground">{t('reviews:testReport.competitorResponse')}</span>
                      <span className="text-neon-cyan">{translateText(testResult.marketImpact.competitorResponse)}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Preisempfehlung */}
              {testResult.priceRecommendation && (
                <Card className="retro-border bg-card/80 backdrop-blur-sm border-yellow-400/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-400">
                      <DollarSign className="w-5 h-5" />
                      {t('reviews:testReport.priceRecommendation')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('reviews:testReport.currentPrice')}</p>
                        <p className="font-bold text-lg font-mono text-neon-cyan">
                          {formatCurrency(testResult.priceRecommendation.currentPrice)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('reviews:testReport.recommendedPrice')}</p>
                        <p className="font-bold text-lg font-mono text-yellow-400">
                          {formatCurrency(testResult.priceRecommendation.recommendedPrice)}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground bg-card/50 p-3 rounded">
                      {translateText(testResult.priceRecommendation.reasoning)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Fazit */}
          <Card className="retro-border bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-neon-green text-center">
                {t('reviews:testReport.verdictTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-center text-neon-cyan bg-card/50 p-6 rounded-lg font-medium">
                {translateText(testResult.finalVerdict)}
              </p>
              
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={onRevise}
                  variant="outline"
                  className="text-lg px-8 py-3"
                >
                  <Cpu className="w-5 h-5 mr-2" />
                  {t('reviews:testReport.actionRevise')}
                </Button>
                <Button
                  onClick={onContinue}
                  className="glow-button text-lg px-8 py-3"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t('reviews:testReport.actionPublish')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};