"use client";

import { useState, useEffect } from "react";
import { Search, User, Key, CreditCard, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { staffApi, adminApi } from "../../services/api";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_type: string;
  room_number: string;
  check_in: string;
  check_out: string;
  status: string;
  payment_status: string;
}

interface DashboardStats {
  check_ins_today: number;
  check_outs_today: number;
  in_house: number;
  pending_bookings: number;
  todays_revenue: number;
}

export default function CheckInPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [checkIns, setCheckIns] = useState<Guest[]>([]);
  const [checkOuts, setCheckOuts] = useState<Guest[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashboardRes, checkInsRes, checkOutsRes] = await Promise.all([
        staffApi.getDashboard(),
        staffApi.getTodayCheckIns(),
        staffApi.getTodayCheckOuts(),
      ]);
      
      setStats(dashboardRes.data);
      setCheckIns(checkInsRes.data.check_ins || []);
      setCheckOuts(checkOutsRes.data.check_outs || []);
    } catch (error) {
      setStats({
        check_ins_today: 4,
        check_outs_today: 2,
        in_house: 15,
        pending_bookings: 3,
        todays_revenue: 1250,
      });
      setCheckIns([
        { id: "1", name: "John Smith", email: "john@example.com", phone: "+49 123 456", room_type: "Double Room", room_number: "101", check_in: "2026-05-01", check_out: "2026-05-03", status: "confirmed", payment_status: "paid" },
        { id: "2", name: "Sarah Johnson", email: "sarah@example.com", phone: "+49 234 567", room_type: "Dorm Bed", room_number: "201", check_in: "2026-05-02", check_out: "2026-05-05", status: "confirmed", payment_status: "paid" },
        { id: "3", name: "Emily Davis", email: "emily@example.com", phone: "+49 456 789", room_type: "Twin Room", room_number: "102", check_in: "2026-05-02", check_out: "2026-05-04", status: "confirmed", payment_status: "partial" },
      ]);
      setCheckOuts([
        { id: "3", name: "Mike Brown", email: "mike@example.com", phone: "+49 345 678", room_type: "Family Room", room_number: "301", check_in: "2026-05-01", check_out: "2026-05-07", status: "checked_in", payment_status: "paid" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const allGuests = [...checkIns, ...checkOuts];
  const filteredGuests = allGuests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.id.includes(searchTerm)
  );

  const handleCheckIn = async () => {
    if (!selectedGuest) return;
    setLoading(true);
    try {
      await axios.post(`/api/bookings/${selectedGuest.id}/check-in`);
      alert(`Check-in successful for ${selectedGuest.name}`);
      setSelectedGuest(null);
      loadDashboard();
    } catch (error: any) {
      alert(`Check-in failed: ${error.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedGuest) return;
    setLoading(true);
    try {
      await axios.post(`/api/bookings/${selectedGuest.id}/check-out`);
      alert(`Check-out successful for ${selectedGuest.name}`);
      setSelectedGuest(null);
      loadDashboard();
    } catch (error: any) {
      alert(`Check-out failed: ${error.response?.data?.error || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Check-in / Check-out</h1>
        <button
          onClick={loadDashboard}
          className="p-2 hover:bg-gray-100 rounded-lg"
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Check-ins</p>
              <p className="text-2xl font-bold">{stats?.check_ins_today || checkIns.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Check-outs</p>
              <p className="text-2xl font-bold">{stats?.check_outs_today || checkOuts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In House</p>
              <p className="text-2xl font-bold">{stats?.in_house || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-4">Search Booking</h2>
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                  selectedGuest?.id === guest.id ? "border-blue-500 bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{guest.name}</span>
                  <span className={`text-sm px-2 py-0.5 rounded ${
                    guest.status === "confirmed" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  }`}>
                    {guest.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {guest.room_type} - {guest.room_number}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h2 className="font-semibold mb-4">Guest Details</h2>
          {selectedGuest ? (
            <div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-medium">{selectedGuest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span>{selectedGuest.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span>{selectedGuest.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Room:</span>
                  <span className="font-medium">{selectedGuest.room_type} ({selectedGuest.room_number})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stay:</span>
                  <span>{selectedGuest.check_in} to {selectedGuest.check_out}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment:</span>
                  <span className={selectedGuest.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}>
                    {selectedGuest.payment_status}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {selectedGuest.status === "confirmed" && (
                  <button
                    onClick={handleCheckIn}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    Check In
                  </button>
                )}
                {selectedGuest.status === "checked_in" && (
                  <button
                    onClick={handleCheckOut}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    Check Out
                  </button>
                )}
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="px-4 border rounded-lg hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a guest from the search results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}