import { ESNState } from "@/reservoir/types/ESNTypes";

interface ESNStatusProps {
  state: ESNState;
}

export function ESNStatus({ state }: ESNStatusProps) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <h3 className="font-semibold mb-2">ESN Status</h3>
      <pre className="text-sm overflow-auto max-h-48">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}