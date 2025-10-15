import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Building2, Users, TrendingUp } from "lucide-react";
import { formatters } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";

interface HeadquartersTabProps {
  cash: number;
  employees: number;
  revenue: number;
  quarter: number;
  year: number;
}

interface Employee {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  floor: number;
  room: number;
  direction: 'left' | 'right';
  role: 'worker' | 'manager' | 'developer';
}

export const HeadquartersTab = ({ 
  cash, 
  employees, 
  revenue,
  quarter,
  year 
}: HeadquartersTabProps) => {
  const { t } = useTranslation(['ui']);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);

  // Calculate headquarters level based on revenue and employees
  const getHeadquartersLevel = () => {
    const totalQuarters = (year - 1980) * 4 + quarter;
    const revenueScore = Math.min(revenue / 10000000, 1);
    const employeeScore = Math.min(employees / 100, 1);
    const timeScore = Math.min(totalQuarters / 40, 1);
    
    return {
      size: Math.floor((revenueScore + employeeScore) * 5),
      modernity: Math.floor(timeScore * 5),
      floors: Math.max(1, Math.floor((revenueScore + employeeScore) * 4)),
      workers: Math.max(3, Math.min(20, Math.floor(employees / 5)))
    };
  };

  const level = getHeadquartersLevel();

  const getColorScheme = () => {
    const schemes = [
      { building: "#8B7355", window: "#FFE4B5", accent: "#CD853F" },
      { building: "#A9A9A9", window: "#87CEEB", accent: "#4682B4" },
      { building: "#696969", window: "#B0E0E6", accent: "#5F9EA0" },
      { building: "#708090", window: "#ADD8E6", accent: "#4169E1" },
      { building: "#2F4F4F", window: "#00CED1", accent: "#00BFFF" },
      { building: "#1C1C1C", window: "#00FFFF", accent: "#0FF" }
    ];
    return schemes[Math.min(level.modernity, schemes.length - 1)];
  };

  // Initialize employees
  useEffect(() => {
    const newEmployees: Employee[] = [];
    const floorHeight = 80;
    const roomWidth = 150;
    
    for (let i = 0; i < level.workers; i++) {
      const floor = Math.floor(Math.random() * level.floors);
      const room = Math.floor(Math.random() * 4);
      const x = 60 + room * roomWidth + Math.random() * 100;
      const y = 500 - (floor * floorHeight) - 40;
      
      const roles: Employee['role'][] = ['worker', 'worker', 'worker', 'developer', 'manager'];
      
      newEmployees.push({
        id: i,
        x,
        y,
        targetX: x,
        targetY: y,
        speed: 0.3 + Math.random() * 0.5,
        floor,
        room,
        direction: Math.random() > 0.5 ? 'left' : 'right',
        role: roles[Math.floor(Math.random() * roles.length)]
      });
    }
    setEmployeeList(newEmployees);
  }, [level.workers, level.floors]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const floorHeight = 80;
    const roomWidth = 150;
    const buildingWidth = 600;
    const colors = getColorScheme();

    let animationFrame: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.fillRect(0, 500, canvas.width, 100);
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 500);
      ctx.lineTo(canvas.width, 500);
      ctx.stroke();

      // Draw building background
      ctx.fillStyle = colors.building;
      ctx.fillRect(40, 500 - level.floors * floorHeight, buildingWidth, level.floors * floorHeight);
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 500 - level.floors * floorHeight, buildingWidth, level.floors * floorHeight);

      // Draw roof
      ctx.fillStyle = colors.accent;
      ctx.beginPath();
      ctx.moveTo(40, 500 - level.floors * floorHeight);
      ctx.lineTo(340, 500 - level.floors * floorHeight - 30);
      ctx.lineTo(640, 500 - level.floors * floorHeight);
      ctx.closePath();
      ctx.fill();

      // Company logo on roof
      if (level.size >= 5) {
        ctx.fillStyle = colors.window;
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('●', 340, 500 - level.floors * floorHeight - 10);
      }

      // Draw floors and rooms
      for (let floor = 0; floor < level.floors; floor++) {
        const y = 500 - floor * floorHeight;
        
        // Floor line
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(40 + buildingWidth, y);
        ctx.stroke();

        // Rooms
        for (let room = 0; room < 4; room++) {
          const roomX = 40 + room * roomWidth;
          
          // Room separator
          if (room > 0) {
            ctx.strokeStyle = colors.accent + '40';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(roomX, y - floorHeight);
            ctx.lineTo(roomX, y);
            ctx.stroke();
          }

          // Windows
          ctx.fillStyle = colors.window;
          ctx.globalAlpha = 0.8;
          ctx.fillRect(roomX + 15, y - floorHeight + 10, 50, 30);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 2;
          ctx.strokeRect(roomX + 15, y - floorHeight + 10, 50, 30);

          // Window panes
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(roomX + 40, y - floorHeight + 10);
          ctx.lineTo(roomX + 40, y - floorHeight + 40);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(roomX + 15, y - floorHeight + 25);
          ctx.lineTo(roomX + 65, y - floorHeight + 25);
          ctx.stroke();

          // Furniture (desks)
          if (level.modernity >= 2) {
            ctx.fillStyle = colors.accent + '80';
            ctx.fillRect(roomX + 80, y - 25, 40, 15);
            
            // Computer monitor
            if (level.modernity >= 3) {
              ctx.fillStyle = '#333';
              ctx.fillRect(roomX + 90, y - 35, 12, 10);
              ctx.fillStyle = colors.window;
              ctx.fillRect(roomX + 91, y - 34, 10, 8);
              
              // Screen glow
              ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
              ctx.fillRect(roomX + 91, y - 34, 10, 8);
            }
          }

          // Plants (modern offices)
          if (level.modernity >= 4 && room % 2 === 0) {
            ctx.fillStyle = '#2d8659';
            ctx.beginPath();
            ctx.arc(roomX + 25, y - 15, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1e5a3d';
            ctx.beginPath();
            ctx.arc(roomX + 25, y - 20, 5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Coffee machine (modern offices)
          if (level.modernity >= 5 && room === 1 && floor === 0) {
            ctx.fillStyle = '#654321';
            ctx.fillRect(roomX + 130, y - 30, 15, 25);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(roomX + 132, y - 28, 11, 5);
          }
        }
      }

      // Draw entrance door
      const doorX = 40 + buildingWidth / 2 - 30;
      ctx.fillStyle = colors.accent;
      ctx.fillRect(doorX, 450, 60, 50);
      ctx.strokeStyle = colors.building;
      ctx.lineWidth = 3;
      ctx.strokeRect(doorX, 450, 60, 50);
      ctx.fillStyle = colors.window;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ENTRANCE', doorX + 30, 480);

      // Parking lot
      if (level.modernity >= 3) {
        const carCount = Math.min(5, Math.floor(level.size / 2));
        for (let i = 0; i < carCount; i++) {
          const carX = 40 + buildingWidth + 20 + (i * 35);
          ctx.fillStyle = colors.accent;
          ctx.globalAlpha = 0.6;
          ctx.fillRect(carX, 470, 28, 18);
          ctx.globalAlpha = 1;
          ctx.strokeStyle = colors.building;
          ctx.lineWidth = 1;
          ctx.strokeRect(carX, 470, 28, 18);
          
          // Windows
          ctx.fillStyle = colors.window;
          ctx.fillRect(carX + 2, 472, 10, 8);
          ctx.fillRect(carX + 16, 472, 10, 8);
          
          // Wheels
          ctx.fillStyle = '#333';
          ctx.beginPath();
          ctx.arc(carX + 5, 488, 3, 0, Math.PI * 2);
          ctx.arc(carX + 23, 488, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw and update employees
      setEmployeeList(prevEmployees => {
        return prevEmployees.map(emp => {
          // Move towards target
          const dx = emp.targetX - emp.x;
          const dy = emp.targetY - emp.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 2) {
            // Choose new target
            const newRoom = Math.floor(Math.random() * 4);
            const newX = 60 + newRoom * roomWidth + Math.random() * 80;
            return {
              ...emp,
              targetX: newX,
              targetY: emp.y,
              direction: newX > emp.x ? 'right' : 'left',
              room: newRoom
            };
          }

          const newX = emp.x + (dx / distance) * emp.speed;
          const newY = emp.y + (dy / distance) * emp.speed;

          // Draw employee
          const employeeColors = {
            worker: '#4A90E2',
            developer: '#9B59B6',
            manager: '#E74C3C'
          };

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.beginPath();
          ctx.ellipse(newX, newY + 12, 6, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Body
          ctx.fillStyle = employeeColors[emp.role];
          ctx.fillRect(newX - 6, newY - 15, 12, 18);
          
          // Body outline
          ctx.strokeStyle = '#2C3E50';
          ctx.lineWidth = 1;
          ctx.strokeRect(newX - 6, newY - 15, 12, 18);

          // Head
          ctx.fillStyle = '#FFD1A3';
          ctx.beginPath();
          ctx.arc(newX, newY - 20, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#D4A574';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Eyes
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(newX - 2, newY - 21, 1, 0, Math.PI * 2);
          ctx.arc(newX + 2, newY - 21, 1, 0, Math.PI * 2);
          ctx.fill();

          // Legs (walking animation)
          const walkCycle = Math.sin(Date.now() * 0.01 + emp.id) * 3;
          ctx.strokeStyle = '#2C3E50';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(newX - 3, newY + 3);
          ctx.lineTo(newX - 3, newY + 10 + walkCycle);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(newX + 3, newY + 3);
          ctx.lineTo(newX + 3, newY + 10 - walkCycle);
          ctx.stroke();

          // Arms (walking animation)
          const armCycle = Math.sin(Date.now() * 0.01 + emp.id + Math.PI) * 2;
          ctx.beginPath();
          ctx.moveTo(newX - 6, newY - 10);
          ctx.lineTo(newX - 9, newY - 5 + armCycle);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(newX + 6, newY - 10);
          ctx.lineTo(newX + 9, newY - 5 - armCycle);
          ctx.stroke();

          // Role indicator (badge)
          if (emp.role === 'manager') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(newX - 4, newY - 8, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (emp.role === 'developer') {
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(newX - 5, newY - 9, 3, 3);
          }

          return { ...emp, x: newX, y: newY };
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [level.floors, level.modernity, level.workers, getColorScheme]);

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neon-green font-mono">
            {t('ui:headquarters.title')}
          </h2>
          <p className="text-sm text-muted-foreground font-mono">
            {t('ui:headquarters.era', { year })}
          </p>
        </div>
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          {t('ui:headquarters.description')}
        </p>

        <div className="w-full overflow-x-auto bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-900 dark:to-sky-950 rounded-lg p-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="mx-auto rounded-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>

        <div className="mt-6 p-4 bg-muted/20 rounded-lg">
          <p className="text-sm text-muted-foreground font-mono text-center">
            {level.size < 3 && t('ui:headquarters.stage.startup')}
            {level.size >= 3 && level.size < 6 && t('ui:headquarters.stage.growing')}
            {level.size >= 6 && level.size < 9 && t('ui:headquarters.stage.established')}
            {level.size >= 9 && t('ui:headquarters.stage.corporation')}
          </p>
          
          <div className="flex justify-center gap-4 mt-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#4A90E2] border border-gray-700"></div>
              <span className="text-muted-foreground">Worker</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#9B59B6] border border-gray-700"></div>
              <span className="text-muted-foreground">Developer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#E74C3C] border border-gray-700"></div>
              <span className="text-muted-foreground">Manager</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};