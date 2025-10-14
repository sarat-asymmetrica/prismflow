import {
  LayoutGrid,
  Clock,
  MapPin,
  Users,
  Truck,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { useState } from "react";
import { format } from "date-fns";

type View = "kanban" | "timeline" | "map";

interface ViewToggleProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
  activeFilters: any;
}

export const ViewToggle = ({
  currentView,
  onViewChange,
  onFilterChange,
  onClearFilters,
  activeFilters,
}: ViewToggleProps) => {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCarrier, setSelectedCarrier] = useState("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const hasActiveFilters =
    customerSearch ||
    selectedCarrier !== "all" ||
    dateRange.from ||
    dateRange.to;

  const handleCustomerSearch = (value: string) => {
    setCustomerSearch(value);
    onFilterChange({
      customer: value,
      carrier: selectedCarrier !== "all" ? selectedCarrier : undefined,
      dateRange: dateRange.from && dateRange.to ? dateRange : undefined,
    });
  };

  const handleCarrierChange = (value: string) => {
    setSelectedCarrier(value);
    onFilterChange({
      customer: customerSearch || undefined,
      carrier: value !== "all" ? value : undefined,
      dateRange: dateRange.from && dateRange.to ? dateRange : undefined,
    });
  };

  const handleClearFilters = () => {
    setCustomerSearch("");
    setSelectedCarrier("all");
    setDateRange({});
    onClearFilters();
  };

  return (
    <div className="view-toggle flex items-center justify-between px-6 py-3 bg-white border border-[#E9ECEF] rounded-2xl mb-6">
      {/* View Selector */}
      <div className="flex items-center gap-2 bg-[#F8F9FA] rounded-lg p-1">
        <ViewButton
          icon={LayoutGrid}
          label="Kanban"
          isActive={currentView === "kanban"}
          onClick={() => onViewChange("kanban")}
        />
        <ViewButton
          icon={Clock}
          label="Timeline"
          isActive={currentView === "timeline"}
          onClick={() => onViewChange("timeline")}
        />
        <ViewButton
          icon={MapPin}
          label="Map"
          isActive={currentView === "map"}
          onClick={() => onViewChange("map")}
        />
      </div>

      {/* Filters Section */}
      <div className="flex items-center gap-3">
        {/* Customer Filter */}
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
          <Input
            type="text"
            placeholder="Search customer..."
            value={customerSearch}
            onChange={(e) => handleCustomerSearch(e.target.value)}
            className="pl-9 w-[200px] h-9"
          />
        </div>

        {/* Carrier Filter */}
        <div className="relative">
          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none z-10" />
          <Select value={selectedCarrier} onValueChange={handleCarrierChange}>
            <SelectTrigger className="w-[160px] h-9 pl-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Carriers</SelectItem>
              <SelectItem value="dhl">DHL</SelectItem>
              <SelectItem value="fedex">FedEx</SelectItem>
              <SelectItem value="ups">UPS</SelectItem>
              <SelectItem value="aramex">Aramex</SelectItem>
              <SelectItem value="local">Local</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-9">
              <Calendar className="w-4 h-4 mr-2" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM dd")} -{" "}
                    {format(dateRange.to, "MMM dd")}
                  </>
                ) : (
                  format(dateRange.from, "MMM dd, yyyy")
                )
              ) : (
                "Date Range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="p-3">
              <div className="text-sm mb-2">Select date range</div>
              <CalendarComponent
                mode="range"
                selected={dateRange as any}
                onSelect={(range: any) => {
                  setDateRange(range || {});
                  if (range?.from && range?.to) {
                    onFilterChange({
                      customer: customerSearch || undefined,
                      carrier:
                        selectedCarrier !== "all" ? selectedCarrier : undefined,
                      dateRange: range,
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

interface ViewButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ViewButton = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: ViewButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md transition-all
        ${
          isActive
            ? "bg-white text-[#6C63FF] shadow-sm"
            : "text-[#6C757D] hover:text-[#212529]"
        }
      `}
    >
      <Icon className="w-[18px] h-[18px]" />
      <span className="text-[13px]">{label}</span>
    </button>
  );
};
