"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface AIAnalysisButtonProps {
  plantId: string
}

export function AIAnalysisButton({ plantId }: AIAnalysisButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<string>("")
  const router = useRouter()

  const handleAnalyze = () => {
    startTransition(async () => {
      setStatus("Analyzing...")

      try {
        const response = await fetch("/api/ai/analyze-plant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plant_id: plantId }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus("Analysis complete!")
          setTimeout(() => {
            setStatus("")
            router.refresh()
          }, 2000)
        } else {
          setStatus("Analysis failed")
          setTimeout(() => setStatus(""), 3000)
        }
      } catch (error) {
        console.error("[v0] Error analyzing plant:", error)
        setStatus("Error occurred")
        setTimeout(() => setStatus(""), 3000)
      }
    })
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleAnalyze} disabled={isPending} className="w-full bg-accent hover:bg-accent/90 text-white">
        <Sparkles className="w-4 h-4 mr-2" />
        {isPending ? "Analyzing..." : "Generate AI Prediction"}
      </Button>
      {status && <p className="text-sm text-center text-muted-foreground">{status}</p>}
    </div>
  )
}
