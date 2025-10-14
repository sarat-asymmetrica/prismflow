// Main Order Table Component

import { useEffect, useRef } from "react";
import {
  Plus,
  Upload,
  Download,
  Settings,
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { OrderTableToolbar } from "./OrderTableToolbar";
import { OrderTableRow } from "./OrderTableRow";
import { OrderTablePagination } from "./OrderTablePagination";
import { useOrderTable } from "../hooks/useOrderTable";
import { formatCurrency } from "../lib/orderUtils";
import { toast } from "sonner@2.0.3";
import gsap from "gsap";

export function OrderTable() {
  const {
    orders,
    filters,
    sorting,
    pagination,
    selectedRows,
    stats,
    updateFilters,
    updateSorting,
    goToPage,
    changePageSize,
    toggleRowSelection,
    toggleAllRows,
    clearSelection,
    resetFilters,
    hasActiveFilters,
  } = useOrderTable();

  const headerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLTableRowElement[]>([]);

  // Page load animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(toolbarRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        delay: 0.2,
      });

      gsap.from(tableRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        delay: 0.3,
      });
    });

    return () => ctx.revert();
  }, []);

  // Animate rows on data change
  useEffect(() => {
    if (rowsRef.current.length > 0) {
      gsap.from(rowsRef.current, {
        x: -20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });
    }
  }, [orders]);

  const getSortIcon = (column: string) => {
    if (sorting.column !== column) {
      return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    }
    return sorting.order === "asc" ? (
      <ArrowUp size={14} className="ml-1" />
    ) : (
      <ArrowDown size={14} className="ml-1" />
    );
  };

  const handleSortClick = (column: string) => {
    updateSorting(column);
    toast.info(`Sorted by ${column}`);
  };

  const handleCreateFromQuote = () => {
    toast.info("Opening quote selection...");
  };

  const handleImport = () => {
    toast.info("Opening import dialog...");
  };

  const handleExport = () => {
    toast.success("Exporting orders...");
  };

  const allRowsSelected =
    orders.length > 0 && selectedRows.length === orders.length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div ref={headerRef} className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-[#212529] mb-2">Orders</h1>
            <p className="text-sm text-[#6C757D]">
              {stats.totalCount} orders ·{" "}
              {formatCurrency(stats.totalValue, "BHD")} ·{" "}
              {stats.inProductionCount} in production ·{" "}
              {stats.deliveryTodayCount} deliveries today
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleCreateFromQuote}
              className="bg-gradient-to-br from-[#6C63FF] to-[#5A52E0] text-white"
            >
              <Plus size={16} className="mr-2" />
              Create from Quote
            </Button>
            <Button variant="outline" onClick={handleImport}>
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="icon">
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div ref={toolbarRef}>
        <OrderTableToolbar
          filters={filters}
          sorting={sorting}
          selectedCount={selectedRows.length}
          onFilterChange={updateFilters}
          onSortChange={updateSorting}
          onClearFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Table */}
      <div
        ref={tableRef}
        className="bg-white border border-[#E9ECEF] rounded-2xl overflow-hidden shadow-sm"
      >
        {orders.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-16">
            <ShoppingCart size={64} className="text-[#E9ECEF] mb-6" />
            <h3 className="text-[#212529] mb-2">
              {hasActiveFilters
                ? "No orders match your filters"
                : "No orders yet"}
            </h3>
            <p className="text-[#6C757D] text-center max-w-md mb-6">
              {hasActiveFilters
                ? "Try adjusting your filters or search term"
                : "Start by creating an order from an approved quotation"}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={resetFilters}>
                Clear all filters
              </Button>
            ) : (
              <Button onClick={handleCreateFromQuote}>Create from Quote</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8F9FA] border-b-2 border-[#E9ECEF] hover:bg-[#F8F9FA]">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allRowsSelected}
                      onCheckedChange={toggleAllRows}
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-[#6C63FF]"
                    onClick={() => handleSortClick("order_no")}
                  >
                    <div className="flex items-center">
                      Order No
                      {getSortIcon("order_no")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-[#6C63FF]"
                    onClick={() => handleSortClick("customer")}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon("customer")}
                    </div>
                  </TableHead>
                  <TableHead>RFQ / Quotation</TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-[#6C63FF]"
                    onClick={() => handleSortClick("amount")}
                  >
                    <div className="flex items-center">
                      Amount
                      {getSortIcon("amount")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-[#6C63FF]"
                    onClick={() => handleSortClick("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none hover:text-[#6C63FF]"
                    onClick={() => handleSortClick("delivery_date")}
                  >
                    <div className="flex items-center">
                      Delivery Date
                      {getSortIcon("delivery_date")}
                    </div>
                  </TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    isSelected={selectedRows.includes(order.id)}
                    onToggleSelect={toggleRowSelection}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {orders.length > 0 && (
        <OrderTablePagination
          pagination={pagination}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
      )}
    </div>
  );
}
