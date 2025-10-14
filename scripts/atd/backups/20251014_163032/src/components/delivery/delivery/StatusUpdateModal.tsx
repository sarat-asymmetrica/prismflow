import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Delivery,
  Stage,
  STAGES,
  VALID_TRANSITIONS,
} from "../../lib/deliveryData";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface StatusUpdateModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (
    deliveryId: string,
    newStage: Stage,
    details?: any,
  ) => Promise<void>;
}

export const StatusUpdateModal = ({
  delivery,
  isOpen,
  onClose,
  onUpdateStatus,
}: StatusUpdateModalProps) => {
  const [newStage, setNewStage] = useState<Stage | "">("");
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date>();
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!delivery) return null;

  const currentStageConfig = STAGES.find(
    (s: unknown) => s.id === delivery.stage,
  );
  const validNextStages = VALID_TRANSITIONS[delivery.stage] || [];

  const handleSubmit = async () => {
    if (!newStage) {
      toast.error("Please select a new status");
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateStatus(delivery.id, newStage, {
        estimatedDelivery: estimatedDelivery?.toISOString(),
        location: location || undefined,
        notes: notes || undefined,
      });
      toast.success(
        `Delivery status updated to ${STAGES.find((s: unknown) => s.id === newStage)?.name}`,
      );
      handleClose();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewStage("");
    setEstimatedDelivery(undefined);
    setLocation("");
    setNotes("");
    onClose();
  };

  const requiresETA =
    newStage &&
    ["picked_up", "in_transit", "out_for_delivery"].includes(newStage);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Delivery Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Delivery Info */}
          <div className="p-3 bg-[#F8F9FA] rounded-lg">
            <div className="text-[13px] text-[#6C757D] mb-1">
              Delivery Number
            </div>
            <div className="text-[15px] text-[#212529] font-mono">
              {delivery.deliveryNo}
            </div>
            <div className="text-[13px] text-[#6C757D] mt-2">
              Customer: {delivery.customerName}
            </div>
            <div className="text-[13px] text-[#6C757D]">
              Order: {delivery.orderNo}
            </div>
          </div>

          {/* Current Status */}
          <div>
            <Label>Current Status</Label>
            <div className="mt-1.5">
              <Badge
                className="text-white"
                style={{ backgroundColor: currentStageConfig?.color }}
              >
                {currentStageConfig?.name}
              </Badge>
            </div>
          </div>

          {/* New Status */}
          <div>
            <Label>New Status *</Label>
            <Select
              value={newStage}
              onValueChange={(value: unknown) => setNewStage(value as Stage)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {validNextStages.length === 0 ? (
                  <div className="px-2 py-6 text-center text-[13px] text-[#6C757D]">
                    No valid transitions from current stage
                  </div>
                ) : (
                  validNextStages.map((stageId: unknown) => {
                    const stageConfig = STAGES.find(
                      (s: unknown) => s.id === stageId,
                    );
                    return (
                      <SelectItem key={stageId} value={stageId}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: stageConfig?.color }}
                          />
                          {stageConfig?.name}
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Delivery Time - Show for certain stages */}
          {requiresETA && (
            <div>
              <Label>Estimated Delivery Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left mt-1.5"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {estimatedDelivery
                      ? format(estimatedDelivery, "PPP HH:mm")
                      : "Select date & time"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={estimatedDelivery}
                    onSelect={setEstimatedDelivery}
                    disabled={(date: unknown) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Location */}
          <div>
            <Label>Current Location (Optional)</Label>
            <Input
              type="text"
              placeholder="e.g., City, Country"
              value={location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLocation(e.target.value)
              }
              className="mt-1.5"
            />
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNotes(e.target.value)
              }
              rows={3}
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newStage || isSubmitting}
            className="bg-gradient-to-br from-[#6C63FF] to-[#5A52E0]"
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
