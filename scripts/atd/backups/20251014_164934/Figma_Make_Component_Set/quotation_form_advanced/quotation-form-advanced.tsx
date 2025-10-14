import React, { useState, useEffect, useRef } from "react";
import {
  Calculator,
  Percent,
  Clock,
  Wallet,
  Truck,
  Paperclip,
  FileText,
  ChevronDown,
  IndianRupee,
  Building,
  Smartphone,
  CreditCard,
  Eye,
  Download,
  Send,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
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
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { FileUploadZone, UploadedFile } from "./file-upload-zone";
import {
  TaxConfig,
  DiscountRules,
  ValiditySettings,
  PaymentTermsConfig,
  ShippingDetails,
  UserRole,
  calculateQuotation,
  formatCurrency,
  getRoleMaxDiscount,
  requiresApproval,
  addDays,
  getDaysRemaining,
  formatDate,
} from "../lib/quotation-utils";
import { cn } from "./ui/utils";
import gsap from "gsap";

interface QuotationFormAdvancedProps {
  subtotal: number;
  userRole?: UserRole;
  onCalculationsChange?: (calculations: any) => void;
  className?: string;
}

export function QuotationFormAdvanced({
  subtotal = 50000,
  userRole = "SALES_MANAGER",
  onCalculationsChange,
  className,
}: QuotationFormAdvancedProps) {
  // Tax Configuration State
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({
    taxType: "gst",
    taxInclusive: false,
  });

  // Discount Rules State
  const [discountRules, setDiscountRules] = useState<DiscountRules>({
    overallDiscountType: "percentage",
    overallDiscountValue: 0,
  });

  // Validity Settings State
  const [validitySettings, setValiditySettings] = useState<ValiditySettings>({
    validUntil: addDays(new Date(), 30),
    autoRemind: true,
  });

  // Payment Terms State
  const [paymentTerms, setPaymentTerms] = useState<PaymentTermsConfig>({
    terms: "net_30",
    advancePayment: 0,
    paymentMethods: ["bank_transfer", "upi"],
  });

  // Shipping Details State
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    includeShipping: false,
  });

  // Attachments State
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  // Notes State
  const [notes, setNotes] = useState({
    internal: "",
    customerInstructions: "",
    specialConditions: "",
  });

  // Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Refs for animations
  const discountPreviewRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const calculations = calculateQuotation(
    subtotal,
    taxConfig,
    discountRules,
    shippingDetails,
    paymentTerms,
  );

  useEffect(() => {
    onCalculationsChange?.(calculations);
  }, [calculations, onCalculationsChange]);

  // Animate discount preview on change
  useEffect(() => {
    if (discountPreviewRef.current && discountRules.overallDiscountValue > 0) {
      gsap
        .timeline()
        .to(discountPreviewRef.current.querySelector(".discount-amount"), {
          scale: 1.1,
          color: "#06D6A0",
          duration: 0.2,
          ease: "power2.out",
        })
        .to(discountPreviewRef.current.querySelector(".discount-amount"), {
          scale: 1.0,
          duration: 0.2,
          ease: "power2.out",
        });
    }
  }, [discountRules.overallDiscountValue]);

  const handleValidityPreset = (days: number) => {
    setValiditySettings((prev) => ({
      ...prev,
      validUntil: addDays(new Date(), days),
    }));
  };

  const maxDiscount = getRoleMaxDiscount(userRole);
  const needsApproval =
    discountRules.overallDiscountType === "percentage" &&
    requiresApproval(userRole, discountRules.overallDiscountValue);

  const daysRemaining = getDaysRemaining(validitySettings.validUntil);
  const validityBadgeColor =
    daysRemaining < 7
      ? "bg-[#FF6B6B]"
      : daysRemaining < 15
        ? "bg-[#FFD166]"
        : "bg-[#06D6A0]";

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      <Accordion
        type="multiple"
        defaultValue={["tax", "discount", "validity", "payment"]}
        className="space-y-4"
      >
        {/* Tax Configuration */}
        <AccordionItem
          value="tax"
          className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:bg-[#F8F9FA] hover:no-underline">
            <div className="flex items-center gap-3">
              <Calculator className="w-5 h-5 text-[#6C63FF]" />
              <span className="text-[#212529]">Tax Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax-type">Tax Type</Label>
              <Select
                value={taxConfig.taxType}
                onValueChange={(value: any) =>
                  setTaxConfig((prev) => ({ ...prev, taxType: value }))
                }
              >
                <SelectTrigger id="tax-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gst">
                    <div>
                      <div>GST (Goods & Services Tax)</div>
                      <div className="text-xs text-[#6C757D]">
                        18% standard rate
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="igst">
                    <div>
                      <div>IGST (Integrated GST)</div>
                      <div className="text-xs text-[#6C757D]">
                        18% interstate
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="cgst_sgst">
                    <div>
                      <div>CGST + SGST</div>
                      <div className="text-xs text-[#6C757D]">9% + 9%</div>
                    </div>
                  </SelectItem>
                  {(userRole === "ADMIN" || userRole === "SUPERADMIN") && (
                    <SelectItem value="custom">
                      <div>
                        <div>Custom Tax Rate</div>
                        <div className="text-xs text-[#6C757D]">
                          Define your own
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {taxConfig.taxType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <div className="relative">
                  <Input
                    id="tax-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxConfig.taxRate || ""}
                    onChange={(e) =>
                      setTaxConfig((prev) => ({
                        ...prev,
                        taxRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] text-sm">
                    %
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="tax-inclusive">Tax Inclusive Pricing</Label>
                <p className="text-xs text-[#6C757D]">Prices include tax</p>
              </div>
              <Switch
                id="tax-inclusive"
                checked={taxConfig.taxInclusive}
                onCheckedChange={(checked) =>
                  setTaxConfig((prev) => ({ ...prev, taxInclusive: checked }))
                }
              />
            </div>

            {taxConfig.taxType === "cgst_sgst" && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8F9FA] rounded-lg">
                <div>
                  <p className="text-xs text-[#6C757D] mb-1">CGST (9%)</p>
                  <p className="text-sm text-[#212529]">
                    {formatCurrency(calculations.taxAmount / 2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6C757D] mb-1">SGST (9%)</p>
                  <p className="text-sm text-[#212529]">
                    {formatCurrency(calculations.taxAmount / 2)}
                  </p>
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Discount Rules */}
        <AccordionItem
          value="discount"
          className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:bg-[#F8F9FA] hover:no-underline">
            <div className="flex items-center gap-3">
              <Percent className="w-5 h-5 text-[#06D6A0]" />
              <span className="text-[#212529]">Discount Rules</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-5 space-y-4">
            <div className="space-y-2">
              <Label>Overall Discount Type</Label>
              <RadioGroup
                value={discountRules.overallDiscountType}
                onValueChange={(value: any) =>
                  setDiscountRules((prev) => ({
                    ...prev,
                    overallDiscountType: value,
                  }))
                }
              >
                <div className="flex items-center space-x-2 p-3 border border-[#E9ECEF] rounded-lg">
                  <RadioGroupItem value="percentage" id="percentage" />
                  <Label
                    htmlFor="percentage"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <Percent className="w-4 h-4" />
                    Percentage (%)
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border border-[#E9ECEF] rounded-lg">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label
                    htmlFor="fixed"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <IndianRupee className="w-4 h-4" />
                    Fixed Amount (₹)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-value">
                {discountRules.overallDiscountType === "percentage"
                  ? "Discount %"
                  : "Discount Amount"}
              </Label>
              <div className="relative">
                <Input
                  id="discount-value"
                  type="number"
                  min="0"
                  max={
                    discountRules.overallDiscountType === "percentage"
                      ? maxDiscount
                      : subtotal
                  }
                  step={
                    discountRules.overallDiscountType === "percentage"
                      ? "0.01"
                      : "1"
                  }
                  value={discountRules.overallDiscountValue || ""}
                  onChange={(e) =>
                    setDiscountRules((prev) => ({
                      ...prev,
                      overallDiscountValue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] text-sm">
                  {discountRules.overallDiscountType === "percentage"
                    ? "%"
                    : "₹"}
                </span>
              </div>
              {needsApproval && (
                <p className="text-xs text-[#FFD166]">
                  ⚠️ Discount exceeds your limit. Requires manager approval.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount-reason">
                Discount Reason (Optional)
              </Label>
              <Textarea
                id="discount-reason"
                placeholder="e.g., Bulk order discount, Loyalty reward, Seasonal offer"
                rows={2}
                maxLength={200}
                value={discountRules.discountReason || ""}
                onChange={(e) =>
                  setDiscountRules((prev) => ({
                    ...prev,
                    discountReason: e.target.value,
                  }))
                }
              />
            </div>

            <div
              ref={discountPreviewRef}
              className="p-4 bg-[#F8F9FA] rounded-lg space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-sm text-[#6C757D]">Subtotal</span>
                <span className="text-sm text-[#212529]">
                  {formatCurrency(calculations.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#6C757D]">Discount</span>
                <span className="text-sm text-[#06D6A0] discount-amount">
                  -{formatCurrency(calculations.discountAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E9ECEF]">
                <span className="text-sm text-[#212529]">After Discount</span>
                <span className="text-sm text-[#212529]">
                  {formatCurrency(calculations.afterDiscount)}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Validity & Expiry */}
        <AccordionItem
          value="validity"
          className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:bg-[#F8F9FA] hover:no-underline">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#FFD166]" />
              <span className="text-[#212529]">Validity & Expiry</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-5 space-y-4">
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formatDate(validitySettings.validUntil)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={validitySettings.validUntil}
                    onSelect={(date) => {
                      if (date) {
                        setValiditySettings((prev) => ({
                          ...prev,
                          validUntil: date,
                        }));
                        setDatePickerOpen(false);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-[#6C757D]">
                Quote expires at 11:59 PM on this date
              </p>
            </div>

            <div className="space-y-2">
              <Label>Quick Presets</Label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 15, 30, 60].map((days) => (
                  <Button
                    key={days}
                    variant="outline"
                    size="sm"
                    onClick={() => handleValidityPreset(days)}
                  >
                    {days} days
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={cn("text-white", validityBadgeColor)}>
                {daysRemaining} days remaining
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="auto-remind">
                  Auto-remind customer before expiry
                </Label>
                <p className="text-xs text-[#6C757D]">
                  Send reminder 3 days before quote expires
                </p>
              </div>
              <Switch
                id="auto-remind"
                checked={validitySettings.autoRemind}
                onCheckedChange={(checked) =>
                  setValiditySettings((prev) => ({
                    ...prev,
                    autoRemind: checked,
                  }))
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Payment Terms */}
        <AccordionItem
          value="payment"
          className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:bg-[#F8F9FA] hover:no-underline">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-[#8B5CF6]" />
              <span className="text-[#212529]">Payment Terms</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-terms">Payment Terms</Label>
              <Select
                value={paymentTerms.terms}
                onValueChange={(value: any) =>
                  setPaymentTerms((prev) => ({ ...prev, terms: value }))
                }
              >
                <SelectTrigger id="payment-terms">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">
                    <div>
                      <div>Immediate Payment</div>
                      <div className="text-xs text-[#6C757D]">
                        Due upon receipt
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="net_15">
                    <div>
                      <div>Net 15</div>
                      <div className="text-xs text-[#6C757D]">
                        Due in 15 days
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="net_30">
                    <div>
                      <div>Net 30</div>
                      <div className="text-xs text-[#6C757D]">
                        Due in 30 days
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="net_45">
                    <div>
                      <div>Net 45</div>
                      <div className="text-xs text-[#6C757D]">
                        Due in 45 days
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="net_60">
                    <div>
                      <div>Net 60</div>
                      <div className="text-xs text-[#6C757D]">
                        Due in 60 days
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div>
                      <div>Custom Terms</div>
                      <div className="text-xs text-[#6C757D]">
                        Define your own
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentTerms.terms === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-days">Custom Payment Days</Label>
                <Input
                  id="custom-days"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="e.g., 45"
                  value={paymentTerms.customDays || ""}
                  onChange={(e) =>
                    setPaymentTerms((prev) => ({
                      ...prev,
                      customDays: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="advance-payment">
                Advance Payment Required (%)
              </Label>
              <div className="relative">
                <Input
                  id="advance-payment"
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={paymentTerms.advancePayment}
                  onChange={(e) =>
                    setPaymentTerms((prev) => ({
                      ...prev,
                      advancePayment: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] text-sm">
                  %
                </span>
              </div>
              <p className="text-xs text-[#6C757D]">
                Percentage of total amount required upfront
              </p>
            </div>

            {paymentTerms.advancePayment > 0 && (
              <div className="p-3 bg-[#8B5CF6]/10 rounded-lg">
                <p className="text-xs text-[#6C757D] mb-1">Advance Amount</p>
                <p className="text-[#8B5CF6]">
                  {formatCurrency(calculations.advanceAmount)}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Accepted Payment Methods</Label>
              <div className="space-y-2">
                {[
                  {
                    value: "bank_transfer",
                    label: "Bank Transfer",
                    icon: Building,
                  },
                  { value: "upi", label: "UPI", icon: Smartphone },
                  {
                    value: "card",
                    label: "Credit/Debit Card",
                    icon: CreditCard,
                  },
                  { value: "cheque", label: "Cheque", icon: FileText },
                  { value: "cash", label: "Cash", icon: Wallet },
                ].map(({ value, label, icon: Icon }) => (
                  <div
                    key={value}
                    className="flex items-center space-x-2 p-3 border border-[#E9ECEF] rounded-lg"
                  >
                    <Checkbox
                      id={value}
                      checked={paymentTerms.paymentMethods.includes(value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPaymentTerms((prev) => ({
                            ...prev,
                            paymentMethods: [...prev.paymentMethods, value],
                          }));
                        } else {
                          setPaymentTerms((prev) => ({
                            ...prev,
                            paymentMethods: prev.paymentMethods.filter(
                              (m) => m !== value,
                            ),
                          }));
                        }
                      }}
                    />
                    <Label
                      htmlFor={value}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Shipping Details */}
        <AccordionItem
          value="shipping"
          className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:bg-[#F8F9FA] hover:no-underline">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#3B82F6]" />
              <span className="text-[#212529]">Shipping Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-5 space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
              <Label htmlFor="include-shipping">Include Shipping</Label>
              <Switch
                id="include-shipping"
                checked={shippingDetails.includeShipping}
                onCheckedChange={(checked) =>
                  setShippingDetails((prev) => ({
                    ...prev,
                    includeShipping: checked,
                  }))
                }
              />
            </div>

            {shippingDetails.includeShipping && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="shipping-address">Shipping Address</Label>
                  <Textarea
                    id="shipping-address"
                    placeholder="Enter full shipping address with pincode"
                    rows={3}
                    maxLength={500}
                    value={shippingDetails.shippingAddress || ""}
                    onChange={(e) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        shippingAddress: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping-method">Shipping Method</Label>
                  <Select
                    value={shippingDetails.shippingMethod}
                    onValueChange={(value) =>
                      setShippingDetails((prev) => ({
                        ...prev,
                        shippingMethod: value,
                      }))
                    }
                  >
                    <SelectTrigger id="shipping-method">
                      <SelectValue placeholder="Select shipping method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard Delivery (5-7 days) - Free
                      </SelectItem>
                      <SelectItem value="express">
                        Express Delivery (2-3 days) - ₹500
                      </SelectItem>
                      <SelectItem value="same_day">
                        Same Day Delivery - ₹1,500
                      </SelectItem>
                      <SelectItem value="pickup">
                        Customer Pickup - Free
                      </SelectItem>
                      <SelectItem value="custom">Custom Arrangement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {shippingDetails.shippingMethod === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="shipping-cost">Shipping Cost (₹)</Label>
                    <div className="relative">
                      <Input
                        id="shipping-cost"
                        type="number"
                        min="0"
                        placeholder="Enter shipping cost"
                        value={shippingDetails.shippingCost || ""}
                        onChange={(e) =>
                          setShippingDetails((prev) => ({
                            ...prev,
                            shippingCost: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] text-sm">
                        ₹
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Attachments */}
        <AccordionItem
          value="attachments"
          className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:bg-[#F8F9FA] hover:no-underline">
            <div className="flex items-center gap-3">
              <Paperclip className="w-5 h-5 text-[#6C757D]" />
              <span className="text-[#212529]">Attachments</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-5">
            <FileUploadZone
              files={attachments}
              onFilesChange={setAttachments}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Internal Notes & Instructions */}
        <AccordionItem
          value="notes"
          className="border border-[#E9ECEF] rounded-2xl overflow-hidden bg-white shadow-sm"
        >
          <AccordionTrigger className="px-5 py-4 hover:bg-[#F8F9FA] hover:no-underline">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#ADB5BD]" />
              <span className="text-[#212529]">
                Internal Notes & Instructions
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 py-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="internal-notes">
                Internal Notes (Not visible to customer)
              </Label>
              <Textarea
                id="internal-notes"
                placeholder="Add notes for your team about this quotation..."
                rows={3}
                maxLength={1000}
                value={notes.internal}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, internal: e.target.value }))
                }
              />
              <p className="text-xs text-[#6C757D]">
                These notes are only visible to your team
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer-instructions">
                Instructions for Customer
              </Label>
              <Textarea
                id="customer-instructions"
                placeholder="Add any special instructions or requirements..."
                rows={3}
                maxLength={500}
                value={notes.customerInstructions}
                onChange={(e) =>
                  setNotes((prev) => ({
                    ...prev,
                    customerInstructions: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-[#6C757D]">
                Will be displayed on the quote PDF
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special-conditions">Special Conditions</Label>
              <Textarea
                id="special-conditions"
                placeholder="e.g., Minimum order quantity, delivery constraints, warranty terms..."
                rows={2}
                maxLength={500}
                value={notes.specialConditions}
                onChange={(e) =>
                  setNotes((prev) => ({
                    ...prev,
                    specialConditions: e.target.value,
                  }))
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Preview Button */}
      <Button
        onClick={() => setShowPreview(true)}
        className="w-full bg-gradient-to-r from-[#6C63FF] to-[#5A52E0] hover:opacity-90"
      >
        <Eye className="w-4 h-4 mr-2" />
        Preview Quotation
      </Button>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-6 bg-[#F8F9FA] rounded-lg">
            <div className="bg-white p-6 rounded-lg space-y-4">
              <h3 className="text-lg text-[#212529]">Quotation Summary</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Subtotal</span>
                  <span className="text-[#212529]">
                    {formatCurrency(calculations.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">Discount</span>
                  <span className="text-[#06D6A0]">
                    -{formatCurrency(calculations.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">After Discount</span>
                  <span className="text-[#212529]">
                    {formatCurrency(calculations.afterDiscount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C757D]">
                    Tax ({taxConfig.taxType.toUpperCase()})
                  </span>
                  <span className="text-[#212529]">
                    {formatCurrency(calculations.taxAmount)}
                  </span>
                </div>
                {shippingDetails.includeShipping && (
                  <div className="flex justify-between">
                    <span className="text-[#6C757D]">Shipping</span>
                    <span className="text-[#212529]">
                      {formatCurrency(calculations.shippingCharge)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#E9ECEF]">
                  <span className="text-[#212529]">Grand Total</span>
                  <span className="text-[#212529]">
                    {formatCurrency(calculations.grandTotal)}
                  </span>
                </div>
                {paymentTerms.advancePayment > 0 && (
                  <div className="flex justify-between text-[#8B5CF6]">
                    <span>
                      Advance Payment ({paymentTerms.advancePayment}%)
                    </span>
                    <span>{formatCurrency(calculations.advanceAmount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#E9ECEF] space-y-2">
                <p className="text-sm text-[#6C757D]">
                  <span>Payment Terms:</span>{" "}
                  <span className="text-[#212529]">
                    {paymentTerms.terms.replace("_", " ").toUpperCase()}
                  </span>
                </p>
                <p className="text-sm text-[#6C757D]">
                  <span>Valid Until:</span>{" "}
                  <span className="text-[#212529]">
                    {formatDate(validitySettings.validUntil)}
                  </span>
                </p>
              </div>

              {notes.customerInstructions && (
                <div className="pt-4 border-t border-[#E9ECEF]">
                  <p className="text-sm text-[#6C757D] mb-2">
                    Customer Instructions:
                  </p>
                  <p className="text-sm text-[#212529]">
                    {notes.customerInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close Preview
            </Button>
            <Button className="bg-[#6C63FF] hover:bg-[#5A52E0]">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button className="bg-[#06D6A0] hover:bg-[#05C293]">
              <Send className="w-4 h-4 mr-2" />
              Send to Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grand Total Summary */}
      <div className="p-6 bg-white border border-[#E9ECEF] rounded-2xl shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[#6C757D]">Grand Total</span>
          <span className="text-2xl text-[#212529]">
            {formatCurrency(calculations.grandTotal)}
          </span>
        </div>
        {paymentTerms.advancePayment > 0 && (
          <div className="flex justify-between items-center pt-3 border-t border-[#E9ECEF]">
            <span className="text-sm text-[#8B5CF6]">Advance Due</span>
            <span className="text-lg text-[#8B5CF6]">
              {formatCurrency(calculations.advanceAmount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
