import { useEffect, useRef, useState } from "react";
import { Plus, Upload, Download, RefreshCw } from "lucide-react";
import { Button } from "./components/ui/button";
import { RFQCard } from "./components/RFQCard";
import { StatsRow } from "./components/StatsRow";
import { FiltersBar } from "./components/FiltersBar";
import { EmptyState } from "./components/EmptyState";
import { PaginationControls } from "./components/PaginationControls";
import { RFQListSkeleton } from "./components/RFQListSkeleton";
import { useRFQs } from "./hooks/useRFQs";
import { useDebounce } from "./hooks/useDebounce";
import { UserRole } from "./types/rfq";
import { toast, Toaster } from "sonner@2.0.3";
import gsap from "gsap";

export default function App() {
  // Simulated user context
  const [userId] = useState("u1");
  const [role] = useState<UserRole>("SALES_MANAGER"); // Change to test different roles: 'SALES', 'SALES_MANAGER', 'ADMIN', 'SUPERADMIN'

  const headerRef = useRef<HTMLDivElement>(null);

  const {
    rfqs,
    stats,
    pagination,
    loading,
    filters,
    setFilters,
    setPage,
    setPerPage,
    refetch,
  } = useRFQs(userId, role);

  const debouncedSearch = useDebounce(filters.search, 300);

  // Update filters with debounced search
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Animate header on mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, []);

  const handleCreateRFQ = () => {
    toast.success("Create RFQ modal would open here");
  };

  const handleImportRFQs = () => {
    toast.success("Import RFQs dialog would open here");
  };

  const handleExportRFQs = () => {
    toast.success("Exporting RFQs to CSV...");
    setTimeout(() => {
      toast.success("RFQs exported successfully");
    }, 1000);
  };

  const handleRFQClick = (rfqId: string) => {
    toast.info(`Opening RFQ details for ${rfqId}`);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      statuses: [],
      dateRange: undefined,
    });
  };

  const hasActiveFilters =
    filters.search.length >= 2 ||
    filters.statuses.length > 0 ||
    filters.dateRange !== undefined;

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] p-4 md:p-6 lg:p-8">
      <Toaster position="top-right" />

      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div ref={headerRef} className="rfq-header mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h1
              style={{ fontSize: "32px", lineHeight: "40px", color: "#212529" }}
            >
              RFQs
            </h1>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleImportRFQs}
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>

              <Button
                variant="ghost"
                className="gap-2"
                onClick={handleExportRFQs}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={refetch}
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Button
                className="gap-2 bg-gradient-to-br from-[#6C63FF] to-[#5A52E0] text-white hover:opacity-90 transition-opacity"
                onClick={handleCreateRFQ}
              >
                <Plus className="w-4 h-4" />
                New RFQ
              </Button>
            </div>
          </div>

          <StatsRow stats={stats} />
        </div>

        {/* Filters Bar */}
        <FiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          role={role}
        />

        {/* RFQ List */}
        <div className="list-container">
          {loading ? (
            <RFQListSkeleton />
          ) : rfqs.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              onCreateRFQ={handleCreateRFQ}
            />
          ) : (
            <div className="space-y-3">
              {rfqs.map((rfq) => (
                <RFQCard
                  key={rfq.id}
                  rfq={rfq}
                  role={role}
                  userId={userId}
                  onClick={() => handleRFQClick(rfq.code)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && rfqs.length > 0 && (
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        )}

        {/* Role Indicator (for demo purposes) */}
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-white border border-[#E9ECEF] rounded-lg shadow-lg text-sm">
          <span className="text-[#6C757D]">Current Role: </span>
          <span className="font-medium text-[#6C63FF]">{role}</span>
        </div>
      </div>
    </div>
  );
}
