// Customer Table Component - MathAlive Implementation
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Search,
  Plus,
  Upload,
  Download,
  Settings,
  Mail,
  Tag,
  Archive,
  Trash2,
  Filter,
  Award,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Users,
  Eye,
  Edit,
  MoreVertical,
  MessageCircle,
  Phone,
  Video,
  TrendingUp,
  TrendingDown,
  Copy,
  Trophy,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type {
  Customer,
  CustomerTableProps,
  UserRole,
} from "@/components/figma-make/types/customer";
import { useCustomerTable } from "@/components/figma-make/hooks/useCustomerTable";
import {
  formatCurrency,
  formatPercentage,
  formatRelativeTime,
  getInitials,
  generateAvatarColor,
  gradeConfig,
  customerTypeConfig,
  statusConfig,
  debounce,
} from "@/components/figma-make/utils/customerHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CustomerTable({
  userId,
  role = "ADMIN",
  initialFilters,
  onCustomerClick,
  juliusEnabled = true,
}: CustomerTableProps) {
  const {
    customers,
    stats,
    juliusInsights,
    filters,
    sorting,
    pagination,
    selectedRows,
    loading,
    updateFilters,
    updateSorting,
    selectRow,
    selectAllRows,
    clearSelection,
    goToPage,
    bulkAction,
    exportData,
    resetFilters,
    hasActiveFilters,
  } = useCustomerTable({ userId, role, initialFilters });

  const headerRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLTableRowElement[]>([]);

  // Page load animations (GSAP)
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

      if (rowsRef.current.length > 0) {
        gsap.from(rowsRef.current, {
          x: -20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          delay: 0.5,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  // Animate rows when customers change
  useEffect(() => {
    if (rowsRef.current.length > 0) {
      gsap.from(rowsRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.out",
      });
    }
  }, [customers]);

  // Search debounce
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useRef(
    debounce((value: string) => {
      updateFilters({ search: value });
    }, 300),
  ).current;

  useEffect(() => {
    debouncedSearch(searchInput);
  }, [searchInput, debouncedSearch]);

  const canEdit = (customer: Customer) => {
    if (role === "SUPERADMIN" || role === "ADMIN") return true;
    if (role === "SALES" && customer.assignedTo === userId) return true;
    return false;
  };

  const canDelete = (customer: Customer) => {
    if (role === "SUPERADMIN") return true;
    if (role === "ADMIN" && customer.createdBy === userId) return true;
    return false;
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#F8F9FA] p-8">
        {/* Header */}
        <div ref={headerRef} className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[#212529] mb-2">Customers</h1>
              <p className="text-[#6C757D]">
                {stats.totalCount} customers · {stats.gradeBreakdown.A} Grade A
                · {stats.activePercentage}% active
              </p>
              {juliusEnabled && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[rgba(255,215,0,0.1)] to-[rgba(255,215,0,0.2)] border border-[rgba(255,215,0,0.3)]">
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-[#6C757D]">AI Insights Active</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  /* TODO: Implement import functionality */
                }}
                aria-label="Import customers"
              >
                <Upload className="w-4 h-4" aria-hidden="true" />
                Import
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportData("csv")}>
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData("excel")}>
                    Export Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData("pdf")}>
                    Export PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                className="gap-2 bg-gradient-to-br from-[#6C63FF] to-[#5A52E0] hover:opacity-90"
                onClick={() => {
                  /* TODO: Implement add customer functionality */
                }}
                aria-label="Add new customer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div
          ref={toolbarRef}
          className="bg-white border border-[#E9ECEF] rounded-2xl p-4 mb-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D]" />
              <Input
                placeholder="Search customers by name, code, email, phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[rgba(108,99,255,0.05)] rounded-lg border border-[#6C63FF]">
                <span className="text-[#6C63FF] mr-2">
                  {selectedRows.length} selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => bulkAction("email", selectedRows)}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => bulkAction("tag", selectedRows)}
                >
                  <Tag className="w-4 h-4" />
                  Tag
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => bulkAction("archive", selectedRows)}
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filters.grades.length === 0 ? "all" : filters.grades[0]}
              onValueChange={(value) =>
                updateFilters({
                  grades: value === "all" ? [] : [value as any],
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="A">Grade A</SelectItem>
                <SelectItem value="B">Grade B</SelectItem>
                <SelectItem value="C">Grade C</SelectItem>
                <SelectItem value="D">Grade D</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.types.length === 0 ? "all" : filters.types[0]}
              onValueChange={(value) =>
                updateFilters({
                  types: value === "all" ? [] : [value as any],
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
                <SelectItem value="distributor">Distributor</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                updateFilters({
                  status: value === "all" ? undefined : (value as any),
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div
          ref={tableRef}
          className="bg-white border border-[#E9ECEF] rounded-2xl overflow-hidden shadow-sm"
        >
          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-16">
              <Users className="w-16 h-16 text-[#E9ECEF] mb-6" />
              <h3 className="text-[#212529] mb-2">
                {hasActiveFilters
                  ? "No customers match your filters"
                  : "No customers yet"}
              </h3>
              <p className="text-[#6C757D] text-center max-w-md mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters or search term"
                  : "Start adding customers to build your customer base"}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear all filters
                </Button>
              ) : (
                <Button className="bg-gradient-to-br from-[#6C63FF] to-[#5A52E0]">
                  Add your first customer
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8F9FA] border-b-2 border-[#E9ECEF]">
                  <th className="w-12 p-4">
                    <Checkbox
                      checked={
                        selectedRows.length === customers.length &&
                        customers.length > 0
                      }
                      onCheckedChange={selectAllRows}
                    />
                  </th>
                  <th className="w-16 p-4"></th>
                  <SortableHeader
                    label="Customer"
                    column="name"
                    currentSort={sorting}
                    onSort={updateSorting}
                  />
                  <SortableHeader
                    label="Code"
                    column="code"
                    currentSort={sorting}
                    onSort={updateSorting}
                  />
                  <SortableHeader
                    label="Grade"
                    column="grade"
                    currentSort={sorting}
                    onSort={updateSorting}
                  />
                  <th className="text-left p-4 text-[#6C757D] uppercase tracking-wider">
                    Type
                  </th>
                  <SortableHeader
                    label="Revenue"
                    column="revenue"
                    currentSort={sorting}
                    onSort={updateSorting}
                  />
                  <SortableHeader
                    label="Last Contact"
                    column="last_contact"
                    currentSort={sorting}
                    onSort={updateSorting}
                  />
                  <th className="text-left p-4 text-[#6C757D] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <CustomerRow
                    key={customer.id}
                    customer={customer}
                    selected={selectedRows.includes(customer.id)}
                    onSelect={() => selectRow(customer.id)}
                    onClick={() => onCustomerClick?.(customer)}
                    canEdit={canEdit(customer)}
                    canDelete={canDelete(customer)}
                    juliusEnabled={juliusEnabled}
                    ref={(el) => {
                      if (el) rowsRef.current[index] = el;
                    }}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {customers.length > 0 && (
          <div className="bg-white border border-[#E9ECEF] rounded-xl p-4 mt-4 flex items-center justify-between">
            <p className="text-[#6C757D]">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1}-
              {Math.min(
                pagination.currentPage * pagination.pageSize,
                pagination.totalCount,
              )}{" "}
              of {pagination.totalCount} customers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 text-[#212529]">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pagination.totalPages)}
                disabled={!pagination.hasNext}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Sortable Header Component
function SortableHeader({
  label,
  column,
  currentSort,
  onSort,
}: {
  label: string;
  column: string;
  currentSort: { column: string; order: "asc" | "desc" };
  onSort: (column: string) => void;
}) {
  const isActive = currentSort.column === column;
  const Icon = isActive
    ? currentSort.order === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className="text-left p-4 text-[#6C757D] uppercase tracking-wider cursor-pointer hover:text-[#6C63FF] transition-colors group"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-2">
        {label}
        <Icon
          className={`w-3.5 h-3.5 ${isActive ? "text-[#6C63FF]" : "opacity-0 group-hover:opacity-100"}`}
        />
      </div>
    </th>
  );
}

// Customer Row Component
const CustomerRow = React.forwardRef<
  HTMLTableRowElement,
  {
    customer: Customer;
    selected: boolean;
    onSelect: () => void;
    onClick: () => void;
    canEdit: boolean;
    canDelete: boolean;
    juliusEnabled: boolean;
  }
>(
  (
    {
      customer,
      selected,
      onSelect,
      onClick,
      canEdit,
      canDelete,
      juliusEnabled,
    },
    ref,
  ) => {
    const gradeIcon = {
      A: Trophy,
      B: Award,
      C: AlertCircle,
      D: AlertTriangle,
    }[customer.grade];

    const GradeIcon = gradeIcon;

    const contactIcon = {
      whatsapp: MessageCircle,
      call: Phone,
      email: Mail,
      meeting: Video,
    }[customer.lastContactType || "email"];

    const ContactIcon = contactIcon;

    return (
      <tr
        ref={ref}
        className={`border-b border-[#E9ECEF] hover:bg-[#F8F9FA] transition-colors ${
          selected
            ? "bg-[rgba(108,99,255,0.05)] border-l-4 border-l-[#6C63FF]"
            : ""
        }`}
      >
        <td className="p-4">
          <Checkbox checked={selected} onCheckedChange={onSelect} />
        </td>
        <td className="p-3">
          <Avatar>
            <AvatarImage src={customer.avatarUrl} alt={customer.name} />
            <AvatarFallback
              style={{ backgroundColor: generateAvatarColor(customer.name) }}
            >
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
        </td>
        <td className="p-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[#212529]">{customer.name}</span>
              {juliusEnabled && customer.hasJuliusInsight && (
                <Tooltip>
                  <TooltipTrigger>
                    <Sparkles className="w-3 h-3 text-[#FFD700]" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{customer.juliusInsightText}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <span className="text-[#6C757D]">{customer.email}</span>
          </div>
        </td>
        <td className="p-4">
          <code className="text-[#6C757D]">{customer.code}</code>
        </td>
        <td className="p-4">
          <Tooltip>
            <TooltipTrigger>
              <Badge
                style={{
                  backgroundColor: gradeConfig[customer.grade].color,
                  color: "#FFFFFF",
                }}
                className="gap-1"
              >
                <GradeIcon className="w-3.5 h-3.5" />
                {customer.grade}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <p>{gradeConfig[customer.grade].label}</p>
                <p className="text-[#ADB5BD]">
                  {gradeConfig[customer.grade].description}
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </td>
        <td className="p-4">
          <Badge
            variant="outline"
            style={{
              backgroundColor: `${customerTypeConfig[customer.type].color}15`,
              color: customerTypeConfig[customer.type].color,
              borderColor: `${customerTypeConfig[customer.type].color}50`,
            }}
          >
            {customerTypeConfig[customer.type].label}
          </Badge>
        </td>
        <td className="p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[#212529]">
              {formatCurrency(customer.revenue)}
            </span>
            {customer.revenueTrend !== 0 && (
              <div className="flex items-center gap-1">
                {customer.revenueTrend > 0 ? (
                  <TrendingUp className="w-3 h-3 text-[#06D6A0]" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-[#FF6B6B]" />
                )}
                <span
                  className={
                    customer.revenueTrend > 0
                      ? "text-[#06D6A0]"
                      : "text-[#FF6B6B]"
                  }
                >
                  {formatPercentage(customer.revenueTrend)}
                </span>
              </div>
            )}
          </div>
        </td>
        <td className="p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[#6C757D]">
              {formatRelativeTime(customer.lastContactAt)}
            </span>
            {customer.lastContactType && (
              <div className="flex items-center gap-1 text-[#ADB5BD]">
                <ContactIcon className="w-3 h-3" />
                <span className="capitalize">{customer.lastContactType}</span>
              </div>
            )}
          </div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={onClick}>
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>
            {canEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="ghost">
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit customer</TooltipContent>
              </Tooltip>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                {canDelete && (
                  <DropdownMenuItem className="text-[#FF6B6B]">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
    );
  },
);

CustomerRow.displayName = "CustomerRow";

// Need to import React for forwardRef
import * as React from "react";
