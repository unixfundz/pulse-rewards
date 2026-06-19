'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Reward {
  id: string;
  campaign_id: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  tx_hash?: string;
  created_at: string;
}

const statusColors: Record<Reward['status'], string> = {
  confirmed: 'text-green-600 bg-green-50',
  pending:   'text-yellow-600 bg-yellow-50',
  failed:    'text-red-600 bg-red-50',
};

export default function RewardHistory() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<{ rewards: Reward[] }>('/rewards')
      .then(({ rewards }) => setRewards(rewards))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading…</p>;
  if (rewards.length === 0) return <p className="text-gray-400 text-sm">No rewards yet.</p>;

  return (
    <ul className="space-y-2" aria-label="Reward history">
      {rewards.map((r) => (
        <li key={r.id} className="bg-white rounded-lg border p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{r.amount} PULSE</p>
            <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[r.status]}`}>
            {r.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
