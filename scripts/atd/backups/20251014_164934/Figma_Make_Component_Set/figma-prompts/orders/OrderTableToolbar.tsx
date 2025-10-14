// Order Table Toolbar Component

import { Search, Filter, Users, Calendar, ArrowUpDown, X } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ORDER_STATUSES, OrderStatus } from "../types/order";
import { FilterState, SortState } from "../types/order";

interface OrderTableToolbarProps {
  filters: FilterState;
  sorting: SortState;
  selectedCount: number;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onSortChange: (column: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function OrderTableToolbar({
  filters,
  sorting,
  selectedCount,
  onFilterChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: OrderTableToolbarProps) {
  const statusEntries = Object.entries(ORDER_STATUSES) as [
    OrderStatus,
    (typeof ORDER_STATUSES)[OrderStatus],
  ][];

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-2xl p-4 mb-4">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]"
              size={16}
            />
            <Input
              placeholder="Search orders by number, customer, RFQ..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-10 pr-8 h-10 border-[#E9ECEF]"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#212529]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(108,99,255,0.05)] border border-[#6C63FF] rounded-lg">
              <span className="text-sm text-[#6C63FF]">
                {selectedCount} selected
              </span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-[#E9ECEF]">
                <Filter size={16} className="mr-2" />
                Status
                {filters.statuses.length > 0 && (
                  <Badge className="ml-2 h-5 px-1.5 bg-[#6C63FF]">
                    {filters.statuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {statusEntries.map(([status, config]) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.statuses.includes(status)}
                  onCheckedChange={(checked) => {
                    const newStatuses = checked
                      ? [...filters.statuses, status]
                      : filters.statuses.filter((s) => s !== status);
                    onFilterChange({ statuses: newStatuses });
                  }}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                    style={{ backgroundColor: config.color }}
                  />
                  {config.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <Select
            value={`${sorting.column}-${sorting.order}`}
            onValueChange={(value) => {
              const [column] = value.split("-");
              onSortChange(column);
            }}
          >
            <SelectTrigger className="h-10 w-[180px] border-[#E9ECEF]">
              <ArrowUpDown size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Date Created</SelectItem>
              <SelectItem value="order_no-asc">Order Number</SelectItem>
              <SelectItem value="customer-asc">Customer</SelectItem>
              <SelectItem value="amount-desc">Amount</SelectItem>
              <SelectItem value="delivery_date-asc">Delivery Date</SelectItem>
              <SelectItem value="status-asc">Status</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="h-10 text-[#6C757D]"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
