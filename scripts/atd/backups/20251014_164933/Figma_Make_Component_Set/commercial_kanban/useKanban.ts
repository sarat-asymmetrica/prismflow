import { useState, useEffect, useCallback } from "react";
import { Deal, Stage, Stats, UserRole } from "../lib/kanban-types";
import { STAGES, MOCK_DEALS, MOCK_STATS } from "../lib/kanban-data";
import { canTransition } from "../lib/kanban-utils";

export interface UseKanbanReturn {
  stages: Stage[];
  dealsByStage: { [stageId: string]: Deal[] };
  stats: Stats;
  loading: boolean;
  error: Error | null;
  moveDeal: (
    dealId: string,
    fromStage: string,
    toStage: string,
    index: number,
  ) => Promise<void>;
  updateStageStats: () => void;
}

export function useKanban(
  userId: string,
  role: UserRole = "SALES",
): UseKanbanReturn {
  const [stages, setStages] = useState<Stage[]>(STAGES);
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [stats, setStats] = useState<Stats>(MOCK_STATS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Group deals by stage
  const dealsByStage = deals.reduce(
    (acc, deal) => {
      if (!acc[deal.stage]) {
        acc[deal.stage] = [];
      }
      acc[deal.stage].push(deal);
      return acc;
    },
    {} as { [stageId: string]: Deal[] },
  );

  // Update stage statistics
  const updateStageStats = useCallback(() => {
    const updatedStages = stages.map((stage) => {
      const stageDeals = dealsByStage[stage.id] || [];
      return {
        ...stage,
        dealCount: stageDeals.length,
        totalValue: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
      };
    });
    setStages(updatedStages);

    // Update overall stats
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    setStats({
      ...stats,
      totalDeals,
      totalValue,
      avgDealSize: totalDeals > 0 ? totalValue / totalDeals : 0,
    });
  }, [deals, dealsByStage, stages]);

  // Move deal between stages
  const moveDeal = useCallback(
    async (
      dealId: string,
      fromStage: string,
      toStage: string,
      index: number,
    ) => {
      // Validate transition
      if (!canTransition(fromStage, toStage, role)) {
        throw new Error("Invalid stage transition");
      }

      setLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 300));

        setDeals((prevDeals) => {
          return prevDeals.map((deal) => {
            if (deal.id === dealId) {
              const stageOrder =
                stages.find((s) => s.id === toStage)?.order || 0;
              return {
                ...deal,
                stage: toStage,
                stageOrder,
                updatedAt: new Date().toISOString(),
                daysInCurrentStage: 0,
              };
            }
            return deal;
          });
        });

        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        throw err;
      }
    },
    [role, stages],
  );

  // Update stage stats whenever deals change
  useEffect(() => {
    updateStageStats();
  }, [deals]);

  return {
    stages,
    dealsByStage,
    stats,
    loading,
    error,
    moveDeal,
    updateStageStats,
  };
}
