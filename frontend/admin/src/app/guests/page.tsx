"use client";

import { useState, useEffect } from "react";
import { Users, Search, Loader2, Edit, Trash2, Ban, Download, FileText } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Select, Modal, Badge } from "../components/AdminComponents";

interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  is_loyalty_member: boolean;
  loyalty_points: number;
  is_banned: boolean;
  bookings_count: number;
  created_at: string;
}

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchGuests();
  }, [pagination.current_page, search]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getGuests({ search, page: pagination.current_page });
      setGuests(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch guests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async () => {
    if (!selectedGuest || !confirm("Are you sure you want to ban this guest?")) return;
    setActionLoading(true);
    try {
      await adminApi.banGuest(selectedGuest.id);
      setModalOpen(false);
      fetchGuests();
    } catch (error) {
      console.error("Failed to ban guest:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!selectedGuest || !confirm("Are you sure you want to unban this guest?")) return;
    setActionLoading(true);
    try {
      await adminApi.unbanGuest(selectedGuest.id);
      setModalOpen(false);
      fetchGuests();
    } catch (error) {
      console.error("Failed to unban guest:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!selectedGuest) return;
    setActionLoading(true);
    try {
      const response = await adminApi.exportGuestData(selectedGuest.id);
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `guest_data_${selectedGuest.id}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export guest data:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteData = async () => {
    if (!selectedGuest || !confirm("WARNING: This will permanently delete all guest data. This action cannot be undone. Are you sure?")) return;
    if (!confirm("Are you absolutely sure? This is the final confirmation.")) return;
    setActionLoading(true);
    try {
      await adminApi.deleteGuestData(selectedGuest.id);
      setModalOpen(false);
      fetchGuests();
    } catch (error) {
      console.error("Failed to delete guest data:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { 
      key: "name", 
      label: "Name",
      render: (item: Guest) => `${item.first_name} ${item.last_name}`
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "country", label: "Country" },
    { 
      key: "loyalty", 
      label: "A&O Club",
      render: (item: Guest) => (
        <div>
          {item.is_loyalty_member && <Badge variant="info">Member</Badge>}
          {item.loyalty_points > 0 && <span className="ml-2 text-xs text-gray-500">{item.loyalty_points} pts</span>}
        </div>
      )
    },
    { key: "bookings", label: "Bookings" },
    { 
      key: "status", 
      label: "Status",
      render: (item: Guest) => item.is_banned ? <Badge variant="danger">Banned</Badge> : <Badge variant="success">Active</Badge>
    },
  ];

  return (
    <AdminLayout>
      <PageHeader 
        title="Guests" 
        subtitle="Manage guest accounts across all properties"
      />

      <Card>
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search guests..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm"
            />
          </div>
        </div>
        
        <DataTable
          columns={columns}
          data={guests}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
          actions={(item: any) => (
            <button 
              onClick={() => { setSelectedGuest(item); setModalOpen(true); }}
              className="text-blue-600 hover:underline text-sm"
            >
              View
            </button>
          )}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Guest Details">
        {selectedGuest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedGuest.first_name} {selectedGuest.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{selectedGuest.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{selectedGuest.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">{selectedGuest.country || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">A&O Club</p>
                <p className="font-medium">{selectedGuest.is_loyalty_member ? "Member" : "Not member"} - {selectedGuest.loyalty_points} points</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="font-medium">{selectedGuest.bookings_count}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={selectedGuest.is_banned ? "danger" : "success"}>
                  {selectedGuest.is_banned ? "Banned" : "Active"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{selectedGuest.created_at}</p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Close
              </Button>
              {selectedGuest.is_banned ? (
                <Button onClick={handleUnban} disabled={actionLoading} className="flex-1">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Unban Guest"}
                </Button>
              ) : (
                <Button variant="danger" onClick={handleBan} disabled={actionLoading} className="flex-1">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ban Guest"}
                </Button>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">GDPR Options</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportData} disabled={actionLoading}>
                  <Download className="w-4 h-4" /> Export Data
                </Button>
                <Button variant="danger" size="sm" onClick={handleDeleteData} disabled={actionLoading}>
                  <Trash2 className="w-4 h-4" /> Delete All Data
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}