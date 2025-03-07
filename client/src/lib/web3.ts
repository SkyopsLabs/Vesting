import { ethers } from "ethers";
import { create } from "zustand";

declare global {
  interface Window {
    ethereum: any;
  }
}

interface Web3State {
  address: string | null;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWeb3Store = create<Web3State>((set) => ({
  address: null,
  isConnected: false,
  provider: null,
  signer: null,
  connect: async () => {
    if (!window.ethereum) {
      throw new Error("No Ethereum provider found");
    }

    // Attempt to reset provider selection

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);

      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      set({
        address: accounts[0],
        isConnected: true,
        provider,
        signer,
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  },

  disconnect: () => {
    set({
      address: null,
      isConnected: false,
      provider: null,
      signer: null,
    });
  },
}));
