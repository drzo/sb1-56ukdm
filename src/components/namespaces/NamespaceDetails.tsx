import type { Namespace } from '../../types/namespaces';

interface NamespaceDetailsProps {
  namespace: Namespace;
}

export default function NamespaceDetails({ namespace }: NamespaceDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {namespace.type}
        </div>
        <h2 className="text-2xl font-bold dark:text-white">
          {namespace.name}
        </h2>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {namespace.path}
        </div>
      </div>

      {namespace.mountPoint && (
        <div>
          <h3 className="text-lg font-medium dark:text-white mb-2">
            Mount Point
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {namespace.mountPoint}
          </div>
        </div>
      )}

      {namespace.content && (
        <div>
          <h3 className="text-lg font-medium dark:text-white mb-2">
            Content
          </h3>
          <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto text-sm text-gray-800 dark:text-gray-200">
            {namespace.content}
          </pre>
        </div>
      )}

      {namespace.children && namespace.children.length > 0 && (
        <div>
          <h3 className="text-lg font-medium dark:text-white mb-2">
            Children
          </h3>
          <div className="space-y-2">
            {namespace.children.map(child => (
              <div 
                key={child.id}
                className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
              >
                <div className="font-medium dark:text-white">
                  {child.name}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {child.type} • {child.path}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}