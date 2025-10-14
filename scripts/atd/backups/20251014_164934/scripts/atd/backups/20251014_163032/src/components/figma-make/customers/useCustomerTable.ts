// Custom Hook for Customer Table State Management
import { useState, useEffect, useMemo, useCallback } from "react";
import type {
  Customer,
  FilterState,
  SortState,
  PaginationState,
  Stats,
  JuliusInsight,
  UserRole,
} from "@/components/figma-make/types/customer";
import {
  generateMockCustomers,
  calculateStats,
  generateJuliusInsights,
} from "@/components/figma-make/utils/customerMockData";

// Mock API simulation
const ALL_CUSTOMERS = generateMockCustomers(100);

interface UseCustomerTableProps {
  userId: string;
  role?: UserRole;
  initialFilters?: Partial<FilterState>;
  pageSize?: number;
}

export function useCustomerTable({
  userId,
  role = "ADMIN",
  initialFilters,
  pageSize = 20,
}: UseCustomerTableProps) {
  const [allCustomers] = useState<Customer[]>(ALL_CUSTOMERS);
  const [filters, setFilters] = useState<FilterState>({
    search: initialFilters?.search || "",
    grades: initialFilters?.grades || [],
    types: initialFilters?.types || [],
    status: initialFilters?.status,
  });
  const [sorting, setSorting] = useState<SortState>({
    column: "name",
    order: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter customers based on current filters
  const filteredCustomers = useMemo(() => {
    let result = [...allCustomers];

    // Apply role-based filtering
    if (role === "SALES") {
      result = result.filter((c) => c.assignedTo === userId);
    }

    // Apply search filter
    if (filters.search.length >= 2) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.code.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.phone.includes(searchLower),
      );
    }

    // Apply grade filter
    if (filters.grades.length > 0) {
      result = result.filter((c) => filters.grades.includes(c.grade));
    }

    // Apply type filter
    if (filters.types.length > 0) {
      result = result.filter((c) => filters.types.includes(c.type));
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }

    return result;
  }, [allCustomers, filters, role, userId]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    const result = [...filteredCustomers];

    result.sort((a, b) => {
      let aValue: any = a[sorting.column as keyof Customer];
      let bValue: any = b[sorting.column as keyof Customer];

      // Handle special sorting cases
      if (sorting.column === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sorting.column === "grade") {
        const gradeOrder = { A: 4, B: 3, C: 2, D: 1 };
        aValue = gradeOrder[a.grade];
        bValue = gradeOrder[b.grade];
      } else if (sorting.column === "last_contact") {
        aValue = new Date(a.lastContactAt).getTime();
        bValue = new Date(b.lastContactAt).getTime();
      }

      if (aValue < bValue) return sorting.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sorting.order === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [filteredCustomers, sorting]);

  // Paginate customers
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedCustomers.slice(startIndex, endIndex);
  }, [sortedCustomers, currentPage, pageSize]);

  // Calculate pagination state
  const pagination: PaginationState = useMemo(() => {
    const totalCount = sortedCustomers.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      currentPage,
      totalPages,
      totalCount,
      pageSize,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    };
  }, [sortedCustomers.length, currentPage, pageSize]);

  // Calculate stats
  const stats: Stats = useMemo(() => {
    return calculateStats(filteredCustomers);
  }, [filteredCustomers]);

  // Generate Julius insights
  const juliusInsights: JuliusInsight = useMemo(() => {
    return generateJuliusInsights(filteredCustomers);
  }, [filteredCustomers]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Update sorting
  const updateSorting = useCallback((column: string) => {
    setSorting((prev) => ({
      column,
      order: prev.column === column && prev.order === "asc" ? "desc" : "asc",
    }));
  }, []);

  // Row selection
  const selectRow = useCallback((id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  }, []);

  const selectAllRows = useCallback(() => {
    if (selectedRows.length === paginatedCustomers.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedCustomers.map((c) => c.id));
    }
  }, [paginatedCustomers, selectedRows.length]);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  // Pagination controls
  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, pagination.totalPages)));
    },
    [pagination.totalPages],
  );

  // Bulk actions
  const bulkAction = useCallback(
    async (action: string, ids: string[]) => {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // TODO: Implement actual bulk action API call
      setLoading(false);
      clearSelection();
    },
    [clearSelection],
  );

  // Export data
  const exportData = useCallback(
    async (format: "csv" | "excel" | "pdf") => {
      setLoading(true);
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // TODO: Implement actual export functionality
      setLoading(false);
    },
    [sortedCustomers],
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      grades: [],
      types: [],
      status: undefined,
    });
    setCurrentPage(1);
  }, []);

  return {
    customers: paginatedCustomers,
    allFilteredCustomers: sortedCustomers,
    stats,
    juliusInsights,
    filters,
    sorting,
    pagination,
    selectedRows,
    loading,
    error: null,
    updateFilters,
    updateSorting,
    selectRow,
    selectAllRows,
    clearSelection,
    goToPage,
    bulkAction,
    exportData,
    resetFilters,
    hasActiveFilters:
      filters.search.length > 0 ||
      filters.grades.length > 0 ||
      filters.types.length > 0 ||
      !!filters.status,
  };
}
