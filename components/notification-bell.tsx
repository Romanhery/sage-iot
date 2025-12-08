import { Bell } from "lucide-react"
import Link from "next/link"

interface NotificationBellProps {
  count: number
}

export function NotificationBell({ count }: NotificationBellProps) {
  return (
    <Link href="/notifications" className="relative">
      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
        <Bell className="w-5 h-5 text-foreground" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </div>
    </Link>
  )
}
