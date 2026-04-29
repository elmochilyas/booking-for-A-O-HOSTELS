"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, Users, DollarSign, Home, Search, Menu, X } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform`}>
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-blue-600">A&O Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          <a href="/" className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
            <Home className="w-5 h-5" /> Dashboard
          </a>
          <a href="/bookings" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5" /> Bookings
          </a>
          <a href="/checkin" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Users className="w-5 h-5" /> Check-in/out
          </a>
          <a href="/staff" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Users className="w-5 h-5" /> Staff
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <DollarSign className="w-5 h-5" /> Revenue
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4">
          <button className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Today's Bookings</span>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-green-600">+12% from yesterday</p>
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
                <span className="text-gray-500">Occupancy Rate</span>
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-sm text-green-600">Above target</p>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500">Monthly Revenue</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">€61,000</p>
              <p className="text-sm text-green-6 00">+15% from last month</p>
            </div>
          </div>

          {/* Charts */}
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

          {/* Recent Bookings Table */}
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
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}