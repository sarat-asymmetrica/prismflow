import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Upload,
  Camera,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Edit2,
} from "lucide-react";
import { Delivery } from "../../lib/deliveryData";
import { toast } from "sonner";

interface PODUploadModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onUploadPOD: (
    deliveryId: string,
    files: File[],
    recipientInfo: RecipientInfo,
  ) => Promise<void>;
}

interface RecipientInfo {
  name: string;
  signature?: string;
  notes?: string;
}

export const PODUploadModal = ({
  delivery,
  isOpen,
  onClose,
  onUploadPOD,
}: PODUploadModalProps) => {
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  if (!delivery) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

      if (!isValidType) {
        toast.error(`${file.name} is not a valid file type`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignatureData(null);
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      // Check if canvas is blank
      const blankCanvas = document.createElement("canvas");
      blankCanvas.width = canvas.width;
      blankCanvas.height = canvas.height;
      if (data === blankCanvas.toDataURL()) {
        toast.error("Please draw a signature first");
        return;
      }
      setSignatureData(data);
      setShowSignaturePad(false);
      toast.success("Signature saved");
    }
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.moveTo(x, y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#212529";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSubmit = async () => {
    if (!recipientName.trim()) {
      toast.error("Please enter recipient name");
      return;
    }

    if (files.length === 0 && !signatureData) {
      toast.error("Please upload at least one file or add a signature");
      return;
    }

    setIsSubmitting(true);
    try {
      await onUploadPOD(delivery.id, files, {
        name: recipientName,
        signature: signatureData || undefined,
        notes: notes || undefined,
      });

      toast.success("Proof of Delivery uploaded successfully");
      handleClose();
    } catch (error) {
      toast.error("Failed to upload POD");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRecipientName("");
    setNotes("");
    setFiles([]);
    setSignatureData(null);
    setShowSignaturePad(false);
    handleClearSignature();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Proof of Delivery</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Delivery Info */}
          <div className="p-4 bg-[#F8F9FA] rounded-lg">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <div className="text-[#6C757D]">Delivery Number</div>
                <div className="text-[#212529] font-mono">
                  {delivery.deliveryNo}
                </div>
              </div>
              <div>
                <div className="text-[#6C757D]">Order Number</div>
                <div className="text-[#212529]">{delivery.orderNo}</div>
              </div>
              <div>
                <div className="text-[#6C757D]">Customer</div>
                <div className="text-[#212529]">{delivery.customerName}</div>
              </div>
              <div>
                <div className="text-[#6C757D]">Location</div>
                <div className="text-[#212529]">
                  {delivery.city}, {delivery.country}
                </div>
              </div>
            </div>
          </div>

          {/* Recipient Name */}
          <div>
            <Label>Received By *</Label>
            <Input
              type="text"
              placeholder="Enter recipient name"
              value={recipientName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRecipientName(e.target.value)
              }
              className="mt-1.5"
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>Upload Files</Label>
            <div className="mt-1.5 space-y-3">
              {/* Upload Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="w-4 h-4 text-[#6C63FF] flex-shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-[#FF6B6B] flex-shrink-0" />
                        )}
                        <span className="text-[13px] text-[#212529] truncate">
                          {file.name}
                        </span>
                        <span className="text-[12px] text-[#6C757D] flex-shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Drag & Drop Area */}
              <div
                className="border-2 border-dashed border-[#E9ECEF] rounded-lg p-6 text-center hover:border-[#6C63FF] transition-colors cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(
                    "border-[#6C63FF]",
                    "bg-[#6C63FF]/5",
                  );
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(
                    "border-[#6C63FF]",
                    "bg-[#6C63FF]/5",
                  );
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(
                    "border-[#6C63FF]",
                    "bg-[#6C63FF]/5",
                  );
                  const droppedFiles = Array.from(e.dataTransfer.files);
                  handleFileSelect({ target: { files: droppedFiles } } as any);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-[#ADB5BD] mx-auto mb-2" />
                <p className="text-[13px] text-[#6C757D]">
                  Drop files here or click to browse
                </p>
                <p className="text-[12px] text-[#ADB5BD] mt-1">
                  Maximum file size: 10MB
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div>
            <Label>Signature (Optional)</Label>
            {!showSignaturePad && !signatureData && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSignaturePad(true)}
                className="w-full mt-1.5"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Add Signature
              </Button>
            )}

            {showSignaturePad && (
              <div className="mt-1.5 border border-[#E9ECEF] rounded-lg p-3 bg-white">
                <div className="mb-2 text-[13px] text-[#6C757D]">
                  Draw your signature below
                </div>
                <div className="border border-[#E9ECEF] rounded bg-white">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={160}
                    className="w-full h-40 cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearSignature}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveSignature}
                    className="flex-1 bg-gradient-to-br from-[#6C63FF] to-[#5A52E0]"
                  >
                    Save Signature
                  </Button>
                </div>
              </div>
            )}

            {signatureData && !showSignaturePad && (
              <div className="mt-1.5 space-y-2">
                <div className="flex items-center gap-2 p-3 bg-[#06D6A0]/10 border border-[#06D6A0] rounded-lg">
                  <CheckCircle className="w-4 h-4 text-[#06D6A0]" />
                  <span className="text-[13px] text-[#06D6A0] flex-1">
                    Signature added
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSignaturePad(true)}
                    className="text-[#06D6A0] hover:text-[#06D6A0]"
                  >
                    Edit
                  </Button>
                </div>
                <div className="border border-[#E9ECEF] rounded-lg p-2 bg-white">
                  <img
                    src={signatureData}
                    alt="Signature"
                    className="w-full h-20 object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>Delivery Notes (Optional)</Label>
            <Textarea
              placeholder="Add any notes about the delivery..."
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
            disabled={isSubmitting}
            className="bg-gradient-to-br from-[#6C63FF] to-[#5A52E0]"
          >
            {isSubmitting ? "Uploading..." : "Upload & Complete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
