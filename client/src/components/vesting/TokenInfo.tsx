import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Lock, Coins } from "lucide-react";
import { useWeb3Store } from "@/lib/web3";

// Contract Details
const CONTRACT_ADDRESS = "0xd20f16fec4bf189854EDAf4d2dA5Ab95E1aA1dd5";
const ABI = [
  "function getPlanByAddressAndIndex(address holder, uint256 index) view returns (tuple(address,uint256,uint256,uint256,bool,uint256,uint256,uint256,bool))",
  "function getReleasableAmount(bytes32 planId) view returns (uint256)",
  "function releaseTokens(bytes32 planId, uint256 amount) public",
  "function computePlanId(address holder, uint256 index) public pure returns (bytes32)",
  "function getNextReleaseTime(address beneficiary) public view returns (uint256)",
];

export function TokenInfo() {
  const { toast } = useToast();
  const [vestingProgress, setVestingProgress] = useState(0);
  const [lockedTokens, setLockedTokens] = useState(0);
  const [nextUnlock, setNextUnlock] = useState<number>(0);
  const [start, setStart] = useState<number>(0);
  const { provider, signer, isConnected, address } = useWeb3Store();
  const [nextReleaseTime, setNextReleaseTime] = useState<any>(null);

  const [planId, setPlanId] = useState<null | string>(null);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  console.log(address);

  // Fetch vesting details
  // Fetch vesting details
  useEffect(() => {
    async function fetchVestingData() {
      if (!isConnected) {
        setNextUnlock(0);
        setLockedTokens(0);
        return;
      }
      if (!contract || !address) return;
      try {
        const index = 0; // Assuming first vesting plan
        const computedPlanId = await contract.computePlanId(address, index);
        setPlanId(computedPlanId);

        const plan = await contract.getPlanByAddressAndIndex(address, index);
        const launchDate = Number(plan[1]); // plan.start
        const totalAmount = Number(plan[5]); // plan.totalAmount
        const released = Number(plan[7]); // plan.released

        setStart(launchDate * 1000);

        setLockedTokens((totalAmount - released) / 10 ** 18);
        console.log(released / 10 ** 18, totalAmount / 10 ** 18, "Okay");
        setVestingProgress((released / totalAmount) * 100);

        const releasable: ethers.BigNumberish =
          await contract.getReleasableAmount(computedPlanId);
        const releasableAmount = ethers.formatUnits(releasable, 18);
        setNextUnlock(parseFloat(releasableAmount));
      } catch (error) {
        console.error("Error fetching vesting data:", error);
      }
    }
    const fetchReleaseTime = async () => {
      if (!address || !isConnected) return;

      try {
        const releaseTime: ethers.BigNumberish =
          await contract.getNextReleaseTime(address);
        setNextReleaseTime(parseInt(releaseTime.toString()) * 1000); // Convert to milliseconds
      } catch (error) {
        console.error("Error fetching vesting release time:", error);
        setNextReleaseTime(0); // Convert to milliseconds
      }
    };

    fetchReleaseTime();
    fetchVestingData();
  }, [contract, isConnected, address]);

  // Claim function
  const handleClaim = async () => {
    if (!contract || !signer || !planId || nextUnlock <= 0) {
      toast({
        title: "No tokens available to claim",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure nextUnlock is properly converted
      const amountToClaim = ethers.parseUnits(nextUnlock.toString(), 18);

      const tx = await contract.releaseTokens(planId, amountToClaim);
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
            {lockedTokens} SKYOPS
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
          disabled={(nextUnlock as number) <= 0 || Date.now() < start}
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
