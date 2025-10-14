import { useState } from "react";
import { Save, Star, Trash2, Plus, Filter } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { PaymentStatus } from "../types/payment";

interface FilterView {
  id: string;
  name: string;
  description?: string;
  filters: {
    search?: string;
    status?: PaymentStatus[];
    dateRange?: { start: string; end: string };
    amountRange?: { min: number; max: number };
  };
  isFavorite?: boolean;
}

interface SavedFilterViewsProps {
  currentFilters: {
    search?: string;
    status?: PaymentStatus[];
    dateRange?: { start: string; end: string };
    amountRange?: { min: number; max: number };
  };
  onApplyView: (filters: FilterView["filters"]) => void;
}

const defaultViews: FilterView[] = [
  {
    id: "overdue-critical",
    name: "Overdue Critical",
    description: "Invoices overdue by 30+ days",
    filters: {
      status: ["overdue"],
    },
    isFavorite: true,
  },
  {
    id: "due-this-week",
    name: "Due This Week",
    description: "Invoices due in next 7 days",
    filters: {
      status: ["pending"],
    },
    isFavorite: true,
  },
  {
    id: "high-value",
    name: "High Value",
    description: "Invoices over $10,000",
    filters: {
      amountRange: { min: 10000, max: Infinity },
    },
  },
  {
    id: "partial-payments",
    name: "Partial Payments",
    description: "Invoices with partial payments",
    filters: {
      status: ["partially_paid"],
    },
  },
];

export function SavedFilterViews({
  currentFilters,
  onApplyView,
}: SavedFilterViewsProps) {
  const [views, setViews] = useState<FilterView[]>(defaultViews);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDescription, setNewViewDescription] = useState("");

  const hasActiveFilters =
    currentFilters.search ||
    (currentFilters.status && currentFilters.status.length > 0) ||
    currentFilters.dateRange ||
    currentFilters.amountRange;

  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) {
      toast.error("Please enter a name for this view");
      return;
    }

    const newView: FilterView = {
      id: `custom-${Date.now()}`,
      name: newViewName,
      description: newViewDescription || undefined,
      filters: currentFilters,
      isFavorite: false,
    };

    setViews([...views, newView]);
    toast.success(`Saved filter view: ${newViewName}`);
    setSaveDialogOpen(false);
    setNewViewName("");
    setNewViewDescription("");
  };

  const handleDeleteView = (viewId: string) => {
    setViews(views.filter((v) => v.id !== viewId));
    toast.success("Filter view deleted");
  };

  const handleToggleFavorite = (viewId: string) => {
    setViews(
      views.map((v) =>
        v.id === viewId ? { ...v, isFavorite: !v.isFavorite } : v,
      ),
    );
  };

  const getFilterDescription = (filters: FilterView["filters"]) => {
    const parts: string[] = [];
    if (filters.status && filters.status.length > 0) {
      parts.push(`${filters.status.length} status`);
    }
    if (filters.dateRange) {
      parts.push("date range");
    }
    if (filters.amountRange) {
      parts.push("amount range");
    }
    if (filters.search) {
      parts.push("search");
    }
    return parts.length > 0 ? parts.join(", ") : "No filters";
  };

  const favoriteViews = views.filter((v) => v.isFavorite);
  const otherViews = views.filter((v) => !v.isFavorite);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter size={14} className="mr-2" />
            Saved Views
            {favoriteViews.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5">
                {favoriteViews.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          {/* Favorites */}
          {favoriteViews.length > 0 && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                  Favorites
                </p>
              </div>
              {favoriteViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  className="flex items-start gap-2 cursor-pointer group"
                  onClick={() => onApplyView(view.filters)}
                >
                  <Star
                    size={14}
                    className="text-[#FFD166] mt-0.5 fill-[#FFD166]"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{view.name}</p>
                    {view.description && (
                      <p className="text-xs text-[#6C757D]">
                        {view.description}
                      </p>
                    )}
                    <p className="text-xs text-[#ADB5BD] mt-0.5">
                      {getFilterDescription(view.filters)}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(view.id);
                      }}
                    >
                      <Star size={12} />
                    </Button>
                    {view.id.startsWith("custom-") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Other Views */}
          {otherViews.length > 0 && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                  All Views
                </p>
              </div>
              {otherViews.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  className="flex items-start gap-2 cursor-pointer group"
                  onClick={() => onApplyView(view.filters)}
                >
                  <Filter size={14} className="text-[#ADB5BD] mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{view.name}</p>
                    {view.description && (
                      <p className="text-xs text-[#6C757D]">
                        {view.description}
                      </p>
                    )}
                    <p className="text-xs text-[#ADB5BD] mt-0.5">
                      {getFilterDescription(view.filters)}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(view.id);
                      }}
                    >
                      <Star size={12} />
                    </Button>
                    {view.id.startsWith("custom-") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Save Current View */}
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setSaveDialogOpen(true)}
            disabled={!hasActiveFilters}
          >
            <Plus size={14} />
            <span>Save Current View</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save View Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save size={20} className="text-[#6C63FF]" />
              Save Filter View
            </DialogTitle>
            <DialogDescription>
              Save your current filters for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">View Name *</Label>
              <Input
                id="name"
                placeholder="e.g., High Priority Invoices"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this view"
                value={newViewDescription}
                onChange={(e) => setNewViewDescription(e.target.value)}
              />
            </div>

            <div className="bg-[#F8F9FA] rounded-lg p-3">
              <p className="text-sm font-semibold text-[#212529] mb-2">
                Current Filters
              </p>
              <p className="text-sm text-[#6C757D]">
                {getFilterDescription(currentFilters)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCurrentView}
              className="bg-gradient-to-r from-[#6C63FF] to-[#5A52E0] text-white"
            >
              <Save size={16} className="mr-2" />
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
