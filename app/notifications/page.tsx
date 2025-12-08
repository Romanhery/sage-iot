import { createClient } from "@/lib/supabase/server"
import { NotificationItem } from "@/components/notifications/notification-item"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { markAllNotificationsRead } from "@/app/actions/notifications"

export default async function NotificationsPage() {
  const supabase = await createClient()

  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      plants(name, plant_type)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <Button variant="outline" size="sm">
                  Mark All Read
                </Button>
              </form>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {!notifications || notifications.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  plantName={notification.plants?.name || "Unknown Plant"}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
