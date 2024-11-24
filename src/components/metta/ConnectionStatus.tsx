import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm text-muted-foreground">
        {isConnected ? 'Connected to MeTTa' : 'Disconnected'}
      </span>
    </div>
  );
}