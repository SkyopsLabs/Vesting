import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ethers } from "ethers";
import { useWeb3Store } from "@/lib/web3";

interface TimeUnit {
  value: number;
  label: string;
}

const CONTRACT_ADDRESS = "0xd20f16fec4bf189854EDAf4d2dA5Ab95E1aA1dd5";
const ABI = [
  "function getNextReleaseTime(address beneficiary) public view returns (uint256)",
];

export function CountdownTimer() {
  const { provider, signer, address } = useWeb3Store();
  const [timeUnits, setTimeUnits] = useState<TimeUnit[]>([
    { value: 0, label: "DAYS" },
    { value: 0, label: "HOURS" },
    { value: 0, label: "MINUTES" },
    { value: 0, label: "SECONDS" },
  ]);

  const [nextReleaseTime, setNextReleaseTime] = useState<any>(null);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  useEffect(() => {
    if (!address) return;
    const fetchReleaseTime = async () => {
      try {
        const releaseTime: ethers.BigNumberish =
          await contract.getNextReleaseTime(address);
        setNextReleaseTime(parseInt(releaseTime.toString()) * 1000); // Convert to milliseconds
      } catch (error) {
        console.error("Error fetching vesting release time:", error);
        setNextReleaseTime(0); // Convert to milliseconds
        setTimeUnits([
          { value: 0, label: "DAYS" },
          { value: 0, label: "HOURS" },
          { value: 0, label: "MINUTES" },
          { value: 0, label: "SECONDS" },
        ]);
      }
    };

    fetchReleaseTime();
  }, [address]);

  useEffect(() => {
    if (!nextReleaseTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = nextReleaseTime - now;

      if (diff <= 0) {
        setTimeUnits([
          { value: 0, label: "DAYS" },
          { value: 0, label: "HOURS" },
          { value: 0, label: "MINUTES" },
          { value: 0, label: "SECONDS" },
        ]);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUnits([
        { value: days, label: "DAYS" },
        { value: hours, label: "HOURS" },
        { value: minutes, label: "MINUTES" },
        { value: seconds, label: "SECONDS" },
      ]);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextReleaseTime]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-center text-white">
        Next release in:
      </h2>
      <div className="flex gap-4 justify-center">
        {timeUnits.map((unit) => (
          <Card
            key={unit.label}
            className="bg-black/20 backdrop-blur-sm border border-white/10 shadow-xl"
          >
            <CardContent className="p-4 text-center">
              <div className="text-4xl font-mono font-medium tracking-wider text-white">
                {unit.value.toString().padStart(2, "0")}
              </div>
              <div className="text-xs font-mono font-medium text-gray-300 mt-1">
                {unit.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
