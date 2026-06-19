import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-pulse-700 mb-2">Pulse Rewards</h1>
        <p className="text-lg text-gray-600 max-w-md">
          Blockchain-powered loyalty rewards on the Stellar network.
          Earn, hold, and redeem PULSE tokens.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-pulse-600 text-white rounded-lg font-medium
                     hover:bg-pulse-700 focus-visible:ring-2 ring-pulse-500 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/campaigns"
          className="px-6 py-3 border border-pulse-600 text-pulse-600 rounded-lg font-medium
                     hover:bg-pulse-50 transition-colors"
        >
          Browse Campaigns
        </Link>
      </div>
    </main>
  );
}
