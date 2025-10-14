import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { StageData, Deal } from "./types";
import { formatCurrency, formatNumber, formatDuration } from "./utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Hash,
  DollarSign,
  TrendingUp,
  Clock,
  Search,
  Download,
  ArrowUpDown,
} from "lucide-react";
import { Card } from "../ui/card";

interface StageDetailsModalProps {
  stage: StageData | null;
  color: string;
  isOpen: boolean;
  onClose: () => void;
  onDealClick?: (deal: Deal) => void;
}

type SortField =
  | "name"
  | "customerName"
  | "value"
  | "daysInStage"
  | "winProbability";
type SortDirection = "asc" | "desc";

export const StageDetailsModal: React.FC<StageDetailsModalProps> = ({
  stage,
  color,
  isOpen,
  onClose,
  onDealClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  if (!stage) return null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredDeals = stage.deals.filter(
    (deal) =>
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "name":
        return multiplier * a.name.localeCompare(b.name);
      case "customerName":
        return multiplier * a.customerName.localeCompare(b.customerName);
      case "value":
        return multiplier * (a.value - b.value);
      case "daysInStage":
        return multiplier * (a.daysInStage - b.daysInStage);
      case "winProbability":
        return multiplier * (a.winProbability - b.winProbability);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedDeals.length / pageSize);
  const paginatedDeals = sortedDeals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      size={14}
      className="inline ml-1"
      style={{
        color: sortField === field ? color : "#6C757D",
        opacity: sortField === field ? 1 : 0.5,
      }}
    />
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${color}20` }}
            >
              <Hash size={24} color={color} />
            </div>
            <div>
              <h2 className="text-2xl" style={{ color: "#212529" }}>
                {stage.name} Stage Details
              </h2>
              <p className="text-sm mt-1" style={{ color: "#6C757D" }}>
                Detailed breakdown and deal list
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Summary Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={18} color={color} />
              <span className="text-sm" style={{ color: "#6C757D" }}>
                Total Count
              </span>
            </div>
            <div className="text-2xl" style={{ color: "#212529" }}>
              {formatNumber(stage.count)}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={18} color={color} />
              <span className="text-sm" style={{ color: "#6C757D" }}>
                Total Value
              </span>
            </div>
            <div className="text-2xl" style={{ color: "#212529" }}>
              {formatCurrency(stage.totalValue)}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} color="#3B82F6" />
              <span className="text-sm" style={{ color: "#6C757D" }}>
                Avg Deal Size
              </span>
            </div>
            <div className="text-2xl" style={{ color: "#212529" }}>
              {formatCurrency(stage.avgDealSize)}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} color="#FF9800" />
              <span className="text-sm" style={{ color: "#6C757D" }}>
                Avg Time in Stage
              </span>
            </div>
            <div className="text-2xl" style={{ color: "#212529" }}>
              {formatDuration(stage.avgTimeInStage)}
            </div>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#6C757D" }}
            />
            <Input
              placeholder="Search deals by name or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Download size={16} />
            Export
          </Button>
        </div>

        {/* Deals Table */}
        <div
          className="mt-6 border rounded-lg"
          style={{ borderColor: "#E9ECEF" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("name")}
                >
                  Deal Name <SortIcon field="name" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("customerName")}
                >
                  Customer <SortIcon field="customerName" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("value")}
                >
                  Value <SortIcon field="value" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("daysInStage")}
                >
                  Days in Stage <SortIcon field="daysInStage" />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("winProbability")}
                >
                  Win Probability <SortIcon field="winProbability" />
                </TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDeals.map((deal) => (
                <TableRow
                  key={deal.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onDealClick?.(deal)}
                >
                  <TableCell>{deal.name}</TableCell>
                  <TableCell>{deal.customerName}</TableCell>
                  <TableCell>{formatCurrency(deal.value)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor:
                          deal.daysInStage > 7
                            ? "rgba(255, 152, 0, 0.1)"
                            : "transparent",
                        color: deal.daysInStage > 7 ? "#FF9800" : "#6C757D",
                        borderColor:
                          deal.daysInStage > 7 ? "#FF9800" : "#E9ECEF",
                      }}
                    >
                      {deal.daysInStage}d
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full flex-1"
                        style={{ backgroundColor: "#E9ECEF", width: "60px" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: color,
                            width: `${deal.winProbability}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm" style={{ color: "#6C757D" }}>
                        {deal.winProbability}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm" style={{ color: "#6C757D" }}>
                    {deal.ownerName}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDealClick?.(deal);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm" style={{ color: "#6C757D" }}>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedDeals.length)} of{" "}
              {sortedDeals.length} deals
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="text-sm" style={{ color: "#6C757D" }}>
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
