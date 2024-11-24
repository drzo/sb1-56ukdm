import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddEntityFormProps {
  onAddAgent: (name: string) => void;
  onAddTask: (description: string) => void;
  agentName: string;
  taskDescription: string;
  onAgentNameChange: (value: string) => void;
  onTaskDescriptionChange: (value: string) => void;
}

export function AddEntityForm({
  onAddAgent,
  onAddTask,
  agentName,
  taskDescription,
  onAgentNameChange,
  onTaskDescriptionChange
}: AddEntityFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Agent/Task</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Add Agent</Label>
          <div className="flex gap-2">
            <Input
              value={agentName}
              onChange={(e) => onAgentNameChange(e.target.value)}
              placeholder="Agent name"
            />
            <Button onClick={() => onAddAgent(agentName)}>Add</Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Add Task</Label>
          <div className="flex gap-2">
            <Input
              value={taskDescription}
              onChange={(e) => onTaskDescriptionChange(e.target.value)}
              placeholder="Task description"
            />
            <Button onClick={() => onAddTask(taskDescription)}>Add</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}