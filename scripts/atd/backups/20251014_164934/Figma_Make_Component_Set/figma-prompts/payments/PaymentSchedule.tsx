import { useState, useEffect, useMemo, useRef } from "react";
import {
  Bell,
  DollarSign,
  Download,
  BarChart3,
  Calendar,
  Table as TableIcon,
} from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import {
  Invoice,
  PaymentStatus,
  SortState,
  PaymentData,
} from "../types/payment";
import {
  mockInvoices,
  mockStatistics,
  mockAgingReport,
} from "../lib/mock-data";
import { filterInvoices, sortInvoices } from "../lib/utils-payment";
import { MetricsCards } from "./MetricsCards";
import { Toolbar } from "./Toolbar";
import { PaymentTable } from "./PaymentTable";
import { PaymentModal } from "./PaymentModal";
import { PaymentPagination } from "./PaymentPagination";
import { CalendarView } from "./CalendarView";
import { AgingChart } from "./AgingChart";
import { AdvancedFilters } from "./AdvancedFilters";
import { KeyboardShortcutsHelp } from "./KeyboardShortcutsHelp";
import { ExportDialog } from "./ExportDialog";
import { SavedFilterViews } from "./SavedFilterViews";
import { RealTimeUpdates } from "./RealTimeUpdates";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function PaymentSchedule() {
  // State
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [statistics, setStatistics] = useState(mockStatistics);
  const [agingReport] = useState(mockAgingReport);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    start: string;
    end: string;
  }>();
  const [amountRangeFilter, setAmountRangeFilter] = useState<{
    min: number;
    max: number;
  }>();
  const [sortBy, setSortBy] = useState<SortState>({
    column: "dueDate",
    order: "asc",
  });
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeView, setActiveView] = useState<"table" | "calendar" | "chart">(
    "table",
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Animations on mount
  useEffect(() => {
    const tl = gsap.timeline();

    tl.from(".payment-header", {
      y: -30,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
    })
      .from(
        ".metric-card",
        {
          scale: 0.95,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.7)",
        },
        0.2,
      )
      .from(
        ".toolbar",
        {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        0.4,
      )
      .from(
        ".table-container",
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0.5,
      );
  }, []);

  // Filtered and sorted invoices
  const processedInvoices = useMemo(() => {
    let filtered = filterInvoices(invoices, {
      search: searchQuery,
      status: statusFilter,
      dateRange: dateRangeFilter,
      amountRange: amountRangeFilter,
    });

    filtered = sortInvoices(filtered, sortBy.column, sortBy.order);

    return filtered;
  }, [
    invoices,
    searchQuery,
    statusFilter,
    dateRangeFilter,
    amountRangeFilter,
    sortBy,
  ]);

  // Paginated invoices
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return processedInvoices.slice(start, end);
  }, [processedInvoices, currentPage, pageSize]);

  const totalPages = Math.ceil(processedInvoices.length / pageSize);

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilterChange = (statuses: PaymentStatus[]) => {
    setStatusFilter(statuses);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortState) => {
    setSortBy(sort);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedInvoices.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedInvoices.map((inv) => inv.id));
    }
  };

  const handleBulkAction = (action: string) => {
    const selectedInvoiceObjects = invoices.filter((inv) =>
      selectedRows.includes(inv.id),
    );

    switch (action) {
      case "send_reminders":
        toast.success(
          `Reminders sent to ${selectedRows.length} customers successfully!`,
        );
        setSelectedRows([]);
        break;
      case "export":
        toast.success(`Exporting ${selectedRows.length} invoices to Excel...`);
        break;
      case "mark_paid":
        toast.success(`${selectedRows.length} invoices marked as paid`);
        // Update invoice statuses
        setInvoices((prev) =>
          prev.map((inv) =>
            selectedRows.includes(inv.id)
              ? {
                  ...inv,
                  status: "paid" as PaymentStatus,
                  paidAmount: inv.totalAmount,
                  remainingAmount: 0,
                  paymentDate: new Date().toISOString(),
                }
              : inv,
          ),
        );
        setSelectedRows([]);
        break;
    }
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (invoiceId: string, payment: PaymentData) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaidAmount = inv.paidAmount + payment.amount;
          const newRemainingAmount = inv.totalAmount - newPaidAmount;
          const newStatus: PaymentStatus =
            newRemainingAmount <= 0 ? "paid" : "partially_paid";

          return {
            ...inv,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            status: newStatus,
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            paymentReference: payment.reference,
            notes: payment.notes,
          };
        }
        return inv;
      }),
    );

    // Update statistics
    setStatistics((prev) => ({
      ...prev,
      totalReceivables: prev.totalReceivables - payment.amount,
      overdueAmount: prev.overdueAmount - payment.amount,
    }));

    // Celebration with confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#06D6A0", "#6C63FF", "#FFD166"],
    });

    toast.success(
      `Payment of ${payment.amount.toLocaleString()} recorded successfully! 🎉`,
    );

    // Row highlight animation
    setTimeout(() => {
      const row = document.querySelector(`[data-invoice-id="${invoiceId}"]`);
      if (row) {
        gsap
          .timeline()
          .to(row, {
            backgroundColor: "rgba(6, 214, 160, 0.1)",
            duration: 0.5,
          })
          .to(row, {
            backgroundColor: "#FFFFFF",
            duration: 0.5,
            delay: 2,
          });
      }
    }, 100);
  };

  const handleSendReminder = (invoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              remindersSent: inv.remindersSent + 1,
              lastReminderDate: new Date().toISOString(),
            }
          : inv,
      ),
    );
    toast.success(`Reminder sent to ${invoice.customerName}`);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    toast.info(`Viewing invoice ${invoice.number}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleApplySavedView = (filters: any) => {
    if (filters.search !== undefined) setSearchQuery(filters.search);
    if (filters.status) setStatusFilter(filters.status);
    if (filters.dateRange) setDateRangeFilter(filters.dateRange);
    if (filters.amountRange) setAmountRangeFilter(filters.amountRange);
    setCurrentPage(1);
    toast.success("Filter view applied");
  };

  const handleRealTimeUpdate = (update: any) => {
    if (update.type === "payment_received") {
      // Update statistics
      setStatistics((prev) => ({
        ...prev,
        totalReceivables: prev.totalReceivables - (update.data?.amount || 0),
      }));
    }
  };

  const handleToggleView = () => {
    const views: Array<"table" | "calendar" | "chart"> = [
      "table",
      "calendar",
      "chart",
    ];
    const currentIndex = views.indexOf(activeView);
    const nextIndex = (currentIndex + 1) % views.length;
    setActiveView(views[nextIndex]);
  };

  const handleFocusSearch = () => {
    const searchInput = document.querySelector(
      'input[placeholder*="Search"]',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRecordPayment: () => {
      if (selectedRows.length === 1) {
        const invoice = invoices.find((inv) => inv.id === selectedRows[0]);
        if (invoice && invoice.status !== "paid") {
          handleRecordPayment(invoice);
        }
      } else {
        toast.info("Select a single invoice to record payment");
      }
    },
    onSendReminder: () => {
      if (selectedRows.length > 0) {
        const selectedInvoices = invoices.filter((inv) =>
          selectedRows.includes(inv.id),
        );
        const reminderableInvoices = selectedInvoices.filter(
          (inv) => inv.status === "overdue" || inv.status === "pending",
        );
        if (reminderableInvoices.length > 0) {
          toast.success(
            `Sending reminders to ${reminderableInvoices.length} customers...`,
          );
          setSelectedRows([]);
        } else {
          toast.info("Selected invoices don't need reminders");
        }
      } else {
        toast.info("Select invoices to send reminders");
      }
    },
    onExport: () => setExportDialogOpen(true),
    onFocusSearch: handleFocusSearch,
    onSelectAll: () => {
      if (activeView === "table") {
        handleSelectAll();
      }
    },
    onEscape: () => {
      if (selectedRows.length > 0) {
        setSelectedRows([]);
      } else if (exportDialogOpen) {
        setExportDialogOpen(false);
      } else if (paymentModalOpen) {
        setPaymentModalOpen(false);
      }
    },
    onToggleView: handleToggleView,
  });

  const totalInvoices = invoices.length;
  const overdueCount = invoices.filter(
    (inv) => inv.status === "overdue",
  ).length;
  const totalReceivables = invoices.reduce(
    (sum, inv) => sum + inv.remainingAmount,
    0,
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="payment-header flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-4xl font-bold text-[#212529] mb-2">
              Payment Schedule
            </h1>
            <p className="text-[#6C757D]">
              {totalInvoices} invoices · {overdueCount} overdue · Total: $
              {totalReceivables.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Toggle */}
            <Tabs
              value={activeView}
              onValueChange={(v) => setActiveView(v as any)}
            >
              <TabsList>
                <TabsTrigger value="table">
                  <TableIcon size={16} className="mr-2" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <Calendar size={16} className="mr-2" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="chart">
                  <BarChart3 size={16} className="mr-2" />
                  Chart
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <SavedFilterViews
              currentFilters={{
                search: searchQuery,
                status: statusFilter,
                dateRange: dateRangeFilter,
                amountRange: amountRangeFilter,
              }}
              onApplyView={handleApplySavedView}
            />

            <KeyboardShortcutsHelp />

            <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
              <Download size={16} className="mr-2" />
              Export
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const overdueInvoices = invoices.filter(
                  (inv) => inv.status === "overdue",
                );
                if (overdueInvoices.length > 0) {
                  toast.success(
                    `Sending reminders to ${overdueInvoices.length} customers...`,
                  );
                } else {
                  toast.info("No overdue invoices to send reminders for");
                }
              }}
            >
              <Bell size={16} className="mr-2" />
              Send Reminders
            </Button>

            <Button
              className="bg-gradient-to-r from-[#6C63FF] to-[#5A52E0] text-white"
              onClick={() => toast.info("Opening payment recording form...")}
            >
              <DollarSign size={16} className="mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <MetricsCards statistics={statistics} />

        {/* Content */}
        {activeView === "table" && (
          <>
            {/* Main Toolbar */}
            <Toolbar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              selectedCount={selectedRows.length}
              onBulkAction={handleBulkAction}
            />

            {/* Advanced Filters */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] p-3 mb-4 flex items-center gap-2">
              <span className="text-sm text-[#6C757D]">Advanced:</span>
              <AdvancedFilters
                dateRange={dateRangeFilter}
                amountRange={amountRangeFilter}
                onDateRangeChange={setDateRangeFilter}
                onAmountRangeChange={setAmountRangeFilter}
              />
            </div>

            {/* Table */}
            <PaymentTable
              invoices={paginatedInvoices}
              selectedRows={selectedRows}
              onSelectRow={handleSelectRow}
              onSelectAll={handleSelectAll}
              onRecordPayment={handleRecordPayment}
              onSendReminder={handleSendReminder}
              onViewInvoice={handleViewInvoice}
            />

            {/* Pagination */}
            {processedInvoices.length > 0 && (
              <PaymentPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={processedInvoices.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}

        {activeView === "calendar" && (
          <CalendarView
            invoices={processedInvoices}
            onInvoiceClick={handleViewInvoice}
          />
        )}

        {activeView === "chart" && <AgingChart agingReport={agingReport} />}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        invoice={selectedInvoice}
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handlePaymentSubmit}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        selectedCount={selectedRows.length}
        totalCount={processedInvoices.length}
      />

      {/* Real-time Updates */}
      <RealTimeUpdates onUpdate={handleRealTimeUpdate} />
    </div>
  );
}
