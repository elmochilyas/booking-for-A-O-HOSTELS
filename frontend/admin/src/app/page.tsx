"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, Users, DollarSign, Home, Search, Menu, X, Loader2 } from "lucide-react";
import { adminApi } from "../services/api";
import { AdminLayout, PageHeader, Card, StatsCard, Badge } from "./components/AdminComponents";

const bookingsData = [
  { date: "Mon", bookings: 12 },
  { date: "Tue", bookings: 19 },
  { date: "Wed", bookings: 15 },
  { date: "Thu", bookings: 22 },
  { date: "Fri", bookings: 28 },
  { date: "Sat", bookings: 35 },
  { date: "Sun", bookings: 18 },
];

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAnalytics();
      setStats(response.data.metrics);
    } catch (error) {
      setStats({
        occupancy_rate: 78,
        total_revenue: 61000,
        adr: 85,
        revpar: 65,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening today." />
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Occupancy Rate" value={`${stats?.occupancy_rate || 78}%`} change="+5% from last month" icon={<Home className="w-5 h-5" />} />
            <StatsCard title="Total Guests" value="1,248" change="+8% this month" icon={<Users className="w-5 h-5" />} />
            <StatsCard title="ADR" value={`€${stats?.adr || 85}`} change="Above target" icon={<DollarSign className="w-5 h-5" />} />
            <StatsCard title="RevPAR" value={`€${stats?.revpar || 65}`} change="+15% from last month" icon={<DollarSign className="w-5 h-5" />} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Weekly Bookings</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={bookingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#2563EB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-5">
              <h3 className="font-semibold mb-4">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Recent Bookings Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Recent Bookings</h3>
              <a href="/bookings" className="text-sm text-blue-600 hover:underline">View all</a>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">John Smith</td>
                  <td className="px-4 py-3">Double Room</td>
                  <td className="px-4 py-3">May 1, 2026</td>
                  <td className="px-4 py-3"><Badge variant="success">Confirmed</Badge></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Sarah Johnson</td>
                  <td className="px-4 py-3">Dorm Bed</td>
                  <td className="px-4 py-3">May 2, 2026</td>
                  <td className="px-4 py-3"><Badge variant="warning">Pending</Badge></td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Mike Brown</td>
                  <td className="px-4 py-3">Family Room</td>
                  <td className="px-4 py-3">May 3, 2026</td>
                  <td className="px-4 py-3"><Badge variant="success">Confirmed</Badge></td>
                </tr>
              </tbody>
            </table>
          </Card>
        </>
      )}
    </AdminLayout>
  );
}