// Custom Hook for Customer Table State Management
// ✅ REAL API - Replaced mock data with useAsymmSocket (Agent Hotel)
import { useState, useMemo, useCallback } from "react";
import { useAsymmSocket } from "@/lib/asymm-socket";
import type {
  Customer,
  FilterState,
  SortState,
  PaginationState,
  Stats,
  JuliusInsight,
  UserRole,
} from "../types/customer";
import {
  calculateStats,
  generateJuliusInsights,
} from "../utils/customerMockData";

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
  // ═════════════════════════════════════════════════════════════
  // 🧲 REAL API CONNECTION (AsymmSocket)
  // ═════════════════════════════════════════════════════════════
  const {
    data: apiData,
    loading: apiLoading,
    error: apiError,
    refetch,
  } = useAsymmSocket("customers");

  // Extract customers from API response
  const allCustomers: Customer[] = useMemo(() => {
    return apiData?.customers || [];
  }, [apiData]);

  // ═════════════════════════════════════════════════════════════
  // 📊 STATE MANAGEMENT
  // ═════════════════════════════════════════════════════════════
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

  // ═════════════════════════════════════════════════════════════
  // 🔍 FILTERING LOGIC
  // ═════════════════════════════════════════════════════════════
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

  // ═════════════════════════════════════════════════════════════
  // 🔤 SORTING LOGIC
  // ═════════════════════════════════════════════════════════════
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

  // ═════════════════════════════════════════════════════════════
  // 📄 PAGINATION LOGIC
  // ═════════════════════════════════════════════════════════════
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

  // ═════════════════════════════════════════════════════════════
  // 📊 STATISTICS & INSIGHTS
  // ═════════════════════════════════════════════════════════════
  const stats: Stats = useMemo(() => {
    return calculateStats(filteredCustomers);
  }, [filteredCustomers]);

  const juliusInsights: JuliusInsight = useMemo(() => {
    return generateJuliusInsights(filteredCustomers);
  }, [filteredCustomers]);

  // ═════════════════════════════════════════════════════════════
  // 🎛️ ACTION HANDLERS
  // ═════════════════════════════════════════════════════════════

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
      try {
        // TODO: Implement actual bulk action API call
        // Example: await fetch('/api/customers/bulk', { method: 'POST', body: JSON.stringify({ action, ids }) })
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Refetch data after successful action
        await refetch();
      } catch (error) {
        console.error("Bulk action failed:", error);
      } finally {
        setLoading(false);
        clearSelection();
      }
    },
    [clearSelection, refetch],
  );

  // Export data
  const exportData = useCallback(
    async (format: "csv" | "excel" | "pdf") => {
      setLoading(true);
      try {
        // TODO: Implement actual export functionality
        // Example: await fetch(`/api/customers/export?format=${format}`)
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        setLoading(false);
      }
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

  // ═════════════════════════════════════════════════════════════
  // ✨ RETURN INTERFACE
  // ═════════════════════════════════════════════════════════════
  return {
    customers: paginatedCustomers,
    allFilteredCustomers: sortedCustomers,
    stats,
    juliusInsights,
    filters,
    sorting,
    pagination,
    selectedRows,
    loading: apiLoading || loading,
    error: apiError,
    updateFilters,
    updateSorting,
    selectRow,
    selectAllRows,
    clearSelection,
    goToPage,
    bulkAction,
    exportData,
    resetFilters,
    refetch, // Expose refetch for manual data refresh
    hasActiveFilters:
      filters.search.length > 0 ||
      filters.grades.length > 0 ||
      filters.types.length > 0 ||
      !!filters.status,
  };
}
