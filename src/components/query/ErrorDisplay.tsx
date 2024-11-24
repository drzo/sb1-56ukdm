interface ErrorDisplayProps {
  error: string | null;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="bg-destructive/15 text-destructive p-3 rounded-md">
      {error}
    </div>
  );
}