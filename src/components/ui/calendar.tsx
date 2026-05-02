// Placeholder: react-day-picker v9 has breaking changes from v8.
// Currently unused in the project. Re-implement using v9 API when needed.
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, ...props }: CalendarProps) {
  return <DayPicker className={cn("p-3", className)} {...props} />;
}
Calendar.displayName = "Calendar";
