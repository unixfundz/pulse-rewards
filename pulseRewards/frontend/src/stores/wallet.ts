import { create } from 'zustand';

interface WalletState {
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Freighter types are minimal — we access via window
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<string>;
    };
  }
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  connecting: false,
  error: null,

  connect: async () => {
    set({ connecting: true, error: null });
    try {
      if (!window.freighter) {
        throw new Error('Freighter extension not installed. Visit freighter.app');
      }
      const isConnected = await window.freighter.isConnected();
      if (!isConnected) {
        throw new Error('Please approve the connection request in Freighter');
      }
      const address = await window.freighter.getPublicKey();
      set({ address, connecting: false });
    } catch (err: unknown) {
      set({
        error: err instanceof Error ? err.message : 'Wallet connection failed',
        connecting: false,
      });
    }
  },

  disconnect: () => set({ address: null, error: null }),
}));
