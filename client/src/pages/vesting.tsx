import { WalletConnect } from "@/components/vesting/WalletConnect";
import { CountdownTimer } from "@/components/vesting/CountdownTimer";
import { TokenInfo } from "@/components/vesting/TokenInfo";
import { Footer } from "@/components/vesting/Footer";

export default function VestingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#20209c] to-[#0ea7ca] flex flex-col">
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-end mb-8">
            <WalletConnect />
          </div>

          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-white">
                Token Vesting Portal
              </h1>
              <p className="text-gray-200">
                Track and claim your vested SKYOPS tokens
              </p>
            </div>

            <CountdownTimer />

            <div className="mt-12">
              <TokenInfo />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}