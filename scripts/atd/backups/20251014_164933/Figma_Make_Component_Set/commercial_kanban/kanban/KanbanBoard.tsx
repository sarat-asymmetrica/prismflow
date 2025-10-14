import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { KanbanHeader } from "./KanbanHeader";
import { StageColumn } from "./StageColumn";
import { DealCard } from "./DealCard";
import { useKanban } from "../../hooks/useKanban";
import { Deal, KanbanProps, ViewFilter } from "../../lib/kanban-types";
import { toast } from "sonner@2.0.3";
import gsap from "gsap";

export function KanbanBoard({
  userId,
  role = "SALES",
  initialView = "my",
  onDealClick,
}: KanbanProps) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>(initialView);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const { stages, dealsByStage, stats, moveDeal } = useKanban(userId, role);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Page load animation
  useEffect(() => {
    gsap.from(".kanban-header", {
      y: -30,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    });

    gsap.from(".stage-column", {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "back.out(1.7)",
      delay: 0.2,
    });
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = active.data.current?.deal;
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeDeal = active.data.current?.deal as Deal;
    const overStageId =
      over.data.current?.stage?.id || over.data.current?.deal?.stage;

    if (!activeDeal || !overStageId) return;

    // Don't do anything if dropped in same stage
    if (activeDeal.stage === overStageId) return;

    try {
      await moveDeal(activeDeal.id, activeDeal.stage, overStageId, 0);

      toast.success(
        `Deal moved to ${stages.find((s) => s.id === overStageId)?.name}`,
        {
          duration: 2000,
        },
      );

      // Animate the stage count update
      gsap
        .timeline()
        .to(".stage-count", {
          scale: 1.2,
          duration: 0.2,
          ease: "power2.out",
        })
        .to(".stage-count", {
          scale: 1.0,
          duration: 0.2,
          ease: "power2.out",
        });
    } catch (error) {
      toast.error("Failed to move deal. Invalid transition.", {
        duration: 3000,
      });
    }
  };

  const handleAddDeal = () => {
    toast.info("Add deal functionality coming soon!");
  };

  const showViewFilter = role !== "SALES";

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        <KanbanHeader
          stats={stats}
          viewFilter={viewFilter}
          onViewFilterChange={setViewFilter}
          onAddDeal={handleAddDeal}
          showViewFilter={showViewFilter}
        />

        {/* Desktop: Horizontal Layout */}
        <div className="hidden md:block">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5 overflow-x-auto pb-6">
              {stages.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  deals={dealsByStage[stage.id] || []}
                  onDealClick={onDealClick}
                />
              ))}
            </div>

            <DragOverlay>
              {activeDeal ? (
                <div className="rotate-[-5deg] scale-105">
                  <DealCard deal={activeDeal} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Mobile: Tab Layout */}
        <div className="md:hidden">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {stages.map((stage) => (
              <button
                key={stage.id}
                className="px-4 py-2 rounded-lg whitespace-nowrap border border-[#E9ECEF] bg-white"
                style={{
                  borderBottom: `3px solid ${stage.color}`,
                }}
              >
                {stage.name} ({dealsByStage[stage.id]?.length || 0})
              </button>
            ))}
          </div>

          {stages.map((stage) => (
            <div key={stage.id} className="mb-6">
              <h3 className="text-[#212529] mb-3">{stage.name}</h3>
              <div className="space-y-3">
                {(dealsByStage[stage.id] || []).map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onDealClick={onDealClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
