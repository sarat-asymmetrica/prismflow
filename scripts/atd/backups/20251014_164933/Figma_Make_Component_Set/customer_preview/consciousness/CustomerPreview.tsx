import { useEffect, useState, useRef } from "react";
import { useCustomersSocket } from "../../lib/hooks/useCustomersSocket";
import { useDebounce } from "../../lib/hooks/useDebounce";
import {
  Users,
  Search,
  X,
  ArrowRight,
  Eye,
  MessageSquare,
  MoreHorizontal,
  ShoppingBag,
  Calendar,
  SearchX,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  generateInitials,
  generateAvatarColor,
  getTypeBadgeStyle,
  getStatusDotColor,
} from "../../lib/utils/customerHelpers";

interface CustomerPreviewProps {
  userId: string;
  role?: "SALES" | "ADMIN" | "SUPERADMIN";
  limit?: number;
  onCustomerClick?: (customerId: string) => void;
}

function SkeletonList({ rows }: { rows: number }) {
  return (
    <div className="w-full max-w-[800px] mx-auto min-h-[600px] bg-white rounded-xl border border-[#E9ECEF] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded" />
          <div>
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <Skeleton className="h-10 w-full mb-6" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 px-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="w-full max-w-[800px] mx-auto min-h-[600px] bg-white rounded-xl border-2 border-[#FF6B6B] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-[#FF6B6B] mb-4" />
        <p className="text-[#212529] mb-2">Unable to load customers</p>
        <p className="text-sm text-[#6C757D] mb-4">{message}</p>
        <div className="flex gap-2">
          <Button variant="outline">Retry</Button>
          <Button variant="link" className="text-[#6C63FF]">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  searchActive,
  onClear,
}: {
  searchActive: boolean;
  onClear: () => void;
}) {
  if (searchActive) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <SearchX className="w-12 h-12 text-[#6C757D] mb-4" />
        <p className="text-[#212529] mb-1">No customers found</p>
        <p className="text-sm text-[#6C757D] mb-4">
          Try adjusting your search or filters
        </p>
        <Button onClick={onClear} variant="outline">
          Clear Search
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Users className="w-12 h-12 text-[#6C757D] mb-4" />
      <p className="text-[#212529] mb-1">No customers yet</p>
      <p className="text-sm text-[#6C757D] mb-4">
        Add your first customer to get started
      </p>
      <Button className="bg-[#6C63FF] hover:bg-[#5850E5]">Add Customer</Button>
    </div>
  );
}

