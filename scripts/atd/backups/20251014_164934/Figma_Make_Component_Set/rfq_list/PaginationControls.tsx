import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Pagination } from "../types/rfq";
import { PER_PAGE_OPTIONS } from "../constants/rfqConstants";

interface PaginationControlsProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function PaginationControls({
  pagination,
  onPageChange,
  onPerPageChange,
}: PaginationControlsProps) {
  const start = (pagination.page - 1) * pagination.perPage + 1;
  const end = Math.min(pagination.page * pagination.perPage, pagination.total);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 md:p-6 bg-white border border-[#E9ECEF] rounded-xl">
      <p
        className="text-[#6C757D]"
        style={{ fontSize: "13px", lineHeight: "18px" }}
      >
        Showing {start}-{end} of {pagination.total} RFQs
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[#6C757D] text-sm">Per page:</span>
          <Select
            value={pagination.perPage.toString()}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button variant="outline" disabled className="min-w-[40px]">
            {pagination.page}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={
              pagination.page === pagination.totalPages ||
              pagination.totalPages === 0
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
