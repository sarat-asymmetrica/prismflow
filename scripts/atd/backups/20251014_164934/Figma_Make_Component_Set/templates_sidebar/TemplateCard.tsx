import { Star, MoreVertical, TrendingUp } from "lucide-react";
import { Template, UserRole } from "../types/template";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useEffect, useRef } from "react";

interface TemplateCardProps {
  template: Template;
  role: UserRole;
  onApply: (template: Template) => void;
  onToggleFavorite: (templateId: string) => void;
  onEdit?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
  typeIcon: React.ReactNode;
  typeColor: string;
}

export function TemplateCard({
  template,
  role,
  onApply,
  onToggleFavorite,
  onEdit,
  onDelete,
  typeIcon,
  typeColor
}: TemplateCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseEnter = () => {
      if (window.gsap) {
        window.gsap.to(card, {
          scale: 1.01,
          borderColor: "#6C63FF",
          boxShadow: "0 4px 12px rgba(108, 99, 255, 0.15)",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const handleMouseLeave = () => {
      if (window.gsap) {
        window.gsap.to(card, {
          scale: 1.0,
          borderColor: "#E9ECEF",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const canEdit = role === "SUPERADMIN" || (role === "ADMIN" && template.createdBy === "user1");
  const canDelete = role === "SUPERADMIN" || (role === "ADMIN" && template.createdBy === "user1" && !template.isPublic);

  return (
    <div
      ref={cardRef}
      className="template-card bg-white border border-[#E9ECEF] rounded-xl p-4 cursor-pointer mb-2"
      style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
      role="article"
      aria-label={`${template.name}, ${template.type}, used ${template.usageCount} times`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <Badge
          className="flex items-center gap-1.5 px-2 py-1 rounded-md border-0"
          style={{ backgroundColor: typeColor, color: "#FFFFFF" }}
        >
          {typeIcon}
          <span className="text-xs capitalize">{template.type}</span>
        </Badge>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(template.id);
              
              // Animate star
              if (window.gsap) {
                const starIcon = e.currentTarget.querySelector("svg");
                if (starIcon) {
                  if (!template.isFavorite) {
                    window.gsap.from(starIcon, {
                      scale: 0,
                      rotation: -180,
                      duration: 0.5,
                      ease: "back.out(1.7)"
                    });
                  }
                }
              }
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Toggle favorite"
            aria-pressed={template.isFavorite}
          >
            <Star
              size={16}
              fill={template.isFavorite ? "#FFD700" : "none"}
              stroke={template.isFavorite ? "#FFD700" : "#E9ECEF"}
              className="transition-colors"
            />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} className="text-[#6C757D]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onApply(template)}>
                Apply Template
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(template.id)}>
                {template.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(template.id)}>
                  Edit Template
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(template.id)}
                  className="text-red-600"
                >
                  Delete Template
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Body */}
      <div className="mb-3">
        <h3 className="text-[#212529] mb-1 line-clamp-2">
          {template.name}
        </h3>
        <p className="text-[#6C757D] text-sm line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#6C757D] text-xs">
          <TrendingUp size={12} />
          <span>{template.usageCount} uses</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-[#6C63FF] hover:bg-[#6C63FF]/10 h-7 px-3"
          onClick={(e) => {
            e.stopPropagation();
            onApply(template);
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
