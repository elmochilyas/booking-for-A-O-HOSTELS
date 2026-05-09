"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart,
} from "recharts";
import {
  Calendar, Users, DollarSign, Home, Loader2, TrendingUp, TrendingDown,
  BedDouble, CreditCard, Star, ArrowUpRight, ArrowDownRight, Activity,
  BarChart3, PieChart as PieIcon, MapPin, ChevronRight
} from "lucide-react";
import { adminApi, propertiesApi, staffApi } from "../services/api";
import { AdminLayout, PageHeader, Card, StatsCard, Badge, ProgressBar, StatsCardSkeleton, Skeleton } from "./components/AdminComponents";

const PIE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
const CHART_GRADIENT = ["#2563EB", "#3B82F6"];

interface DashboardData {
  occupancy_rate: number;
  total_revenue: number;
  adr: number;
  revpar: number;
  total_guests: number;
  total_bookings: number;
  check_ins_today: number;
  check_outs_today: number;
  in_house: number;
  pending_bookings: number;
  weekly_bookings: { date: string; bookings: number }[];
  monthly_revenue: { month: string; revenue: number }[];
  bookings_by_status: Record<string, number>;
  revenue_by_property: { name: string; revenue: number }[];
  recent_bookings: any[];
  top_properties: { name: string; bookings: number; revenue: number }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
    fetchDashboard();
  }, [selectedProperty]);

  const fetchProperties = async () => {
    try {
      const res = await adminApi.getProperties();
      const data = res.data.data || res.data;
      setProperties(Array.isArray(data) ? data : []);
    } catch {
      setProperties([]);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const staffData = await staffApi.getDashboard();
      console.log('Staff dashboard response:', staffData.data);

      setData({
        occupancy_rate: staffData.data.occupancy_rate || 0,
        total_revenue: staffData.data.total_revenue || staffData.data.todays_revenue || 0,
        adr: staffData.data.adr || 0,
        revpar: staffData.data.revpar || 0,
        total_guests: staffData.data.total_guests || 0,
        total_bookings: staffData.data.total_bookings || 0,
        check_ins_today: staffData.data.check_ins_today || 0,
        check_outs_today: staffData.data.check_outs_today || 0,
        in_house: staffData.data.in_house || 0,
        pending_bookings: staffData.data.pending_bookings || 0,
        weekly_bookings: staffData.data.weekly_bookings || [],
        monthly_revenue: staffData.data.monthly_revenue || [],
        bookings_by_status: staffData.data.bookings_by_status || {},
        revenue_by_property: staffData.data.revenue_by_property || [],
        recent_bookings: staffData.data.recent_bookings || [],
        top_properties: staffData.data.top_properties || [],
      });
    } catch (err: any) {
      console.error('Dashboard error:', err.response?.data || err.message);
      setError(`Failed to load dashboard: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      setData({
        occupancy_rate: 0, total_revenue: 0, adr: 0, revpar: 0,
        total_guests: 0, total_bookings: 0, check_ins_today: 0,
        check_outs_today: 0, in_house: 0, pending_bookings: 0,
        weekly_bookings: [], monthly_revenue: [], bookings_by_status: {},
        revenue_by_property: [], recent_bookings: [], top_properties: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const statusData = data ? Object.entries(data.bookings_by_status).map(([name, value]) => ({ name, value })) : [];

  return (
    <AdminLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your property performance overview."
      >
        <div className="flex items-center gap-3">
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3.5 py-2.5 border border-gray-200 dark:border-[hsl(var(--sidebar-hover))] rounded-xl text-sm bg-white dark:bg-[hsl(var(--sidebar-hover))] dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Properties</option>
            {Array.isArray(properties) && properties.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={fetchDashboard}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-[hsl(var(--sidebar-hover))] rounded-xl transition-colors"
            title="Refresh"
          >
            <Activity className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </PageHeader>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl border p-5"><Skeleton className="h-64 w-full" /></div>
            <div className="bg-white dark:bg-[hsl(var(--card))] rounded-2xl border p-5"><Skeleton className="h-64 w-full" /></div>
          </div>
        </div>
      ) : (
        <>
          {/* Primary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Occupancy Rate"
              value={`${data?.occupancy_rate?.toFixed(1) || 0}%`}
              change={data && data.occupancy_rate > 0 ? "+2.5% vs last month" : undefined}
              changeType="positive"
              icon={<Home className="w-5 h-5" />}
              accentColor="blue"
            />
            <StatsCard
              title="Total Revenue"
              value={`€${(data?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              change={data && data.total_revenue > 0 ? "+12.3% vs last month" : undefined}
              changeType="positive"
              icon={<DollarSign className="w-5 h-5" />}
              accentColor="green"
            />
            <StatsCard
              title="ADR (Avg Daily Rate)"
              value={`€${(data?.adr || 0).toFixed(2)}`}
              change={data && data.adr > 150 ? "Above target" : "Below target"}
              changeType={data && data.adr > 150 ? "positive" : "negative"}
              icon={<BedDouble className="w-5 h-5" />}
              accentColor="purple"
            />
            <StatsCard
              title="RevPAR"
              value={`€${(data?.revpar || 0).toFixed(2)}`}
              change="+15% from last month"
              changeType="positive"
              icon={<TrendingUp className="w-5 h-5" />}
              accentColor="yellow"
            />
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              { label: "Total Guests", value: data?.total_guests?.toLocaleString() || "0", icon: <Users className="w-4 h-4" />, color: "blue" },
              { label: "Total Bookings", value: data?.total_bookings?.toLocaleString() || "0", icon: <Calendar className="w-4 h-4" />, color: "green" },
              { label: "Check-ins Today", value: data?.check_ins_today || 0, icon: <ArrowDownRight className="w-4 h-4" />, color: "purple" },
              { label: "Check-outs Today", value: data?.check_outs_today || 0, icon: <ArrowUpRight className="w-4 h-4" />, color: "yellow" },
              { label: "In House", value: data?.in_house || 0, icon: <BedDouble className="w-4 h-4" />, color: "blue" },
              { label: "Pending", value: data?.pending_bookings || 0, icon: <Activity className="w-4 h-4" />, color: "red" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white dark:bg-[hsl(var(--card))] rounded-xl border p-3 card-hover">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">Weekly Bookings Trend</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded-full" /> Bookings</span>
                </div>
              </div>
              {data && data.weekly_bookings && data.weekly_bookings.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.weekly_bookings}>
                    <defs>
                      <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number) => [value, 'Bookings']}
                    />
                    <Area type="monotone" dataKey="bookings" stroke="#2563EB" strokeWidth={2} fill="url(#bookingGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No booking data available</div>
              )}
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Revenue</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-600 rounded-full" /> Revenue</span>
                </div>
              </div>
              {data && data.monthly_revenue && data.monthly_revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.monthly_revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      formatter={(value: number) => [`€${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No revenue data available</div>
              )}
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Bookings by Status</h3>
              {statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {statusData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value, 'Bookings']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {statusData.map((item, idx) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No status data</div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Occupancy Overview</h3>
              <div className="space-y-4">
                {[
                  { label: "Occupancy Rate", value: data?.occupancy_rate || 0, color: "blue" },
                  { label: "Check-in Progress", value: ((data?.check_ins_today || 0) / Math.max(1, (data?.total_bookings || 1))) * 100, color: "green" },
                  { label: "Pending Rate", value: ((data?.pending_bookings || 0) / Math.max(1, (data?.total_bookings || 1))) * 100, color: "yellow" },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value.toFixed(1)}%</span>
                    </div>
                    <ProgressBar value={item.value} color={item.color} />
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[hsl(var(--sidebar-hover))]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data?.in_house || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In House</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data?.check_outs_today || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Check-outs</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Top Properties</h3>
              {data && data.top_properties && data.top_properties.length > 0 ? (
                <div className="space-y-3">
                  {data.top_properties.map((prop: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[hsl(var(--sidebar-hover))]/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{prop.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{prop.bookings} bookings</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">€{prop.revenue?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {[1, 2, 3].map((idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[hsl(var(--sidebar-hover))]/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-[hsl(var(--sidebar-hover))] rounded-lg" />
                        <div>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-[hsl(var(--sidebar-hover))] rounded mb-1" />
                          <div className="h-3 w-16 bg-gray-100 dark:bg-[hsl(var(--sidebar-hover))]/50 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-[hsl(var(--sidebar-hover))] rounded" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-[hsl(var(--sidebar-hover))] flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h3>
              <a href="/bookings" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[hsl(var(--sidebar-hover))]/50 border-b border-gray-100 dark:border-[hsl(var(--sidebar-hover))]">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Guest</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Property</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Room Type</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Check-in</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[hsl(var(--sidebar-hover))]">
                  {data && data.recent_bookings && data.recent_bookings.length > 0 ? (
                    data.recent_bookings.slice(0, 6).map((booking: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[hsl(var(--sidebar-hover))]/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                              {(booking.guest_name?.[0] || "G").toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{booking.guest_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{booking.property_name || "N/A"}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{booking.room_type}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{booking.check_in_date}</td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">€{booking.total_price || booking.amount || "0"}</td>
                        <td className="px-5 py-4">
                          <Badge variant={
                            booking.status === 'confirmed' ? 'success' :
                            booking.status === 'pending' ? 'warning' :
                            booking.status === 'cancelled' ? 'danger' : 'info'
                          }>
                            {booking.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}
