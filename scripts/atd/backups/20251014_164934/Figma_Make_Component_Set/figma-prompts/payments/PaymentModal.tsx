import { useState } from "react";
import { X } from "lucide-react";
import { Invoice, PaymentData } from "../types/payment";
import { formatCurrency, formatDate } from "../lib/utils-payment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface PaymentModalProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (invoiceId: string, payment: PaymentData) => void;
}

export function PaymentModal({
  invoice,
  open,
  onClose,
  onSubmit,
}: PaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoice) return;

    // Validation
    const newErrors: Record<string, string> = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Payment amount must be greater than 0";
    }

    if (parseFloat(amount) > invoice.remainingAmount) {
      newErrors.amount = `Payment amount cannot exceed remaining balance of ${formatCurrency(
        invoice.remainingAmount,
      )}`;
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const paymentData: PaymentData = {
      amount: parseFloat(amount),
      paymentDate,
      paymentMethod,
      reference: reference || undefined,
      notes: notes || undefined,
    };

    onSubmit(invoice.id, paymentData);
    handleClose();
  };

  const handleClose = () => {
    setAmount("");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod("");
    setReference("");
    setNotes("");
    setErrors({});
    onClose();
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoice.number}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Invoice Details */}
          <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#6C757D] mb-1">Invoice Number</p>
                <p className="font-mono font-semibold">{invoice.number}</p>
              </div>
              <div>
                <p className="text-sm text-[#6C757D] mb-1">Customer</p>
                <p className="font-semibold">{invoice.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-[#6C757D] mb-1">Total Amount</p>
                <p className="font-semibold">
                  {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6C757D] mb-1">Remaining Balance</p>
                <p className="font-semibold text-[#FF9800]">
                  {formatCurrency(invoice.remainingAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6C757D] mb-1">Due Date</p>
                <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
              </div>
              {invoice.paidAmount > 0 && (
                <div>
                  <p className="text-sm text-[#6C757D] mb-1">Already Paid</p>
                  <p className="font-semibold text-[#06D6A0]">
                    {formatCurrency(invoice.paidAmount)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">
                Payment Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: "" }));
                }}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
              <p className="text-sm text-[#6C757D] mt-1">
                Maximum: {formatCurrency(invoice.remainingAmount)}
              </p>
            </div>

            <div>
              <Label htmlFor="paymentDate">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => {
                  setPaymentMethod(value);
                  setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                }}
              >
                <SelectTrigger
                  id="paymentMethod"
                  className={errors.paymentMethod ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.paymentMethod}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                placeholder="Transaction reference number"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Payment notes (optional)"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#6C63FF] to-[#5A52E0] text-white"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
