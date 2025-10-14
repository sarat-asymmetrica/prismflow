import { useEffect, useRef } from 'react';
import { RFQ, UserRole } from '../types/rfq';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '../constants/rfqConstants';
import { formatCurrency, formatDate, formatRelativeTime, getInitials, generateAvatarColor } from '../utils/formatters';
import { Eye, Edit, MoreHorizontal, Clock, RefreshCw, AlertCircle, TrendingUp, Copy } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner@2.0.3';
import gsap from 'gsap';

interface RFQCardProps {
  rfq: RFQ;
  role: UserRole;
  userId: string;
  onClick?: () => void;
}

export function RFQCard({ rfq, role, userId, onClick }: RFQCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const statusConfig = STATUS_CONFIG[rfq.status];
  const isOverdue = new Date(rfq.deadline) < new Date() && !['approved', 'rejected', 'converted'].includes(rfq.status);
  const showPriorityBadge = rfq.priority === 'high' || rfq.priority === 'urgent';
  
  const canEdit = 
    ['ADMIN', 'SUPERADMIN'].includes(role) ||
    (role === 'SALES_MANAGER' && rfq.assignedTo === userId) ||
    (role === 'SALES' && rfq.assignedTo === userId && ['draft', 'pending'].includes(rfq.status));

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }, []);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: -4,
        boxShadow: '0 8px 24px rgba(108, 99, 255, 0.15)',
        borderColor: 'rgba(108, 99, 255, 0.3)',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        y: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        borderColor: '#E9ECEF',
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(rfq.code);
    toast.success('RFQ code copied to clipboard');
  };

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`Action: ${action} for ${rfq.code}`);
  };

  return (
    <div
      ref={cardRef}
      className="rfq-card w-full p-5 md:p-6 bg-white border border-[#E9ECEF] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-all"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Card Header */}
      <div className="flex flex-row justify-between items-start mb-4">
        <div className="flex flex-row gap-3 items-center flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopyCode}
                  className="font-mono px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                  style={{ fontSize: '16px', lineHeight: '24px' }}
                >
                  {rfq.code}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Badge
            style={{ 
              backgroundColor: statusConfig.bgColor, 
              color: '#FFFFFF',
              fontSize: '11px',
              lineHeight: '14px',
              fontWeight: 600,
            }}
            className="px-2.5 py-1 rounded-xl"
          >
            {statusConfig.label}
          </Badge>

          {showPriorityBadge && (
            <Badge
              style={{ 
                backgroundColor: PRIORITY_CONFIG[rfq.priority].color,
                color: '#FFFFFF',
              }}
              className="px-2 py-1 rounded-md flex items-center gap-1"
            >
              {rfq.priority === 'urgent' ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
            </Badge>
          )}
        </div>

        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => handleAction('View details', e)}
                >
                  <Eye className="w-4 h-4 text-[#6C757D]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>

            {canEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleAction('Edit RFQ', e)}
                  >
                    <Edit className="w-4 h-4 text-[#6C757D]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit RFQ</TooltipContent>
              </Tooltip>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4 text-[#6C757D]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleAction('View details', e)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleAction('Duplicate', e)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {rfq.status === 'approved' && (
                  <DropdownMenuItem onClick={(e) => handleAction('Convert to Quote', e)}>
                    Convert to Quote
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </div>

      {/* Card Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Customer Section */}
        <div className="flex gap-3 items-center">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
            style={{ backgroundColor: generateAvatarColor(rfq.customerName) }}
          >
            <span className="text-white text-sm">{getInitials(rfq.customerName)}</span>
          </div>
          <div>
            <p style={{ fontSize: '15px', lineHeight: '22px' }}>{rfq.customerName}</p>
            <p className="text-[#6C757D]" style={{ fontSize: '14px', lineHeight: '20px' }}>
              {rfq.customerCode}
            </p>
          </div>
        </div>

        {/* Value Section */}
        <div className="flex flex-col gap-1">
          <p className="text-[#6C757D]" style={{ fontSize: '14px', lineHeight: '20px' }}>
            Estimated Value
          </p>
          <p className="text-[#06D6A0]" style={{ fontSize: '16px', lineHeight: '24px' }}>
            {formatCurrency(rfq.estimatedValue, rfq.currency)}
          </p>
        </div>

        {/* Items Section */}
        <div className="flex flex-col gap-1">
          <p className="text-[#6C757D]" style={{ fontSize: '14px', lineHeight: '20px' }}>
            Items
          </p>
          <p style={{ fontSize: '16px', lineHeight: '24px' }}>{rfq.itemsCount} products</p>
        </div>

        {/* Deadline Section */}
        <div className="flex flex-col gap-1">
          <p className="text-[#6C757D]" style={{ fontSize: '14px', lineHeight: '20px' }}>
            Deadline
          </p>
          <p
            className={`flex items-center gap-1 ${isOverdue ? 'text-[#FF6B6B]' : 'text-[#6C757D]'}`}
            style={{ fontSize: '13px', lineHeight: '18px' }}
          >
            {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
            {formatDate(rfq.deadline)}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex flex-row justify-between items-center pt-4 border-t border-[#F8F9FA]">
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-[#6C757D]" style={{ fontSize: '13px', lineHeight: '18px' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>Created {formatRelativeTime(rfq.createdAt)}</span>
          </div>
          {rfq.updatedAt !== rfq.createdAt && (
            <div className="flex items-center gap-1.5 text-[#6C757D]" style={{ fontSize: '13px', lineHeight: '18px' }}>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Updated {formatRelativeTime(rfq.updatedAt)}</span>
            </div>
          )}
        </div>

        {rfq.assignedTo && rfq.assignedUserName && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                    style={{ backgroundColor: generateAvatarColor(rfq.assignedUserName) }}
                  >
                    {getInitials(rfq.assignedUserName)}
                  </div>
                  <span className="text-[#6C757D] hidden sm:inline" style={{ fontSize: '13px', lineHeight: '18px' }}>
                    {rfq.assignedUserName}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Assigned to {rfq.assignedUserName}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
