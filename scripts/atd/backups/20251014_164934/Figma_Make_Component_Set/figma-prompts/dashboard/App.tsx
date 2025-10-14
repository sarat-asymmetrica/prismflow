import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  FileText,
  FileEdit,
  Users,
  Target,
  DollarSign,
  Truck,
  RefreshCw,
  Download,
  Settings,
  Calendar,
  CalendarRange,
  Activity,
  Keyboard,
} from 'lucide-react';
import { useMetrics, Period } from './hooks/useMetrics';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { MetricCard } from './components/MetricCard';
import { DrillDownModal } from './components/DrillDownModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { formatRelativeTime, formatCurrency, formatNumber } from './utils/formatters';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

type UserRole = 'SALES' | 'FINANCE' | 'ADMIN' | 'SUPERADMIN';

interface DrillDownState {
  open: boolean;
  metric: {
    name: string;
    icon: React.ReactNode;
    iconColor: string;
    currentValue: number | string;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    isCurrency?: boolean;
    isPercentage?: boolean;
  } | null;
  detailedData?: any;
}

export default function App() {
  const {
    metrics,
    charts,
    period,
    loading,
    realtimeConnected,
    lastUpdated,
    changePeriod,
    refreshMetrics,
  } = useMetrics('month');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('ADMIN');
  const [drillDownState, setDrillDownState] = useState<DrillDownState>({
    open: false,
    metric: null,
  });
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const timeSelectorRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'r',
      callback: () => {
        handleRefresh();
        toast.info('Refreshing dashboard...', { duration: 2000 });
      },
      description: 'Refresh dashboard',
    },
    {
      key: 'e',
      callback: () => {
        setExportModalOpen(true);
      },
      description: 'Open export modal',
    },
    {
      key: 't',
      callback: () => {
        const periods: Period[] = ['today', 'week', 'month', 'quarter'];
        const currentIndex = periods.indexOf(period);
        const nextPeriod = periods[(currentIndex + 1) % periods.length];
        changePeriod(nextPeriod);
        toast.info(`Switched to ${nextPeriod}`, { duration: 2000 });
      },
      description: 'Toggle time period',
    },
    {
      key: '?',
      callback: () => {
        setShowShortcuts(!showShortcuts);
      },
      description: 'Show/hide keyboard shortcuts',
    },
  ]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
    if (timeSelectorRef.current) {
      gsap.from(timeSelectorRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.2,
      });
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const iconElement = document.querySelector('.refresh-icon');
    if (iconElement) {
      gsap.to(iconElement, {
        rotation: 360,
        duration: 0.8,
        ease: 'linear',
      });
    }
    await refreshMetrics();
    setIsRefreshing(false);
  };

  const openDrillDown = (
    name: string,
    icon: React.ReactNode,
    iconColor: string,
    currentValue: number | string,
    trend: 'up' | 'down' | 'stable',
    trendValue: number,
    isCurrency?: boolean,
    isPercentage?: boolean,
    detailedData?: any
  ) => {
    setDrillDownState({
      open: true,
      metric: {
        name,
        icon,
        iconColor,
        currentValue,
        trend,
        trendValue,
        isCurrency,
        isPercentage,
      },
      detailedData,
    });
  };

  const closeDrillDown = () => {
    setDrillDownState({ open: false, metric: null });
  };

  // RBAC: Filter metrics based on role
  const getVisibleMetrics = () => {
    switch (userRole) {
      case 'SALES':
        return ['orders', 'quotes', 'customers', 'conversionRate'];
      case 'FINANCE':
        return ['revenue', 'orders', 'avgOrderValue', 'deliveries'];
      case 'ADMIN':
      case 'SUPERADMIN':
      default:
        return ['revenue', 'orders', 'rfqs', 'quotes', 'customers', 'conversionRate', 'avgOrderValue', 'deliveries'];
    }
  };

  const visibleMetrics = getVisibleMetrics();

  const periodButtons: { value: Period; label: string; icon: typeof Calendar }[] = [
    { value: 'today', label: 'Today', icon: Calendar },
    { value: 'week', label: 'This Week', icon: Calendar },
    { value: 'month', label: 'This Month', icon: Calendar },
    { value: 'quarter', label: 'This Quarter', icon: Calendar },
  ];

  if (loading && !metrics) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto space-y-6">
          {/* Skeleton loading */}
          <div className="h-20 bg-white rounded-lg animate-pulse" />
          <div className="h-14 bg-white rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-48 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics || !charts) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <Card className="p-16 text-center max-w-md">
          <BarChart3 size={64} className="mx-auto mb-6 text-[#E9ECEF]" />
          <h2 className="mb-2">No metrics data available</h2>
          <p className="text-sm text-[#6C757D] mb-6">
            Metrics will appear here once you start tracking business activities
          </p>
          <Button onClick={handleRefresh}>Refresh Dashboard</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div
          ref={headerRef}
          className="metrics-header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#5A52E0]">
              <BarChart3 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-[#212529]">Business Metrics</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-[#6C757D]">
                  Last updated: {formatRelativeTime(lastUpdated)}
                </p>
                {realtimeConnected && (
                  <Badge
                    variant="outline"
                    className="realtime-indicator bg-[rgba(6,214,160,0.1)] border-[#06D6A0] text-[#06D6A0] flex items-center gap-1"
                  >
                    <Activity size={12} className="animate-pulse" />
                    Live
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Selector (for demo) */}
            <Select value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALES">Sales</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPERADMIN">Superadmin</SelectItem>
              </SelectContent>
            </Select>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw size={16} className="refresh-icon mr-2" />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Press <kbd className="px-1 py-0.5 bg-[#F8F9FA] rounded border">R</kbd> to refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setExportModalOpen(true)}>
                    <Download size={16} className="mr-2" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Press <kbd className="px-1 py-0.5 bg-[#F8F9FA] rounded border">E</kbd> to export</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(!showShortcuts)}>
                    <Keyboard size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Press <kbd className="px-1 py-0.5 bg-[#F8F9FA] rounded border">?</kbd> for shortcuts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="ghost" size="sm" onClick={() => setSettingsModalOpen(true)}>
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* Time Period Selector */}
        <div ref={timeSelectorRef} className="time-selector flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          {periodButtons.map((btn) => {
            const PeriodIcon = btn.icon;
            return (
              <Button
                key={btn.value}
                variant={period === btn.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => changePeriod(btn.value)}
                className={
                  period === btn.value
                    ? 'bg-[#6C63FF] hover:bg-[#5A52E0]'
                    : 'hover:bg-[#F8F9FA]'
                }
              >
                <PeriodIcon size={16} className="mr-2" />
                {btn.label}
              </Button>
            );
          })}
          <Button variant="outline" size="sm">
            <CalendarRange size={16} className="mr-2" />
            Custom Range
          </Button>
        </div>

        {/* Role Info Banner */}
        <Card className="mb-6 p-4 bg-gradient-to-r from-[#6C63FF]/10 to-[#5A52E0]/10 border-[#6C63FF]/30">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Badge className="bg-[#6C63FF] hover:bg-[#5A52E0]">
                {userRole}
              </Badge>
              <span className="text-sm text-[#6C757D]">
                Viewing {visibleMetrics.length} of 8 metrics based on your role
              </span>
            </div>
            {userRole !== 'ADMIN' && userRole !== 'SUPERADMIN' && (
              <span className="text-xs text-[#6C757D]">
                💡 Some metrics are hidden. Contact admin for full access.
              </span>
            )}
          </div>
        </Card>

        {/* Keyboard Shortcuts Panel */}
        {showShortcuts && (
          <Card className="mb-6 p-6 bg-gradient-to-br from-[#6C63FF]/5 to-[#5A52E0]/5 border-[#6C63FF]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2">
                <Keyboard size={20} className="text-[#6C63FF]" />
                Keyboard Shortcuts
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(false)}>
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: 'R', description: 'Refresh dashboard' },
                { key: 'E', description: 'Export data' },
                { key: 'T', description: 'Toggle time period' },
                { key: '?', description: 'Show/hide shortcuts' },
              ].map((shortcut) => (
                <div key={shortcut.key} className="flex items-center gap-3 text-sm">
                  <kbd className="px-2 py-1 bg-white rounded border border-[#E9ECEF] min-w-[2rem] text-center">
                    {shortcut.key}
                  </kbd>
                  <span className="text-[#6C757D]">{shortcut.description}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {visibleMetrics.includes('revenue') && (
            <MetricCard
              icon={TrendingUp}
              iconColor="#06D6A0"
              iconBackground="rgba(6, 214, 160, 0.1)"
              label="Total Revenue"
              value={metrics.revenue.value}
              isCurrency
              trend={metrics.revenue.trend}
              trendValue={metrics.revenue.change}
              trendText="vs last period"
              sparklineData={metrics.revenue.history}
              sparklineColor="#06D6A0"
              borderColor="#06D6A0"
              delay={0.3}
              onClick={() =>
                openDrillDown(
                  'Total Revenue',
                  <TrendingUp size={32} className="text-white" />,
                  '#06D6A0',
                  formatCurrency(metrics.revenue.value),
                  metrics.revenue.trend,
                  metrics.revenue.change,
                  true,
                  false,
                  {
                    historicalData: metrics.revenue.history,
                    insights: [
                      'Revenue is trending upward with consistent growth over the past 30 days',
                      'Average daily revenue has increased by 12.5% compared to last period',
                      'Peak revenue days align with mid-week promotional activities',
                    ],
                    topContributors: [
                      { name: 'Enterprise Client A', value: 45000, change: 23.5 },
                      { name: 'Mid-Market Client B', value: 32000, change: 15.2 },
                      { name: 'SMB Client C', value: 18000, change: -5.3 },
                    ],
                  }
                )
              }
            />
          )}

          {visibleMetrics.includes('orders') && (
            <MetricCard
              icon={ShoppingCart}
              iconColor="#3B82F6"
              iconBackground="rgba(59, 130, 246, 0.1)"
              label="Active Orders"
              value={metrics.orders.activeCount}
              trend={metrics.orders.trend}
              trendValue={metrics.orders.change}
              trendText="vs last period"
              secondaryMetric={{
                label: 'In progress',
                value: metrics.orders.inProgressCount,
              }}
              sparklineData={metrics.orders.history.map((h) => ({
                date: h.date,
                value: h.count,
              }))}
              sparklineColor="#3B82F6"
              borderColor="#3B82F6"
              delay={0.4}
              onClick={() =>
                openDrillDown(
                  'Active Orders',
                  <ShoppingCart size={32} className="text-white" />,
                  '#3B82F6',
                  formatNumber(metrics.orders.activeCount),
                  metrics.orders.trend,
                  metrics.orders.change,
                  false,
                  false,
                  {
                    historicalData: metrics.orders.history.map((h) => ({
                      date: h.date,
                      value: h.count,
                    })),
                    breakdown: [
                      { label: 'Pending', value: 23, percentage: 18.1 },
                      { label: 'In Progress', value: 89, percentage: 70.1 },
                      { label: 'Shipped', value: 8, percentage: 6.3 },
                      { label: 'Delivered', value: 5, percentage: 3.9 },
                      { label: 'Cancelled', value: 2, percentage: 1.6 },
                    ],
                    insights: [
                      'Order volume has increased by 8.3% showing strong demand',
                      'In-progress orders represent 70% of active orders',
                      'Average order processing time has improved by 15%',
                    ],
                  }
                )
              }
            />
          )}

          {visibleMetrics.includes('rfqs') && (
            <MetricCard
              icon={FileText}
              iconColor="#FF9800"
              iconBackground="rgba(255, 152, 0, 0.1)"
              label="Pending RFQs"
              value={metrics.rfqs.pendingCount}
              trend={metrics.rfqs.trend}
              trendValue={metrics.rfqs.change}
              trendText="vs last period"
              secondaryMetric={{
                label: 'New today',
                value: metrics.rfqs.newToday,
                color: '#FF9800',
              }}
              urgencyBadge={
                metrics.rfqs.urgentCount > 0
                  ? {
                      text: `${metrics.rfqs.urgentCount} urgent`,
                      pulse: true,
                    }
                  : undefined
              }
              borderColor="#FF9800"
              delay={0.5}
            />
          )}

          {visibleMetrics.includes('quotes') && (
            <MetricCard
              icon={FileEdit}
              iconColor="#8B5CF6"
              iconBackground="rgba(139, 92, 246, 0.1)"
              label="Open Quotes"
              value={metrics.quotes.openCount}
              trend={metrics.quotes.trend}
              trendValue={metrics.quotes.change}
              trendText="vs last period"
              secondaryMetric={{
                label: 'Sent today',
                value: metrics.quotes.sentToday,
              }}
              borderColor="#8B5CF6"
              delay={0.6}
            />
          )}

          {visibleMetrics.includes('customers') && (
            <MetricCard
              icon={Users}
              iconColor="#FFD166"
              iconBackground="rgba(255, 209, 102, 0.1)"
              label="Active Customers"
              value={metrics.customers.activeCount}
              trend={metrics.customers.trend}
              trendValue={metrics.customers.change}
              trendText={`${metrics.customers.newCount} new this period`}
              secondaryMetric={{
                label: 'Total customers',
                value: metrics.customers.totalCount,
                color: '#6C757D',
              }}
              borderColor="#FFD166"
              delay={0.7}
            />
          )}

          {visibleMetrics.includes('conversionRate') && (
            <MetricCard
              icon={Target}
              iconColor="#06D6A0"
              iconBackground="rgba(6, 214, 160, 0.1)"
              label="Conversion Rate"
              value={metrics.conversionRate.value}
              isPercentage
              trend={metrics.conversionRate.trend}
              trendValue={metrics.conversionRate.change}
              trendText="vs last period"
              secondaryMetric={{
                label: 'Target',
                value: `${metrics.conversionRate.target}%`,
              }}
              borderColor="#06D6A0"
              delay={0.8}
            />
          )}

          {visibleMetrics.includes('avgOrderValue') && (
            <MetricCard
              icon={DollarSign}
              iconColor="#3B82F6"
              iconBackground="rgba(59, 130, 246, 0.1)"
              label="Avg Order Value"
              value={metrics.avgOrderValue.value}
              isCurrency
              trend={metrics.avgOrderValue.trend}
              trendValue={metrics.avgOrderValue.change}
              trendText="vs last period"
              sparklineData={metrics.avgOrderValue.history}
              sparklineColor="#3B82F6"
              borderColor="#3B82F6"
              delay={0.9}
            />
          )}

          {visibleMetrics.includes('deliveries') && (
            <MetricCard
              icon={Truck}
              iconColor="#FF6B6B"
              iconBackground="rgba(255, 107, 107, 0.1)"
              label="Deliveries Due Today"
              value={metrics.deliveries.dueToday}
              trend={metrics.deliveries.trend}
              trendValue={metrics.deliveries.change}
              secondaryMetric={{
                label: 'Due this week',
                value: metrics.deliveries.dueWeek,
                color: '#FF9800',
              }}
              urgencyBadge={
                metrics.deliveries.delayed > 0
                  ? {
                      text: `${metrics.deliveries.delayed} delayed`,
                      pulse: true,
                    }
                  : undefined
              }
              borderColor="#FF6B6B"
              delay={1.0}
            />
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue Trend */}
          <Card className="chart-card p-6">
            <h3 className="text-[#212529] mb-1">Revenue Trend</h3>
            <p className="text-sm text-[#6C757D] mb-6">Last 30 days</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts.revenueTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06D6A0" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#06D6A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                  stroke="#6C757D"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  stroke="#6C757D"
                  style={{ fontSize: '12px' }}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      const value = payload[0].value as number;
                      return (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E9ECEF',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                        >
                          <p className="text-sm" style={{ color: '#6C757D', margin: 0, marginBottom: '4px' }}>
                            {format(new Date(label || ''), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-sm" style={{ color: '#212529', margin: 0 }}>
                            <strong>Revenue: ${value.toFixed(0)}</strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06D6A0"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                  dot={{ fill: '#06D6A0', r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Pipeline Funnel */}
          <Card className="chart-card p-6">
            <h3 className="text-[#212529] mb-1">Sales Pipeline</h3>
            <p className="text-sm text-[#6C757D] mb-6">Conversion funnel</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={charts.pipelineFunnel}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                <XAxis type="number" stroke="#6C757D" style={{ fontSize: '12px' }} />
                <YAxis
                  dataKey="stage"
                  type="category"
                  stroke="#6C757D"
                  style={{ fontSize: '12px' }}
                  width={120}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E9ECEF',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                        >
                          <p className="text-sm" style={{ color: '#212529', margin: 0, marginBottom: '4px' }}>
                            <strong>{data.stage}</strong>
                          </p>
                          <p className="text-sm" style={{ color: '#6C757D', margin: 0 }}>
                            {data.value} ({data.conversionRate.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {charts.pipelineFunnel.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#FF9800', '#8B5CF6', '#3B82F6', '#06D6A0'][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Status Breakdown */}
          <Card className="chart-card p-6">
            <h3 className="text-[#212529] mb-1">Orders by Status</h3>
            <p className="text-sm text-[#6C757D] mb-6">Current distribution</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={charts.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={false}
                  isAnimationActive={true}
                >
                  {charts.statusBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ['#FFD166', '#3B82F6', '#06D6A0', '#8B5CF6', '#FF6B6B'][index]
                      }
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload;
                      return (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E9ECEF',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                        >
                          <p className="text-sm" style={{ color: '#212529', margin: 0 }}>
                            <strong>{data.label}</strong>
                          </p>
                          <p className="text-sm" style={{ color: '#6C757D', margin: 0 }}>
                            {data.value} ({data.percentage.toFixed(1)}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  formatter={(value, entry: any) => (
                    <span className="text-sm text-[#212529]">
                      {entry.payload.label} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Metrics Comparison */}
          <Card className="chart-card p-6">
            <h3 className="text-[#212529] mb-1">Key Metrics Comparison</h3>
            <p className="text-sm text-[#6C757D] mb-6">Last 7 days</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={charts.metricsComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'EEE')}
                  stroke="#6C757D"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#6C757D" style={{ fontSize: '12px' }} />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      return (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E9ECEF',
                            borderRadius: '8px',
                            padding: '8px 12px',
                          }}
                        >
                          <p className="text-sm" style={{ color: '#6C757D', margin: 0, marginBottom: '4px' }}>
                            {format(new Date(label || ''), 'MMM dd')}
                          </p>
                          {payload.map((entry: any, index: number) => (
                            <p key={index} className="text-sm" style={{ color: entry.color, margin: 0 }}>
                              <strong>{entry.name}: {entry.value}</strong>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 3 }}
                  name="Orders"
                />
                <Line
                  type="monotone"
                  dataKey="quotes"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', r: 3 }}
                  name="Quotes"
                />
                <Line
                  type="monotone"
                  dataKey="rfqs"
                  stroke="#FF9800"
                  strokeWidth={2}
                  dot={{ fill: '#FF9800', r: 3 }}
                  name="RFQs"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Drill-Down Modal */}
        {drillDownState.metric && (
          <DrillDownModal
            open={drillDownState.open}
            onClose={closeDrillDown}
            metric={drillDownState.metric}
            detailedData={drillDownState.detailedData}
          />
        )}

        {/* Export Modal */}
        <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />

        {/* Settings Modal */}
        <SettingsModal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} />

        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </div>
  );
}
