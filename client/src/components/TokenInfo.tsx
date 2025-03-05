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
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Locked tokens:</span>
          </div>
          <span className="font-mono text-lg font-semibold">1,000,000 SKYOPS</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Vesting Progress</span>
            <span className="font-medium">{vestingProgress}%</span>
          </div>
          <Progress value={vestingProgress} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Next unlock:</span>
          </div>
          <span className="font-mono text-lg font-semibold">250,000 SKYOPS</span>
        </div>
      </CardContent>
      
      <CardFooter className="pb-6">
        <Button 
          onClick={handleClaim}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          Claim Tokens
        </Button>
      </CardFooter>
    </Card>
  );
}
