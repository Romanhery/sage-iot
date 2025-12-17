import Link from "next/link";
import { SensorReading } from "@/components/sensor-reading";
import { Suspense } from "react";
import { LogoutButton } from "@/components/logout-button";


export default function Dashboard() {
    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Plants</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/plants/plant-1" className="block p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h2 className="text-xl font-semibold">Plant 1</h2>
                    <p className="text-gray-500">View details &rarr;</p>
                </Link>
            </div>

            <LogoutButton />
        </div>
    );
}