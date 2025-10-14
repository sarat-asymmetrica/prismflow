/**
 * Tasks Card Appliance
 * AsymmFlow Socket-Driven Component
 *
 * @asymmetrica: TasksCardAppliance
 * symbol: Tasks.Retrieve
 * scope: module
 * regime: Exploration (30%)
 * cost: O(n_tasks)
 * lineage: [Auth.HTXSession, Dashboard.State, Tasks.API, Tasks.DB, Tasks.UI]
 *
 * ANIMATIONS (Motion Stagger):
 * - onLoad: y: 20 → 0, opacity: 0 → 1
 * - duration: 0.3s
 * - stagger: 0.1s (100ms between cards, prevents visual stampede)
 *
 * AUTO-SYNC PULSE:
 * - frequency: 4.909Hz (203.7ms base period)
 * - cacheDuration: 5min (only refetch if cache expired)
 *
 * RETRY ON ERROR (3-6-9 harmonic cycle):
 * - Attempt 1: 611ms (3× harmonic)
 * - Attempt 2: 1222ms (6× harmonic)
 * - Attempt 3: 1833ms (9× harmonic)
 */

import { useEffect, useRef, useState } from "react";
import { useAsymmSocket } from "../hooks/useAsymmSocket";
import { useAsymmPulse } from "../hooks/useAsymmPulse";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, AlertCircle, Inbox } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

// Socket data contract
interface TaskData {
  tasks: Array<{
    id: string;
    title: string;
    dueTime: string;
    customer: {
      name: string;
      code: string;
      tag: string;
    };
    status: "pending" | "completed" | "overdue";
    priority: "low" | "medium" | "high";
    type: string;
  }>;
  metadata: {
    total: number;
    completed: number;
    overdue: number;
  };
}

interface TasksCardApplianceProps {
  role: "sales" | "accountant" | "management";
  enablePulse?: boolean;
}

// Loading skeleton component
function TasksCardSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 border border-gray-200 rounded-lg p-3 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-[18px] h-[18px] bg-gray-200 rounded" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Error state component
function TasksCardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full bg-white rounded-lg p-8 border border-gray-200 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <p className="text-red-500 mb-2">Unable to load tasks</p>
      <p className="text-gray-500 text-sm mb-4">
        Please check your connection and try again
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="text-primary border-primary"
      >
        Retry
      </Button>
    </div>
  );
}

// Empty state component
function TasksCardEmpty() {
  return (
    <div className="w-full bg-white rounded-lg p-8 border border-gray-200 text-center">
      <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-700 mb-1">No tasks today! 🎉</p>
      <p className="text-gray-500 text-sm">You're all caught up</p>
    </div>
  );
}

export default function TasksCardAppliance({
  role,
  enablePulse = false,
}: TasksCardApplianceProps) {
  // Socket connection (auto-authenticated via HTX)
  const { data, isLoading, error, refetch } = useAsymmSocket<TaskData>(
    "/api/tasks",
    { params: { user: role } },
  );

  // Local state for task completion animation
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // 4.909 Hz auto-sync pulse (optional for demo)
  useAsymmPulse(
    4.909,
    () => {
      if (enablePulse) {
        refetch();
      }
    },
    enablePulse,
  );

  // Handler for marking task complete
  const handleMarkComplete = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // Render states
  if (isLoading) return <TasksCardSkeleton />;
  if (error) return <TasksCardError onRetry={refetch} />;
  if (!data?.tasks.length) return <TasksCardEmpty />;

  return (
    <div
      className="w-full bg-white rounded-lg p-4 shadow-md border border-gray-100"
      data-asymm="σ:TaskRetrieval,ρ:Module,γ:Exploration,κ:O(n),λ:[Auth,Dashboard,Tasks.API,Tasks.DB,Tasks.UI]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-900">Today's Tasks</h2>
        <span className="w-6 h-6 bg-primary text-white rounded-full text-sm flex items-center justify-center">
          {data.metadata.total}
        </span>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {data.tasks.map((task, index) => {
            const isCompleted =
              completedTasks.has(task.id) || task.status === "completed";

            return (
              <motion.div
                key={task.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="task-card h-20 border border-gray-200 rounded-lg p-3 flex items-start gap-3 cursor-pointer transition-all hover:border-primary hover:shadow-lg group"
                data-task-id={task.id}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Checkbox */}
                <div className="pt-1">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => handleMarkComplete(task.id)}
                    className="w-[18px] h-[18px] border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-gray-900 transition-all ${
                      isCompleted ? "line-through opacity-50" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{task.dueTime}</p>
                </div>

                {/* Task Meta */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] uppercase px-2 py-1 rounded bg-blue-50 text-primary whitespace-nowrap">
                    {task.customer.tag}
                  </span>
                  <button
                    className="text-xs text-primary hover:bg-blue-50 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                    onClick={() => handleMarkComplete(task.id)}
                  >
                    Mark Done
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      {data.metadata.completed > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm"
        >
          <span className="text-gray-500">
            {data.metadata.completed} of {data.metadata.total} completed
          </span>
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {Math.round(
                (data.metadata.completed / data.metadata.total) * 100,
              )}
              %
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
