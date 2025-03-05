import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWeb3Store } from "@/lib/web3";
import { Wallet, LogOut } from "lucide-react";

export function WalletConnect() {
  const { address, isConnected, connect, disconnect } = useWeb3Store();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected wallet",
    });
  };

  if (!isConnected) {
    return (
      <Button 
        onClick={handleConnect}
        className="bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-all duration-200"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleDisconnect}
      className="bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition-all duration-200"
    >
      <span className="font-mono text-sm tracking-wider">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </span>
      <LogOut className="h-4 w-4 ml-2" />
    </Button>
  );
}