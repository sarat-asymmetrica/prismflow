import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  Package,
  User,
  MapPin,
  Truck,
  Calendar,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  Clock,
} from "lucide-react";
import {
  Delivery,
  CARRIERS,
  STAGES,
  formatDateTime,
  formatRelativeTime,
  generateAvatarColor,
  getInitials,
} from "../../lib/deliveryData";

interface DeliveryDetailModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (delivery: Delivery) => void;
  onUploadPOD?: (delivery: Delivery) => void;
}

export const DeliveryDetailModal = ({
  delivery,
  isOpen,
  onClose,
  onUpdateStatus,
  onUploadPOD,
}: DeliveryDetailModalProps) => {
  if (!delivery) return null;

  const stageConfig = STAGES.find((s) => s.id === delivery.stage);
  const carrier = CARRIERS[delivery.carrier];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delivery Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[24px] text-[#212529] font-mono mb-2">
                {delivery.deliveryNo}
              </div>
              <Badge
                className="text-white"
                style={{ backgroundColor: stageConfig?.color }}
              >
                {stageConfig?.name}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-[#6C757D]">Created</div>
              <div className="text-[14px] text-[#212529]">
                {formatDateTime(delivery.createdAt)}
              </div>
              <div className="text-[13px] text-[#6C757D] mt-1">
                {formatRelativeTime(delivery.createdAt)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="text-[16px] text-[#212529]">
                Customer Information
              </h3>
            </div>
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[18px] border-4 border-white shadow-md flex-shrink-0"
                style={{
                  backgroundColor: generateAvatarColor(delivery.customerName),
                }}
              >
                {getInitials(delivery.customerName)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-[18px] text-[#212529]">
                  {delivery.customerName}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#6C757D]">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+973 1234 5678</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#6C757D]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>
                    {delivery.customerName.toLowerCase().replace(" ", ".")}
                    @email.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Address */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="text-[16px] text-[#212529]">Delivery Address</h3>
            </div>
            <div className="pl-6 space-y-1">
              <div className="text-[14px] text-[#212529]">
                {delivery.address}
              </div>
              <div className="text-[14px] text-[#6C757D]">
                {delivery.city}, {delivery.postalCode}
              </div>
              <div className="text-[14px] text-[#6C757D]">
                {delivery.country}
              </div>
            </div>
          </div>

          <Separator />

          {/* Carrier & Tracking */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="text-[16px] text-[#212529]">Carrier & Tracking</h3>
            </div>
            <div className="pl-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-[#6C757D]">Carrier</div>
                <div className="text-[14px] text-[#212529]">{carrier.name}</div>
              </div>
              {delivery.trackingNo && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] text-[#6C757D]">
                      Tracking Number
                    </div>
                    <div className="text-[14px] text-[#212529] font-mono">
                      {delivery.trackingNo}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (delivery.carrier !== "local") {
                        window.open(
                          carrier.trackingUrl(delivery.trackingNo!),
                          "_blank",
                        );
                      }
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Track on {carrier.name}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ETA */}
          {delivery.estimatedDelivery && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#6C63FF]" />
                  <h3 className="text-[16px] text-[#212529]">
                    Estimated Delivery
                  </h3>
                </div>
                <div className="pl-6">
                  <div className="text-[16px] text-[#3B82F6]">
                    {formatDateTime(delivery.estimatedDelivery)}
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Order Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-[#6C63FF]" />
              <h3 className="text-[16px] text-[#212529]">Order Information</h3>
            </div>
            <div className="pl-6 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-[#6C757D]">Order Number</div>
                <div className="text-[14px] text-[#212529]">
                  {delivery.orderNo}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-[#6C757D]">Priority</div>
                <Badge
                  variant={
                    delivery.priority === "urgent" ? "destructive" : "default"
                  }
                  className="capitalize"
                >
                  {delivery.priority}
                </Badge>
              </div>
            </div>
          </div>

          {/* Notes */}
          {delivery.deliveryNotes && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#6C63FF]" />
                  <h3 className="text-[16px] text-[#212529]">Notes</h3>
                </div>
                <div className="pl-6 p-3 bg-[#F8F9FA] rounded-lg">
                  <p className="text-[14px] text-[#212529]">
                    {delivery.deliveryNotes}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* POD Info */}
          {delivery.hasPOD && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-[#06D6A0]" />
                  <h3 className="text-[16px] text-[#212529]">
                    Proof of Delivery
                  </h3>
                </div>
                <div className="pl-6">
                  <div className="p-3 bg-[#06D6A0]/10 border border-[#06D6A0] rounded-lg">
                    <div className="text-[13px] text-[#06D6A0] mb-1">
                      Received by
                    </div>
                    <div className="text-[14px] text-[#212529]">
                      {delivery.receivedBy || delivery.customerName}
                    </div>
                    <div className="text-[13px] text-[#6C757D] mt-1">
                      {delivery.actualDelivery &&
                        formatDateTime(delivery.actualDelivery)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {onUpdateStatus && (
            <Button
              onClick={() => {
                onClose();
                onUpdateStatus(delivery);
              }}
              className="flex-1 bg-gradient-to-br from-[#6C63FF] to-[#5A52E0]"
            >
              Update Status
            </Button>
          )}
          {onUploadPOD &&
            delivery.stage === "out_for_delivery" &&
            !delivery.hasPOD && (
              <Button
                onClick={() => {
                  onClose();
                  onUploadPOD(delivery);
                }}
                variant="outline"
                className="flex-1"
              >
                Upload POD
              </Button>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
