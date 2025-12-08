"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { AlertTriangle, Droplets, ThermometerSun, Info } from "lucide-react"

interface RealtimeNotificationsProps {
    userId?: string
}

export function RealtimeNotifications({ userId }: RealtimeNotificationsProps) {
    const supabaseRef = useRef(createClient())
    const hasSubscribedRef = useRef(false)

    useEffect(() => {
        if (hasSubscribedRef.current) return

        const supabase = supabaseRef.current

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    ...(userId ? { filter: `user_id=eq.${userId}` } : {}),
                },
                (payload) => {
                    const notification = payload.new as {
                        id: string
                        title: string
                        message: string
                        notification_type: 'alert' | 'warning' | 'info'
                    }

                    // Get icon based on type
                    let Icon = Info
                    let variant: 'default' | 'destructive' = 'default'

                    if (notification.notification_type === 'alert') {
                        Icon = AlertTriangle
                        variant = 'destructive'
                    } else if (notification.notification_type === 'warning') {
                        Icon = ThermometerSun
                    }

                    // Check message content for specific icons
                    if (notification.message.toLowerCase().includes('water') ||
                        notification.message.toLowerCase().includes('moisture')) {
                        Icon = Droplets
                    }
                    if (notification.message.toLowerCase().includes('temp')) {
                        Icon = ThermometerSun
                    }

                    // Show toast notification
                    toast(notification.title, {
                        description: notification.message,
                        icon: <Icon className="w-4 h-4" />,
                        duration: 8000,
                        action: notification.notification_type === 'alert' ? {
                            label: 'View',
                            onClick: () => window.location.href = '/notifications'
                        } : undefined,
                    })
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[Realtime] Connected to notifications channel')
                    hasSubscribedRef.current = true
                }
            })

        return () => {
            channel.unsubscribe()
            hasSubscribedRef.current = false
        }
    }, [userId])

    // This component doesn't render anything visible
    return null
}
