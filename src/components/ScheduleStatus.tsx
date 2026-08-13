import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Clock } from "lucide-react";

const DAY_NAMES_RO = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];

type ScheduleEntry = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

function isCurrentlyOpen(schedule: ScheduleEntry[]): { open: boolean; closesAt?: string; opensAt?: string; nextDay?: string } {
  const now = new Date();
  const currentDay = now.getDay(); // 0=Sun, 1=Mon, ...
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const today = schedule.find((s) => s.dayOfWeek === currentDay);
  if (!today || today.isClosed) {
    // Find next open day
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDay + i) % 7;
      const nextDaySchedule = schedule.find((s) => s.dayOfWeek === nextDayIndex);
      if (nextDaySchedule && !nextDaySchedule.isClosed) {
        return { open: false, opensAt: nextDaySchedule.openTime, nextDay: DAY_NAMES_RO[nextDayIndex] };
      }
    }
    return { open: false };
  }

  if (currentTime >= today.openTime && currentTime < today.closeTime) {
    return { open: true, closesAt: today.closeTime };
  }

  if (currentTime < today.openTime) {
    return { open: false, opensAt: today.openTime, nextDay: "azi" };
  }

  // After closing time today, find next open day
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDay + i) % 7;
    const nextDaySchedule = schedule.find((s) => s.dayOfWeek === nextDayIndex);
    if (nextDaySchedule && !nextDaySchedule.isClosed) {
      return { open: false, opensAt: nextDaySchedule.openTime, nextDay: DAY_NAMES_RO[nextDayIndex] };
    }
  }
  return { open: false };
}

/**
 * Compact "open/closed" status badge for navbar or header areas
 */
export function OpenStatusBadge() {
  const schedule = useQuery(api.schedule.get, {});

  if (!schedule) return null;

  const status = isCurrentlyOpen(schedule);

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${status.open ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
      <span className={`text-[10px] font-semibold tracking-wide uppercase ${status.open ? "text-green-600" : "text-red-500"}`}>
        {status.open ? "Deschis" : "Închis"}
      </span>
    </div>
  );
}

/**
 * Full schedule display with open/closed status and weekly hours
 */
export function ScheduleDisplay({ variant = "light" }: { variant?: "light" | "dark" }) {
  const schedule = useQuery(api.schedule.get, {});

  if (!schedule) return null;

  const status = isCurrentlyOpen(schedule);
  const today = new Date().getDay();

  const textColor = variant === "dark" ? "text-white" : "text-[#14253a]";
  const mutedColor = variant === "dark" ? "text-white/50" : "text-muted-foreground";
  const borderColor = variant === "dark" ? "border-white/10" : "border-foreground/10";
  const bgActive = variant === "dark" ? "bg-white/5" : "bg-primary/5";

  return (
    <div className="space-y-4">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-3 py-1.5 border ${status.open ? "border-green-300 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${status.open ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
          <span className={`text-xs font-bold tracking-wide ${status.open ? "text-green-700" : "text-red-600"}`}>
            {status.open ? "DESCHIS ACUM" : "ÎNCHIS ACUM"}
          </span>
        </div>
        <span className={`text-xs ${mutedColor}`}>
          {status.open
            ? `Se închide la ${status.closesAt}`
            : status.opensAt
              ? `Deschidem ${status.nextDay} la ${status.opensAt}`
              : ""}
        </span>
      </div>

      {/* Weekly schedule */}
      <div className={`border ${borderColor} divide-y ${borderColor}`}>
        {schedule.map((day) => {
          const isToday = day.dayOfWeek === today;
          return (
            <div
              key={day.dayOfWeek}
              className={`flex items-center justify-between px-4 py-2.5 ${isToday ? bgActive : ""}`}
            >
              <div className="flex items-center gap-2.5">
                {isToday && <Clock size={12} className="text-primary" />}
                <span className={`text-sm ${isToday ? `font-semibold ${textColor}` : mutedColor}`}>
                  {DAY_NAMES_RO[day.dayOfWeek]}
                </span>
              </div>
              <span className={`text-sm font-mono ${day.isClosed ? "text-red-400" : isToday ? `font-semibold ${textColor}` : mutedColor}`}>
                {day.isClosed ? "Închis" : `${day.openTime} – ${day.closeTime}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { DAY_NAMES_RO, isCurrentlyOpen };
export type { ScheduleEntry };
