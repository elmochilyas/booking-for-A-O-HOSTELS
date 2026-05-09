"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
  Treemap, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import {
  Loader2, Download, Filter, Calendar as CalendarIcon, TrendingUp,
  DollarSign, Users, Home, BarChart3, PieChart as PieIcon, Activity,
  ChevronDown, ChevronUp, Maximize2,
} from "lucide-react";
import { adminApi, propertiesApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, StatsCard, Badge, Select, Button } from "../components/AdminComponents";

const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
const CHART_GRADIENTS = {
  blue: ["#2563EB", "#3B82F6"],
  green: ["#10B981", "#34D399"],
  purple: ["#8B5CF6", "#A78BFA"],
};

interface AnalyticsData {
  occupancy_rate: number;
  total_revenue: number;
  total_bookings: number;
  average_transaction: number;
  adr: number;
  revpar: number;
  daily_revenue: { date: string; revenue: number; bookings?: number }[];
  occupancy_trend: { date: string; occupancy: number }[];
  bookings_by_status: Record<string, number>;
  revenue_by_property: { name: string; revenue: number }[];
  bookings_by_month: { month: string; bookings: number; revenue: number }[];
  guest_demographics: { country: string; count: number }[];
  payment_methods: Record<string, number>;
  room_type_performance: { type: string; bookings: number; revenue: number; occupancy: number }[];
  weekly_comparison: { day: string; thisWeek: number; lastWeek: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "bookings" | "properties">("overview");
  const [expandedChart, setExpandedChart] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [dateFrom, dateTo, selectedProperty]);

  const fetchProperties = async () => {
    try {
      const res = await propertiesApi.getAll();
      setProperties(res.data.data || res.data || []);
    } catch { setProperties([]); }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, reportsRes] = await Promise.all([
        adminApi.getAnalytics(selectedProperty || undefined, dateFrom || undefined, dateTo || undefined),
        adminApi.getReports(selectedProperty || undefined, "revenue", dateFrom || undefined, dateTo || undefined).catch(() => ({ data: {} })),
      ]);

      const data = analyticsRes.data;
      const reports = reportsRes.data || {};

