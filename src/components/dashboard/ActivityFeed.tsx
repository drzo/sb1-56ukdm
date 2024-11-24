import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: number;
}

export default function ActivityFeed() {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ['activities'],
    queryFn: async () => [
      {
        id: 1,
        type: 'interaction',
        description: 'Local shop owner connected with community teacher',
        timestamp: Date.now() - 1000 * 60 * 5
      },
      {
        id: 2,
        type: 'update',
        description: 'Youth mentor traits updated',
        timestamp: Date.now() - 1000 * 60 * 15
      }
    ]
  });

  return (
    <div className="space-y-4">
      {activities?.map(activity => (
        <div
          key={activity.id}
          className="text-sm text-gray-600 dark:text-gray-400 slide-in"
        >
          <p>{activity.description}</p>
          <span className="text-xs text-gray-500">
            {new Date(activity.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}