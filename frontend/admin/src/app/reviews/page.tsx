"use client";

import { useState, useEffect } from "react";
import { Star, Search, Loader2, Check, X, Flag, MessageSquare } from "lucide-react";
import { adminApi } from "../../services/api";
import { AdminLayout, PageHeader, Card, DataTable, Button, Input, Modal, Badge } from "../components/AdminComponents";

interface Review {
  id: string;
  booking: string;
  guest: string;
  property: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [reply, setReply] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [pagination.current_page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getReviews({ page: pagination.current_page });
      setReviews(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (status: string) => {
    if (!selectedReview) return;
    setActionLoading(true);
    try {
      await adminApi.moderateReview(selectedReview.id, { status, reply: reply || undefined });
      setModalOpen(false);
      setReply("");
      fetchReviews();
    } catch (error) {
      console.error("Failed to moderate review:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
      />
    ));
  };

  const columns = [
    { key: "guest", label: "Guest" },
    { key: "property", label: "Property" },
    { 
      key: "rating", 
      label: "Rating",
      render: (item: Review) => <div className="flex">{renderStars(item.rating)}</div>
    },
    { 
      key: "comment", 
      label: "Comment",
      render: (item: Review) => (
        <p className="max-w-xs truncate">{item.comment}</p>
      )
    },
    { 
      key: "status", 
      label: "Status",
      render: (item: Review) => {
        const variants: Record<string, any> = {
          approved: "success",
          pending: "warning",
          hidden: "danger",
          flagged: "danger"
        };
        return <Badge variant={variants[item.status] || "default"}>{item.status}</Badge>;
      }
    },
    { key: "created_at", label: "Date" },
  ];

  return (
    <AdminLayout>
      <PageHeader title="Reviews" subtitle="Moderate guest reviews" />

      <Card>
        <DataTable
          columns={columns}
          data={reviews}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: number) => setPagination(p => ({ ...p, current_page: page }))}
          actions={(item: any) => (
            <button 
              onClick={() => { setSelectedReview(item); setReply(""); setModalOpen(true); }}
              className="text-blue-600 hover:underline text-sm"
            >
              Moderate
            </button>
          )}
        />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Review Details">
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-500">Rating:</p>
              <div className="flex">{renderStars(selectedReview.rating)}</div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Guest:</p>
              <p className="font-medium">{selectedReview.guest}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Property:</p>
              <p className="font-medium">{selectedReview.property}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Comment:</p>
              <p className="p-3 bg-gray-50 rounded-lg">{selectedReview.comment}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Reply (as property management):</p>
              <textarea 
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                className="w-full px-3 py-2 border rounded-lg text-sm h-24 resize-none"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleModerate("hidden")} disabled={actionLoading} className="flex-1">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hide"}
              </Button>
              <Button onClick={() => handleModerate("approved")} disabled={actionLoading} className="flex-1">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Approve"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}