import { SensorReading } from "./sensor-reading";
import { LogoutButton } from "./logout-button";
import { Suspense } from "react";


export default function PlantCard() {
    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Plant</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Suspense fallback={<div>Loading Temperature...</div>}>
                    <SensorReading
                        label="Temperature"
                        field="temperature"
                        unit="°C"
                    />
                </Suspense>

                <Suspense fallback={<div>Loading Humidity...</div>}>
                    <SensorReading
                        label="Humidity"
                        field="humidity"
                        unit="%"
                    />
                </Suspense>

                <Suspense fallback={<div>Loading Moisture Level...</div>}>
                    <SensorReading
                        label="Moisture Level"
                        field="soil_moisture"
                        unit="%"
                    />
                </Suspense>

                <Suspense fallback={<div>Loading Light Level...</div>}>
                    <SensorReading
                        label="Light Level"
                        field="light_level"
                        unit=" lux"
                    />
                </Suspense>
            </div>
        </div>
    );
}