import { FileSignature } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { termsTemplates } from "../lib/mock-data";

interface TermsSectionProps {
  terms: string;
  onTermsChange: (value: string) => void;
}

export function TermsSection({ terms, onTermsChange }: TermsSectionProps) {
  const loadTemplate = (template: keyof typeof termsTemplates) => {
    onTermsChange(termsTemplates[template]);
  };

  return (
    <SectionCard icon={FileSignature} title="Terms & Conditions">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="termsTemplate" className="text-gray-700">
            Use Template
          </Label>
          <Select onValueChange={(value) => loadTemplate(value as any)}>
            <SelectTrigger
              id="termsTemplate"
              className="bg-white border-gray-200"
            >
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Terms</SelectItem>
              <SelectItem value="government">Government Terms</SelectItem>
              <SelectItem value="export">Export Terms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="terms" className="text-gray-700">
            Terms & Conditions <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="terms"
            value={terms}
            onChange={(e) => onTermsChange(e.target.value)}
            placeholder="Enter terms and conditions..."
            className="min-h-[200px] bg-white border-gray-200 font-mono text-sm"
            maxLength={5000}
            required
          />
          <p className="text-xs text-gray-600">
            {terms.length} / 5000 characters
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
