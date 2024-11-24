import { useCharacterNetwork } from '../../hooks/useCharacterNetwork';

export default function NetworkStatus() {
  const { data } = useCharacterNetwork();

  const stats = {
    characters: data?.nodes.length || 0,
    connections: data?.links.length || 0,
    averageConnections: data
      ? (data.links.length * 2 / data.nodes.length).toFixed(1)
      : '0.0'
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-semibold dark:text-white">
            {stats.characters}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Characters
          </div>
        </div>
        <div>
          <div className="text-2xl font-semibold dark:text-white">
            {stats.connections}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Connections
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Average Connections
        </div>
        <div className="text-2xl font-semibold dark:text-white">
          {stats.averageConnections}
        </div>
      </div>
    </div>
  );
}