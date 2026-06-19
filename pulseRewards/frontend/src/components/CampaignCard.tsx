'use client';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  reward_rate: number;
  starts_at: string;
  ends_at: string;
}

interface Props {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: Props) {
  const endsAt = new Date(campaign.ends_at);
  const isExpiring = endsAt.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

  return (
    <li className="bg-white rounded-xl border p-5 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
        {isExpiring && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
            Ending soon
          </span>
        )}
      </div>

      {campaign.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{campaign.description}</p>
      )}

      <div className="mt-auto pt-3 border-t flex justify-between text-sm">
        <span className="font-bold text-pulse-600">{campaign.reward_rate} PULSE</span>
        <span className="text-gray-400">
          Until {endsAt.toLocaleDateString()}
        </span>
      </div>
    </li>
  );
}
