'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useWalletStore } from '@/stores/wallet';
import WalletBalance from '@/components/WalletBalance';
import RewardHistory from '@/components/RewardHistory';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { connect, address } = useWalletStore();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome, {user.email}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-label="Wallet">
          <h2 className="text-lg font-semibold mb-3">Wallet</h2>
          {address ? (
            <WalletBalance address={address} />
          ) : (
            <button
              onClick={connect}
              className="w-full py-3 bg-pulse-600 text-white rounded-lg hover:bg-pulse-700 transition-colors"
            >
              Connect Freighter Wallet
            </button>
          )}
        </section>

        <section aria-label="Reward History">
          <h2 className="text-lg font-semibold mb-3">Reward History</h2>
          <RewardHistory />
        </section>
      </div>
    </div>
  );
}
