import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Lock, Coins } from "lucide-react";
import { useWeb3Store } from "@/lib/web3";

// Contract Details
const CONTRACT_ADDRESS = "0x0277E5E3EA6D6AeFFF2BEA4d897eb41427EcC1e4";
const ABI = [
  "function getPlanByAddressAndIndex(address holder, uint256 index) view returns (tuple(address,uint256,uint256,uint256,uint256,uint256,bool,uint256,uint256,uint256,bool))",
  "function getReleasableAmount(bytes32 planId) view returns (uint256)",
  "function releaseTokens(bytes32 planId, uint256 amount) public",
  "function computePlanId(address holder, uint256 index) public pure returns (bytes32)",
];

export function TokenInfo() {
  const { toast } = useToast();
  const [vestingProgress, setVestingProgress] = useState(0);
  const [lockedTokens, setLockedTokens] = useState(0);
  const [nextUnlock, setNextUnlock] = useState<number>(0);
  const { provider, signer } = useWeb3Store();

  const [planId, setPlanId] = useState<null | string>(null);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  // Fetch vesting details
  // Fetch vesting details
  useEffect(() => {
    async function fetchVestingData() {
      if (!contract || !signer) return;
      const address = await signer.getAddress();
      try {
        const index = 0; // Assuming first vesting plan
        const computedPlanId = await contract.computePlanId(address, index);
        setPlanId(computedPlanId);

        const plan = await contract.getPlanByAddressAndIndex(address, index);
        const totalAmount = Number(plan[7]); // plan.totalAmount
        const released = Number(plan[8]); // plan.released

        setLockedTokens(totalAmount / 10 ** 18);
        setVestingProgress((released / totalAmount) * 100);

        const releasable = await contract.getReleasableAmount(computedPlanId);
        setNextUnlock(Number(releasable));
      } catch (error) {
        console.error("Error fetching vesting data:", error);
      }
    }
    fetchVestingData();
  }, [contract, signer]);

  // Claim function
  const handleClaim = async () => {
    if (!contract || !signer || !planId) return;

    try {
      const tx = await contract.releaseTokens(planId, nextUnlock);
      await tx.wait(); // Wait for transaction confirmation

      toast({
        title: "Tokens Claimed",
        description: "Successfully claimed your tokens",
      });

      // Refresh vesting data
      setVestingProgress((prev) => prev + (nextUnlock / lockedTokens) * 100);
      setNextUnlock(0);
    } catch (error) {
      console.error("Claim failed:", error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim tokens",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-black/20 backdrop-blur-sm border border-white/10 text-white shadow-xl">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-300" />
            <span className="text-sm font-medium text-gray-200">
              Locked tokens:
            </span>
          </div>
          <span className="font-mono text-lg font-medium tracking-wider text-white">
            {lockedTokens.toLocaleString()} SKYOPS
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Vesting Progress</span>
            <span className="font-mono font-medium text-white">
              {vestingProgress.toFixed(2) ?? 0}%
            </span>
          </div>
          <Progress value={vestingProgress} className="h-2 bg-white/10" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-cyan-300" />
            <span className="text-sm font-medium text-gray-200">
              Next unlock:
            </span>
          </div>
          <span className="font-mono text-lg font-medium tracking-wider text-white">
            {typeof nextUnlock === "string"
              ? nextUnlock
              : `${nextUnlock} SKYOPS`}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pb-6">
        <Button
          onClick={handleClaim}
          disabled={(nextUnlock as number) <= 0}
          className={`w-full text-white border transition-all duration-200 ${
            (nextUnlock as number) > 0
              ? "bg-white/10 hover:bg-white/20 border-white/20"
              : "bg-gray-700 border-gray-500 cursor-not-allowed"
          }`}
        >
          Claim Tokens
        </Button>
      </CardFooter>
    </Card>
  );
}
