import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Lock, Coins } from "lucide-react";

export function TokenInfo() {
  const { toast } = useToast();
  const vestingProgress = 35; // Example progress

  const handleClaim = async () => {
    try {
      // Implement claim logic here
      toast({
        title: "Tokens Claimed",
        description: "Successfully claimed your tokens",
      });
    } catch (error) {
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
            <span className="text-sm font-medium text-gray-200">Locked tokens:</span>
          </div>
          <span className="font-mono text-lg font-semibold text-white">1,000,000 SKYOPS</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Vesting Progress</span>
            <span className="font-medium text-white">{vestingProgress}%</span>
          </div>
          <Progress value={vestingProgress} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-blue-400 to-cyan-400" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-cyan-300" />
            <span className="text-sm font-medium text-gray-200">Next unlock:</span>
          </div>
          <span className="font-mono text-lg font-semibold text-white">250,000 SKYOPS</span>
        </div>
      </CardContent>

      <CardFooter className="pb-6">
        <Button 
          onClick={handleClaim}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-200"
        >
          Claim Tokens
        </Button>
      </CardFooter>
    </Card>
  );
}