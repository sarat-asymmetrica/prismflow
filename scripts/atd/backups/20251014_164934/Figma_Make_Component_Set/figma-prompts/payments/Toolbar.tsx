import {
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  Download,
  Archive,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { PaymentStatus, SortState } from "../types/payment";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: PaymentStatus[];
  onStatusFilterChange: (statuses: PaymentStatus[]) => void;
  sortBy: SortState;
  onSortChange: (sort: SortState) => void;
  selectedCount: number;
  onBulkAction: (action: string) => void;
}

const statusOptions: { value: PaymentStatus; label: string; color: string }[] =
  [
    { value: "pending", label: "Pending", color: "#FFD166" },
    { value: "overdue", label: "Overdue", color: "#FF6B6B" },
    { value: "partially_paid", label: "Partially Paid", color: "#FF9800" },
    { value: "paid", label: "Paid", color: "#06D6A0" },
    { value: "cancelled", label: "Cancelled", color: "#ADB5BD" },
  ];

export function Toolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  selectedCount,
  onBulkAction,
}: ToolbarProps) {
  const handleStatusToggle = (status: PaymentStatus) => {
    if (statusFilter.includes(status)) {
      onStatusFilterChange(statusFilter.filter((s) => s !== status));
    } else {
      onStatusFilterChange([...statusFilter, status]);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      {/* Left Section */}
      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[300px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]"
            size={16}
          />
          <Input
            placeholder="Search by invoice number, customer, or amount..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-[#E9ECEF]"
          />
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2 p-2 bg-[#F8F9FA] rounded-lg">
            <span className="text-sm text-[#6C757D] px-2">
              {selectedCount} selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkAction("send_reminders")}
              className="h-8"
            >
              <Mail size={14} className="mr-1" />
              Send Reminders
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkAction("export")}
              className="h-8"
            >
              <Download size={14} className="mr-1" />
              Export
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onBulkAction("mark_paid")}
              className="h-8"
            >
              <Archive size={14} className="mr-1" />
              Mark Paid
            </Button>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
        {/* Status Filter */}
        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-[#6C757D]" />
          <div className="flex gap-1 flex-wrap">
            <Button
              size="sm"
              variant={statusFilter.length === 0 ? "default" : "outline"}
              onClick={() => onStatusFilterChange([])}
              className="h-8"
            >
              All
            </Button>
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={
                  statusFilter.includes(option.value) ? "default" : "outline"
                }
                onClick={() => handleStatusToggle(option.value)}
                className="h-8"
                style={
                  statusFilter.includes(option.value)
                    ? {
                        backgroundColor: option.color,
                        borderColor: option.color,
                      }
                    : {}
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <Select
          value={`${sortBy.column}_${sortBy.order}`}
          onValueChange={(value) => {
            const [column, order] = value.split("_");
            onSortChange({ column, order: order as "asc" | "desc" });
          }}
        >
          <SelectTrigger className="w-[180px] h-8 border-[#E9ECEF]">
            <ArrowUpDown size={14} className="mr-2 text-[#6C757D]" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate_asc">Due Date (Earliest)</SelectItem>
            <SelectItem value="dueDate_desc">Due Date (Latest)</SelectItem>
            <SelectItem value="totalAmount_desc">
              Amount (High to Low)
            </SelectItem>
            <SelectItem value="totalAmount_asc">
              Amount (Low to High)
            </SelectItem>
            <SelectItem value="customerName_asc">Customer (A-Z)</SelectItem>
            <SelectItem value="customerName_desc">Customer (Z-A)</SelectItem>
            <SelectItem value="daysOverdue_desc">
              Days Overdue (Most)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
