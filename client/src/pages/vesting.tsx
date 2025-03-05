import { WalletConnect } from "@/components/vesting/WalletConnect";
import { CountdownTimer } from "@/components/vesting/CountdownTimer";
import { TokenInfo } from "@/components/vesting/TokenInfo";

export default function VestingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <WalletConnect />
        </div>

        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Token Vesting Portal
            </h1>
            <p className="text-gray-600">
              Track and claim your vested DAETA tokens
            </p>
          </div>

          <CountdownTimer />
          
          <div className="mt-12">
            <TokenInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
