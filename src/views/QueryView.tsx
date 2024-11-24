import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OpenCogBridge } from '@/opencog/core/OpenCogBridge'
import { Logger } from '@/cogutil/Logger'
import { QueryForm } from '@/components/query/QueryForm'
import { QueryResults } from '@/components/query/QueryResults'
import { ErrorDisplay } from '@/components/query/ErrorDisplay'

const openCogBridge = OpenCogBridge.getInstance()

export function QueryView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const runQuery = async () => {
    if (!query.trim()) {
      setError('Query cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await openCogBridge.processQuery(query);
      setResults(results);
      Logger.info(`Query executed: ${query}`);
    } catch (err) {
      Logger.error('Query failed:', err);
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Engine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ErrorDisplay error={error} />
        
        <QueryForm
          query={query}
          onQueryChange={setQuery}
          onSubmit={runQuery}
          loading={loading}
        />

        <QueryResults results={results} />
      </CardContent>
    </Card>
  );
}