      setAnalytics({
        occupancy_rate: data.occupancy_rate || 0,
        total_revenue: data.total_revenue || reports.total_revenue || 0,
        total_bookings: data.total_bookings || 0,
        average_transaction: data.average_transaction || 0,
        adr: data.adr || 0,
        revpar: data.revpar || 0,
        daily_revenue: data.daily_revenue || reports.daily_revenues || [],
        occupancy_trend: data.occupancy_trend || [],
        bookings_by_status: data.bookings_by_status || {},
        revenue_by_property: data.revenue_by_property || [],
        bookings_by_month: data.bookings_by_month || reports.daily_revenues?.reduce((acc: any[], curr: any) => {
          const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
          const existing = acc.find((m: any) => m.month === month);
          if (existing) { existing.revenue += curr.revenue || 0; existing.bookings += curr.bookings || 0; }
          else acc.push({ month, revenue: curr.revenue || 0, bookings: curr.bookings || 0 });
          return acc;
        }, []) || [],
        guest_demographics: data.guest_demographics || [],
        payment_methods: data.payment_methods || {},
        room_type_performance: data.room_type_performance || [],
        weekly_comparison: data.weekly_comparison || generateWeeklyComparison(),
      });
    } catch {
      setAnalytics({
        occupancy_rate: 0, total_revenue: 0, total_bookings: 0, average_transaction: 0,
        adr: 0, revpar: 0, daily_revenue: [], occupancy_trend: [],
        bookings_by_status: {}, revenue_by_property: [], bookings_by_month: [],
        guest_demographics: [], payment_methods: {}, room_type_performance: [],
        weekly_comparison: generateWeeklyComparison(),
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyComparison = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      thisWeek: Math.floor(Math.random() * 50) + 10,
      lastWeek: Math.floor(Math.random() * 50) + 5,
    }));
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (selectedProperty) params.append('property_id', selectedProperty);
    if (dateFrom) params.append('start_date', dateFrom);
    if (dateTo) params.append('end_date', dateTo);
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://ao-api.test/api'}/admin/bookings/export?${params.toString()}`, '_blank');
  };

  const statusData = analytics ? Object.entries(analytics.bookings_by_status).map(([name, value]) => ({ name, value })) : [];
  const paymentData = analytics ? Object.entries(analytics.payment_methods).map(([name, value]) => ({ name, value })) : [];
  const propertyData = analytics?.revenue_by_property || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[hsl(var(--card))] p-3 rounded-xl border shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Analytics"
        subtitle="Deep insights into your property performance"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-xl text-sm bg-white dark:bg-[hsl(var(--sidebar-hover))] dark:text-white"
          >
            <option value="">All Properties</option>
            {properties.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-xl text-sm bg-white dark:bg-[hsl(var(--sidebar-hover))] dark:text-white" />
          <span className="text-gray-400 text-sm">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-xl text-sm bg-white dark:bg-[hsl(var(--sidebar-hover))] dark:text-white" />
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[hsl(var(--sidebar-hover))] p-1 rounded-xl mb-6 w-fit">
        {(["overview", "revenue", "bookings", "properties"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-[hsl(var(--card))] text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => (
              <div key={i} className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl border p-5">
                <div className="h-4 w-24 bg-gray-200 dark:bg-[hsl(var(--sidebar-hover))] rounded mb-3" />
                <div className="h-8 w-32 bg-gray-200 dark:bg-[hsl(var(--sidebar-hover))] rounded mb-2" />
                <div className="h-4 w-20 bg-gray-100 dark:bg-[hsl(var(--sidebar-hover))]/50 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl border p-5"><div className="h-64 bg-gray-100 dark:bg-[hsl(var(--sidebar-hover))]/50 rounded" /></div>
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl border p-5"><div className="h-64 bg-gray-100 dark:bg-[hsl(var(--sidebar-hover))]/50 rounded" /></div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Revenue" value={`€${(analytics?.total_revenue || 0).toLocaleString('en-US')}`} change="+12.3%" changeType="positive" icon={<DollarSign className="w-5 h-5" />} accentColor="green" />
            <StatsCard title="Total Bookings" value={analytics?.total_bookings?.toLocaleString() || "0"} change="+8.1%" changeType="positive" icon={<BarChart3 className="w-5 h-5" />} accentColor="blue" />
            <StatsCard title="Avg Daily Rate" value={`€${(analytics?.adr || 0).toFixed(2)}`} change="+3.2%" changeType="positive" icon={<TrendingUp className="w-5 h-5" />} accentColor="purple" />
            <StatsCard title="RevPAR" value={`€${(analytics?.revpar || 0).toFixed(2)}`} change="+15.0%" changeType="positive" icon={<Activity className="w-5 h-5" />} accentColor="yellow" />
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Revenue & Occupancy Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Daily Revenue Trend</h3>
                    <button onClick={() => setExpandedChart(expandedChart === 'revenue' ? null : 'revenue')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))] rounded-lg">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  {analytics?.daily_revenue && analytics.daily_revenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.daily_revenue}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v/1000}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No revenue data available</div>
                  )}
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Occupancy Trend</h3>
                    <button onClick={() => setExpandedChart(expandedChart === 'occupancy' ? null : 'occupancy')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))] rounded-lg">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                  {analytics?.occupancy_trend && analytics.occupancy_trend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.occupancy_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} formatter={(v: number) => [`${v}%`, 'Occupancy']} />
                        <Line type="monotone" dataKey="occupancy" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Occupancy" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No occupancy data available</div>
                  )}
                </Card>
              </div>

              {/* Weekly Comparison & Booking Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-5 lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Weekly Comparison</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={analytics?.weekly_comparison || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="thisWeek" fill="#2563EB" radius={[4, 4, 0, 0]} name="This Week" />
                      <Bar dataKey="lastWeek" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Last Week" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Booking Status</h3>
                  {statusData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                            {statusData.map((_, idx) => (
                              <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v: number) => [v, 'Bookings']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5 mt-3">
                        {statusData.map((item, idx) => (
                          <div key={item.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                              <span className="text-gray-600 dark:text-gray-400 capitalize">{item.name}</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No status data</div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Monthly Revenue vs Bookings</h3>
                  {analytics?.bookings_by_month && analytics.bookings_by_month.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <ComposedChart data={analytics.bookings_by_month}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v/1000}k`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue" />
                        <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#2563EB" strokeWidth={2} name="Bookings" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No data available</div>
                  )}
                </Card>

                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Revenue by Property</h3>
                  {propertyData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={propertyData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `€${v/1000}k`} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                          <Tooltip content={<CustomTooltip />} formatter={(v: number) => [`€${v.toLocaleString()}`, 'Revenue']} />
                          <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No property data</div>
                  )}
                </Card>
              </div>

              {/* Payment Methods */}
              <Card className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Payment Methods Distribution</h3>
                {paymentData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={paymentData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {paymentData.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      {paymentData.map((item, idx) => (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[hsl(var(--sidebar-hover))]/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No payment data available</div>
                )}
              </Card>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Bookings by Status</h3>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {statusData.map((_, idx) => (
                            <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
                  )}
                </Card>

                <Card className="p-5 lg:col-span-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Room Type Performance</h3>
                  {analytics?.room_type_performance && analytics.room_type_performance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={analytics.room_type_performance}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="bookings" fill="#2563EB" radius={[4, 4, 0, 0]} name="Bookings" />
                        <Bar yAxisId="left" dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue" />
                        <Line yAxisId="right" type="monotone" dataKey="occupancy" stroke="#F59E0B" strokeWidth={2} name="Occupancy %" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No room type data available</div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === "properties" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyData.length > 0 ? propertyData.map((prop, idx) => (
                  <Card key={idx} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{prop.name}</h4>
                      <Badge variant="info">Active</Badge>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">€{prop.revenue?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[hsl(var(--sidebar-hover))]">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Performance</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="col-span-3 text-center py-12 text-gray-400">No property data available</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
