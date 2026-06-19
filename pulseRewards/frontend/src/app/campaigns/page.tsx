'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import CampaignCard from '@/components/CampaignCard';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  reward_rate: number;
  starts_at: string;
  ends_at: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ campaigns: Campaign[] }>('/campaigns')
      .then(({ campaigns }) => setCampaigns(campaigns))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading campaigns…</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Active Campaigns</h1>
      {campaigns.length === 0 ? (
        <p className="text-gray-500">No active campaigns right now.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2" aria-label="Campaigns list">
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </ul>
      )}
    </div>
  );
}
