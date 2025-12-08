"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplets, Sun, Thermometer, ChevronLeft, ChevronRight, Check } from "lucide-react"

interface PlantPreset {
    id: number
    species_name: string
    common_name: string
    ideal_moisture_min: number
    ideal_moisture_max: number
    ideal_temp_min: number
    ideal_temp_max: number
    ideal_light_hours: number
    image_url: string | null
    description: string | null
    care_tips: string | null
}

interface PlantPresetsCarouselProps {
    onSelect: (preset: PlantPreset) => void
    selectedId?: number
}

export function PlantPresetsCarousel({ onSelect, selectedId }: PlantPresetsCarouselProps) {
    const [presets, setPresets] = useState<PlantPreset[]>([])
    const [loading, setLoading] = useState(true)
    const [scrollIndex, setScrollIndex] = useState(0)

    useEffect(() => {
        async function fetchPresets() {
            try {
                const response = await fetch('/api/plant-presets')
                const data = await response.json()
                if (data.presets) {
                    setPresets(data.presets)
                }
            } catch (err) {
                console.error('Failed to fetch presets:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchPresets()
    }, [])

    const visibleCount = 3
    const canScrollLeft = scrollIndex > 0
    const canScrollRight = scrollIndex < presets.length - visibleCount

    const scrollLeft = () => {
        if (canScrollLeft) setScrollIndex(scrollIndex - 1)
    }

    const scrollRight = () => {
        if (canScrollRight) setScrollIndex(scrollIndex + 1)
    }

    if (loading) {
        return (
            <div className="space-y-3">
                <h3 className="text-sm font-medium">Popular Plants</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    if (presets.length === 0) {
        return null
    }

    const visiblePresets = presets.slice(scrollIndex, scrollIndex + visibleCount)

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Choose a Plant Type</h3>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={scrollLeft}
                        disabled={!canScrollLeft}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {visiblePresets.map(preset => (
                    <Card
                        key={preset.id}
                        className={`cursor-pointer transition-all hover:border-primary relative overflow-hidden ${selectedId === preset.id ? 'border-primary ring-2 ring-primary/20' : ''
                            }`}
                        onClick={() => onSelect(preset)}
                    >
                        {selectedId === preset.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                        )}

                        {preset.image_url && (
                            <div className="h-20 overflow-hidden">
                                <img
                                    src={preset.image_url}
                                    alt={preset.common_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <CardContent className="p-3">
                            <h4 className="font-medium text-sm truncate">{preset.common_name}</h4>
                            <p className="text-xs text-muted-foreground truncate italic">{preset.species_name}</p>

                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-0.5" title="Ideal moisture range">
                                    <Droplets className="w-3 h-3 text-blue-500" />
                                    <span>{preset.ideal_moisture_min}-{preset.ideal_moisture_max}%</span>
                                </div>
                                <div className="flex items-center gap-0.5" title="Light hours needed">
                                    <Sun className="w-3 h-3 text-yellow-500" />
                                    <span>{preset.ideal_light_hours}h</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedId && (
                <p className="text-xs text-muted-foreground">
                    Selected preset will auto-fill plant type and care settings
                </p>
            )}
        </div>
    )
}
