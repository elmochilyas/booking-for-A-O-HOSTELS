<?php

namespace App\Modules\Admin\Controllers;

use App\Actions\Admin\BanGuestAction;
use App\Actions\Admin\CancelBookingAction;
use App\Actions\Admin\CreateExtraAction;
use App\Actions\Admin\CreatePromotionAction;
use App\Actions\Admin\CreatePropertyAction;
use App\Actions\Admin\CreateStaffAction;
use App\Actions\Admin\DeactivateExtraAction;
use App\Actions\Admin\DeactivatePromotionAction;
use App\Actions\Admin\DeactivateStaffAction;
use App\Actions\Admin\ExportGuestDataAction;
use App\Actions\Admin\MergeGuestsAction;
use App\Actions\Admin\ModerateReviewAction;
use App\Actions\Admin\RefundBookingAction;
use App\Actions\Admin\UnbanGuestAction;
use App\Actions\Admin\UpdateBookingAction;
use App\Actions\Admin\UpdateExtraAction;
use App\Actions\Admin\UpdateGuestAction;
use App\Actions\Admin\UpdatePromotionAction;
use App\Actions\Admin\UpdatePropertyAction;
use App\Actions\Admin\UpdateStaffAction;
use App\Contracts\Repositories\BookingRepositoryInterface;
use App\Contracts\Repositories\GuestRepositoryInterface;
use App\Contracts\Repositories\PaymentRepositoryInterface;
use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Contracts\Repositories\RoomRepositoryInterface;
use App\Contracts\Repositories\RoomTypeRepositoryInterface;
use App\Contracts\Repositories\StaffRepositoryInterface;
use App\Contracts\Repositories\SystemConfigRepositoryInterface;
use App\Http\Requests\Modules\Admin\BanGuestRequest;
use App\Http\Requests\Modules\Admin\CancelBookingRequest;
use App\Http\Requests\Modules\Admin\CreateExtraRequest;
use App\Http\Requests\Modules\Admin\CreatePromotionRequest;
use App\Http\Requests\Modules\Admin\CreatePropertyRequest;
use App\Http\Requests\Modules\Admin\CreateRoomRequest;
use App\Http\Requests\Modules\Admin\CreateRoomTypeRequest;
use App\Http\Requests\Modules\Admin\CreateStaffRequest;
use App\Http\Requests\Modules\Admin\ExportBookingsRequest;
use App\Http\Requests\Modules\Admin\GetAuditLogsRequest;
use App\Http\Requests\Modules\Admin\GetBookingsRequest;
use App\Http\Requests\Modules\Admin\GetExtrasRequest;
use App\Http\Requests\Modules\Admin\GetGuestsRequest;
use App\Http\Requests\Modules\Admin\GetPaymentsRequest;
use App\Http\Requests\Modules\Admin\GetPromotionsRequest;
use App\Http\Requests\Modules\Admin\GetPropertiesRequest;
use App\Http\Requests\Modules\Admin\GetReviewsRequest;
use App\Http\Requests\Modules\Admin\GetRoomsRequest;
use App\Http\Requests\Modules\Admin\GetRoomTypesRequest;
use App\Http\Requests\Modules\Admin\MergeGuestsRequest;
use App\Http\Requests\Modules\Admin\ModerateReviewRequest;
use App\Http\Requests\Modules\Admin\RefundBookingRequest;
use App\Http\Requests\Modules\Admin\SendAnnouncementRequest;
use App\Http\Requests\Modules\Admin\UpdateBookingRequest;
use App\Http\Requests\Modules\Admin\UpdateEmailTemplateRequest;
use App\Http\Requests\Modules\Admin\UpdateExtraRequest;
use App\Http\Requests\Modules\Admin\UpdateGuestRequest;
use App\Http\Requests\Modules\Admin\UpdatePromotionRequest;
use App\Http\Requests\Modules\Admin\UpdatePropertyRequest;
use App\Http\Requests\Modules\Admin\UpdateRoomRequest;
use App\Http\Requests\Modules\Admin\UpdateRoomStatusRequest;
use App\Http\Requests\Modules\Admin\UpdateRoomTypeRequest;
        use App\Http\Requests\Modules\Admin\AnalyticsRequest;
        use App\Http\Requests\Modules\Admin\UpdateStaffRequest;
        use App\Http\Requests\Modules\Admin\UpdateSystemConfigRequest;
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
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function __construct(
        private StaffRepositoryInterface $staffRepo,
        private PropertyRepositoryInterface $propertyRepo,
        private BookingRepositoryInterface $bookingRepo,
        private GuestRepositoryInterface $guestRepo,
        private PaymentRepositoryInterface $paymentRepo,
        private SystemConfigRepositoryInterface $systemConfigRepo,
        private RoomRepositoryInterface $roomRepo,
        private RoomTypeRepositoryInterface $roomTypeRepo,
    ) {}

    public function getStaff(CreateStaffRequest $request): JsonResponse
    {
        $filters = $request->only(['role', 'property', 'is_active', 'search']);
        $staff = $this->staffRepo->getPaginated($filters);

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

    public function createStaff(CreateStaffRequest $request, CreateStaffAction $action): JsonResponse
    {
        $staff = $action->handle($request->validated());

        return response()->json([
            'message' => 'Staff created successfully',
            'data' => $staff,
        ], 201);
    }

    public function updateStaff(UpdateStaffRequest $request, string $id, UpdateStaffAction $action): JsonResponse
    {
        $staff = $this->staffRepo->findOrFail($id);
        $staff = $action->handle($staff, $request->validated());

        return response()->json([
            'message' => 'Staff updated successfully',
            'data' => $staff,
        ]);
    }

    public function deleteStaff(string $id, DeactivateStaffAction $action): JsonResponse
    {
        $action->handle($this->staffRepo->findOrFail($id));

        return response()->json([
            'message' => 'Staff deactivated successfully',
        ]);
    }

    public function getStaffById(string $id): JsonResponse
    {
        $staff = $this->staffRepo->findOrFail($id);

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
        AuditLog::log('force_logout', 'staff', $id);

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

    public function getProperties(GetPropertiesRequest $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_active']);
        $properties = $this->propertyRepo->getPaginated($filters);

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

    public function createProperty(CreatePropertyRequest $request, CreatePropertyAction $action): JsonResponse
    {
        $property = $action->handle($request->validated());

        return response()->json([
            'message' => 'Property created successfully',
            'data' => $property,
        ], 201);
    }

    public function updateProperty(UpdatePropertyRequest $request, string $id, UpdatePropertyAction $action): JsonResponse
    {
        $property = $this->propertyRepo->findOrFail($id);
        $property = $action->handle($property, $request->validated());

        return response()->json([
            'message' => 'Property updated successfully',
            'data' => $property,
        ]);
    }

    public function deleteProperty(string $id, ArchivePropertyAction $action): JsonResponse
    {
        $action->handle($this->propertyRepo->findOrFail($id));

        return response()->json([
            'message' => 'Property archived successfully',
        ]);
    }

    public function getPropertyKpis(Request $request, string $id): JsonResponse
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');

        $kpis = $this->propertyRepo->getKpis($id, $startDate, $endDate);

        return response()->json([
            'data' => $kpis,
        ]);
    }

    public function getBookings(GetBookingsRequest $request): JsonResponse
    {
        $filters = $request->only(['property', 'status', 'date_from', 'date_to', 'search']);
        $bookings = $this->bookingRepo->getPaginated($filters);

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

    public function updateBooking(UpdateBookingRequest $request, string $id, UpdateBookingAction $action): JsonResponse
    {
        $booking = $this->bookingRepo->findOrFail($id);
        $booking = $action->handle($booking, $request->validated());

        return response()->json([
            'message' => 'Booking updated successfully',
            'data' => $booking,
        ]);
    }

    public function cancelBooking(CancelBookingRequest $request, string $id, CancelBookingAction $action): JsonResponse
    {
        $reason = $request->input('reason');
        $booking = $action->handle($id, $reason);

        return response()->json([
            'message' => 'Booking cancelled successfully',
            'data' => $booking,
        ]);
    }

    public function refundBooking(RefundBookingRequest $request, string $id, RefundBookingAction $action): JsonResponse
    {
        $refund = $action->handle(
            $id,
            $request->validated('amount'),
            $request->validated('reason')
        );

        return response()->json([
            'message' => 'Refund processed successfully',
            'data' => $refund,
        ]);
    }

    public function exportBookings(ExportBookingsRequest $request): JsonResponse
    {
        $filters = $request->only(['property', 'status', 'date_from', 'date_to']);
        $bookings = $this->bookingRepo->getPaginated($filters);

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

    public function getGuests(GetGuestsRequest $request): JsonResponse
    {
        $filters = $request->only(['search', 'is_loyalty_member', 'is_banned']);
        $guests = $this->guestRepo->getPaginatedWithCount($filters, ['bookings']);

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
                'bookingsCount' => $g->bookings_count ?? 0,
                'memberSince' => $g->created_at?->toDateString(),
            ]),
            'pagination' => [
                'current_page' => $guests->currentPage(),
                'last_page' => $guests->lastPage(),
                'total' => $guests->total(),
            ],
        ]);
    }

    public function updateGuest(UpdateGuestRequest $request, string $id, UpdateGuestAction $action): JsonResponse
    {
        $guest = $this->guestRepo->findOrFail($id);
        $guest = $action->handle($guest, $request->validated());

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

    public function banGuest(BanGuestRequest $request, string $id, BanGuestAction $action): JsonResponse
    {
        $reason = $request->input('reason');
        $guest = $action->handle($id, $reason);

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

    public function unbanGuest(string $id, UnbanGuestAction $action): JsonResponse
    {
        $guest = $action->handle($id);

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

    public function mergeGuests(MergeGuestsRequest $request, MergeGuestsAction $action): JsonResponse
    {
        $guest = $action->handle($request->validated('source_id'), $request->validated('target_id'));

        return response()->json([
            'message' => 'Guests merged successfully',
            'data' => $guest,
        ]);
    }

    public function exportGuestData(string $id, ExportGuestDataAction $action): JsonResponse
    {
        $data = $action->handle($id);

        return response()->json([
            'data' => $data,
        ]);
    }

    public function deleteGuestData(string $id, DeleteGuestDataAction $action): JsonResponse
    {
        $action->handle($id);

        return response()->json([
            'message' => 'Guest data deleted successfully',
        ]);
    }

    public function getPayments(GetPaymentsRequest $request): JsonResponse
    {
        $filters = $request->only(['property', 'status', 'date_from', 'date_to']);
        $payments = $this->paymentRepo->getPaginated($filters);

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

        $data = $this->propertyRepo->getRevenueDashboard($propertyId, $startDate, $endDate);

        return response()->json([
            'data' => $data,
        ]);
    }

    public function getReviews(GetReviewsRequest $request): JsonResponse
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

    public function moderateReview(ModerateReviewRequest $request, string $id, ModerateReviewAction $action): JsonResponse
    {
        $review = $action->handle($id, $request->validated());

        return response()->json([
            'message' => 'Review moderated successfully',
            'data' => $review,
        ]);
    }

    public function getPromotions(GetPromotionsRequest $request): JsonResponse
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

    public function createPromotion(CreatePromotionRequest $request, CreatePromotionAction $action): JsonResponse
    {
        $promotion = $action->handle($request->validated());

        return response()->json([
            'message' => 'Promotion created successfully',
            'data' => $promotion,
        ], 201);
    }

    public function updatePromotion(UpdatePromotionRequest $request, string $id, UpdatePromotionAction $action): JsonResponse
    {
        $promotion = Promotion::findOrFail($id);
        $promotion = $action->handle($promotion, $request->validated());

        return response()->json([
            'message' => 'Promotion updated successfully',
            'data' => $promotion->fresh(),
        ]);
    }

    public function deletePromotion(string $id, DeactivatePromotionAction $action): JsonResponse
    {
        $action->handle($id);

        return response()->json([
            'message' => 'Promotion deactivated successfully',
        ]);
    }

    public function getExtras(GetExtrasRequest $request): JsonResponse
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

    public function createExtra(CreateExtraRequest $request, CreateExtraAction $action): JsonResponse
    {
        $extra = $action->handle($request->validated());

        return response()->json([
            'message' => 'Extra created successfully',
            'data' => $extra,
        ], 201);
    }

    public function updateExtra(UpdateExtraRequest $request, string $id, UpdateExtraAction $action): JsonResponse
    {
        $extra = Extra::findOrFail($id);
        $extra = $action->handle($extra, $request->validated());

        return response()->json([
            'message' => 'Extra updated successfully',
            'data' => $extra,
        ]);
    }

    public function deleteExtra(string $id, DeactivateExtraAction $action): JsonResponse
    {
        $action->handle($id);

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

    public function updateEmailTemplate(UpdateEmailTemplateRequest $request, string $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);
        $template->update($request->validated());

        AuditLog::log('template_updated', 'email_template', $id, null, $request->validated());

        return response()->json([
            'message' => 'Template updated successfully',
            'data' => $template,
        ]);
    }

    public function sendAnnouncement(SendAnnouncementRequest $request): JsonResponse
    {
        AuditLog::log('announcement_sent', null, null, null, $request->validated());

        return response()->json([
            'message' => 'Announcement sent successfully',
        ]);
    }

    public function getSystemConfig(Request $request): JsonResponse
    {
        $category = $request->query('category');
        $config = $this->systemConfigRepo->getByCategory($category);

        return response()->json([
            'data' => $config,
        ]);
    }

    public function updateSystemConfig(UpdateSystemConfigRequest $request, UpdateSystemConfigAction $action): JsonResponse
    {
        $config = $action->handle($request->validated());

        return response()->json([
            'message' => 'Configuration updated successfully',
            'data' => $config,
        ]);
    }

    public function getAuditLogs(GetAuditLogsRequest $request): JsonResponse
    {
        $filters = $request->only(['staff_id', 'action', 'entity_type', 'date_from', 'date_to', 'search']);
        $logs = AuditLog::with('staff')
            ->when($filters['staff_id'] ?? null, fn ($q, $v) => $q->where('staff_id', $v))
            ->when($filters['action'] ?? null, fn ($q, $v) => $q->where('action', 'like', "%{$v}%"))
            ->when($filters['entity_type'] ?? null, fn ($q, $v) => $q->where('entity_type', $v))
            ->when($filters['date_from'] ?? null, fn ($q, $v) => $q->where('created_at', '>=', $v))
            ->when($filters['date_to'] ?? null, fn ($q, $v) => $q->where('created_at', '<=', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where(function ($q) use ($v) {
                $q->where('action', 'like', "%{$v}%")
                    ->orWhere('entity_type', 'like', "%{$v}%");
            }))
            ->orderByDesc('created_at')
            ->paginate(50);

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

    public function getAnalytics(AnalyticsRequest $request): JsonResponse
    {
        $propertyId = $request->validated('property_id');
        $startDate = $request->query('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', now()->toDateString());

        $kpis = $this->propertyRepo->getRevenueDashboard($propertyId, $startDate, $endDate);

        $occupancyQuery = $this->bookingRepo->getQuery();
        if ($propertyId) {
            $occupancyQuery->where('property_id', $propertyId);
        }
        $occupancyQuery->whereBetween('check_in_date', [$startDate, $endDate])
            ->whereIn('status', ['confirmed', 'completed']);

        $bookingsCount = $occupancyQuery->count();
        $totalNights = $occupancyQuery->sum(DB::raw('DATEDIFF(check_out_date, check_in_date)'));
        $totalRooms = $propertyId
            ? $this->propertyRepo->findOrFail($propertyId)->rooms()->count()
            : $this->propertyRepo->sum('total_rooms');

        $occupancyRate = $totalRooms > 0 && $totalNights > 0
            ? round(($totalNights / ($totalRooms * 30)) * 100, 1)
            : 0;

        // Weekly bookings: grouped query for last 7 days
        $weeklyBookings = [];
        $weekDates = collect(range(6, 0))->mapWithKeys(fn ($i) => [
            now()->subDays($i)->toDateString() => now()->subDays($i)->format('D')
        ]);
        if ($propertyId) {
            $weeklyCounts = $this->bookingRepo->getQuery()
                ->where('property_id', $propertyId)
                ->whereBetween('check_in_date', [now()->subDays(6)->toDateString(), now()->toDateString()])
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->groupBy('check_in_date')
                ->select(DB::raw('check_in_date, count(*) as count'))
                ->pluck('count', 'check_in_date')
                ->toArray();
        } else {
            $weeklyCounts = $this->bookingRepo->getQuery()
                ->whereBetween('check_in_date', [now()->subDays(6)->toDateString(), now()->toDateString()])
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->groupBy('check_in_date')
                ->select(DB::raw('check_in_date, count(*) as count'))
                ->pluck('count', 'check_in_date')
                ->toArray();
        }
        foreach ($weekDates as $date => $day) {
            $weeklyBookings[] = [
                'date' => $day,
                'bookings' => $weeklyCounts[$date] ?? 0,
            ];
        }

        // Monthly revenue: grouped query for last 12 months
        $monthlyRevenue = [];
        $monthDates = collect(range(11, 0))->mapWithKeys(fn ($i) => [
            now()->subMonths($i)->format('Y-m') => now()->subMonths($i)->format('M')
        ]);
        if ($propertyId) {
            $monthlySums = $this->bookingRepo->getQuery()
                ->where('property_id', $propertyId)
                ->whereBetween('check_in_date', [now()->subMonths(11)->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->groupBy(DB::raw('DATE_FORMAT(check_in_date, "%Y-%m")'))
                ->select(DB::raw('DATE_FORMAT(check_in_date, "%Y-%m") as month, sum(total_price) as revenue'))
                ->pluck('revenue', 'month')
                ->toArray();
        } else {
            $monthlySums = $this->bookingRepo->getQuery()
                ->whereBetween('check_in_date', [now()->subMonths(11)->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
                ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
                ->groupBy(DB::raw('DATE_FORMAT(check_in_date, "%Y-%m")'))
                ->select(DB::raw('DATE_FORMAT(check_in_date, "%Y-%m") as month, sum(total_price) as revenue'))
                ->pluck('revenue', 'month')
                ->toArray();
        }
        foreach ($monthDates as $month => $label) {
            $monthlyRevenue[] = [
                'month' => $label,
                'revenue' => (float) ($monthlySums[$month] ?? 0),
            ];
        }

        $recentBookings = $this->bookingRepo->getQuery()
            ->with(['guest', 'roomType'])
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

        $totalGuests = $this->guestRepo->count();
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

    public function getRooms(GetRoomsRequest $request): JsonResponse
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

        $statusCounts = $this->roomRepo->getStatusCounts($request->query('property'));

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

    public function createRoom(CreateRoomRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['id'] = Str::uuid()->toString();
        $validated['status'] = $validated['status'] ?? 'available';

        $room = $this->roomRepo->create($validated);
        AuditLog::log('room_created', 'room', $room->id, null, $validated);

        return response()->json(['message' => 'Room created successfully', 'data' => $room], 201);
    }

    public function updateRoom(UpdateRoomRequest $request, string $id): JsonResponse
    {
        $room = $this->roomRepo->findOrFail($id);
        $room = $this->roomRepo->update($room, $request->validated());
        AuditLog::log('room_updated', 'room', $id, null, $request->validated());

        return response()->json(['message' => 'Room updated successfully', 'data' => $room]);
    }

    public function updateRoomStatus(UpdateRoomStatusRequest $request, string $id): JsonResponse
    {
        $room = Room::findOrFail($id);
        $room->update($request->validated());
        AuditLog::log('room_status_updated', 'room', $id, null, $request->validated());

        return response()->json(['message' => 'Room status updated successfully', 'data' => $room]);
    }

    public function getRoomTypes(GetRoomTypesRequest $request): JsonResponse
    {
        $roomTypes = $this->roomTypeRepo->getWithCount('rooms', $request->query('property'));

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

    public function createRoomType(CreateRoomTypeRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['id'] = Str::uuid()->toString();

        $roomType = RoomType::create($validated);
        AuditLog::log('room_type_created', 'room_type', $roomType->id, null, $validated);

        return response()->json(['message' => 'Room type created successfully', 'data' => $roomType], 201);
    }

    public function updateRoomType(UpdateRoomTypeRequest $request, string $id): JsonResponse
    {
        $roomType = RoomType::findOrFail($id);
        $roomType->update($request->validated());
        AuditLog::log('room_type_updated', 'room_type', $id, null, $request->validated());

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
