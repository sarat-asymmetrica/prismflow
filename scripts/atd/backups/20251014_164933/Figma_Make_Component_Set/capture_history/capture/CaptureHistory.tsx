import { useEffect, useRef, useState } from "react";
import { useCaptureHistory } from "../../hooks/useCaptureHistory";
import { UserRole } from "../../types/capture";
import { Button } from "../ui/button";
import { Download, RefreshCw, Clock, List, Grid, Loader } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FiltersBar } from "./FiltersBar";
import { DateHeader } from "./DateHeader";
import { TimelineMarker } from "./TimelineMarker";
import { CaptureCard } from "./CaptureCard";
import { EmptyState } from "./EmptyState";
import { gsap } from "gsap";

interface CaptureHistoryProps {
  userId: string;
  role?: UserRole;
}

export function CaptureHistory({
  userId,
  role = "ADMIN",
}: CaptureHistoryProps) {
  const {
    groupedCaptures,
    stats,
    filters,
    loading,
    hasMore,
    updateFilters,
    loadMore,
    refreshHistory,
    exportData,
  } = useCaptureHistory({ userId, role });

  const [viewMode, setViewMode] = useState<"timeline" | "list" | "grid">(
    "timeline",
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Page load animations
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
      );
    }

    if (filtersRef.current) {
      gsap.fromTo(
        filtersRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", delay: 0.2 },
      );
    }
  }, []);

  // Timeline items stagger animation
  useEffect(() => {
    if (timelineRef.current && !loading) {
      const items = timelineRef.current.querySelectorAll(".timeline-item");
      gsap.fromTo(
        items,
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, [groupedCaptures, loading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    // Animate refresh icon
    const refreshIcon = document.querySelector(".refresh-icon");
    if (refreshIcon) {
      gsap.to(refreshIcon, {
        rotation: 360,
        duration: 0.8,
        ease: "linear",
      });
    }

    await refreshHistory();
    setIsRefreshing(false);
  };

  const handleExport = async (format: "csv" | "pdf" | "json") => {
    await exportData(format);
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.customerId !== undefined ||
    filters.status !== undefined;

  return (
    <div className="capture-history min-h-screen bg-[#F8F9FA] p-6 md:p-8">
      {/* Header */}
      <div ref={headerRef} className="history-header mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-[#212529] mb-2">Capture History</h1>
            <p className="text-[#6C757D]">
              {stats.totalCount} captures · {stats.todayCount} today ·{" "}
              {stats.processedPercentage}% processed
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white border border-[#E9ECEF] rounded-lg p-1">
              <Button
                variant={viewMode === "timeline" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className={viewMode === "timeline" ? "bg-[#6C63FF]" : ""}
              >
                <Clock className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-[#6C63FF]" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-[#6C63FF]" : ""}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`refresh-icon w-4 h-4 text-[#6C63FF] ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>

            {/* Export Button */}
            {role !== "USER" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#6C63FF] text-[#6C63FF]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("json")}>
                    Export as JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div ref={filtersRef}>
        <FiltersBar
          filters={filters}
          onFiltersChange={updateFilters}
          role={role}
        />
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="timeline">
        {groupedCaptures.length === 0 ? (
          <EmptyState
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => {
              updateFilters({
                types: [],
                customerId: undefined,
                status: undefined,
              });
            }}
            onCreateCapture={() =>
              alert("Create capture modal would open here")
            }
          />
        ) : (
          groupedCaptures.map((group, groupIndex) => (
            <div key={group.date} className="date-group mb-8">
              <DateHeader date={group.date} count={group.captures.length} />

              <div className="space-y-4">
                {group.captures.map((capture, captureIndex) => {
                  const isLastInGroup =
                    captureIndex === group.captures.length - 1;
                  const isLastGroup = groupIndex === groupedCaptures.length - 1;
                  const isLast = isLastInGroup && isLastGroup;

                  return (
                    <div key={capture.id} className="timeline-item flex gap-5">
                      <TimelineMarker type={capture.type} isLast={isLast} />
                      <div className="flex-1">
                        <CaptureCard
                          capture={capture}
                          onClick={() =>
                            console.log("Open capture detail:", capture.id)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Trigger */}
      {hasMore && !loading && groupedCaptures.length > 0 && (
        <div ref={loadMoreRef} className="h-20" />
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="load-spinner w-6 h-6 text-[#6C63FF] animate-spin mb-2" />
          <p className="text-[#6C757D] text-[13px]">Loading more captures...</p>
        </div>
      )}
    </div>
  );
}
