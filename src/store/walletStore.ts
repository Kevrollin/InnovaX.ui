import { create } from 'zustand';
import { Wallet } from '@/types';
import { triggerWalletUpdate } from '@/utils/realtime';

interface WalletState {
  wallet: Wallet | null;
  isConnecting: boolean;
  setWallet: (wallet: Wallet | null) => void;
  setConnecting: (connecting: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  isConnecting: false,
  setWallet: (wallet) => {
    set({ wallet });
    // Trigger real-time update when wallet changes
    triggerWalletUpdate();
  },
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  disconnect: () => {
    set({ wallet: null });
    // Trigger real-time update when wallet disconnects
    triggerWalletUpdate();
  },
}));
