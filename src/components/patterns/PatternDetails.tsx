import type { Pattern } from '../../types/patterns';

interface PatternDetailsProps {
  pattern: Pattern;
}

export default function PatternDetails({ pattern }: PatternDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Pattern {pattern.id}
        </div>
        <h2 className="text-2xl font-bold dark:text-white">
          {pattern.name}
        </h2>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium dark:text-white">Description</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {pattern.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium dark:text-white">Context</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {pattern.context}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium dark:text-white">Problem</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {pattern.problem}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium dark:text-white">Solution</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {pattern.solution}
            </p>
          </div>

          {pattern.examples && (
            <div>
              <h3 className="text-lg font-medium dark:text-white">Examples</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {pattern.examples.map((example, i) => (
                  <li key={i}>{example}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}