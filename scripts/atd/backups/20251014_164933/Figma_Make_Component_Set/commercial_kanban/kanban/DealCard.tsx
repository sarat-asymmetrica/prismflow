import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Clock,
  Eye,
  Edit,
  MoreHorizontal,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Deal } from "../../lib/kanban-types";
import {
  formatCurrency,
  formatRelativeTime,
  getInitials,
  generateAvatarColor,
  getPriorityColor,
} from "../../lib/kanban-utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface DealCardProps {
  deal: Deal;
  onDealClick?: (deal: Deal) => void;
}

export function DealCard({ deal, onDealClick }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: {
      type: "deal",
      deal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const showPriorityBadge =
    deal.priority === "high" || deal.priority === "urgent";
  const priorityColor = getPriorityColor(deal.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="deal-card group bg-white border border-[#E9ECEF] rounded-xl p-4 mb-3 cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      role="button"
      aria-label={`Deal ${deal.title}, customer ${deal.customerName}, value ${formatCurrency(deal.value, "INR")}`}
      {...attributes}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        {/* Priority Badge */}
        {showPriorityBadge && (
          <Badge
            className="text-white text-[11px] px-2 py-1"
            style={{ backgroundColor: priorityColor }}
          >
            {deal.priority === "urgent" ? (
              <AlertCircle className="w-3 h-3 mr-1" />
            ) : (
              <TrendingUp className="w-3 h-3 mr-1" />
            )}
            {deal.priority.toUpperCase()}
          </Badge>
        )}

        {/* Drag Handle */}
        <div
          {...listeners}
          className="ml-auto text-[#ADB5BD] hover:text-[#6C757D] cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>

      {/* Card Body */}
      <div onClick={() => onDealClick?.(deal)}>
        {/* Deal ID */}
        <p className="text-[11px] text-[#6C757D] font-mono mb-2">{deal.code}</p>

        {/* Customer */}
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="w-7 h-7 border-2 border-white shadow-sm">
            <AvatarFallback
              style={{
                backgroundColor: generateAvatarColor(deal.customerName),
              }}
              className="text-white text-[11px]"
            >
              {getInitials(deal.customerName)}
            </AvatarFallback>
          </Avatar>
          <p className="text-[#6C757D] text-sm truncate">{deal.customerName}</p>
        </div>

        {/* Title */}
        <h3 className="text-[#212529] mt-2 mb-2 line-clamp-2 min-h-[44px]">
          {deal.title}
        </h3>

        {/* Value */}
        <p className="text-[#06D6A0] mt-2">
          {formatCurrency(deal.value, "INR")}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F8F9FA]">
        {/* Left: Date */}
        <div className="flex items-center gap-1 text-[#6C757D] text-[13px]">
          <Clock className="w-3.5 h-3.5" />
          {formatRelativeTime(deal.updatedAt)}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Assigned User */}
          {deal.assignedUserName && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="w-6 h-6">
                    <AvatarFallback
                      style={{
                        backgroundColor: generateAvatarColor(
                          deal.assignedUserName,
                        ),
                      }}
                      className="text-white text-[10px]"
                    >
                      {getInitials(deal.assignedUserName)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{deal.assignedUserName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDealClick?.(deal);
                    }}
                  >
                    <Eye className="w-4 h-4 text-[#6C757D]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4 text-[#6C757D]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit deal</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4 text-[#6C757D]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Send WhatsApp</DropdownMenuItem>
                <DropdownMenuItem>Send email</DropdownMenuItem>
                <DropdownMenuItem>Call customer</DropdownMenuItem>
                <DropdownMenuItem>Schedule meeting</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
