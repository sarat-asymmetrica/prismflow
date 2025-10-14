import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { toast } from "sonner";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCount: number;
  totalCount: number;
}

type ExportFormat = "excel" | "pdf";
type ExportScope = "all" | "filtered" | "selected";

export function ExportDialog({
  open,
  onClose,
  selectedCount,
  totalCount,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [scope, setScope] = useState<ExportScope>("filtered");
  const [includeAgingReport, setIncludeAgingReport] = useState(true);
  const [includeStatistics, setIncludeStatistics] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    // Simulate export progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate export delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    clearInterval(interval);
    setProgress(100);

    // Get count based on scope
    let exportCount = totalCount;
    if (scope === "selected") exportCount = selectedCount;

    // Simulate download
    const filename = `payment_schedule_${new Date().toISOString().split("T")[0]}.${
      format === "excel" ? "xlsx" : "pdf"
    }`;

    toast.success(
      `Successfully exported ${exportCount} invoices to ${format.toUpperCase()}!`,
      {
        description: `File: ${filename}`,
        action: {
          label: "Download",
          onClick: () => {
            // In a real app, this would trigger the actual download
            console.log("Downloading:", filename);
          },
        },
      },
    );

    setTimeout(() => {
      setExporting(false);
      setProgress(0);
      onClose();
    }, 500);
  };

  const getExportCount = () => {
    if (scope === "all") return totalCount;
    if (scope === "selected") return selectedCount;
    return totalCount; // filtered
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download size={20} className="text-[#6C63FF]" />
            Export Payment Schedule
          </DialogTitle>
          <DialogDescription>
            Choose your export format and options
          </DialogDescription>
        </DialogHeader>

        {!exporting ? (
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div className="space-y-3">
              <Label className="font-semibold">Export Format</Label>
              <RadioGroup
                value={format}
                onValueChange={(v) => setFormat(v as ExportFormat)}
              >
                <div className="flex items-center space-x-3 p-3 border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet size={20} className="text-[#06D6A0]" />
                      <div>
                        <p className="font-medium">Excel Spreadsheet</p>
                        <p className="text-sm text-[#6C757D]">
                          .xlsx with multiple sheets
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border border-[#E9ECEF] rounded-lg hover:bg-[#F8F9FA] transition-colors">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-[#FF6B6B]" />
                      <div>
                        <p className="font-medium">PDF Report</p>
                        <p className="text-sm text-[#6C757D]">
                          Professional formatted report
                        </p>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Scope Selection */}
            <div className="space-y-3">
              <Label className="font-semibold">Export Scope</Label>
              <RadioGroup
                value={scope}
                onValueChange={(v) => setScope(v as ExportScope)}
              >
                <div className="flex items-center space-x-3 p-3 border border-[#E9ECEF] rounded-lg">
                  <RadioGroupItem value="filtered" id="filtered" />
                  <Label htmlFor="filtered" className="flex-1 cursor-pointer">
                    <p className="font-medium">Current View</p>
                    <p className="text-sm text-[#6C757D]">
                      {totalCount} invoices (with active filters)
                    </p>
                  </Label>
                </div>
                {selectedCount > 0 && (
                  <div className="flex items-center space-x-3 p-3 border border-[#E9ECEF] rounded-lg">
                    <RadioGroupItem value="selected" id="selected" />
                    <Label htmlFor="selected" className="flex-1 cursor-pointer">
                      <p className="font-medium">Selected Only</p>
                      <p className="text-sm text-[#6C757D]">
                        {selectedCount} selected invoices
                      </p>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            {/* Additional Options */}
            {format === "excel" && (
              <div className="space-y-3">
                <Label className="font-semibold">
                  Include Additional Sheets
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aging"
                      checked={includeAgingReport}
                      onCheckedChange={(checked) =>
                        setIncludeAgingReport(checked as boolean)
                      }
                    />
                    <Label htmlFor="aging" className="cursor-pointer">
                      Aging Report (30/60/90 day analysis)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="statistics"
                      checked={includeStatistics}
                      onCheckedChange={(checked) =>
                        setIncludeStatistics(checked as boolean)
                      }
                    />
                    <Label htmlFor="statistics" className="cursor-pointer">
                      Summary Statistics
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <p className="text-sm font-semibold text-[#212529] mb-2">
                Export Preview
              </p>
              <ul className="text-sm text-[#6C757D] space-y-1">
                <li>• Format: {format.toUpperCase()}</li>
                <li>• Invoices: {getExportCount()}</li>
                {format === "excel" && (
                  <>
                    {includeAgingReport && <li>• Aging Report: Yes</li>}
                    {includeStatistics && <li>• Statistics: Yes</li>}
                  </>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div className="py-8 space-y-4">
            <div className="flex flex-col items-center justify-center">
              {progress < 100 ? (
                <>
                  <Clock
                    size={48}
                    className="text-[#6C63FF] mb-4 animate-pulse"
                  />
                  <p className="font-semibold text-[#212529] mb-2">
                    Generating {format.toUpperCase()}...
                  </p>
                </>
              ) : (
                <>
                  <CheckCircle2 size={48} className="text-[#06D6A0] mb-4" />
                  <p className="font-semibold text-[#212529] mb-2">
                    Export Complete!
                  </p>
                </>
              )}
              <Progress value={progress} className="w-full max-w-xs" />
              <p className="text-sm text-[#6C757D] mt-2">{progress}%</p>
            </div>
          </div>
        )}

        {!exporting && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-[#6C63FF] to-[#5A52E0] text-white"
            >
              <Download size={16} className="mr-2" />
              Export {format.toUpperCase()}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
