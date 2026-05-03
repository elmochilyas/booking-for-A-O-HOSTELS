"use client";

import { useState, useEffect } from "react";
import { Calendar, Search, Loader2, Download, Filter, RefreshCw } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Select, Modal, Badge } from "../components/AdminComponents";

interface Booking {
  id: string;
  guest: string;
  property: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setPagination(p => ({ ...p, current_page: 1 }));
  }, [search, statusFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchBookings();
  }, [pagination.current_page, search, statusFilter, dateFrom, dateTo]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getBookings({ 
        search, 
        status: statusFilter, 
        date_from: dateFrom, 
        date_to: dateTo,
        page: pagination.current_page 
      });
      setBookings(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking || !confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    try {
      await adminApi.cancelBooking(selectedBooking.id);
      setModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await adminApi.exportBookings();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bookings_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export bookings:", error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed": return "success";
      case "pending": return "warning";
      case "cancelled": return "danger";
      case "completed": return "info";
      default: return "default";
    }
  };

  const columns = [
    { key: "guest", label: "Guest" },
    { key: "property", label: "Property" },
    { key: "room_type", label: "Room Type" },
    { key: "check_in_date", label: "Check-in" },
    { key: "check_out_date", label: "Check-out" },
    { key: "total_price", label: "Price", render: (item: Booking) => `€${item.total_price}` },
    { 
      key: "status", 
      label: "Status",
      render: (item: Booking) => <Badge variant={getStatusVariant(item.status) as any}>{item.status}</Badge>
    },
    { 
      key: "payment", 
      label: "Payment",
      render: (item: Booking) => <Badge variant={getStatusVariant(item.payment_status) as any}>{item.payment_status}</Badge>
    },
  ];

  return (
    <AdminLayout>
      <PageHeader 
        title="Bookings" 
        subtitle="View and manage all bookings"
      >
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </PageHeader>

      <Card>
        <div className="p-4 border-b space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by guest name or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm"
              />
            </div>
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
                { value: "cancelled", label: "Cancelled" },
                { value: "completed", label: "Completed" },
              ]}
            />
            <Input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-auto"
            />
            <Input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
          actions={(item: any) => (
            <button 
              onClick={() => { setSelectedBooking(item); setModalOpen(true); }}
              className="text-blue-600 hover:underline text-sm"
            >
              View
            </button>
          )}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Booking Details">
        {selectedBooking && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Guest</p>
                <p className="font-medium">{selectedBooking.guest}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-medium">{selectedBooking.property}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Room Type</p>
                <p className="font-medium">{selectedBooking.room_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Guests</p>
                <p className="font-medium">{selectedBooking.guest_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-in</p>
                <p className="font-medium">{selectedBooking.check_in_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Check-out</p>
                <p className="font-medium">{selectedBooking.check_out_date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="font-medium">€{selectedBooking.total_price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={getStatusVariant(selectedBooking.status) as any}>{selectedBooking.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <Badge variant={getStatusVariant(selectedBooking.payment_status) as any}>{selectedBooking.payment_status}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Booked On</p>
                <p className="font-medium">{selectedBooking.created_at}</p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Close
              </Button>
              {selectedBooking.status !== "cancelled" && (
                <Button variant="danger" onClick={handleCancel} disabled={actionLoading} className="flex-1">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Booking"}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}