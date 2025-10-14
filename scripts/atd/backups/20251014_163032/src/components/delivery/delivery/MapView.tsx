import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import {
  MapPin,
  Navigation,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";
import {
  Delivery,
  Stage,
  STAGES,
  formatRelativeTime,
  getInitials,
  generateAvatarColor,
} from "../../lib/deliveryData";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

interface MapViewProps {
  deliveries: Delivery[];
  onViewDetails: (delivery: Delivery) => void;
  onUpdateStatus: (delivery: Delivery) => void;
}

interface MapMarker {
  id: string;
  delivery: Delivery;
  x: number;
  y: number;
  lat: number;
  lng: number;
  color: string;
  pulse: boolean;
}

const STAGE_COLORS: Record<Stage, string> = {
  pending: "#FFD166",
  picked_up: "#3B82F6",
  in_transit: "#8B5CF6",
  out_for_delivery: "#FF9800",
  delivered: "#06D6A0",
  returned: "#FF6B6B",
};

// Mock coordinates for Bahrain and UAE cities
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Manama: { lat: 26.2285, lng: 50.586 },
  Riffa: { lat: 26.13, lng: 50.555 },
  Muharraq: { lat: 26.2572, lng: 50.6114 },
  Sitra: { lat: 26.1543, lng: 50.6178 },
  "Isa Town": { lat: 26.1738, lng: 50.5476 },
  "Hamad Town": { lat: 26.1158, lng: 50.5067 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  "Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
};

export const MapView = ({
  deliveries,
  onViewDetails,
  onUpdateStatus,
}: MapViewProps) => {
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Generate markers from deliveries
  const markers: MapMarker[] = deliveries
    .filter((d) => stageFilter === "all" || d.stage === stageFilter)
    .map((delivery, index) => {
      const coords = CITY_COORDS[delivery.city] || CITY_COORDS["Manama"];
      // Add slight offset for overlapping markers
      const offset = index % 3;
      return {
        id: delivery.id,
        delivery,
        x: coords.lng,
        y: coords.lat,
        lat: coords.lat + offset * 0.02,
        lng: coords.lng + offset * 0.02,
        color: STAGE_COLORS[delivery.stage],
        pulse:
          delivery.stage === "out_for_delivery" ||
          delivery.stage === "in_transit",
      };
    });

  // Draw map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    let pulseTime = 0;

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw map background
      ctx.fillStyle = "#F0F4F8";
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = "#E9ECEF";
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        const x = (width / 20) * i;
        const y = (height / 20) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw map features (simplified land masses)
      drawMapFeatures(ctx, width, height);

      // Draw routes for active deliveries
      drawRoutes(ctx, markers, width, height, mapZoom, mapPan);

      // Draw markers
      markers.forEach((marker) => {
        const screenPos = latLngToScreen(
          marker.lat,
          marker.lng,
          width,
          height,
          mapZoom,
          mapPan,
        );

        // Pulse animation for active deliveries
        const pulseScale = marker.pulse ? 1 + Math.sin(pulseTime * 3) * 0.1 : 1;

        // Draw pulse ring for active deliveries
        if (marker.pulse) {
          const pulseRadius = 20 + Math.sin(pulseTime * 2) * 8;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = marker.color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.3 + Math.sin(pulseTime * 2) * 0.2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Draw marker pin
        drawMarkerPin(
          ctx,
          screenPos.x,
          screenPos.y,
          marker.color,
          pulseScale,
          marker.id === selectedDelivery?.id,
        );
      });

      pulseTime += 0.02;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [markers, selectedDelivery, mapZoom, mapPan]);

  // Entrance animation
  useEffect(() => {
    gsap.from(".map-container", {
      opacity: 0,
      scale: 0.98,
      duration: 0.4,
      ease: "power2.out",
    });

    gsap.from(".map-sidebar", {
      x: 300,
      opacity: 0,
      duration: 0.5,
      delay: 0.2,
      ease: "power2.out",
    });
  }, []);

  const handleMarkerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is near any marker
    for (const marker of markers) {
      const screenPos = latLngToScreen(
        marker.lat,
        marker.lng,
        rect.width,
        rect.height,
        mapZoom,
        mapPan,
      );
      const distance = Math.sqrt(
        Math.pow(x - screenPos.x, 2) + Math.pow(y - screenPos.y, 2),
      );

      if (distance < 20) {
        setSelectedDelivery(marker.delivery);
        return;
      }
    }

    setSelectedDelivery(null);
  };

  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleRecenter = () => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
    toast.info("Map recentered");
  };

  const activeDeliveryCount = deliveries.filter((d) =>
    ["in_transit", "out_for_delivery"].includes(d.stage),
  ).length;

  return (
    <div className="map-container flex gap-6 h-[calc(100vh-240px)]">
      {/* Map Canvas */}
      <div className="flex-1 relative bg-white border border-[#E9ECEF] rounded-2xl overflow-hidden shadow-sm">
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Card className="p-2 shadow-md">
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0"
              onClick={handleRecenter}
            >
              <Locate className="w-4 h-4" />
            </Button>
          </Card>
        </div>

        {/* Stage Filter */}
        <div className="absolute top-4 right-4 z-10">
          <Card className="p-3 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-[#6C757D]" />
              <span className="text-[13px] text-[#6C757D]">
                Filter by Stage
              </span>
            </div>
            <Select
              value={stageFilter}
              onValueChange={(value: unknown) =>
                setStageFilter(value as Stage | "all")
              }
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map((stage: unknown) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[stage.id] }}
                      />
                      {stage.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>

        {/* Live Tracking Badge */}
        {activeDeliveryCount > 0 && (
          <div className="absolute bottom-4 left-4 z-10">
            <Card className="p-3 shadow-md bg-gradient-to-br from-[#6C63FF] to-[#5A52E0] border-none">
              <div className="flex items-center gap-2 text-white">
                <div className="relative">
                  <Navigation className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#06D6A0] rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="text-[11px] opacity-90">Live Tracking</div>
                  <div className="text-[14px]">
                    {activeDeliveryCount} Active Deliveries
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 z-10">
          <Card className="p-3 shadow-md">
            <div className="text-[12px] text-[#6C757D] mb-2 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Legend
            </div>
            <div className="space-y-1.5">
              {STAGES.slice(0, 4).map((stage: unknown) => (
                <div key={stage.id} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: STAGE_COLORS[stage.id] }}
                  />
                  <span className="text-[11px] text-[#212529]">
                    {stage.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={handleMarkerClick}
        />
      </div>

      {/* Sidebar */}
      <div className="map-sidebar w-[360px] flex flex-col gap-4">
        {/* Selected Delivery Details */}
        {selectedDelivery ? (
          <Card className="p-4 shadow-md">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[16px] text-[#212529] mb-1">
                  Delivery Details
                </div>
                <div className="text-[13px] text-[#6C757D] font-mono">
                  {selectedDelivery.deliveryNo}
                </div>
              </div>
              <Badge
                className="text-white text-[11px]"
                style={{
                  backgroundColor: STAGE_COLORS[selectedDelivery.stage],
                }}
              >
                {
                  STAGES.find((s: unknown) => s.id === selectedDelivery.stage)
                    ?.name
                }
              </Badge>
            </div>

            <Separator className="my-3" />

            {/* Customer Info */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] flex-shrink-0"
                style={{
                  backgroundColor: generateAvatarColor(
                    selectedDelivery.customerName,
                  ),
                }}
              >
                {getInitials(selectedDelivery.customerName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] text-[#212529] truncate">
                  {selectedDelivery.customerName}
                </div>
                <div className="text-[12px] text-[#6C757D] truncate">
                  {selectedDelivery.address}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 p-2 bg-[#F8F9FA] rounded-lg mb-3">
              <MapPin className="w-4 h-4 text-[#6C63FF]" />
              <span className="text-[13px] text-[#212529]">
                {selectedDelivery.city}, {selectedDelivery.country}
              </span>
            </div>

            {/* ETA */}
            {selectedDelivery.estimatedDelivery && (
              <div className="flex items-center gap-2 p-2 bg-[#3B82F6]/10 rounded-lg mb-3">
                <Clock className="w-4 h-4 text-[#3B82F6]" />
                <div className="flex-1">
                  <div className="text-[11px] text-[#6C757D]">
                    Estimated Delivery
                  </div>
                  <div className="text-[13px] text-[#3B82F6]">
                    {formatRelativeTime(selectedDelivery.estimatedDelivery)}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(selectedDelivery)}
                className="flex-1"
              >
                View Details
              </Button>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(selectedDelivery)}
                className="flex-1 bg-gradient-to-br from-[#6C63FF] to-[#5A52E0]"
              >
                Update Status
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center shadow-md">
            <MapPin className="w-12 h-12 text-[#E9ECEF] mx-auto mb-3" />
            <div className="text-[14px] text-[#6C757D] mb-1">
              No delivery selected
            </div>
            <div className="text-[12px] text-[#ADB5BD]">
              Click on a marker to view details
            </div>
          </Card>
        )}

        {/* Deliveries List */}
        <Card className="flex-1 overflow-hidden shadow-md flex flex-col">
          <div className="p-4 border-b border-[#E9ECEF]">
            <div className="text-[16px] text-[#212529] mb-1">
              {stageFilter === "all"
                ? "All Deliveries"
                : STAGES.find((s: unknown) => s.id === stageFilter)?.name}
            </div>
            <div className="text-[13px] text-[#6C757D]">
              {markers.length} on map
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {markers.map((marker) => (
                <button
                  key={marker.id}
                  onClick={() => setSelectedDelivery(marker.delivery)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all
                    ${
                      selectedDelivery?.id === marker.id
                        ? "bg-[#6C63FF]/10 border-2 border-[#6C63FF]"
                        : "bg-[#F8F9FA] hover:bg-[#E9ECEF] border-2 border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: marker.color }}
                    />
                    <span className="text-[13px] text-[#212529] font-mono truncate flex-1">
                      {marker.delivery.deliveryNo}
                    </span>
                    {marker.pulse && (
                      <div className="w-2 h-2 bg-[#06D6A0] rounded-full animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-[12px] text-[#6C757D] truncate pl-4">
                    {marker.delivery.customerName}
                  </div>
                  <div className="text-[11px] text-[#ADB5BD] truncate pl-4">
                    {marker.delivery.city}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper functions
const latLngToScreen = (
  lat: number,
  lng: number,
  width: number,
  height: number,
  zoom: number,
  pan: { x: number; y: number },
): { x: number; y: number } => {
  // Simple mercator projection
  const x = ((lng - 48) / 8) * width * zoom + pan.x + width / 2;
  const y = ((28 - lat) / 6) * height * zoom + pan.y + height / 2;
  return { x, y };
};

const drawMarkerPin = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  scale: number,
  selected: boolean,
) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Shadow
  if (selected) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
  }

  // Pin body
  ctx.beginPath();
  ctx.arc(0, -10, 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Pin border
  ctx.strokeStyle = selected ? "#FFFFFF" : "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = selected ? 3 : 2;
  ctx.stroke();

  // Pin point
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-4, -4);
  ctx.lineTo(4, -4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Center dot
  ctx.beginPath();
  ctx.arc(0, -10, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  ctx.restore();
};

const drawMapFeatures = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => {
  // Draw simplified land masses (Bahrain & UAE region)
  ctx.fillStyle = "#E5E9ED";

  // Bahrain island (simplified)
  ctx.beginPath();
  ctx.ellipse(width * 0.45, height * 0.4, 60, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // UAE coastline (simplified)
  ctx.beginPath();
  ctx.ellipse(width * 0.75, height * 0.65, 80, 100, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Saudi Arabia coastline (hint)
  ctx.fillStyle = "#DDE3E8";
  ctx.beginPath();
  ctx.ellipse(width * 0.2, height * 0.5, 100, 120, 0, 0, Math.PI * 2);
  ctx.fill();
};

const drawRoutes = (
  ctx: CanvasRenderingContext2D,
  markers: MapMarker[],
  width: number,
  height: number,
  zoom: number,
  pan: { x: number; y: number },
) => {
  const activeMarkers = markers.filter(
    (m) =>
      m.delivery.stage === "in_transit" ||
      m.delivery.stage === "out_for_delivery",
  );

  activeMarkers.forEach((marker) => {
    // Draw route from warehouse (center) to delivery location
    const start = latLngToScreen(26.2285, 50.586, width, height, zoom, pan); // Manama center
    const end = latLngToScreen(
      marker.lat,
      marker.lng,
      width,
      height,
      zoom,
      pan,
    );

    // Dotted line for route
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = marker.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // Moving dot along route (animation)
    const progress = (Date.now() % 3000) / 3000;
    const dotX = start.x + (end.x - start.x) * progress;
    const dotY = start.y + (end.y - start.y) * progress;

    ctx.beginPath();
    ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = marker.color;
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
};
