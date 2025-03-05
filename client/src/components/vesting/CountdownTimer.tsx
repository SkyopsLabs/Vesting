import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TimeUnit {
  value: number;
  label: string;
}

export function CountdownTimer() {
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([
    { value: 0, label: "DAYS" },
    { value: 0, label: "HOURS" },
    { value: 0, label: "MINUTES" },
    { value: 0, label: "SECONDS" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const nextRelease = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const diff = nextRelease.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUnits([
        { value: days, label: "DAYS" },
        { value: hours, label: "HOURS" },
        { value: minutes, label: "MINUTES" },
        { value: seconds, label: "SECONDS" }
      ]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-white">Next release in:</h2>
      <div className="flex gap-4 justify-center">
        {timeUnits.map((unit, index) => (
          <Card key={unit.label} className="bg-black/20 backdrop-blur-sm border border-white/10 shadow-xl">
            <CardContent className="p-4 text-center">
              <div className="text-4xl font-mono font-bold text-white">
                {unit.value.toString().padStart(2, '0')}
              </div>
              <div className="text-xs font-semibold text-gray-300 mt-1">
                {unit.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}