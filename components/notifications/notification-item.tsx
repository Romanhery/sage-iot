"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, Droplets, Thermometer, Sun } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { markNotificationRead } from "@/app/actions/notifications"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

interface NotificationItemProps {
  notification: {
    id: string
    plant_id: string
    title: string
    message: string
    read: boolean
    created_at: string
  }
  plantName: string
}

export function NotificationItem({ notification, plantName }: NotificationItemProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const getIcon = () => {
    const title = notification.title.toLowerCase()
    if (title.includes("water") || title.includes("moisture")) {
      return <Droplets className="w-5 h-5" />
    }
    if (title.includes("temperature") || title.includes("temp")) {
      return <Thermometer className="w-5 h-5" />
    }
    if (title.includes("light")) {
      return <Sun className="w-5 h-5" />
    }
    return <AlertCircle className="w-5 h-5" />
  }

  const handleClick = () => {
    if (!notification.read) {
      startTransition(async () => {
        await markNotificationRead(notification.id)
        router.refresh()
      })
    }
    router.push(`/plants/${notification.plant_id}`)
  }

  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:border-primary ${
        !notification.read ? "bg-accent/5 border-accent/20" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            !notification.read ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
          }`}
        >
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-foreground text-sm">{notification.title}</h3>
            {!notification.read && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">{notification.message}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{plantName}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
