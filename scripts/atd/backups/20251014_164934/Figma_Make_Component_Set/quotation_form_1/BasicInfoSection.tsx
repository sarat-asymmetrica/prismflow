import { Calendar, Clock, FileText, Hash, Link } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { mockRFQs } from "../lib/mock-data";
import { formatDate } from "../lib/utils";

interface BasicInfoSectionProps {
  rfqId?: string;
  quotationDate: Date;
  validityDays: number;
  reference?: string;
  onRfqChange: (value: string) => void;
  onDateChange: (value: Date) => void;
  onValidityChange: (value: number) => void;
  onReferenceChange: (value: string) => void;
}

export function BasicInfoSection({
  rfqId,
  quotationDate,
  validityDays,
  reference,
  onRfqChange,
  onDateChange,
  onValidityChange,
  onReferenceChange,
}: BasicInfoSectionProps) {
  const expiryDate = new Date(quotationDate);
  expiryDate.setDate(expiryDate.getDate() + validityDays);

  return (
    <SectionCard icon={FileText} title="Basic Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* RFQ Reference */}
        <div className="space-y-2">
          <Label htmlFor="rfqReference" className="text-gray-700">
            <Link className="inline h-4 w-4 mr-1.5 text-gray-600" />
            Reference RFQ (Optional)
          </Label>
          <Select value={rfqId} onValueChange={onRfqChange}>
            <SelectTrigger
              id="rfqReference"
              className="bg-white border-gray-200"
            >
              <SelectValue placeholder="Link to existing RFQ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No RFQ</SelectItem>
              {mockRFQs.map((rfq) => (
                <SelectItem key={rfq.id} value={rfq.id}>
                  {rfq.code} - {rfq.customerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quotation Date */}
        <div className="space-y-2">
          <Label htmlFor="quotationDate" className="text-gray-700">
            <Calendar className="inline h-4 w-4 mr-1.5 text-gray-600" />
            Quotation Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="quotationDate"
            type="date"
            value={quotationDate.toISOString().split("T")[0]}
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="bg-white border-gray-200"
            required
          />
        </div>

        {/* Validity Period */}
        <div className="space-y-2">
          <Label htmlFor="validityDays" className="text-gray-700">
            <Clock className="inline h-4 w-4 mr-1.5 text-gray-600" />
            Validity Period <span className="text-red-500">*</span>
          </Label>
          <Input
            id="validityDays"
            type="number"
            min="1"
            max="365"
            value={validityDays}
            onChange={(e) => onValidityChange(parseInt(e.target.value) || 30)}
            className="bg-white border-gray-200"
            placeholder="Days"
            required
          />
          <p className="text-xs text-gray-600 mt-1">
            Quote valid for {validityDays} days (expires{" "}
            {formatDate(expiryDate)})
          </p>
        </div>

        {/* Internal Reference */}
        <div className="space-y-2">
          <Label htmlFor="reference" className="text-gray-700">
            <Hash className="inline h-4 w-4 mr-1.5 text-gray-600" />
            Internal Reference
          </Label>
          <Input
            id="reference"
            type="text"
            value={reference || ""}
            onChange={(e) => onReferenceChange(e.target.value)}
            className="bg-white border-gray-200"
            placeholder="Optional internal reference"
            maxLength={100}
          />
        </div>
      </div>
    </SectionCard>
  );
}
