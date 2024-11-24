import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AutonomousAgent } from "@/swarm/core/AutonomousAgent"

interface AgentListProps {
  agents: AutonomousAgent[];
  selectedAgent: string | null;
  onSelectAgent: (id: string) => void;
}

export function AgentList({ agents, selectedAgent, onSelectAgent }: AgentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {agents.map(agent => (
            <li key={agent.getId()} className="flex justify-between items-center">
              <span>{agent.getName()}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-1 rounded ${
                  agent.getState().status === 'idle' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                }`}>
                  {agent.getState().status}
                </span>
                <Button
                  size="sm"
                  variant={selectedAgent === agent.getId() ? 'default' : 'outline'}
                  onClick={() => onSelectAgent(agent.getId())}
                  disabled={agent.getState().status !== 'idle'}
                >
                  Select
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}