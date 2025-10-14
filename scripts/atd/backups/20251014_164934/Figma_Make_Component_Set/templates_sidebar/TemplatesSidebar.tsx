import { useState, useEffect, useRef, useCallback } from "react";
import {
  Layout,
  ChevronRight,
  Search,
  X,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckSquare,
} from "lucide-react";
import { TemplatesSidebarProps, TemplateType } from "../types/template";
import { useTemplates } from "../hooks/useTemplates";
import { FilterChip } from "./FilterChip";
import { TemplateCard } from "./TemplateCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner@2.0.3";

// Template type configuration
const TEMPLATE_TYPES = [
  { type: "whatsapp" as TemplateType, label: "WhatsApp", icon: MessageSquare, color: "#25D366" },
  { type: "call" as TemplateType, label: "Call", icon: Phone, color: "#FF6B6B" },
  { type: "email" as TemplateType, label: "Email", icon: Mail, color: "#3B82F6" },
  { type: "meeting" as TemplateType, label: "Meeting", icon: Calendar, color: "#8B5CF6" },
  { type: "note" as TemplateType, label: "Note", icon: FileText, color: "#FFD166" },
  { type: "task" as TemplateType, label: "Task", icon: CheckSquare, color: "#06D6A0" },
];

export function TemplatesSidebar({
  userId,
  role = "USER",
  isCollapsed = false,
  onToggle,
  onApply,
  onCreateNew
}: TemplatesSidebarProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState<TemplateType | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    templates,
    favorites,
    recent,
    popular,
    loading,
    error,
    applyTemplate,
    toggleFavorite,
    deleteTemplate,
    searchTemplates,
    filterByType
  } = useTemplates(userId);

  // Load GSAP
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js";
    script.async = true;
    script.onload = () => {
      // Animate sidebar entrance
      if (window.gsap && sidebarRef.current && !collapsed) {
        window.gsap.from(sidebarRef.current, {
          x: 320,
          duration: 0.4,
          ease: "power1.inOut"
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Animate template cards when they load
  useEffect(() => {
    if (!loading && cardsRef.current && window.gsap) {
      const cards = cardsRef.current.querySelectorAll(".template-card");
      window.gsap.from(cards, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out"
      });
    }
  }, [loading, templates.length, activeFilter, searchValue]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchTemplates(value);
    }, 300);
  }, [searchTemplates]);

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onToggle?.();

    if (window.gsap && sidebarRef.current) {
      window.gsap.to(sidebarRef.current, {
        x: newCollapsed ? 320 : 0,
        duration: 0.4,
        ease: "power1.inOut"
      });
    }
  };

  const handleFilterClick = (type: TemplateType) => {
    const newFilter = activeFilter === type ? null : type;
    setActiveFilter(newFilter);
    filterByType(newFilter);
  };

  const handleApply = (template: any) => {
    applyTemplate(template.id);
    onApply?.(template);
    toast.success(`Applied template: ${template.name}`);
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      await toggleFavorite(templateId);
    } catch (err) {
      toast.error("Failed to update favorite");
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      toast.success("Template deleted");
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  const getTypeIcon = (type: TemplateType) => {
    const config = TEMPLATE_TYPES.find(t => t.type === type);
    if (!config) return null;
    const Icon = config.icon;
    return <Icon size={16} />;
  };

  const getTypeColor = (type: TemplateType) => {
    return TEMPLATE_TYPES.find(t => t.type === type)?.color || "#6C63FF";
  };

  const showCreateButton = role === "ADMIN" || role === "SUPERADMIN";

  if (collapsed) {
    return null;
  }

  return (
    <div
      ref={sidebarRef}
      className="templates-sidebar fixed right-0 top-0 w-[320px] h-screen bg-white border-l border-[#E9ECEF] z-[100] flex flex-col"
      style={{ boxShadow: "-8px 0 24px rgba(0, 0, 0, 0.08)" }}
      role="complementary"
      aria-label="Templates sidebar"
    >
      {/* Header */}
      <div
        className="h-[72px] px-6 flex items-center justify-between"
        style={{
          background: "linear-gradient(135deg, #6C63FF, #5A52E0)"
        }}
      >
        <div className="flex items-center gap-3">
          <Layout size={24} className="text-white" />
          <h2 className="text-white">Templates</h2>
        </div>
        <button
          onClick={handleToggleCollapse}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Collapse sidebar"
          aria-expanded={!collapsed}
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="h-[64px] px-6 py-3 bg-[#F8F9FA] border-b border-[#E9ECEF]" role="search">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-10 bg-white border-[#E9ECEF] rounded-lg focus:border-[#6C63FF] focus:ring-[#6C63FF]/20"
            aria-label="Search templates"
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-[#212529]"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div
        className="h-12 px-6 py-2 bg-white border-b border-[#E9ECEF] overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Filter templates by type"
      >
        <div className="flex gap-2">
          {TEMPLATE_TYPES.map((config) => (
            <FilterChip
              key={config.type}
              type={config.type}
              label={config.label}
              icon={config.icon}
              color={config.color}
              isActive={activeFilter === config.type}
              onClick={() => handleFilterClick(config.type)}
            />
          ))}
        </div>
      </div>

      {/* Gallery */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div ref={cardsRef}>
          {loading ? (
            // Loading skeleton
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 border border-[#E9ECEF] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <p className="text-[#6C757D] mb-4">Failed to load templates</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : templates.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <Layout size={48} className="mx-auto mb-4 text-[#ADB5BD]" />
              <h3 className="text-[#212529] mb-2">
                {searchValue || activeFilter ? "No matching templates" : "No templates yet"}
              </h3>
              <p className="text-[#6C757D] text-sm mb-4">
                {searchValue || activeFilter
                  ? "Try a different search or filter"
                  : "Create your first template to save time"}
              </p>
              {searchValue && (
                <Button variant="outline" onClick={() => handleSearchChange("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Favorites Section */}
              {favorites.length > 0 && !searchValue && !activeFilter && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#6C757D] text-sm uppercase tracking-wide">
                      Favorites
                    </h3>
                    <span className="text-[#6C757D] text-xs">{favorites.length}</span>
                  </div>
                  {favorites.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      role={role}
                      onApply={handleApply}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                      typeIcon={getTypeIcon(template.type)}
                      typeColor={getTypeColor(template.type)}
                    />
                  ))}
                </div>
              )}

              {/* Recent Section */}
              {recent.length > 0 && !searchValue && !activeFilter && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#6C757D] text-sm uppercase tracking-wide">
                      Recent
                    </h3>
                    <span className="text-[#6C757D] text-xs">{recent.length}</span>
                  </div>
                  {recent.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      role={role}
                      onApply={handleApply}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                      typeIcon={getTypeIcon(template.type)}
                      typeColor={getTypeColor(template.type)}
                    />
                  ))}
                </div>
              )}

              {/* Popular Section */}
              {popular.length > 0 && !searchValue && !activeFilter && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#6C757D] text-sm uppercase tracking-wide">
                      Popular
                    </h3>
                    <span className="text-[#6C757D] text-xs">{popular.length}</span>
                  </div>
                  {popular.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      role={role}
                      onApply={handleApply}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                      typeIcon={getTypeIcon(template.type)}
                      typeColor={getTypeColor(template.type)}
                    />
                  ))}
                </div>
              )}

              {/* All Templates Section */}
              {(searchValue || activeFilter) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#6C757D] text-sm uppercase tracking-wide">
                      Results
                    </h3>
                    <span className="text-[#6C757D] text-xs">{templates.length}</span>
                  </div>
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      role={role}
                      onApply={handleApply}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                      typeIcon={getTypeIcon(template.type)}
                      typeColor={getTypeColor(template.type)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {showCreateButton && (
        <div className="h-[64px] px-6 py-3 bg-[#F8F9FA] border-t border-[#E9ECEF]">
          <Button
            onClick={onCreateNew}
            className="w-full h-10 text-white border-0 rounded-lg transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #6C63FF, #5A52E0)"
            }}
            aria-label="Create new template"
          >
            <Plus size={16} className="mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
}

// Add GSAP to window type
declare global {
  interface Window {
    gsap: any;
  }
}
