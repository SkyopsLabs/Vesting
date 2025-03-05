import { ethers } from "ethers";
import { create } from "zustand";

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
      throw new Error("MetaMask not installed");
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      set({
        address: accounts[0],
        isConnected: true,
        provider,
        signer
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
      signer: null
    });
  }
}));
