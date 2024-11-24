import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskWithStatus } from "@/swarm/types"

interface TaskListProps {
  tasks: TaskWithStatus[];
  selectedAgent: string | null;
  onAssignTask: (taskId: string) => void;
}

export function TaskList({ tasks, selectedAgent, onAssignTask }: TaskListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex justify-between items-center">
              <div className="flex flex-col">
                <span>{task.description}</span>
                <span className={`text-sm ${
                  task.status === 'completed' 
                    ? 'text-green-600 dark:text-green-400'
                    : task.status === 'failed'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                }`}>
                  {task.status}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => onAssignTask(task.id)}
                disabled={task.status !== 'pending' || !selectedAgent}
              >
                {task.status === 'pending' ? 'Assign' : 'Assigned'}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}