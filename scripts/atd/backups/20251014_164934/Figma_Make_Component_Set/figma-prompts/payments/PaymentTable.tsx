import {
  Eye,
  DollarSign,
  Mail,
  MoreVertical,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Invoice } from "../types/payment";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getDueDateColor,
  getOverdueBadgeColor,
  paymentStatusConfig,
} from "../lib/utils-payment";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface PaymentTableProps {
  invoices: Invoice[];
  selectedRows: string[];
  onSelectRow: (id: string) => void;
  onSelectAll: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onSendReminder: (invoice: Invoice) => void;
  onViewInvoice: (invoice: Invoice) => void;
}

const statusIcons = {
  pending: Clock,
  overdue: AlertTriangle,
  partially_paid: DollarSign,
  paid: CheckCircle,
  cancelled: XCircle,
};

export function PaymentTable({
  invoices,
  selectedRows,
  onSelectRow,
  onSelectAll,
  onRecordPayment,
  onSendReminder,
  onViewInvoice,
}: PaymentTableProps) {
  const allSelected =
    invoices.length > 0 && selectedRows.length === invoices.length;
  const someSelected = selectedRows.length > 0 && !allSelected;

  return (
    <div className="table-container bg-white rounded-2xl border border-[#E9ECEF] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#F8F9FA] border-b-2 border-[#E9ECEF]">
              <th className="h-14 px-4 text-left w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                  className={
                    someSelected ? "data-[state=checked]:bg-[#6C63FF]" : ""
                  }
                />
              </th>
              <th className="h-14 px-4 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Invoice No.
              </th>
              <th className="h-14 px-4 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Customer
              </th>
              <th className="h-14 px-4 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Amount
              </th>
              <th className="h-14 px-4 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Due Date
              </th>
              <th className="h-14 px-4 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Overdue
              </th>
              <th className="h-14 px-4 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Status
              </th>
              <th className="h-14 px-4 text-left text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Payment
              </th>
              <th className="h-14 px-4 text-right text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const isSelected = selectedRows.includes(invoice.id);
              const StatusIcon = statusIcons[invoice.status];
              const isOverdue = invoice.status === "overdue";

              return (
                <tr
                  key={invoice.id}
                  className={`table-row border-b border-[#E9ECEF] transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#6C63FF0D] border-l-[3px] border-l-[#6C63FF]"
                      : isOverdue
                        ? "bg-[#FF6B6B05] border-l-[3px] border-l-[#FF6B6B]"
                        : "hover:bg-[#F8F9FA]"
                  }`}
                  onClick={() => onViewInvoice(invoice)}
                >
                  <td
                    className="h-18 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectRow(invoice.id)}
                      aria-label={`Select invoice ${invoice.number}`}
                    />
                  </td>
                  <td className="h-18 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#6C63FF]">
                        {invoice.number}
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(invoice.number);
                              }}
                            >
                              <Copy size={12} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy invoice number</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                  <td className="h-18 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#212529]">
                        {invoice.customerName}
                      </span>
                      <span className="text-sm text-[#6C757D]">
                        {invoice.customerCode}
                      </span>
                    </div>
                  </td>
                  <td className="h-18 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#212529]">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                      {invoice.status === "partially_paid" && (
                        <>
                          <span className="text-sm text-[#06D6A0]">
                            {formatCurrency(invoice.paidAmount)} paid
                          </span>
                          <span className="text-sm text-[#FF9800]">
                            {formatCurrency(invoice.remainingAmount)} remaining
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="h-18 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-sm"
                        style={{
                          color: getDueDateColor(
                            invoice.dueDate,
                            invoice.status,
                          ),
                        }}
                      >
                        {formatDate(invoice.dueDate)}
                      </span>
                      <span className="text-xs text-[#ADB5BD]">
                        {formatRelativeTime(invoice.dueDate)}
                      </span>
                    </div>
                  </td>
                  <td className="h-18 px-4">
                    {invoice.daysOverdue > 0 && (
                      <Badge
                        className="text-white border-0"
                        style={{
                          backgroundColor: getOverdueBadgeColor(
                            invoice.daysOverdue,
                          ),
                        }}
                      >
                        {invoice.daysOverdue > 30 && (
                          <AlertTriangle size={12} className="mr-1" />
                        )}
                        {invoice.daysOverdue} days
                      </Badge>
                    )}
                  </td>
                  <td className="h-18 px-4">
                    <Badge
                      className="text-white border-0 gap-1.5"
                      style={{
                        backgroundColor:
                          paymentStatusConfig[invoice.status].color,
                      }}
                    >
                      <StatusIcon size={14} />
                      {paymentStatusConfig[invoice.status].label}
                    </Badge>
                  </td>
                  <td className="h-18 px-4">
                    {invoice.paymentDate && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-[#06D6A0]">
                          {formatDate(invoice.paymentDate)}
                        </span>
                        {invoice.paymentMethod && (
                          <span className="text-xs text-[#ADB5BD]">
                            {invoice.paymentMethod}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td
                    className="h-18 px-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewInvoice(invoice);
                              }}
                            >
                              <Eye size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View invoice</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {invoice.status !== "paid" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRecordPayment(invoice);
                                }}
                              >
                                <DollarSign size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Record payment</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {(invoice.status === "overdue" ||
                        invoice.status === "pending") && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSendReminder(invoice);
                                }}
                              >
                                <Mail size={16} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Send reminder</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => onViewInvoice(invoice)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          {invoice.status === "paid" && (
                            <DropdownMenuItem>
                              Generate Receipt
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Cancel Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {invoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-[#F8F9FA] flex items-center justify-center mb-4">
            <DollarSign size={32} className="text-[#E9ECEF]" />
          </div>
          <h3 className="text-xl font-semibold text-[#212529] mb-2">
            No invoices found
          </h3>
          <p className="text-[#6C757D] text-center max-w-md">
            There are no invoices matching your current filters. Try adjusting
            your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
}
