import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AIPredictionsProps {
  predictions: Array<{
    id: string
    prediction_type: string
    prediction_text: string
    confidence: number
    created_at: string
  }>
}

export function AIPredictions({ predictions }: AIPredictionsProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "watering":
        return "bg-accent/10 text-accent border-accent"
      case "light":
        return "bg-warning/10 text-warning border-warning"
      case "temperature":
        return "bg-destructive/10 text-destructive border-destructive"
      default:
        return "bg-primary/10 text-primary border-primary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <CardTitle className="text-lg">AI Predictions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {predictions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No predictions available yet</p>
        ) : (
          predictions.map((prediction) => (
            <div key={prediction.id} className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-md border ${getTypeColor(prediction.prediction_type)}`}
                >
                  {prediction.prediction_type}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(prediction.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{prediction.prediction_text}</p>
              <div className="mt-2 flex items-center gap-1">
                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${prediction.confidence * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{(prediction.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
