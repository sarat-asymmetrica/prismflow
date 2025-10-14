import { useState } from "react";
import { FilterState, CaptureType, CaptureStatus } from "../../types/capture";
import { Button } from "../ui/button";
import { Calendar, Filter, Users, CheckCircle, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { captureTypeLabels } from "../../utils/captureUtils";
import { getDateRangePreset } from "../../utils/captureUtils";

interface FiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  role?: "USER" | "ADMIN" | "SUPERADMIN";
}

const datePresets = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Last 30 Days",
  "This Month",
];

const captureTypes: CaptureType[] = [
  "whatsapp",
  "call",
  "email",
  "meeting",
  "note",
  "task",
];
const statusOptions: CaptureStatus[] = ["pending", "processed", "archived"];

export function FiltersBar({
  filters,
  onFiltersChange,
  role = "ADMIN",
}: FiltersBarProps) {
  const [selectedPreset, setSelectedPreset] = useState("Last 7 Days");

  const handleDateRangeChange = (preset: string) => {
    setSelectedPreset(preset);
    const dateRange = getDateRangePreset(preset);
    onFiltersChange({ dateRange });
  };

  const handleTypeToggle = (type: CaptureType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ types: newTypes });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      status: status === "all" ? undefined : (status as CaptureStatus),
    });
  };

  const handleClearFilters = () => {
    setSelectedPreset("Last 7 Days");
    onFiltersChange({
      dateRange: getDateRangePreset("Last 7 Days"),
      types: [],
      customerId: undefined,
      status: undefined,
    });
  };

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.customerId !== undefined ||
    filters.status !== undefined ||
    selectedPreset !== "Last 7 Days";

  return (
    <div className="filters-bar bg-white border border-[#E9ECEF] rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
      {/* Date Range Picker */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[#6C757D]" />
        <Select value={selectedPreset} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {datePresets.map((preset) => (
              <SelectItem key={preset} value={preset}>
                {preset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#6C757D]" />
        <div className="flex gap-2 flex-wrap">
          {captureTypes.map((type) => {
            const isActive = filters.types.includes(type);
            return (
              <Button
                key={type}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleTypeToggle(type)}
                className={isActive ? "bg-[#6C63FF] hover:bg-[#5A52E0]" : ""}
              >
                {captureTypeLabels[type]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Status Filter */}
      {role !== "USER" && (
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#6C757D]" />
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Customer Filter (Admin/Superadmin only) */}
      {role !== "USER" && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#6C757D]" />
          <Select
            value={filters.customerId || "all"}
            onValueChange={(value) =>
              onFiltersChange({
                customerId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="1">Acme Corp</SelectItem>
              <SelectItem value="2">TechStart Inc</SelectItem>
              <SelectItem value="3">Global Solutions</SelectItem>
              <SelectItem value="4">Innovation Labs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="ml-auto text-[#6C63FF]"
        >
          <X className="w-4 h-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
