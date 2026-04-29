"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { bookingsApi } from "../../services/api";

interface Booking {
  id: string;
  guest: { first_name: string; last_name: string };
  room_type: { name: string };
  check_in_date: string;
  check_out_date: string;
  status: string;
  payment_status: string;
  total_price: number;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  checked_in: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-700",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingsApi.getMyBookings();
      setBookings(response.data.bookings || []);
    } catch (err: any) {
      setError("Could not load bookings from server. Showing demo data.");
      setBookings([
        { id: "1", guest: { first_name: "John", last_name: "Smith" }, room_type: { name: "Double Room" }, check_in_date: "2026-05-01", check_out_date: "2026-05-03", status: "confirmed", payment_status: "paid", total_price: 130 },
        { id: "2", guest: { first_name: "Sarah", last_name: "Johnson" }, room_type: { name: "Dorm Bed" }, check_in_date: "2026-05-02", check_out_date: "2026-05-05", status: "pending", payment_status: "pending", total_price: 75 },
        { id: "3", guest: { first_name: "Mike", last_name: "Brown" }, room_type: { name: "Family Room" }, check_in_date: "2026-05-03", check_out_date: "2026-05-07", status: "confirmed", payment_status: "paid", total_price: 480 },
        { id: "4", guest: { first_name: "Emily", last_name: "Davis" }, room_type: { name: "Twin Room" }, check_in_date: "2026-05-04", check_out_date: "2026-05-06", status: "checked_in", payment_status: "paid", total_price: 130 },
        { id: "5", guest: { first_name: "Chris", last_name: "Wilson" }, room_type: { name: "Single Room" }, check_in_date: "2026-05-05", check_out_date: "2026-05-08", status: "cancelled", payment_status: "refunded", total_price: 135 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    setLoading(true);
    try {
      await bookingsApi.cancel(id);
      await fetchBookings();
    } catch (err) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const guestName = `${booking.guest?.first_name || ''} ${booking.guest?.last_name || ''}`.toLowerCase();
    const matchesSearch = guestName.includes(searchTerm.toLowerCase()) || booking.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && bookings.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
          {error}
        </div>
      )}
      
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
                <td className="py-3 px-4">
                  {booking.guest?.first_name} {booking.guest?.last_name}
                </td>
                <td className="py-3 px-4">{booking.room_type?.name}</td>
                <td className="py-3 px-4">{booking.check_in_date}</td>
                <td className="py-3 px-4">{booking.check_out_date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-sm ${statusColors[booking.status] || ''}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 px-4">{booking.payment_status}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
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
        <span className="px-4">Page 1 of 1</span>
        <button className="p-2 border rounded hover:bg-gray-50">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}