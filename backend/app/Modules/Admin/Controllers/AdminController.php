<?php

namespace App\Modules\Admin\Controllers;

use App\Models\AdminPermission;
use App\Models\AdminRole;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\EmailTemplate;
use App\Models\Extra;
use App\Models\Guest;
use App\Models\Promotion;
use App\Models\Property;
use App\Models\Review;
use App\Models\Room;
use App\Models\RoomType;
use App\Modules\Admin\Services\AdminManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    private AdminManagementService $service;

    public function __construct()
    {
        $this->service = new AdminManagementService;
    }

    public function getStaff(Request $request): JsonResponse
    {
        $filters = $request->only(['role', 'property', 'is_active', 'search']);
        $staff = $this->service->getAllStaff($filters);

        return response()->json([
            'data' => $staff->map(fn ($s) => [
                'id' => $s->id,
                'first_name' => $s->first_name,
                'last_name' => $s->last_name,
                'email' => $s->email,
                'role' => $s->role,
                'is_active' => $s->is_active,
                'property' => $s->property?->name,
                'admin_role' => $s->adminRole?->name,
                'two_factor_enabled' => $s->two_factor_enabled,
                'last_login_at' => $s->last_login_at,
                'created_at' => $s->created_at,
            ]),
            'pagination' => [
                'current_page' => $staff->currentPage(),
                'last_page' => $staff->lastPage(),
                'per_page' => $staff->perPage(),
                'total' => $staff->total(),
            ],
        ]);
    }

    public function createStaff(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:staff,email',
            'password' => 'required|min:8',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'role' => 'nullable|string',
            'admin_role_id' => 'nullable|exists:admin_roles,id',
            'property_id' => 'nullable|exists:properties,id',
            'permissions' => 'nullable|array',
            'assigned_properties' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'two_factor_enabled' => 'nullable|boolean',
        ]);

        $staff = $this->service->createStaff($validated);

        return response()->json([
            'message' => 'Staff created successfully',
            'data' => $staff,
        ], 201);
    }

    public function updateStaff(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'sometimes|email|unique:staff,email,'.$id,
            'password' => 'sometimes|min:8',
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'role' => 'sometimes|string',
            'admin_role_id' => 'nullable|exists:admin_roles,id',
            'property_id' => 'nullable|exists:properties,id',
            'permissions' => 'nullable|array',
            'assigned_properties' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'two_factor_enabled' => 'nullable|boolean',
        ]);

        $staff = $this->service->updateStaff($id, $validated);

        return response()->json([
            'message' => 'Staff updated successfully',
            'data' => $staff,
        ]);
    }

    public function deleteStaff(string $id): JsonResponse
    {
        $this->service->deactivateStaff($id);

        return response()->json([
            'message' => 'Staff deactivated successfully',
        ]);
    }

    public function getStaffById(string $id): JsonResponse
    {
        $staff = $this->service->getStaffById($id);

        return response()->json([
            'data' => [
                'id' => $staff->id,
                'first_name' => $staff->first_name,
                'last_name' => $staff->last_name,
                'email' => $staff->email,
                'role' => $staff->role,
                'is_active' => $staff->is_active,
                'property' => $staff->property,
                'admin_role' => $staff->adminRole,
                'permissions' => $staff->permissions,
                'assigned_properties' => $staff->assigned_properties,
                'two_factor_enabled' => $staff->two_factor_enabled,
                'last_login_at' => $staff->last_login_at,
                'created_at' => $staff->created_at,
            ],
        ]);
    }

    public function forceLogout(string $id): JsonResponse
    {
        $this->service->forceLogout($id);

        return response()->json([
            'message' => 'Session terminated successfully',
        ]);
    }

    public function getRoles(): JsonResponse
    {
        $roles = AdminRole::orderBy('level', 'desc')->get();

        return response()->json([
            'data' => $roles,
        ]);
    }

    public function getPermissions(): JsonResponse
    {
        $permissions = AdminPermission::orderBy('module')->orderBy('name')->get();
        $grouped = $permissions->groupBy('module');

        return response()->json([
            'data' => $grouped,
        ]);
    }

    public function getProperties(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active']);
        $properties = $this->service->getAllProperties($filters);

        return response()->json([
            'data' => $properties->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'location' => $p->location,
                'address' => $p->address,
                'total_rooms' => $p->total_rooms,
                'is_active' => $p->is_active,
                'check_in_time' => $p->check_in_time,
                'check_out_time' => $p->check_out_time,
            ]),
            'pagination' => [
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function createProperty(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'sometimes|string|unique:properties,slug',
            'location' => 'required|string|max:255',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'check_in_time' => 'nullable|date_format:H:i:s',
            'check_out_time' => 'nullable|date_format:H:i:s',
            'total_rooms' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'amenities' => 'nullable|array',
            'policies' => 'nullable|array',
            'photos' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $property = $this->service->createProperty($validated);

        return response()->json([
            'message' => 'Property created successfully',
            'data' => $property,
        ], 201);
    }

    public function updateProperty(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:properties,slug,'.$id,
            'location' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'check_in_time' => 'nullable|date_format:H:i:s',
            'check_out_time' => 'nullable|date_format:H:i:s',
            'total_rooms' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'amenities' => 'nullable|array',
            'policies' => 'nullable|array',
            'photos' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $property = $this->service->updateProperty($id, $validated);

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property,
        ]);
    }

    public function deleteProperty(string $id): JsonResponse
    {
        $this->service->archiveProperty($id);

        return response()->json([
            'message' => 'Property archived successfully',
        ]);
    }

    public function getPropertyKpis(Request $request, string $id): JsonResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $kpis = $this->service->getPropertyKpis($id, $startDate, $endDate);

        return response()->json([
            'data' => $kpis,
        ]);
    }

    public function getBookings(Request $request): JsonResponse
    {
        $filters = $request->only(['property', 'status', 'date_from', 'date_to', 'search']);
        $bookings = $this->service->getAllBookings($filters);

        return response()->json([
            'data' => $bookings->map(fn ($b) => [
                'id' => $b->id,
                'guest' => $b->guest?->first_name.' '.$b->guest?->last_name,
                'property' => $b->property?->name,
                'room_type' => $b->roomType?->name,
                'check_in_date' => $b->check_in_date,
                'check_out_date' => $b->check_out_date,
                'guest_count' => $b->guest_count,
                'total_price' => $b->total_price,
                'status' => $b->status,
                'payment_status' => $b->payment_status,
                'created_at' => $b->created_at,
            ]),
            'pagination' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }

    public function updateBooking(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'check_in_date' => 'sometimes|date',
            'check_out_date' => 'sometimes|date',
            'room_type_id' => 'sometimes|exists:room_types,id',
            'guest_count' => 'sometimes|integer|min:1',
            'total_price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string',
        ]);

        $booking = $this->service->updateBooking($id, $validated);

        return response()->json([
            'message' => 'Booking updated successfully',
            'data' => $booking,
        ]);
    }

    public function cancelBooking(Request $request, string $id): JsonResponse
    {
        $reason = $request->input('reason');
        $booking = $this->service->cancelBooking($id, $reason);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'data' => $booking,
        ]);
    }

    public function refundBooking(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string',
        ]);

        $refund = $this->service->processRefund(
            $id,
            $validated['amount'] ?? null,
            $validated['reason'] ?? null
        );

        return response()->json([
            'message' => 'Refund processed successfully',
            'data' => $refund,
        ]);
    }

    public function exportBookings(Request $request): JsonResponse
    {
        $filters = $request->only(['property', 'status', 'date_from', 'date_to']);
        $bookings = $this->service->getAllBookings($filters);

        $csv = "ID,Guest,Property,Room Type,Check-in,Check-out,Guests,Price,Status,Payment Status,Created At\n";

        foreach ($bookings as $booking) {
            $csv .= sprintf(
                "%s,%s,%s,%s,%s,%s,%d,%.2f,%s,%s,%s\n",
                $booking->id,
                $booking->guest?->first_name.' '.$booking->guest?->last_name,
                $booking->property?->name,
                $booking->roomType?->name,
                $booking->check_in_date,
                $booking->check_out_date,
                $booking->guest_count,
                $booking->total_price,
                $booking->status,
                $booking->payment_status,
                $booking->created_at
            );
        }

        return response()->stream(function () use ($csv) {
            echo $csv;
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="bookings_'.date('Y-m-d').'.csv"',
        ]);
    }

    public function getGuests(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_loyalty_member', 'is_banned']);
        $guests = $this->service->getAllGuests($filters);

        return response()->json([
            'data' => $guests->map(fn ($g) => [
                'id' => $g->id,
                'firstName' => $g->first_name,
                'lastName' => $g->last_name,
                'email' => $g->email,
                'phone' => $g->phone,
                'country' => $g->country,
                'isLoyaltyMember' => (bool) $g->is_loyalty_member,
                'loyaltyPoints' => $g->loyalty_points,
                'isBanned' => (bool) ($g->is_banned ?? false),
                'bookingsCount' => $g->bookings()->count(),
                'memberSince' => $g->created_at?->toDateString(),
            ]),
            'pagination' => [
                'current_page' => $guests->currentPage(),
                'last_page' => $guests->lastPage(),
                'total' => $guests->total(),
            ],
        ]);
    }

    public function updateGuest(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'phone' => 'sometimes|string|max:20',
            'country' => 'sometimes|string|max:100',
            'is_loyalty_member' => 'sometimes|boolean',
            'loyalty_points' => 'sometimes|integer|min:0',
        ]);

        $guest = $this->service->updateGuest($id, $validated);

        return response()->json([
            'message' => 'Guest updated successfully',
            'data' => [
                'id' => $guest->id,
                'firstName' => $guest->first_name,
                'lastName' => $guest->last_name,
                'email' => $guest->email,
                'phone' => $guest->phone,
                'country' => $guest->country,
                'isLoyaltyMember' => (bool) $guest->is_loyalty_member,
                'loyaltyPoints' => $guest->loyalty_points,
                'isBanned' => (bool) ($guest->is_banned ?? false),
            ],
        ]);
    }

    public function banGuest(Request $request, string $id): JsonResponse
    {
        $reason = $request->input('reason');
        $guest = $this->service->banGuest($id, $reason);

        return response()->json([
            'message' => 'Guest banned successfully',
            'data' => [
                'id' => $guest->id,
                'firstName' => $guest->first_name,
                'lastName' => $guest->last_name,
                'email' => $guest->email,
                'isBanned' => (bool) $guest->is_banned,
                'banReason' => $guest->ban_reason,
            ],
        ]);
    }

    public function unbanGuest(string $id): JsonResponse
    {
        $guest = $this->service->unbanGuest($id);

        return response()->json([
            'message' => 'Guest unbanned successfully',
            'data' => [
                'id' => $guest->id,
                'firstName' => $guest->first_name,
                'lastName' => $guest->last_name,
                'email' => $guest->email,
                'isBanned' => (bool) $guest->is_banned,
            ],
        ]);
    }

    public function mergeGuests(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'source_id' => 'required|exists:guests,id',
            'target_id' => 'required|exists:guests,id|different:source_id',
        ]);

        $guest = $this->service->mergeGuests($validated['source_id'], $validated['target_id']);

        return response()->json([
            'message' => 'Guests merged successfully',
            'data' => $guest,
        ]);
    }

    public function exportGuestData(string $id): JsonResponse
    {
        $data = $this->service->exportGuestData($id);

        return response()->json([
            'data' => $data,
        ]);
    }

    public function deleteGuestData(string $id): JsonResponse
    {
        $this->service->deleteGuestData($id);

        return response()->json([
            'message' => 'Guest data deleted successfully',
        ]);
    }

    public function getPayments(Request $request): JsonResponse
    {
        $filters = $request->only(['property', 'status', 'date_from', 'date_to']);
        $payments = $this->service->getAllPayments($filters);

        return response()->json([
            'data' => $payments->map(fn ($p) => [
                'id' => $p->id,
                'booking' => $p->booking?->id,
                'guest' => $p->booking?->guest?->first_name.' '.$p->booking?->guest?->last_name,
                'amount' => $p->amount,
                'payment_method' => $p->payment_method,
                'status' => $p->status,
                'stripe_payment_id' => $p->stripe_payment_id,
                'created_at' => $p->created_at,
            ]),
            'pagination' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    public function getRevenueDashboard(Request $request): JsonResponse
    {
        $propertyId = $request->query('property_id');
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $data = $this->service->getRevenueDashboard($propertyId, $startDate, $endDate);

        return response()->json([
            'data' => $data,
        ]);
    }

    public function getReviews(Request $request): JsonResponse
    {
        $query = Review::with(['booking', 'booking.guest', 'booking.property']);

        if ($request->query('property')) {
            $query->whereHas('booking', fn ($q) => $q->where('property_id', $request->query('property')));
        }
        if ($request->query('status')) {
            $query->where('status', $request->query('status'));
        }

        $reviews = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => $reviews->map(fn ($r) => [
                'id' => $r->id,
                'booking' => $r->booking_id,
                'guest' => $r->booking?->guest?->first_name.' '.$r->booking?->guest?->last_name,
                'property' => $r->booking?->property?->name,
                'rating' => $r->overall_rating,
                'comment' => $r->review_text,
                'reply' => $r->reply,
                'status' => $r->status,
                'created_at' => $r->created_at,
            ]),
            'pagination' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function moderateReview(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected,hidden,flagged',
            'reply' => 'nullable|string',
        ]);

        $review = Review::findOrFail($id);
        $review->update([
            'status' => $validated['status'],
            'reply' => $validated['reply'] ?? null,
        ]);

        AuditLog::log('review_moderated', 'review', $id, null, $validated);

        return response()->json([
            'message' => 'Review moderated successfully',
            'data' => $review,
        ]);
    }

    public function getPromotions(Request $request): JsonResponse
    {
        $query = Promotion::query();

        if ($request->query('property')) {
            $query->where('property_id', $request->query('property'))->orWhereNull('property_id');
        }

        $promotions = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'data' => $promotions,
            'pagination' => [
                'current_page' => $promotions->currentPage(),
                'last_page' => $promotions->lastPage(),
                'total' => $promotions->total(),
            ],
        ]);
    }

    public function createPromotion(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promotions,promo_code',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'property_id' => 'nullable|exists:properties,id',
            'room_type_id' => 'nullable|exists:room_types,id',
            'valid_from' => 'required|date',
            'valid_until' => 'required|date|after:valid_from',
            'min_booking_value' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
        ]);

        $promotion = Promotion::create([
            'id' => Str::uuid()->toString(),
            'property_id' => $validated['property_id'] ?? null,
            'name' => $validated['code'],
            'description' => $validated['description'] ?? null,
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'promo_code' => $validated['code'],
            'start_date' => $validated['valid_from'],
            'end_date' => $validated['valid_until'],
            'min_nights' => $validated['min_booking_value'] ?? null,
            'is_active' => true,
            'usage_limit' => $validated['max_uses'] ?? null,
            'usage_count' => 0,
        ]);

        AuditLog::log('promotion_created', 'promotion', $promotion->id, null, $validated);

        return response()->json([
            'message' => 'Promotion created successfully',
            'data' => $promotion,
        ], 201);
    }

    public function updatePromotion(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:promotions,promo_code,'.$id,
            'description' => 'nullable|string',
            'discount_type' => 'sometimes|in:percentage,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'property_id' => 'nullable|exists:properties,id',
            'room_type_id' => 'nullable|exists:room_types,id',
            'valid_from' => 'sometimes|date',
            'valid_until' => 'sometimes|date',
            'min_booking_value' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        $promotion = Promotion::findOrFail($id);

        $updateData = [];
        if (isset($validated['code'])) {
            $updateData['promo_code'] = $validated['code'];
            $updateData['name'] = $validated['code'];
        }
        if (isset($validated['description'])) {
            $updateData['description'] = $validated['description'];
        }
        if (isset($validated['discount_type'])) {
            $updateData['discount_type'] = $validated['discount_type'];
        }
        if (isset($validated['discount_value'])) {
            $updateData['discount_value'] = $validated['discount_value'];
        }
        if (isset($validated['property_id'])) {
            $updateData['property_id'] = $validated['property_id'];
        }
        if (isset($validated['valid_from'])) {
            $updateData['start_date'] = $validated['valid_from'];
        }
        if (isset($validated['valid_until'])) {
            $updateData['end_date'] = $validated['valid_until'];
        }
        if (isset($validated['min_booking_value'])) {
            $updateData['min_nights'] = $validated['min_booking_value'];
        }
        if (isset($validated['max_uses'])) {
            $updateData['usage_limit'] = $validated['max_uses'];
        }
        if (isset($validated['is_active'])) {
            $updateData['is_active'] = $validated['is_active'];
        }

        $promotion->update($updateData);

        AuditLog::log('promotion_updated', 'promotion', $id, null, $validated);

        return response()->json([
            'message' => 'Promotion updated successfully',
            'data' => $promotion->fresh(),
        ]);
    }

    public function deletePromotion(string $id): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);
        $promotion->update(['is_active' => false]);

        AuditLog::log('promotion_deleted', 'promotion', $id);

        return response()->json([
            'message' => 'Promotion deactivated successfully',
        ]);
    }

    public function getExtras(Request $request): JsonResponse
    {
        $query = Extra::query();

        if ($request->query('property')) {
            $query->where('property_id', $request->query('property'))->orWhereNull('property_id');
        }

        $extras = $query->orderBy('name')->paginate(20);

        return response()->json([
            'data' => $extras,
            'pagination' => [
                'current_page' => $extras->currentPage(),
                'last_page' => $extras->lastPage(),
                'total' => $extras->total(),
            ],
        ]);
    }

    public function createExtra(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'price_type' => 'required|in:per_stay,per_night,per_person',
            'property_id' => 'nullable|exists:properties,id',
            'is_active' => 'nullable|boolean',
        ]);

        $extra = Extra::create([
            'id' => Str::uuid()->toString(),
            ...$validated,
        ]);

        AuditLog::log('extra_created', 'extra', $extra->id, null, $validated);

        return response()->json([
            'message' => 'Extra created successfully',
            'data' => $extra,
        ], 201);
    }

    public function updateExtra(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'price_type' => 'sometimes|in:per_stay,per_night,per_person',
            'property_id' => 'nullable|exists:properties,id',
            'is_active' => 'nullable|boolean',
        ]);

        $extra = Extra::findOrFail($id);
        $extra->update($validated);

        AuditLog::log('extra_updated', 'extra', $id, null, $validated);

        return response()->json([
            'message' => 'Extra updated successfully',
            'data' => $extra,
        ]);
    }

    public function deleteExtra(string $id): JsonResponse
    {
        $extra = Extra::findOrFail($id);
        $extra->update(['is_active' => false]);

        AuditLog::log('extra_deleted', 'extra', $id);

        return response()->json([
            'message' => 'Extra deactivated successfully',
        ]);
    }

    public function getEmailTemplates(): JsonResponse
    {
        $templates = EmailTemplate::orderBy('name')->get();

        return response()->json([
            'data' => $templates,
        ]);
    }

    public function updateEmailTemplate(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
            'is_active' => 'nullable|boolean',
        ]);

        $template = EmailTemplate::findOrFail($id);
        $template->update($validated);

        AuditLog::log('template_updated', 'email_template', $id, null, $validated);

        return response()->json([
            'message' => 'Template updated successfully',
            'data' => $template,
        ]);
    }

    public function sendAnnouncement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:email,sms,push',
            'recipients' => 'required|in:all_guests,all_staff,specific_property',
            'property_id' => 'nullable|exists:properties,id',
            'subject' => 'required_if:type,email|max:255',
            'message' => 'required|string',
        ]);

        AuditLog::log('announcement_sent', null, null, null, $validated);

        return response()->json([
            'message' => 'Announcement sent successfully',
        ]);
    }

    public function getSystemConfig(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $config = $this->service->getSystemConfig($category);

        return response()->json([
            'data' => $config,
        ]);
    }

    public function updateSystemConfig(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => 'required|string|max:100',
            'value' => 'required',
            'type' => 'nullable|in:string,boolean,integer,float,json',
            'category' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_encrypted' => 'nullable|boolean',
        ]);

        $config = $this->service->setSystemConfig(
            $validated['key'],
            $validated['value'],
            $validated['type'] ?? 'string',
            $validated['category'] ?? 'general',
            $validated['description'] ?? null,
            $validated['is_encrypted'] ?? false
        );

        return response()->json([
            'message' => 'Configuration updated successfully',
            'data' => $config,
        ]);
    }

    public function getAuditLogs(Request $request): JsonResponse
    {
        $filters = $request->only(['staff_id', 'action', 'entity_type', 'date_from', 'date_to', 'search']);
        $logs = $this->service->getAuditLogs($filters);

        return response()->json([
            'data' => $logs->map(fn ($l) => [
                'id' => $l->id,
                'staff' => $l->staff?->first_name.' '.$l->staff?->last_name,
                'action' => $l->action,
                'entity_type' => $l->entity_type,
                'entity_id' => $l->entity_id,
                'old_values' => $l->old_values,
                'new_values' => $l->new_values,
                'ip_address' => $l->ip_address,
                'created_at' => $l->created_at,
            ]),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function getAnalytics(Request $request): JsonResponse
    {
        $propertyId = $request->query('property_id');
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $kpis = $this->service->getRevenueDashboard($propertyId, $startDate, $endDate);

        $occupancyQuery = Booking::query();
        if ($propertyId) {
            $occupancyQuery->where('property_id', $propertyId);
        }
        $occupancyQuery->whereBetween('check_in_date', [$startDate, $endDate])
            ->whereIn('status', ['confirmed', 'completed']);

        $bookingsCount = $occupancyQuery->count();
        $totalNights = $occupancyQuery->sum(\DB::raw('DATEDIFF(check_out_date, check_in_date)'));
        $totalRooms = $propertyId
            ? Property::findOrFail($propertyId)->rooms()->count()
            : Property::sum('total_rooms');

        $occupancyRate = $totalRooms > 0 && $totalNights > 0
            ? round(($totalNights / ($totalRooms * 30)) * 100, 1)
            : 0;

        $weeklyBookings = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $count = Booking::where('property_id', $propertyId)
                ->where('check_in_date', $date)
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->count();
            $weeklyBookings[] = [
                'date' => now()->subDays($i)->format('D'),
                'bookings' => $count,
            ];
        }

        $monthlyRevenue = [];
        for ($i = 11; $i >= 0; $i--) {
            $monthStart = now()->subMonths($i)->startOfMonth()->toDateString();
            $monthEnd = now()->subMonths($i)->endOfMonth()->toDateString();
            $revenue = Booking::where('property_id', $propertyId)
                ->whereBetween('check_in_date', [$monthStart, $monthEnd])
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->sum('total_price');
            $monthlyRevenue[] = [
                'month' => now()->subMonths($i)->format('M'),
                'revenue' => (float) $revenue,
            ];
        }

        $recentBookings = Booking::with(['guest', 'roomType'])
            ->where('property_id', $propertyId)
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($b) => [
                'guest_name' => $b->guest?->first_name.' '.$b->guest?->last_name,
                'room_type' => $b->roomType?->name,
                'check_in_date' => $b->check_in_date,
                'status' => $b->status,
            ]);

        $totalGuests = Guest::count();
        $adr = $bookingsCount > 0 ? round($kpis['total_revenue'] / $bookingsCount, 2) : 0;
        $revpar = $totalRooms > 0 ? round($kpis['total_revenue'] / $totalRooms, 2) : 0;

        return response()->json([
            'data' => [
                'occupancy_rate' => $occupancyRate,
                'total_revenue' => $kpis['total_revenue'],
                'total_bookings' => $bookingsCount,
                'total_guests' => $totalGuests,
                'adr' => $adr,
                'revpar' => $revpar,
                'average_transaction' => $kpis['average_transaction'],
                'daily_revenue' => $kpis['daily_revenue'],
                'weekly_bookings' => $weeklyBookings,
                'monthly_revenue' => $monthlyRevenue,
                'recent_bookings' => $recentBookings,
            ],
        ]);
    }

    public function getRooms(Request $request): JsonResponse
    {
        $query = Room::with(['roomType', 'property']);

        if ($request->query('property')) {
            $query->where('property_id', $request->query('property'));
        }
        if ($request->query('status')) {
            $query->where('status', $request->query('status'));
        }
        if ($request->query('search')) {
            $query->where('room_number', 'like', '%'.$request->query('search').'%');
        }

        $rooms = $query->orderBy('room_number')->paginate(50);

        $baseQuery = Room::query();
        if ($request->query('property')) {
            $baseQuery->where('property_id', $request->query('property'));
        }

        $statusCounts = [
            'available' => (clone $baseQuery)->where('status', 'available')->count(),
            'booked' => (clone $baseQuery)->where('status', 'booked')->count(),
            'maintenance' => (clone $baseQuery)->where('status', 'maintenance')->count(),
            'cleaning' => (clone $baseQuery)->where('status', 'cleaning')->count(),
        ];

        return response()->json([
            'data' => $rooms->map(fn ($r) => [
                'id' => $r->id,
                'room_number' => $r->room_number,
                'floor' => $r->floor,
                'room_type' => $r->roomType?->name,
                'room_type_id' => $r->room_type_id,
                'property' => $r->property?->name,
                'property_id' => $r->property_id,
                'status' => $r->status,
                'base_price' => $r->roomType?->base_price ?? 0,
            ]),
            'pagination' => [
                'current_page' => $rooms->currentPage(),
                'last_page' => $rooms->lastPage(),
                'per_page' => $rooms->perPage(),
                'total' => $rooms->total(),
            ],
            'status_counts' => $statusCounts,
        ]);
    }

    public function createRoom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'room_type_id' => 'required|exists:room_types,id',
            'room_number' => 'required|string|max:20',
            'floor' => 'required|integer|min:0',
            'status' => 'nullable|in:available,booked,maintenance,cleaning,out_of_service',
        ]);

        $validated['id'] = Str::uuid()->toString();
        $validated['status'] = $validated['status'] ?? 'available';

        $room = Room::create($validated);
        AuditLog::log('room_created', 'room', $room->id, null, $validated);

        return response()->json(['message' => 'Room created successfully', 'data' => $room], 201);
    }

    public function updateRoom(Request $request, string $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'room_number' => 'sometimes|string|max:20',
            'floor' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:available,booked,maintenance,cleaning,out_of_service',
            'room_type_id' => 'sometimes|exists:room_types,id',
        ]);

        $room->update($validated);
        AuditLog::log('room_updated', 'room', $id, null, $validated);

        return response()->json(['message' => 'Room updated successfully', 'data' => $room]);
    }

    public function updateRoomStatus(Request $request, string $id): JsonResponse
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:available,booked,maintenance,cleaning,out_of_service',
        ]);

        $room->update($validated);
        AuditLog::log('room_status_updated', 'room', $id, null, $validated);

        return response()->json(['message' => 'Room status updated successfully', 'data' => $room]);
    }

    public function getRoomTypes(Request $request): JsonResponse
    {
        $query = RoomType::withCount('rooms');

        if ($request->query('property')) {
            $query->where('property_id', $request->query('property'));
        }

        $roomTypes = $query->orderBy('name')->get();

        return response()->json([
            'data' => $roomTypes->map(fn ($rt) => [
                'id' => $rt->id,
                'name' => $rt->name,
                'capacity' => $rt->capacity,
                'base_price' => $rt->base_price,
                'description' => $rt->description,
                'property_id' => $rt->property_id,
                'rooms_count' => $rt->rooms_count,
            ]),
        ]);
    }

    public function createRoomType(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $validated['id'] = Str::uuid()->toString();

        $roomType = RoomType::create($validated);
        AuditLog::log('room_type_created', 'room_type', $roomType->id, null, $validated);

        return response()->json(['message' => 'Room type created successfully', 'data' => $roomType], 201);
    }

    public function updateRoomType(Request $request, string $id): JsonResponse
    {
        $roomType = RoomType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'capacity' => 'sometimes|integer|min:1',
            'base_price' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $roomType->update($validated);
        AuditLog::log('room_type_updated', 'room_type', $id, null, $validated);

        return response()->json(['message' => 'Room type updated successfully', 'data' => $roomType]);
    }

    public function seedData(): JsonResponse
    {
        AdminManagementService::seedPermissions();
        AdminManagementService::seedRoles();

        return response()->json([
            'message' => 'Admin permissions and roles seeded successfully',
        ]);
    }
}