export function CustomerPreview({
  userId,
  role = "SALES",
  limit = 10,
  onCustomerClick,
}: CustomerPreviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { customers, loading, error, stats, search } =
    useCustomersSocket(userId);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (debouncedSearch.length >= 2 || debouncedSearch === "") {
      search(debouncedSearch);
    }
  }, [debouncedSearch, search]);

  // GSAP animations
  useEffect(() => {
    if (!mounted || loading || !customers.length) return;

    const loadGsap = async () => {
      const gsap = (await import("gsap")).default;

      // Add a small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Card load animation
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      // Search bar reveal
      if (searchRef.current) {
        gsap.from(searchRef.current, {
          scaleX: 0,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.2,
        });
      }

      // Customer rows stagger
      if (rowsRef.current) {
        const rows = rowsRef.current.querySelectorAll(".customer-row");
        if (rows.length > 0) {
          gsap.from(rows, {
            x: -30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.4,
          });
        }
      }
    };

    loadGsap();
  }, [customers, loading, mounted]);

  const handleRowClick = (customerId: string) => {
    if (onCustomerClick) {
      onCustomerClick(customerId);
    }
  };

  const handleRowHover = async (
    e: React.MouseEvent<HTMLDivElement>,
    entering: boolean,
  ) => {
    const element = e.currentTarget;
    if (!element) return;

    const gsap = (await import("gsap")).default;

    if (entering) {
      gsap.to(element, {
        backgroundColor: "#F8F9FA",
        scale: 1.01,
        duration: 0.3,
        ease: "power1.inOut",
      });
    } else {
      gsap.to(element, {
        backgroundColor: "#FFFFFF",
        scale: 1.0,
        duration: 0.3,
        ease: "power1.inOut",
      });
    }
  };

  // Render states
  if (error) return <ErrorState message={error} />;
  if (loading) return <SkeletonList rows={limit} />;

  return (
    <div
      ref={cardRef}
      className="w-full max-w-[800px] mx-auto min-h-[600px] bg-white rounded-xl border border-[#E9ECEF] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-[#6C63FF]" />
          <div>
            <h2 className="text-[#212529]">Customer Directory</h2>
            <p className="text-[13px] text-[#6C757D]">
              {stats.total} total customers
            </p>
          </div>
        </div>
        <Button
          variant="link"
          className="text-[#6C63FF] hover:text-[#5850E5] p-0 h-auto"
        >
          View All <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Search Bar */}
      <div ref={searchRef} className="search-bar relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C757D]" />
        <Input
          type="text"
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-10 border-[#E9ECEF] rounded-lg"
          aria-label="Search customers by name or code"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-transparent"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-[#6C757D]" />
          </Button>
        )}
      </div>

      {/* Customer List */}
      <div ref={rowsRef} className="space-y-0">
        {customers.length === 0 ? (
          <EmptyState
            searchActive={searchQuery.length > 0}
            onClear={() => setSearchQuery("")}
          />
        ) : (
          customers.slice(0, limit).map((customer) => {
            const isNew =
              new Date(customer.createdAt) >
              new Date(Date.now() - 24 * 60 * 60 * 1000);

            return (
              <div
                key={customer.id}
                className="customer-row flex items-center gap-4 py-3 px-4 border-b border-[#E9ECEF] cursor-pointer rounded-lg transition-all duration-300"
                onClick={() => handleRowClick(customer.id)}
                onMouseEnter={(e) => handleRowHover(e, true)}
                onMouseLeave={(e) => handleRowHover(e, false)}
                role="button"
                tabIndex={0}
                aria-label={`${customer.name}, ${customer.type}, ${customer.status}, ${customer.orderCount} orders, last order ${formatDistanceToNow(new Date(customer.lastOrderDate))} ago`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(customer.id);
                  }
                }}
              >
                {/* Avatar */}
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={customer.avatarUrl} alt={customer.name} />
                  <AvatarFallback
                    style={{
                      backgroundColor: generateAvatarColor(customer.name),
                    }}
                    className="text-white"
                  >
                    {generateInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Name & Code */}
                <div className="flex-1 min-w-0">
                  <div className="text-[#212529] truncate max-w-[200px]">
                    {customer.name}
                  </div>
                  <div className="text-[14px] text-[#6C757D]">
                    #{customer.code}
                  </div>
                </div>

                {/* Type Badge */}
                <Badge
                  style={{
                    backgroundColor: getTypeBadgeStyle(customer.type).bg,
                    color: getTypeBadgeStyle(customer.type).color,
                    border: "none",
                  }}
                  className="text-[12px] px-2 py-1 hover:scale-105 transition-transform"
                  aria-label={`Customer type: ${customer.type}`}
                >
                  {customer.type}
                </Badge>

                {/* Status Dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: getStatusDotColor(customer.status),
                  }}
                  title={customer.status}
                  aria-label={`Status: ${customer.status}`}
                />

                {/* Order Count */}
                <div className="hidden md:flex items-center gap-1 text-[13px] text-[#6C757D] min-w-[80px]">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{customer.orderCount} orders</span>
                </div>

                {/* Last Order */}
                <div className="hidden lg:flex items-center gap-1 text-[13px] text-[#6C757D] min-w-[100px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {formatDistanceToNow(new Date(customer.lastOrderDate))} ago
                  </span>
                </div>

                {/* Actions */}
                <div
                  className="flex gap-1 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[#F8F9FA] hover:text-[#6C63FF] transition-all hover:scale-110"
                    aria-label={`View details for ${customer.name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {(role === "ADMIN" || role === "SUPERADMIN") && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-[#F8F9FA] hover:text-[#6C63FF] transition-all hover:scale-110"
                        aria-label={`Send message to ${customer.name}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-[#F8F9FA] hover:text-[#6C63FF] transition-all hover:scale-110"
                        aria-label={`More options for ${customer.name}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* New Badge */}
                {isNew && (
                  <Badge
                    className="new-badge absolute top-1 right-1 bg-[#3B82F6] text-white text-[10px] px-1.5 py-0.5"
                    style={{ fontSize: "10px" }}
                  >
                    NEW
                  </Badge>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
