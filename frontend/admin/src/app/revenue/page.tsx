"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Loader2 } from "lucide-react";

const monthlyRevenue = [
  { month: "Jan", revenue: 45000, target: 40000 },
  { month: "Feb", revenue: 52000, target: 42000 },
  { month: "Mar", revenue: 48000, target: 45000 },
  { month: "Apr", revenue: 61000, target: 48000 },
  { month: "May", revenue: 55000, target: 50000 },
  { month: "Jun", revenue: 67000, target: 55000 },
];

const weeklyRevenue = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4700 },
  { day: "Fri", revenue: 6300 },
  { day: "Sat", revenue: 7200 },
  { day: "Sun", revenue: 5800 },
];

const revenueByRoomType = [
  { name: "Double Room", value: 35000 },
  { name: "Dorm Bed", value: 18000 },
  { name: "Family Room", value: 22000 },
  { name: "Twin Room", value: 15000 },
  { name: "Single Room", value: 8000 },
];

const COLORS = ["#2563EB", "#7C3AED", "#059669", "#D97706", "#DC2626"];

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalTarget = monthlyRevenue.reduce((sum, m) => sum + m.target, 0);
  const avgRevenue = totalRevenue / monthlyRevenue.length;
  const percentChange = ((totalRevenue - totalTarget) / totalTarget) * 100;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="p-6">
      <h2 className="text-2xl font-bold mb-6">Revenue Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600">+12% from target</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Avg Monthly</span>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">€{avgRevenue.toLocaleString()}</p>
          <p className="text-sm text-green-600">Above target</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">YoY Growth</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold">+18.5%</p>
          <p className="text-sm text-green-600">vs last year</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500">Target Achievement</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">{percentChange.toFixed(1)}%</p>
          <p className="text-sm text-green-600">Above target</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Monthly Revenue vs Target</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#2563EB" name="Revenue" />
              <Bar dataKey="target" fill="#94A3B8" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Revenue by Room Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByRoomType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {revenueByRoomType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `€${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Top Performing Rooms</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Room Type</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {revenueByRoomType.map((room, index) => (
                <tr key={room.name} className="border-b">
                  <td className="py-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    {room.name}
                  </td>
                  <td className="text-right py-2">€{room.value.toLocaleString()}</td>
                  <td className="text-right py-2">{((room.value / totalRevenue) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}