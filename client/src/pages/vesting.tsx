import { WalletConnect } from "@/components/vesting/WalletConnect";
import { CountdownTimer } from "@/components/vesting/CountdownTimer";
import { TokenInfo } from "@/components/vesting/TokenInfo";
import { Footer } from "@/components/vesting/Footer";
import { AddressDisplay } from "@/components/vesting/AddressDisplay";
import { useWeb3Store } from "@/lib/web3";

export default function VestingPage() {
  const { address, isConnected } = useWeb3Store();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#20209c] to-[#0ea7ca] flex flex-col">
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            {isConnected && address && (
              <AddressDisplay address={address} />
            )}
            <div className="ml-auto">
              <WalletConnect />
            </div>
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