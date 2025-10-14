import { useEffect, useRef } from "react";
import { Edit2, FileText, Users, Target, Tag, AlertCircle } from "lucide-react";
import gsap from "gsap";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { CaptureFormData } from "../../hooks/useCaptureForm";

interface Step5ReviewProps {
  formData: CaptureFormData;
  errors: Record<string, string>;
  onUpdateField: (field: string, value: any) => void;
  onEditStep: (step: number) => void;
  captureTypeLabel: string;
  captureTypeIcon: any;
  captureTypeColor: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-yellow-500",
  urgent: "bg-red-500",
};

export function Step5Review({
  formData,
  errors,
  onUpdateField,
  onEditStep,
  captureTypeLabel,
  captureTypeIcon: Icon,
  captureTypeColor,
}: Step5ReviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
      );
    }
  }, []);

  const SummarySection = ({
    label,
    value,
    icon: SectionIcon,
    onEdit,
    children,
  }: {
    label: string;
    value?: string;
    icon: any;
    onEdit?: () => void;
    children?: React.ReactNode;
  }) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <SectionIcon className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-purple-600 hover:text-purple-700 transition-colors"
            aria-label={`Edit ${label}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {children || (
        <div className="text-gray-900">
          {value || <span className="text-gray-400 italic">Not set</span>}
        </div>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Info Banner */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-purple-900 mb-1">
              Review your capture before submitting
            </p>
            <p className="text-xs text-purple-700">
              You can edit any section by clicking the edit icon
            </p>
          </div>
        </div>
      </div>

      {/* Type */}
      <SummarySection
        label="Capture Type"
        icon={Icon}
        onEdit={() => onEditStep(1)}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${captureTypeColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: captureTypeColor }} />
          </div>
          <span className="text-gray-900">{captureTypeLabel}</span>
        </div>
      </SummarySection>

      {/* Title */}
      <SummarySection
        label="Title"
        value={formData.title}
        icon={FileText}
        onEdit={() => onEditStep(2)}
      />

      {/* Content */}
      <SummarySection
        label="Details"
        icon={FileText}
        onEdit={() => onEditStep(2)}
      >
        {formData.content ? (
          <div className="text-gray-900 whitespace-pre-wrap max-h-32 overflow-y-auto text-sm">
            {formData.content}
          </div>
        ) : (
          <span className="text-gray-400 italic">No details provided</span>
        )}
      </SummarySection>

      {/* Priority */}
      <SummarySection
        label="Priority"
        icon={AlertCircle}
        onEdit={() => onEditStep(2)}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${priorityColors[formData.priority]}`}
          ></div>
          <span className="text-gray-900 capitalize">{formData.priority}</span>
        </div>
      </SummarySection>

      {/* Tags */}
      {formData.tags.length > 0 && (
        <SummarySection label="Tags" icon={Tag} onEdit={() => onEditStep(2)}>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </SummarySection>
      )}

      {/* Customer */}
      {formData.customerId && (
        <SummarySection
          label="Customer"
          value={formData.customerName}
          icon={Users}
          onEdit={() => onEditStep(3)}
        />
      )}

      {/* Opportunity */}
      {formData.opportunityCode && (
        <SummarySection
          label="Opportunity"
          value={formData.opportunityCode}
          icon={Target}
          onEdit={() => onEditStep(4)}
        />
      )}

      {/* Save as Template */}
      <div className="pt-4 border-t border-gray-200">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="save-template"
              checked={formData.saveAsTemplate}
              onCheckedChange={(checked) =>
                onUpdateField("saveAsTemplate", checked)
              }
            />
            <div className="flex-1">
              <Label htmlFor="save-template" className="cursor-pointer">
                Save as template for future use
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Reuse this structure for similar captures
              </p>
            </div>
          </div>

          {formData.saveAsTemplate && (
            <div className="pl-7">
              <Label htmlFor="template-name" className="mb-2 block">
                Template name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="template-name"
                type="text"
                placeholder="e.g., Customer Call Follow-up"
                value={formData.templateName}
                onChange={(e) => onUpdateField("templateName", e.target.value)}
                className={
                  errors.templateName
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
                maxLength={50}
                aria-invalid={!!errors.templateName}
                aria-describedby={
                  errors.templateName ? "template-name-error" : undefined
                }
              />
              {errors.templateName && (
                <p
                  id="template-name-error"
                  className="text-xs text-red-500 mt-1"
                  role="alert"
                >
                  {errors.templateName}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
