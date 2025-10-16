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
      { 
        building: "#8B7355", 
        wall: "#A0826D",
        floor: "#6B5D52",
        ceiling: "#9B8672",
        window: "#87CEEB", 
        furniture: "#8B4513",
        accent: "#CD853F",
        door: "#654321"
      },
      { 
        building: "#7A6F5D", 
        wall: "#C4B5A0",
        floor: "#5A5145",
        ceiling: "#8B7D6B",
        window: "#B0C4DE", 
        furniture: "#654321",
        accent: "#8B7355",
        door: "#4A3728"
      },
      { 
        building: "#696969", 
        wall: "#D3D3D3",
        floor: "#505050",
        ceiling: "#A9A9A9",
        window: "#ADD8E6", 
        furniture: "#8B7355",
        accent: "#778899",
        door: "#556B2F"
      },
      { 
        building: "#5F6A6A", 
        wall: "#ECF0F1",
        floor: "#34495E",
        ceiling: "#95A5A6",
        window: "#3498DB", 
        furniture: "#34495E",
        accent: "#3498DB",
        door: "#2C3E50"
      },
      { 
        building: "#2C3E50", 
        wall: "#FAFAFA",
        floor: "#1C2833",
        ceiling: "#566573",
        window: "#5DADE2", 
        furniture: "#2C3E50",
        accent: "#3498DB",
        door: "#17202A"
      },
      { 
        building: "#1A1A1A", 
        wall: "#FFFFFF",
        floor: "#0D0D0D",
        ceiling: "#2C2C2C",
        window: "#00D9FF", 
        furniture: "#1A1A1A",
        accent: "#00BFFF",
        door: "#000000"
      }
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
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(0, 500, canvas.width, 100);
      ctx.fillStyle = '#6B5D52';
      ctx.fillRect(0, 500, canvas.width, 10);
      
      // Grass pattern
      ctx.fillStyle = '#7A9B57';
      for (let i = 0; i < 20; i++) {
        const gx = Math.random() * canvas.width;
        ctx.fillRect(gx, 510 + Math.random() * 90, 2, 3);
      }

      // Draw building exterior
      ctx.fillStyle = colors.building;
      ctx.fillRect(50, 500 - level.floors * floorHeight, buildingWidth, level.floors * floorHeight);
      
      // Building outline
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 500 - level.floors * floorHeight, buildingWidth, level.floors * floorHeight);

      // Draw floors
      for (let floor = 0; floor < level.floors; floor++) {
        const y = 500 - floor * floorHeight;
        
        // Floor/ceiling
        ctx.fillStyle = colors.ceiling;
        ctx.fillRect(50, y - floorHeight, buildingWidth, 8);
        ctx.fillStyle = colors.floor;
        ctx.fillRect(50, y - 8, buildingWidth, 8);
        
        // Floor outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(50 + buildingWidth, y);
        ctx.stroke();

        // Rooms
        for (let room = 0; room < 4; room++) {
          const roomX = 50 + room * roomWidth;
          
          // Room background (wall color)
          ctx.fillStyle = colors.wall;
          ctx.fillRect(roomX, y - floorHeight + 8, roomWidth, floorHeight - 16);
          
          // Room divider walls
          if (room > 0) {
            ctx.fillStyle = '#999';
            ctx.fillRect(roomX - 2, y - floorHeight + 8, 4, floorHeight - 16);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(roomX - 2, y - floorHeight + 8, 4, floorHeight - 16);
          }

          // Back wall windows
          const windowY = y - floorHeight + 15;
          const windowHeight = 35;
          const windowWidth = 45;
          
          // Window frame
          ctx.fillStyle = '#666';
          ctx.fillRect(roomX + 10, windowY, windowWidth, windowHeight);
          
          // Window glass
          ctx.fillStyle = colors.window;
          ctx.globalAlpha = 0.7;
          ctx.fillRect(roomX + 13, windowY + 3, windowWidth - 6, windowHeight - 6);
          ctx.globalAlpha = 1;
          
          // Window panes
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(roomX + 32, windowY);
          ctx.lineTo(roomX + 32, windowY + windowHeight);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(roomX + 10, windowY + windowHeight / 2);
          ctx.lineTo(roomX + 55, windowY + windowHeight / 2);
          ctx.stroke();

          // Room-specific furniture
          const roomType = (floor * 4 + room) % 5;
          
          if (roomType === 0) {
            // Office with desk
            // Desk
            ctx.fillStyle = colors.furniture;
            ctx.fillRect(roomX + 65, y - 30, 55, 20);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(roomX + 65, y - 30, 55, 20);
            
            // Desk legs
            ctx.fillRect(roomX + 68, y - 10, 3, 10);
            ctx.fillRect(roomX + 115, y - 10, 3, 10);
            
            // Chair
            ctx.fillStyle = '#4A4A4A';
            ctx.fillRect(roomX + 120, y - 25, 15, 15);
            ctx.fillRect(roomX + 125, y - 35, 5, 10);
            
            // Computer
            if (level.modernity >= 2) {
              ctx.fillStyle = '#2C2C2C';
              ctx.fillRect(roomX + 75, y - 42, 18, 12);
              ctx.fillStyle = '#87CEEB';
              ctx.globalAlpha = 0.8;
              ctx.fillRect(roomX + 76, y - 41, 16, 10);
              ctx.globalAlpha = 1;
              
              // Keyboard
              ctx.fillStyle = '#E0E0E0';
              ctx.fillRect(roomX + 95, y - 28, 20, 6);
            }
            
            // Filing cabinet
            ctx.fillStyle = '#A0A0A0';
            ctx.fillRect(roomX + 130, y - 35, 15, 35);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(roomX + 130, y - 35, 15, 35);
            for (let d = 0; d < 3; d++) {
              ctx.fillStyle = '#666';
              ctx.fillRect(roomX + 135, y - 32 + d * 11, 5, 2);
            }
            
          } else if (roomType === 1) {
            // Conference room
            // Table
            ctx.fillStyle = colors.furniture;
            ctx.fillRect(roomX + 60, y - 35, 70, 25);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(roomX + 60, y - 35, 70, 25);
            
            // Chairs around table
            for (let c = 0; c < 3; c++) {
              ctx.fillStyle = '#4A4A4A';
              ctx.fillRect(roomX + 65 + c * 20, y - 8, 12, 8);
            }
            
            // Whiteboard
            if (level.modernity >= 3) {
              ctx.fillStyle = '#FFF';
              ctx.fillRect(roomX + 10, y - 50, 40, 25);
              ctx.strokeStyle = '#333';
              ctx.lineWidth = 2;
              ctx.strokeRect(roomX + 10, y - 50, 40, 25);
            }
            
          } else if (roomType === 2) {
            // Developer room
            // L-shaped desk
            ctx.fillStyle = colors.furniture;
            ctx.fillRect(roomX + 60, y - 35, 60, 20);
            ctx.fillRect(roomX + 60, y - 35, 20, 30);
            
            // Multiple monitors
            if (level.modernity >= 3) {
              for (let m = 0; m < 2; m++) {
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(roomX + 70 + m * 25, y - 50, 20, 15);
                ctx.fillStyle = '#00FF00';
                ctx.globalAlpha = 0.6;
                ctx.fillRect(roomX + 71 + m * 25, y - 49, 18, 13);
                ctx.globalAlpha = 1;
              }
            }
            
            // Server rack
            ctx.fillStyle = '#333';
            ctx.fillRect(roomX + 125, y - 45, 18, 45);
            for (let s = 0; s < 6; s++) {
              ctx.fillStyle = s % 2 === 0 ? '#00FF00' : '#FF0000';
              ctx.fillRect(roomX + 128, y - 42 + s * 7, 3, 3);
            }
            
          } else if (roomType === 3) {
            // Break room
            // Couch
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(roomX + 65, y - 25, 50, 20);
            ctx.fillRect(roomX + 65, y - 30, 50, 5);
            ctx.fillRect(roomX + 60, y - 30, 5, 25);
            ctx.fillRect(roomX + 115, y - 30, 5, 25);
            
            // Coffee table
            ctx.fillStyle = colors.furniture;
            ctx.fillRect(roomX + 75, y - 12, 30, 12);
            
            // Plant
            if (level.modernity >= 2) {
              ctx.fillStyle = '#8B4513';
              ctx.fillRect(roomX + 125, y - 15, 12, 15);
              ctx.fillStyle = '#228B22';
              ctx.beginPath();
              ctx.arc(roomX + 131, y - 25, 10, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#2E7D32';
              ctx.beginPath();
              ctx.arc(roomX + 126, y - 28, 7, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.arc(roomX + 136, y - 28, 7, 0, Math.PI * 2);
              ctx.fill();
            }
            
          } else {
            // Open workspace
            for (let d = 0; d < 2; d++) {
              // Desk
              ctx.fillStyle = colors.furniture;
              ctx.fillRect(roomX + 65 + d * 35, y - 30, 30, 18);
              
              // Computer
              if (level.modernity >= 1) {
                ctx.fillStyle = '#2C2C2C';
                ctx.fillRect(roomX + 70 + d * 35, y - 42, 15, 12);
                ctx.fillStyle = '#87CEEB';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(roomX + 71 + d * 35, y - 41, 13, 10);
                ctx.globalAlpha = 1;
              }
            }
          }

          // Door
          if (room === 0 || room === 2) {
            ctx.fillStyle = colors.door;
            ctx.fillRect(roomX + roomWidth - 25, y - 48, 20, 48);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(roomX + roomWidth - 25, y - 48, 20, 48);
            // Door handle
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(roomX + roomWidth - 10, y - 24, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Draw entrance at ground level
      const entranceX = 50 + buildingWidth / 2 - 35;
      const entranceWidth = 70;
      
      // Entrance doors (glass)
      ctx.fillStyle = 'rgba(135, 206, 235, 0.4)';
      ctx.fillRect(entranceX, 455, entranceWidth, 45);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.strokeRect(entranceX, 455, entranceWidth, 45);
      
      // Door frame
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(entranceX + entranceWidth / 2, 455);
      ctx.lineTo(entranceX + entranceWidth / 2, 500);
      ctx.stroke();
      
      // Door handles
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(entranceX + 15, 475, 8, 3);
      ctx.fillRect(entranceX + entranceWidth - 23, 475, 8, 3);

      // Stairs (if multiple floors)
      if (level.floors > 1) {
        for (let floor = 0; floor < level.floors - 1; floor++) {
          const stairX = 630;
          const stairY = 500 - floor * floorHeight;
          
          // Staircase background
          ctx.fillStyle = '#888';
          ctx.fillRect(stairX, stairY - floorHeight, 30, floorHeight);
          
          // Steps
          ctx.strokeStyle = '#555';
          ctx.lineWidth = 1;
          for (let step = 0; step < 8; step++) {
            const sy = stairY - (step * (floorHeight / 8));
            ctx.beginPath();
            ctx.moveTo(stairX, sy);
            ctx.lineTo(stairX + 30, sy);
            ctx.stroke();
          }
          
          // Handrail
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(stairX + 5, stairY);
          ctx.lineTo(stairX + 25, stairY - floorHeight);
          ctx.stroke();
        }
      }

      // Parking lot
      if (level.modernity >= 3) {
        const carCount = Math.min(4, Math.floor(level.size / 2));
        for (let i = 0; i < carCount; i++) {
          const carX = 680 + (i * 30);
          const carY = 470;
          
          // Car body
          ctx.fillStyle = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'][i % 4];
          ctx.fillRect(carX, carY, 25, 18);
          ctx.fillRect(carX + 3, carY - 8, 19, 8);
          
          // Windows
          ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
          ctx.fillRect(carX + 4, carY - 7, 8, 6);
          ctx.fillRect(carX + 13, carY - 7, 8, 6);
          
          // Wheels
          ctx.fillStyle = '#1A1A1A';
          ctx.beginPath();
          ctx.arc(carX + 6, carY + 18, 4, 0, Math.PI * 2);
          ctx.arc(carX + 19, carY + 18, 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Wheel rims
          ctx.fillStyle = '#888';
          ctx.beginPath();
          ctx.arc(carX + 6, carY + 18, 2, 0, Math.PI * 2);
          ctx.arc(carX + 19, carY + 18, 2, 0, Math.PI * 2);
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