import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Newspaper as NewspaperIcon, 
  TrendingUp, 
  Globe, 
  Monitor, 
  Users,
  Calendar,
  DollarSign
} from "lucide-react";
import { NewsEvent } from "@/data/NewsEvents";
import { useTranslation } from "react-i18next";
import { formatters } from "@/lib/i18n";

interface NewspaperProps {
  isOpen: boolean;
  onClose: () => void;
  quarter: number;
  year: number;
  newsEvents: NewsEvent[];
  marketData: {
    totalMarketSize: number;
    marketGrowth: number;
    topComputers: Array<{
      name: string;
      company: string;
      unitsSold: number;
      marketShare: number;
    }>;
  } | null;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tech': return Monitor;
    case 'market': return TrendingUp;
    case 'world': return Globe;
    case 'competitor': return Users;
    default: return NewspaperIcon;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tech': return 'text-blue-400';
    case 'market': return 'text-green-400';
    case 'world': return 'text-yellow-400';
    case 'competitor': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

const getCategoryLabel = (category: string, t: any) => {
  switch (category) {
    case 'tech': return t('news:categories.tech');
    case 'market': return t('news:categories.market');
    case 'world': return t('news:categories.world');
    case 'competitor': return t('news:categories.competitor');
    default: return t('news:categories.default', 'News');
  }
};

export const Newspaper = ({ 
  isOpen, 
  onClose, 
  quarter, 
  year, 
  newsEvents, 
  marketData 
}: NewspaperProps) => {
  const { t } = useTranslation(['news', 'common']);
  
  const formatCurrency = (amount: number) => formatters.currency(amount / 1000000) + 'M';
  const formatUnits = (units: number) => {
    if (units >= 1000000) return `${(units / 1000000).toFixed(1)}M`;
    if (units >= 1000) return `${(units / 1000).toFixed(0)}k`;
    return units.toString();
  };

  const getMonthName = (quarter: number) => {
    const months = [t('months.january'), t('months.april'), t('months.july'), t('months.october')];
    return months[quarter - 1];
  };

  const mainNews = newsEvents.slice(0, 1);
  const sideNews = newsEvents.slice(1, 4);
  const techNews = newsEvents.filter(event => event.category === 'tech');
  const marketNews = newsEvents.filter(event => event.category === 'market');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto bg-white text-black border-8 border-black">
        {/* Newspaper Header */}
        <div className="border-b-4 border-black pb-4 mb-6">
          <div className="text-center">
            <h1 className="text-6xl font-bold font-serif tracking-wider mb-2">
              {t('title')}
            </h1>
            <div className="flex justify-between items-center text-sm font-mono border-t-2 border-b-2 border-black py-1">
              <span>{t('issue')} #{(year - 1983) * 4 + quarter}</span>
              <span className="font-bold text-lg">{getMonthName(quarter)} {year}</span>
              <span>{t('price')}</span>
            </div>
            <div className="text-xs text-center mt-1">
              "{t('tagline')}"
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Story */}
          {mainNews.length > 0 && (
            <div className="col-span-12 md:col-span-8 border-r-2 border-black pr-6">
              <div className="border-b-2 border-black pb-2 mb-4">
                <Badge variant="outline" className="text-xs mb-2 bg-black text-white">
                  {getCategoryLabel(mainNews[0].category, t).toUpperCase()}
                </Badge>
                <h2 className="text-4xl font-bold font-serif leading-tight mb-3">
                  {mainNews[0].headline}
                </h2>
                <div className="text-xs text-gray-600 mb-3">
                  {t('byline')} • {t('title')}
                </div>
              </div>
              <div className="columns-2 gap-6 text-justify text-sm leading-relaxed">
                <p className="mb-4 first-letter:text-4xl first-letter:font-bold first-letter:float-left first-letter:mr-1 first-letter:mt-1">
                  {mainNews[0].content}
                </p>
                {mainNews[0].impact && (
                  <div className="border-2 border-black p-3 bg-gray-100 break-inside-avoid mb-4">
                    <h4 className="font-bold text-xs mb-2">{t('marketImpact.title')}:</h4>
                    <div className="text-xs">
                      {mainNews[0].impact.marketGrowth && (
                        <div>• {t('marketImpact.growth')}: +{(mainNews[0].impact.marketGrowth * 100).toFixed(0)}%</div>
                      )}
                      {mainNews[0].impact.priceChange && (
                        <div>• {t('marketImpact.pricePressure')}: {(mainNews[0].impact.priceChange * 100).toFixed(0)}%</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            {/* Market Overview Box */}
            <div className="border-4 border-black bg-gray-50 p-4">
              <h3 className="text-lg font-bold font-serif mb-3 text-center border-b border-black pb-1">
                {t('marketOverview.title')}
              </h3>
              {marketData ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-300 pb-1">
                    <span className="font-semibold">{t('marketOverview.totalMarket')}:</span>
                    <span className="font-mono">{formatCurrency(marketData.totalMarketSize)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-1">
                    <span className="font-semibold">{t('marketOverview.growth')}:</span>
                    <span className={`font-mono ${marketData.marketGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marketData.marketGrowth > 0 ? '+' : ''}{(marketData.marketGrowth * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-3">
                    <h4 className="font-semibold text-xs mb-2">{t('marketOverview.topComputers')}:</h4>
                    {marketData.topComputers.slice(0, 3).map((computer, index) => (
                      <div key={index} className="flex justify-between text-xs py-1 border-b border-gray-200">
                        <span>{index + 1}. {computer.name}</span>
                        <span className="font-mono">{formatUnits(computer.unitsSold)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm">{t('common:loading')}</div>
              )}
            </div>

            {/* Side News */}
            {sideNews.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-serif border-b-2 border-black pb-1">
                  {t('sideNews.title')}
                </h3>
                {sideNews.map((event, index) => {
                  const IconComponent = getCategoryIcon(event.category);
                  return (
                    <div key={event.id} className="border-b border-gray-300 pb-3">
                      <div className="flex items-start gap-2 mb-1">
                        <IconComponent className={`w-4 h-4 mt-0.5 ${getCategoryColor(event.category)}`} />
                        <Badge variant="outline" className="text-xs bg-gray-200">
                          {getCategoryLabel(event.category, t)}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm mb-1 leading-tight">
                        {event.headline}
                      </h4>
                      <p className="text-xs leading-relaxed text-gray-700">
                        {event.content.substring(0, 120)}...
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Technology Section */}
        {techNews.length > 0 && (
          <div className="mt-8 border-t-4 border-black pt-6">
            <h3 className="text-2xl font-bold font-serif mb-4 text-center bg-black text-white py-2">
              {t('techSection.title')}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {techNews.map((event, index) => (
                <div key={event.id} className="border-2 border-black p-4">
                  <h4 className="font-bold text-lg mb-2 font-serif">
                    {event.headline}
                  </h4>
                  <p className="text-sm leading-relaxed text-justify">
                    {event.content}
                  </p>
                  {event.impact && (
                    <div className="mt-3 text-xs border-t border-gray-300 pt-2">
                      <span className="font-semibold">{t('techSection.impact')}: </span>
                      {event.impact.marketGrowth && `+${(event.impact.marketGrowth * 100).toFixed(0)}% ${t('techSection.growth')}`}
                      {event.impact.priceChange && ` ${(event.impact.priceChange * 100).toFixed(0)}% ${t('techSection.pricePressure')}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t-4 border-black pt-4 text-center space-y-3">
          <div className="text-xs font-mono border border-black inline-block px-4 py-1">
            {t('footer.info')}
          </div>
          <Button 
            onClick={onClose}
            className="px-8 py-2 bg-black text-white hover:bg-gray-800 font-mono border-2 border-black"
          >
            {t('footer.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};