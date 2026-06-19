'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Props {
  address: string;
}

export default function WalletBalance({ address }: Props) {
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ balance: string }>(`/wallet/${address}/balance`)
      .then(({ balance }) => setBalance(balance))
      .catch((err: Error) => setError(err.message));
  }, [address]);

  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-sm text-gray-500 mb-1">PULSE Balance</p>
      {error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <p className="text-3xl font-bold text-pulse-700">
          {balance ?? '—'}
          <span className="text-sm font-normal text-gray-500 ml-1">PULSE</span>
        </p>
      )}
      <p className="text-xs text-gray-400 mt-2 font-mono truncate">{address}</p>
    </div>
  );
}
