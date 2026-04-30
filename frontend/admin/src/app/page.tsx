"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Home, Users, DollarSign, Loader2 } from "lucide-react";
import { adminApi } from "./services/api";

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
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Occupancy Rate</span>
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{stats?.occupancy_rate || 78}%</p>
              <p className="text-sm text-green-600">Target: 70%</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Total Guests</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">1,248</p>
              <p className="text-sm text-green-600">+8% this month</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">ADR</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">€{stats?.adr || 85}</p>
              <p className="text-sm text-green-600">Above target</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">RevPAR</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">€{stats?.revpar || 65}</p>
              <p className="text-sm text-green-600">+15% from last month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border">
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
            </div>
            <div className="bg-white p-6 rounded-lg border">
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
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border mt-6">
            <h3 className="font-semibold mb-4">Recent Bookings</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Guest</th>
                  <th className="text-left py-2">Room Type</th>
                  <th className="text-left py-2">Check-in</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">John Smith</td>
                  <td>Double Room</td>
                  <td>May 1, 2026</td>
                  <td><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Confirmed</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Sarah Johnson</td>
                  <td>Dorm Bed</td>
                  <td>May 2, 2026</td>
                  <td><span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">Pending</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Mike Brown</td>
                  <td>Family Room</td>
                  <td>May 3, 2026</td>
                  <td><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">Confirmed</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}