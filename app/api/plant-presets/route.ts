import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/plant-presets
 * Returns all available plant presets for the carousel
 */
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: presets, error } = await supabase
            .from('plant_presets')
            .select('*')
            .order('common_name', { ascending: true })

        if (error) {
            console.error('[Plant Presets API] Error:', error)
            return NextResponse.json(
                { error: 'Failed to fetch plant presets' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            presets: presets || []
        })

    } catch (error) {
        console.error('[Plant Presets API] Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
