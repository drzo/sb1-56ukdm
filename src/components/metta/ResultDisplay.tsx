interface ResultDisplayProps {
  result: string;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <pre className="bg-muted p-4 rounded-lg overflow-auto">
      {result || 'No result yet'}
    </pre>
  );
}