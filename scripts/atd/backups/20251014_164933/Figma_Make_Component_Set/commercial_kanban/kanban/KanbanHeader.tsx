import { Plus, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Stats, ViewFilter } from "../../lib/kanban-types";
import { formatCurrency } from "../../lib/kanban-utils";

interface KanbanHeaderProps {
  stats: Stats;
  viewFilter: ViewFilter;
  onViewFilterChange: (view: ViewFilter) => void;
  onAddDeal: () => void;
  showViewFilter?: boolean;
}

export function KanbanHeader({
  stats,
  viewFilter,
  onViewFilterChange,
  onAddDeal,
  showViewFilter = true,
}: KanbanHeaderProps) {
  return (
    <div className="kanban-header mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Title Section */}
        <div>
          <h1 className="text-[#212529] mb-2">Commercial Pipeline</h1>
          <p className="text-[#6C757D]">
            {stats.totalDeals} deals · {formatCurrency(stats.totalValue, "INR")}{" "}
            · {stats.winRate}% win rate
          </p>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Filter */}
          {showViewFilter && (
            <ToggleGroup
              type="single"
              value={viewFilter}
              onValueChange={(value) =>
                value && onViewFilterChange(value as ViewFilter)
              }
              className="border border-[#E9ECEF] rounded-lg p-1 bg-white"
            >
              <ToggleGroupItem
                value="my"
                aria-label="My Deals"
                className="data-[state=on]:bg-[#6C63FF] data-[state=on]:text-white"
              >
                My Deals
              </ToggleGroupItem>
              <ToggleGroupItem
                value="team"
                aria-label="Team Deals"
                className="data-[state=on]:bg-[#6C63FF] data-[state=on]:text-white"
              >
                Team Deals
              </ToggleGroupItem>
              <ToggleGroupItem
                value="all"
                aria-label="All Deals"
                className="data-[state=on]:bg-[#6C63FF] data-[state=on]:text-white"
              >
                All Deals
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          {/* Add Deal Button */}
          <Button
            onClick={onAddDeal}
            className="bg-gradient-to-br from-[#6C63FF] to-[#5A52E0] hover:opacity-90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>

          {/* Settings Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5 text-[#6C757D]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Customize stages</DropdownMenuItem>
              <DropdownMenuItem>Pipeline settings</DropdownMenuItem>
              <DropdownMenuItem>Export report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
