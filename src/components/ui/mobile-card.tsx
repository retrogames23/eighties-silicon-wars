import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface MobileCardProps extends React.ComponentProps<typeof Card> {
  title?: string;
  children: React.ReactNode;
  compact?: boolean;
}

export const MobileCard = React.forwardRef<
  HTMLDivElement,
  MobileCardProps
>(({ className, title, children, compact = false, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <Card 
      ref={ref} 
      className={cn(
        "retro-border bg-card/50 backdrop-blur-sm",
        isMobile && compact ? "p-3" : "p-4",
        className
      )} 
      {...props}
    >
      {title && (
        <CardHeader className={cn(isMobile ? "pb-2" : "pb-4")}>
          <CardTitle className={cn(
            "neon-text text-primary",
            isMobile ? "text-lg" : "text-xl"
          )}>
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(isMobile && compact ? "p-0" : "")}>
        {children}
      </CardContent>
    </Card>
  );
});

MobileCard.displayName = "MobileCard";