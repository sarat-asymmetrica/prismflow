import { useEffect, useRef } from "react";
import { Search, Filter, Calendar, ArrowUpDown } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { RFQStatus, Filters, UserRole } from "../types/rfq";
import { STATUS_CONFIG, SORT_OPTIONS } from "../constants/rfqConstants";
import gsap from "gsap";

interface FiltersBarProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  role: UserRole;
}

export function FiltersBar({
  filters,
  onFiltersChange,
  role,
}: FiltersBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      gsap.from(barRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        delay: 0.2,
        ease: "power2.out",
      });
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: e.target.value });
  };

  const handleStatusToggle = (status: RFQStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ statuses: newStatuses });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      statuses: [],
      dateRange: undefined,
    });
  };

  const activeFiltersCount =
    filters.statuses.length +
    (filters.search.length >= 2 ? 1 : 0) +
    (filters.dateRange ? 1 : 0);

  const showViewFilter = ["SALES_MANAGER", "ADMIN", "SUPERADMIN"].includes(
    role,
  );

  return (
    <div
      ref={barRef}
      className="filters-bar w-full p-4 md:p-5 bg-white border border-[#E9ECEF] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] mb-6"
    >
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[250px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
          <Input
            type="text"
            placeholder="Search RFQs, customers..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Status
              {filters.statuses.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 py-0.5 text-xs"
                >
                  {filters.statuses.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={filters.statuses.includes(status as RFQStatus)}
                onCheckedChange={() => handleStatusToggle(status as RFQStatus)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Filter (RBAC) */}
        {showViewFilter && (
          <Select
            value={filters.view}
            onValueChange={(value: any) => onFiltersChange({ view: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="my">My RFQs</SelectItem>
              <SelectItem value="team">Team RFQs</SelectItem>
              {["ADMIN", "SUPERADMIN"].includes(role) && (
                <SelectItem value="all">All RFQs</SelectItem>
              )}
            </SelectContent>
          </Select>
        )}

        {/* Sort */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) => onFiltersChange({ sortBy: value })}
        >
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="text-[#6C63FF]"
          >
            Clear filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Status Chips */}
      {filters.statuses.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#F8F9FA]">
          {filters.statuses.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="px-2.5 py-1 gap-1 cursor-pointer hover:bg-gray-200"
              onClick={() => handleStatusToggle(status)}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: STATUS_CONFIG[status].color }}
              />
              {STATUS_CONFIG[status].label}
              <span className="ml-1">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
