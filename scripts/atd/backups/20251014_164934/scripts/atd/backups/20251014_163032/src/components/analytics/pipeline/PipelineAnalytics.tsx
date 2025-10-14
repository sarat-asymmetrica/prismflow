import React, { useState, useRef } from "react";
import {
  PipelineChartProps,
  ChartType,
  TimePeriod,
  FilterState,
  StageData,
} from "./types";
import { mockPipelineData } from "./mockData";
import { FunnelStage } from "./FunnelStage";
import { ConversionRatesChart } from "./ConversionRatesChart";
import { LossAnalysisChart } from "./LossAnalysisChart";
import { InsightsPanel } from "./InsightsPanel";
import { SankeyDiagram } from "./SankeyDiagram";
import { TimelineChart } from "./TimelineChart";
import { StageDetailsModal } from "./StageDetailsModal";
import { FilterPanel } from "./FilterPanel";
import { ShortcutHint } from "./ShortcutHint";
import { Confetti, celebrateDealWon } from "./Confetti";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { usePageLoadAnimation } from "./useAnimations";
import { formatCurrency, formatNumber, formatPercentage } from "./utils";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner@2.0.3";
import {
  TrendingUp,
  Filter,
  GitBranch,
  LineChart,
  Download,
  RefreshCw,
  Activity,
  Keyboard,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const STAGE_COLORS: Record<string, string> = {
  capture: "#FFD166",
  rfq: "#FF9800",
  quotation: "#8B5CF6",
  order: "#3B82F6",
  delivery: "#06D6A0",
  payment: "#10B981",
};

export const PipelineAnalytics: React.FC<PipelineChartProps> = ({
  userId,
  role = "ADMIN",
  defaultPeriod = "30days",
  defaultChartType = "funnel",
  onDealClick,
  onStageClick,
}) => {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [period, setPeriod] = useState<TimePeriod>(defaultPeriod);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedStage, setSelectedStage] = useState<StageData | null>(null);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Page load animations
  usePageLoadAnimation();

  // Using mock data for now
  const pipelineData = mockPipelineData;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info("Refreshing pipeline data...");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Pipeline data updated!");
  };

  const handleStageClick = (stage: StageData) => {
    setSelectedStage(stage);
    setShowStageModal(true);
    if (onStageClick) {
      onStageClick(stage.name);
    }
  };

  const handleExport = (format: "png" | "pdf" | "excel" | "csv") => {
    toast.info(`Exporting as ${format.toUpperCase()}...`);
    // Simulate export
    setTimeout(() => {
      toast.success(`Export completed! File downloaded.`);
    }, 1500);
  };

  const handleFocusStage = (index: number) => {
    if (stageRefs.current[index]) {
      stageRefs.current[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      stageRefs.current[index]?.focus();
      toast.info(`Focused on ${pipelineData.stages[index].name} stage`, {
        duration: 1000,
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    toast.info("Filters cleared");
  };

  const handleDealWon = () => {
    // Simulate deal won
    setShowConfetti(true);
    toast.success("🎉 Deal Won! Congratulations!", { duration: 5000 });
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onChartTypeChange: (type) => {
      setChartType(type);
      toast.info(`Switched to ${type} view`, { duration: 1000 });
    },
    onRefresh: handleRefresh,
    onFocusStage: handleFocusStage,
    onExport: () => setShowKeyboardShortcuts(true),
    enabled: !showStageModal && !showKeyboardShortcuts,
  });

  return (
    <div
      className="w-full min-h-screen p-6 md:p-8"
      style={{ backgroundColor: "#F8F9FA" }}
    >
      {/* Header */}
      <div className="mb-6 pipeline-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(108, 99, 255, 0.1)" }}
            >
              <TrendingUp size={28} color="#6C63FF" />
            </div>
            <div>
              <h1 className="text-3xl mb-1" style={{ color: "#212529" }}>
                Sales Pipeline Analytics
              </h1>
              <div
                className="flex flex-wrap items-center gap-3 text-sm"
                style={{ color: "#6C757D" }}
              >
                <span>
                  {formatNumber(pipelineData.totals.totalOpportunities)}{" "}
                  opportunities
                </span>
                <span>·</span>
                <span>
                  {formatCurrency(pipelineData.totals.totalPipelineValue)}{" "}
                  pipeline value
                </span>
                <span>·</span>
                <span>
                  {formatPercentage(pipelineData.totals.overallWinRate)} win
                  rate
                </span>
                <Badge
                  variant="outline"
                  className="ml-2 gap-1"
                  style={{
                    backgroundColor: "rgba(6, 214, 160, 0.1)",
                    color: "#06D6A0",
                    borderColor: "#06D6A0",
                  }}
                >
                  <Activity size={12} className="animate-pulse" />
                  Live
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardShortcuts(true)}
              title="Keyboard shortcuts"
            >
              <Keyboard size={16} color="#6C757D" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh (R)"
            >
              <RefreshCw
                size={16}
                color="#6C63FF"
                className={isRefreshing ? "animate-spin" : ""}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download size={16} />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("png")}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-4 mb-6 pipeline-controls">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Type Toggle */}
            <div
              className="inline-flex rounded-lg p-1"
              style={{
                backgroundColor: "#F8F9FA",
                border: "1px solid #E9ECEF",
              }}
            >
              <button
                onClick={() => setChartType("funnel")}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all"
                style={{
                  backgroundColor:
                    chartType === "funnel" ? "#6C63FF" : "transparent",
                  color: chartType === "funnel" ? "#FFFFFF" : "#6C757D",
                }}
                title="Funnel view (F)"
              >
                <Filter size={14} />
                Funnel
              </button>
              <button
                onClick={() => setChartType("sankey")}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all"
                style={{
                  backgroundColor:
                    chartType === "sankey" ? "#6C63FF" : "transparent",
                  color: chartType === "sankey" ? "#FFFFFF" : "#6C757D",
                }}
                title="Flow view (S)"
              >
                <GitBranch size={14} />
                Flow
              </button>
              <button
                onClick={() => setChartType("timeline")}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all"
                style={{
                  backgroundColor:
                    chartType === "timeline" ? "#6C63FF" : "transparent",
                  color: chartType === "timeline" ? "#FFFFFF" : "#6C757D",
                }}
                title="Timeline view (T)"
              >
                <LineChart size={14} />
                Timeline
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-blue-50" : ""}
            >
              <Filter size={14} className="mr-2" />
              Filters
              {(filters.customer?.length ||
                filters.product?.length ||
                filters.salesperson?.length) && (
                <Badge variant="secondary" className="ml-2">
                  {(filters.customer?.length || 0) +
                    (filters.product?.length || 0) +
                    (filters.salesperson?.length || 0)}
                </Badge>
              )}
            </Button>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as TimePeriod)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Main Chart */}
      <Card className="p-8 mb-6" ref={chartContainerRef}>
        {chartType === "funnel" && (
          <div className="chart-view">
            <h2 className="text-xl mb-6" style={{ color: "#212529" }}>
              Sales Funnel
            </h2>
            <div className="space-y-0">
              {pipelineData.stages.map((stage, index) => (
                <div
                  key={stage.slug}
                  ref={(el) => (stageRefs.current[index] = el)}
                  tabIndex={0}
                  className="funnel-stage"
                >
                  <FunnelStage
                    stage={stage}
                    color={STAGE_COLORS[stage.slug]}
                    icon={null as any}
                    onClick={() => handleStageClick(stage)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {chartType === "sankey" && (
          <div className="chart-view">
            <h2 className="text-xl mb-6" style={{ color: "#212529" }}>
              Pipeline Flow Diagram
            </h2>
            <SankeyDiagram stages={pipelineData.stages} />
          </div>
        )}

        {chartType === "timeline" && (
          <div className="chart-view">
            <h2 className="text-xl mb-6" style={{ color: "#212529" }}>
              Pipeline Timeline
            </h2>
            <TimelineChart
              data={pipelineData.timeline.data}
              granularity={pipelineData.timeline.granularity}
            />
          </div>
        )}
      </Card>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="secondary-chart">
          <ConversionRatesChart data={pipelineData.conversionRates} />
        </div>
        <div className="secondary-chart">
          <LossAnalysisChart data={pipelineData.lossAnalysis} />
        </div>
      </div>

      {/* Insights Panel */}
      <InsightsPanel
        insights={pipelineData.insights}
        recommendations={pipelineData.recommendations}
      />

      {/* Stage Details Modal */}
      <StageDetailsModal
        stage={selectedStage}
        color={selectedStage ? STAGE_COLORS[selectedStage.slug] : "#6C63FF"}
        isOpen={showStageModal}
        onClose={() => setShowStageModal(false)}
        onDealClick={onDealClick}
      />

      {/* Keyboard Shortcuts Dialog */}
      <Dialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard size={24} color="#6C63FF" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="mb-3" style={{ color: "#212529" }}>
                Chart Views
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Funnel view</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">F</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Flow view</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">S</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Timeline view</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">T</kbd>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3" style={{ color: "#212529" }}>
                Actions
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Refresh data</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">R</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Export</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">E</kbd>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3" style={{ color: "#212529" }}>
                Navigation
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Focus Capture</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">1</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Focus RFQ</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">2</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Focus Quotation</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">3</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Focus Order</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">4</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Focus Delivery</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">5</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: "#6C757D" }}>Focus Payment</span>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border">6</kbd>
                </div>
              </div>
            </div>
            <div>
              <h4 className="mb-3" style={{ color: "#212529" }}>
                Tip
              </h4>
              <p className="text-sm" style={{ color: "#6C757D" }}>
                Press{" "}
                <kbd className="px-2 py-1 rounded bg-gray-100 border text-xs">
                  Esc
                </kbd>{" "}
                to close any dialog or modal.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcut Hint */}
      <ShortcutHint />

      {/* Confetti Celebration */}
      <Confetti
        trigger={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Secret: Press Shift+W to trigger celebration! */}
      {typeof window !== "undefined" && (
        <div
          onKeyDown={(e) => {
            if (e.shiftKey && e.key === "W") {
              handleDealWon();
            }
          }}
          tabIndex={-1}
          style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
        />
      )}
    </div>
  );
};
