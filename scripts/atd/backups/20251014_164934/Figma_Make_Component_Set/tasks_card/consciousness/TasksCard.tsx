import { useEffect, useRef, useState } from 'react';
import { useTasksSocket } from '../../lib/hooks/useTasksSocket';
import { TaskItem } from './TaskItem';
import { Clipboard, Plus, MoreVertical, PartyPopper, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner@2.0.3';

interface TasksCardProps {
  userId: string;
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN';
  limit?: number;
}

export function TasksCard({ userId, role = 'USER', limit = 5 }: TasksCardProps) {
  const { tasks, loading, error, completeTask, stats } = useTasksSocket(userId, limit);
  const cardRef = useRef<HTMLDivElement>(null);
  const taskListRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!mounted || loading) return;

    const loadGsap = async () => {
      const gsap = (await import('gsap')).default;
      
      // Card load animation
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      }

      // Task items stagger animation
      const taskItems = document.querySelectorAll('.gsap-task-item');
      if (taskItems.length > 0) {
        gsap.from(taskItems, {
          x: -20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease: 'power2.out'
        });
      }
    };

    loadGsap();
  }, [mounted, loading, tasks.length]);

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      if (completed) {
        // Animate task completion
        const loadGsap = async () => {
          const gsap = (await import('gsap')).default;
          const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
          
          if (taskElement) {
            await gsap.to(taskElement, {
              x: 100,
              opacity: 0,
              duration: 0.4,
              ease: 'power2.in'
            });
          }
        };

        await loadGsap();
        await completeTask(taskId);
        toast.success('Task completed! 🎉');
      } else {
        await completeTask(taskId);
      }
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleAddTask = () => {
    toast.info('Create Task modal would open here');
  };

  const handleViewAll = () => {
    toast.info('Navigate to /tasks page');
  };

  if (error) {
    return (
      <div className="w-full max-w-[400px] p-6 bg-white rounded-xl border border-[#E9ECEF] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <p className="text-red-500">Error loading tasks: {error}</p>
      </div>
    );
  }

  return (
    <div 
      ref={cardRef}
      className="gsap-card-container w-full max-w-[400px] bg-white rounded-xl border border-[#E9ECEF] shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden"
    >
      {/* Card Header */}
      <div className="card-header px-6 py-4 border-b border-[#E9ECEF]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Clipboard className="h-6 w-6 text-[#6C63FF] mt-0.5" />
            <div>
              <h2 className="title text-[#212529]">
                Today's Tasks
              </h2>
              <p className="subtitle text-[#6C757D] mt-1">
                {stats.remaining} tasks remaining
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Menu Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="menu-button h-8 w-8 rounded-lg hover:bg-[#F8F9FA]"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Filter tasks</DropdownMenuItem>
                <DropdownMenuItem>Sort by priority</DropdownMenuItem>
                {(role === 'ADMIN' || role === 'SUPERADMIN') && (
                  <DropdownMenuItem>Export to CSV</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Button */}
            <Button
              onClick={handleAddTask}
              size="icon"
              className="gsap-add-button h-8 w-8 rounded-lg bg-[#6C63FF] hover:bg-[#5A52E0] active:bg-[#4A42C0] transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div 
        ref={taskListRef}
        className="gsap-task-list max-h-[480px] overflow-y-auto"
      >
        {loading ? (
          // Loading Skeletons
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 border-b border-[#E9ECEF]">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          // Empty State
          <div className="empty-state flex flex-col items-center justify-center py-12 px-6 text-center">
            <PartyPopper className="h-20 w-20 text-[#6C63FF] mb-4" />
            <h3 className="text-[#212529] mb-2">All caught up!</h3>
            <p className="text-[#6C757D] mb-6">
              No tasks for today. Great work!
            </p>
            <Button
              onClick={handleAddTask}
              className="bg-[#6C63FF] hover:bg-[#5A52E0]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
          </div>
        ) : (
          // Task Items
          tasks.map((task) => (
            <div key={task.id} data-task-id={task.id}>
              <TaskItem
                task={task}
                onComplete={handleTaskComplete}
                role={role}
              />
            </div>
          ))
        )}
      </div>

      {/* View All Button */}
      {!loading && tasks.length > 0 && (
        <div className="p-4">
          <Button
            onClick={handleViewAll}
            variant="ghost"
            className="gsap-view-all-button w-full bg-[#F8F9FA] hover:bg-[#E9ECEF] text-[#6C63FF] hover:text-[#5A52E0] rounded-lg"
          >
            View All Tasks ({stats.total})
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
