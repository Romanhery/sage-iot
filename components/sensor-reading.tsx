import { createClient } from "@/lib/supabase/server";

interface SensorReadingProps {
    label: string;
    field: string;
    unit?: string;
    table?: string;
}

export async function SensorReading({
    label,
    field,
    unit = "",
    table = "sensor_readings"
}: SensorReadingProps) {
    const supabase = await createClient();

    // We select only the field we need to optimize the query
    const { data: reading } = await supabase
        .from(table)
        .select(field)
        .order('timestamp', { ascending: false }) // Assuming we want the LATEST reading
        .limit(1)
        .single();

    const value = reading ? reading[field as keyof typeof reading] : null;

    return (
        <div className="flex flex-col gap-2 p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-700">{label}</h2>
            <div className="text-3xl font-mono">
                {value !== null ? `${value}${unit}` : 'No data'}
            </div>
        </div>
    );
}
