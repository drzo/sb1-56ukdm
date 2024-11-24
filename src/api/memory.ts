import { Task, ChatHistoryEntry, Skill } from '../types';
import { addTask, updateTask, addChatEntry, addSkill, getTasks, getSkills } from '../utils/db';
import { sendMessage } from './openai';

interface ActionResult {
  status: 'success' | 'error' | 'warning' | 'needs_human';
  message: string;
  details?: any;
  solution?: string;
}

export async function handleMemoryCommand(command: string, args: any): Promise<ActionResult> {
  try {
    switch (command) {
      case 'addTask':
        const task = await addTask(args);
        return {
          status: 'success',
          message: `Task "${task.title}" added successfully`,
          details: task
        };
      case 'updateTask':
        const updatedTask = await updateTask(args.id, args);
        return {
          status: 'success',
          message: `Task "${updatedTask.title}" updated successfully`,
          details: updatedTask
        };
      case 'addMemory':
        const memory = await addChatEntry(args);
        return {
          status: 'success',
          message: 'Memory entry added successfully',
          details: memory
        };
      case 'addSkill':
        const skill = await addSkill(args);
        return {
          status: 'success',
          message: `Skill "${skill.command}" added successfully`,
          details: skill
        };
      default:
        return {
          status: 'error',
          message: `Unknown memory command: ${command}`
        };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      solution: 'Please try again or contact support if the issue persists'
    };
  }
}

export async function processHotkey(key: string): Promise<ActionResult> {
  try {
    switch (key) {
      case 'w':
        return {
          status: 'success',
          message: 'Continuing with current workflow',
          details: await sendMessage("Proceeding with current task. Status update:")
        };

      case 'a':
        return {
          status: 'success',
          message: 'Analyzing alternative approaches',
          details: await sendMessage("Analyzing 3 alternative approaches to current task:")
        };

      case 's':
        return {
          status: 'success',
          message: 'Reverting last action',
          details: await sendMessage("Reverting previous action. New status:")
        };

      case 'd':
        return {
          status: 'success',
          message: 'Repeating last action',
          details: await sendMessage("Repeating previous action. Results:")
        };

      case 'q':
        return {
          status: 'success',
          message: 'Building intuition through questions',
          details: await sendMessage("Generating guiding questions for deeper understanding:")
        };

      case 'e':
        return {
          status: 'success',
          message: 'Expanding current explanation',
          details: await sendMessage("Providing detailed explanation:")
        };

      case 'f':
        return {
          status: 'success',
          message: 'Generating concise summary',
          details: await sendMessage("Summarizing key points:")
        };

      case 'j':
        return {
          status: 'success',
          message: 'Breaking down into subtasks',
          details: await sendMessage("Creating step-by-step breakdown:")
        };

      case 'g':
        const tasks = await getTasks();
        return {
          status: 'success',
          message: 'Generating search queries',
          details: await sendMessage(`Based on current tasks (${tasks.length}), suggested queries:`)
        };

      case 'm':
        return {
          status: 'success',
          message: 'Accessing memory database',
          details: await sendMessage("Memory database access results:")
        };

      case 't':
        const currentTasks = await getTasks();
        if (currentTasks.length === 0) {
          return {
            status: 'warning',
            message: 'No tasks found',
            solution: 'Create new tasks using the task management interface'
          };
        }
        return {
          status: 'success',
          message: 'Current tasks retrieved',
          details: currentTasks
        };

      case 'c':
        return {
          status: 'success',
          message: 'Generating curriculum tasks',
          details: await sendMessage("Suggesting learning tasks based on progress:")
        };

      case 'p':
        const skills = await getSkills();
        if (skills.length === 0) {
          return {
            status: 'warning',
            message: 'No skills found in database',
            solution: 'Add new skills using the xk command'
          };
        }
        return {
          status: 'success',
          message: 'Skills database accessed',
          details: skills
        };

      case 'x':
        try {
          const exportData = {
            tasks: await getTasks(),
            skills: await getSkills(),
            chatHistory: await getChatHistory()
          };
          return {
            status: 'success',
            message: 'Data export prepared',
            details: exportData
          };
        } catch (error) {
          return {
            status: 'error',
            message: 'Failed to export data',
            solution: 'Check database access permissions and try again'
          };
        }

      case 'xk':
        return {
          status: 'success',
          message: 'Ready to save new skill',
          details: await sendMessage("Please provide the following skill details: name, description, and implementation")
        };

      case 'k':
        return {
          status: 'success',
          message: 'Displaying available hotkeys',
          details: 'All hotkeys are now visible in the interface'
        };

      case 'l':
        const availableSkills = await getSkills();
        return {
          status: 'success',
          message: 'Accessing skill library',
          details: {
            totalSkills: availableSkills.length,
            categories: ['Technical', 'Cognitive', 'Memory', 'Learning'],
            skills: availableSkills
          }
        };

      case 'z':
        return {
          status: 'success',
          message: 'Generating creative suggestion',
          details: await sendMessage("Here's an unexpected approach to consider:")
        };

      default:
        return {
          status: 'error',
          message: `Unknown hotkey: ${key}`,
          solution: 'Use the k command to view available hotkeys'
        };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('token')) {
      return {
        status: 'needs_human',
        message: 'Authentication required',
        solution: 'Please configure your API tokens in the settings'
      };
    }
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      solution: 'Please try again or seek human assistance if the issue persists'
    };
  }
}