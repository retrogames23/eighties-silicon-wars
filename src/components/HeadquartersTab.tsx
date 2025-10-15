import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Building2, Users, TrendingUp } from "lucide-react";
import { formatters } from "@/lib/i18n";

interface HeadquartersTabProps {
  cash: number;
  employees: number;
  revenue: number;
  quarter: number;
  year: number;
}

export const HeadquartersTab = ({ 
  cash, 
  employees, 
  revenue,
  quarter,
  year 
}: HeadquartersTabProps) => {
  const { t } = useTranslation(['ui']);

  // Calculate headquarters level based on revenue and employees
  const getHeadquartersLevel = () => {
    const totalQuarters = (year - 1980) * 4 + quarter;
    const revenueScore = Math.min(revenue / 10000000, 1); // Max at 10M
    const employeeScore = Math.min(employees / 100, 1); // Max at 100 employees
    const timeScore = Math.min(totalQuarters / 40, 1); // Max at 10 years
    
    return {
      size: Math.floor((revenueScore + employeeScore) * 5), // 0-10 levels
      modernity: Math.floor(timeScore * 5), // 0-5 modernity levels
      floors: Math.max(1, Math.floor((revenueScore + employeeScore) * 4)), // 1-8 floors
      workers: Math.max(3, Math.floor(employees / 10)) // Visual workers
    };
  };

  const level = getHeadquartersLevel();

  // Color schemes based on modernity
  const getColorScheme = () => {
    const schemes = [
      { building: "#8B7355", window: "#FFE4B5", accent: "#CD853F" }, // 1980s: Brown/Beige
      { building: "#A9A9A9", window: "#87CEEB", accent: "#4682B4" }, // 1985: Gray/Blue
      { building: "#696969", window: "#B0E0E6", accent: "#5F9EA0" }, // 1990: Dark Gray/Cyan
      { building: "#708090", window: "#ADD8E6", accent: "#4169E1" }, // 1995: Slate/Blue
      { building: "#2F4F4F", window: "#00CED1", accent: "#00BFFF" }, // 2000: Dark Slate/Bright
      { building: "#1C1C1C", window: "#00FFFF", accent: "#0FF" }     // 2005+: Modern Black/Neon
    ];
    return schemes[Math.min(level.modernity, schemes.length - 1)];
  };

  const colors = getColorScheme();

  // Generate floor windows
  const renderFloors = () => {
    const floors = [];
    const floorHeight = 60;
    const buildingWidth = 300 + (level.size * 30);
    const roomsPerFloor = 3 + Math.floor(level.size / 2);

    for (let floor = 0; floor < level.floors; floor++) {
      const y = 400 - (floor * floorHeight);
      const windows = [];

      for (let room = 0; room < roomsPerFloor; room++) {
        const x = 50 + (room * (buildingWidth / roomsPerFloor));
        const hasWorker = room < level.workers && floor < 2;
        
        windows.push(
          <g key={`floor-${floor}-room-${room}`}>
            {/* Window */}
            <rect
              x={x}
              y={y + 10}
              width={buildingWidth / roomsPerFloor - 20}
              height={40}
              fill={colors.window}
              stroke={colors.accent}
              strokeWidth="2"
              opacity={0.8}
            />
            
            {/* Worker silhouette */}
            {hasWorker && (
              <g>
                {/* Desk */}
                <rect
                  x={x + 10}
                  y={y + 35}
                  width={30}
                  height={10}
                  fill={colors.accent}
                  opacity={0.6}
                />
                {/* Person (circle head + rect body) */}
                <circle
                  cx={x + 25}
                  cy={y + 25}
                  r={6}
                  fill="#333"
                />
                <rect
                  x={x + 19}
                  y={y + 30}
                  width={12}
                  height={8}
                  fill="#333"
                />
              </g>
            )}

            {/* Computer monitor (modern offices) */}
            {level.modernity >= 3 && hasWorker && (
              <rect
                x={x + 15}
                y={y + 30}
                width={8}
                height={6}
                fill={colors.accent}
                opacity={0.8}
              />
            )}
          </g>
        );
      }

      floors.push(
        <g key={`floor-${floor}`}>
          {/* Floor separator */}
          <line
            x1={40}
            y1={y}
            x2={40 + buildingWidth}
            y2={y}
            stroke={colors.accent}
            strokeWidth="3"
          />
          {windows}
        </g>
      );
    }

    return floors;
  };

  const buildingWidth = 300 + (level.size * 30);
  const buildingHeight = level.floors * 60;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="retro-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-neon-cyan" />
            <div>
              <p className="text-sm text-muted-foreground font-mono">
                {t('ui:headquarters.buildingSize')}
              </p>
              <p className="text-2xl font-bold text-neon-green">
                {t('ui:headquarters.level', { level: level.size })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="retro-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-neon-magenta" />
            <div>
              <p className="text-sm text-muted-foreground font-mono">
                {t('ui:headquarters.employees')}
              </p>
              <p className="text-2xl font-bold text-neon-green">
                {employees}
              </p>
            </div>
          </div>
        </Card>

        <Card className="retro-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-neon-green" />
            <div>
              <p className="text-sm text-muted-foreground font-mono">
                {t('ui:headquarters.revenue')}
              </p>
              <p className="text-2xl font-bold text-neon-cyan">
                {formatters.currency(revenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Headquarters Visualization */}
      <Card className="retro-border bg-card/50 p-6">
        <h2 className="text-2xl font-bold text-neon-green mb-4 font-mono">
          {t('ui:headquarters.title')}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          {t('ui:headquarters.description')}
        </p>

        <div className="w-full overflow-x-auto">
          <svg
            width="100%"
            height="500"
            viewBox={`0 0 ${Math.max(500, buildingWidth + 100)} 500`}
            className="mx-auto"
            style={{ minWidth: '400px' }}
          >
            {/* Ground */}
            <rect
              x="0"
              y="400"
              width="100%"
              height="100"
              fill="hsl(var(--muted))"
              opacity={0.3}
            />
            <line
              x1="0"
              y1="400"
              x2="100%"
              y2="400"
              stroke="hsl(var(--border))"
              strokeWidth="3"
            />

            {/* Building Base */}
            <rect
              x="40"
              y={400 - buildingHeight}
              width={buildingWidth}
              height={buildingHeight}
              fill={colors.building}
              stroke={colors.accent}
              strokeWidth="4"
            />

            {/* Roof */}
            <polygon
              points={`40,${400 - buildingHeight} ${40 + buildingWidth / 2},${400 - buildingHeight - 30} ${40 + buildingWidth},${400 - buildingHeight}`}
              fill={colors.accent}
              stroke={colors.accent}
              strokeWidth="2"
            />

            {/* Company Logo on Roof (for larger buildings) */}
            {level.size >= 5 && (
              <text
                x={40 + buildingWidth / 2}
                y={400 - buildingHeight - 10}
                fontSize="20"
                fill={colors.window}
                textAnchor="middle"
                fontWeight="bold"
              >
                ●
              </text>
            )}

            {/* Floors and Windows */}
            {renderFloors()}

            {/* Entrance Door */}
            <rect
              x={40 + buildingWidth / 2 - 30}
              y={350}
              width={60}
              height={50}
              fill={colors.accent}
              stroke={colors.accent}
              strokeWidth="2"
            />
            <text
              x={40 + buildingWidth / 2}
              y={380}
              fontSize="12"
              fill={colors.window}
              textAnchor="middle"
              fontWeight="bold"
            >
              ENTRANCE
            </text>

            {/* Parking lot for modern buildings */}
            {level.modernity >= 3 && (
              <g>
                {[...Array(Math.min(5, Math.floor(level.size / 2)))].map((_, i) => (
                  <rect
                    key={`car-${i}`}
                    x={40 + buildingWidth + 20 + (i * 30)}
                    y={370}
                    width={25}
                    height={15}
                    fill={colors.accent}
                    opacity={0.6}
                    stroke={colors.building}
                    strokeWidth="1"
                  />
                ))}
              </g>
            )}

            {/* Era Label */}
            <text
              x="10"
              y="30"
              fontSize="16"
              fill="hsl(var(--muted-foreground))"
              fontFamily="monospace"
            >
              {t('ui:headquarters.era', { year })}
            </text>
          </svg>
        </div>

        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground font-mono text-center">
            {level.size < 3 && t('ui:headquarters.stage.startup')}
            {level.size >= 3 && level.size < 6 && t('ui:headquarters.stage.growing')}
            {level.size >= 6 && level.size < 9 && t('ui:headquarters.stage.established')}
            {level.size >= 9 && t('ui:headquarters.stage.corporation')}
          </p>
        </div>
      </Card>
    </div>
  );
};
