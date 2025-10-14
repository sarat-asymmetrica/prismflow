import { useState } from "react";
import { Capture } from "../../types/capture";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  captureTypeColors,
  captureTypeLabels,
  statusColors,
  priorityColors,
  formatRelativeTime,
} from "../../utils/captureUtils";
import { Clock, Target, Edit2, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface CaptureCardProps {
  capture: Capture;
  onClick?: () => void;
}

export function CaptureCard({ capture, onClick }: CaptureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasLongContent = capture.content.length > 150;
  const displayContent =
    isExpanded || !hasLongContent
      ? capture.content
      : capture.content.slice(0, 150) + "...";

  return (
    <div
      className="capture-card w-full p-5 bg-white border border-[#E9ECEF] rounded-2xl shadow-sm hover:border-[#6C63FF] hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#6C757D]">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[13px] leading-[18px] font-medium">
              {formatRelativeTime(capture.createdAt)}
            </span>
          </div>

          <Badge
            className="rounded-lg px-2.5 py-1 border-0"
            style={{
              backgroundColor: captureTypeColors[capture.type],
              color: "#FFFFFF",
            }}
          >
            {captureTypeLabels[capture.type]}
          </Badge>

          <Badge
            className="rounded-lg px-2.5 py-1 border-0"
            style={{
              backgroundColor: statusColors[capture.status],
              color: "#FFFFFF",
            }}
          >
            {capture.status}
          </Badge>

          <Badge
            className="rounded-lg px-2.5 py-1 border-0"
            style={{
              backgroundColor: priorityColors[capture.priority],
              color: "#FFFFFF",
            }}
          >
            {capture.priority}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Body */}
      <div className="mb-4">
        <h3 className="text-[#212529] mb-2 line-clamp-2">{capture.title}</h3>
        <p className="text-[#6C757D]">{displayContent}</p>
        {hasLongContent && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-[#6C63FF] text-sm mt-1 hover:underline"
          >
            {isExpanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F8F9FA]">
        <div className="flex items-center gap-4">
          {capture.customerName && (
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={capture.customerAvatar} />
                <AvatarFallback className="text-xs">
                  {capture.customerName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-[#6C757D] text-[13px]">
                {capture.customerName}
              </span>
            </div>
          )}

          {capture.opportunityCode && (
            <div className="flex items-center gap-1.5 text-[#6C757D]">
              <Target className="w-3.5 h-3.5" />
              <span className="text-[13px]">{capture.opportunityCode}</span>
            </div>
          )}
        </div>

        {capture.tags.length > 0 && (
          <div className="flex items-center gap-2">
            {capture.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 border-[#E9ECEF]"
              >
                {tag}
              </Badge>
            ))}
            {capture.tags.length > 3 && (
              <span className="text-xs text-[#6C757D]">
                +{capture.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
