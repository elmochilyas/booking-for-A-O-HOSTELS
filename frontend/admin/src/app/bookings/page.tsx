"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  id: string;
  guest_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  status: string;
  payment: string;
}

const mockBookings: Booking[] = [
  { id: "1", guest_name: "John Smith", room_type: "Double Room", check_in: "2026-05-01", check_out: "2026-05-03", status: "confirmed", payment: "paid" },
  { id: "2", guest_name: "Sarah Johnson", room_type: "Dorm Bed", check_in: "2026-05-02", check_out: "2026-05-05", status: "pending", payment: "pending" },
  { id: "3", guest_name: "Mike Brown", room_type: "Family Room", check_in: "2026-05-03", check_out: "2026-05-07", status: "confirmed", payment: "paid" },
  { id: "4", guest_name: "Emily Davis", room_type: "Twin Room", check_in: "2026-05-04", check_out: "2026-05-06", status: "checked_in", payment: "paid" },
  { id: "5", guest_name: "Chris Wilson", room_type: "Single Room", check_in: "2026-05-05", check_out: "2026-05-08", status: "cancelled", payment: "refunded" },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  checked_in: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-700",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.guest_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCheckIn = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: "checked_in" } : b));
  };

  const handleCheckOut = (id: string) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, status: "completed" } : b));
  };

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold">Guest</th>
              <th className="text-left py-3 px-4 font-semibold">Room Type</th>
              <th className="text-left py-3 px-4 font-semibold">Check-in</th>
              <th className="text-left py-3 px-4 font-semibold">Check-out</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Payment</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{booking.guest_name}</td>
                <td className="py-3 px-4">{booking.room_type}</td>
                <td className="py-3 px-4">{booking.check_in}</td>
                <td className="py-3 px-4">{booking.check_out}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[booking.status]}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 px-4">{booking.payment}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Check In
                      </button>
                    )}
                    {booking.status === "checked_in" && (
                      <button
                        onClick={() => handleCheckOut(booking.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Check Out
                      </button>
                    )}
                    {booking.status !== "cancelled" && booking.status !== "completed" && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 mt-4">
        <button className="p-2 border rounded hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="px-4">Page 1 of 5</span>
        <button className="p-2 border rounded hover:bg-gray-50">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}