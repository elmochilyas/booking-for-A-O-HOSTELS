<?php

namespace App\Modules\Admin\Services;

use App\Models\AdminPermission;
use App\Models\AdminRole;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\Guest;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Staff;
use App\Models\SystemConfig;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminManagementService
{
    private const PERMISSIONS = [
        'admins' => [
            'manage_admins' => 'Manage admin accounts',
            'manage_roles' => 'Manage admin roles',
            'view_audit_log' => 'View audit logs',
            'force_logout' => 'Force logout sessions',
        ],
        'properties' => [
            'manage_properties' => 'Manage properties',
            'view_property_kpis' => 'View property KPIs',
            'assign_property_admin' => 'Assign property admins',
        ],
        'rooms' => [
            'manage_rooms' => 'Manage rooms & inventory',
            'manage_pricing' => 'Manage pricing',
            'bulk_update_availability' => 'Bulk update availability',
        ],
        'bookings' => [
            'view_all_bookings' => 'View all bookings',
            'manage_bookings' => 'Manage bookings',
            'issue_refunds' => 'Issue refunds',
            'export_bookings' => 'Export bookings',
        ],
        'guests' => [
            'view_guests' => 'View guest directory',
            'manage_guests' => 'Manage guests',
            'ban_guests' => 'Ban guests',
            'merge_guests' => 'Merge duplicate accounts',
            'gdpr_export' => 'GDPR data export',
            'gdpr_delete' => 'GDPR data deletion',
        ],
        'payments' => [
            'view_payments' => 'View payment logs',
            'manage_refunds' => 'Manage refunds',
            'manage_stripe' => 'Manage Stripe config',
            'view_financials' => 'View financial reports',
        ],
        'reviews' => [
            'view_reviews' => 'View reviews',
            'moderate_reviews' => 'Moderate reviews',
            'reply_reviews' => 'Reply to reviews',
        ],
        'promotions' => [
            'manage_promotions' => 'Manage promotions',
            'manage_pricing_rules' => 'Manage pricing rules',
        ],
        'extras' => [
            'manage_extras' => 'Manage extras catalog',
        ],
        'notifications' => [
            'send_announcements' => 'Send announcements',
            'manage_templates' => 'Manage templates',
            'manage_notification_settings' => 'Manage notification settings',
        ],
        'system' => [
            'manage_system_config' => 'Manage system config',
            'manage_legal_pages' => 'Manage legal pages',
            'toggle_maintenance' => 'Toggle maintenance mode',
        ],
        'analytics' => [
            'view_analytics' => 'View analytics',
            'export_reports' => 'Export reports',
        ],
    ];

    public static function seedPermissions(): void
    {
        foreach (self::PERMISSIONS as $module => $permissions) {
            foreach ($permissions as $slug => $description) {
                AdminPermission::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name' => Str::headline($slug),
                        'module' => $module,
                        'description' => $description,
                    ]
                );
            }
        }
    }

    public static function seedRoles(): void
    {
        $roles = [
            'super_admin' => [
                'name' => 'Super Admin',
                'level' => 100,
                'description' => 'Full system access',
                'is_system' => true,
                'permissions' => array_keys(array_merge(...array_values(self::PERMISSIONS))),
            ],
            'regional_admin' => [
                'name' => 'Regional Admin',
                'level' => 75,
                'description' => 'Manage multiple properties',
                'is_system' => true,
                'permissions' => [
                    'manage_properties', 'view_property_kpis', 'assign_property_admin',
                    'manage_rooms', 'manage_pricing', 'bulk_update_availability',
                    'view_all_bookings', 'manage_bookings', 'issue_refunds', 'export_bookings',
                    'view_guests', 'manage_guests', 'view_guests',
                    'view_payments', 'manage_refunds', 'view_financials',
                    'view_reviews', 'moderate_reviews', 'reply_reviews',
                    'manage_promotions', 'manage_pricing_rules',
                    'manage_extras',
                    'send_announcements', 'manage_templates',
                    'view_analytics', 'export_reports',
                ],
            ],
            'property_admin' => [
                'name' => 'Property Admin',
                'level' => 50,
                'description' => 'Manage single property',
                'is_system' => true,
                'permissions' => [
                    'view_property_kpis',
                    'manage_rooms', 'manage_pricing', 'bulk_update_availability',
                    'view_all_bookings', 'manage_bookings', 'issue_refunds', 'export_bookings',
                    'view_guests', 'manage_guests',
                    'view_payments', 'view_financials',
                    'view_reviews', 'moderate_reviews', 'reply_reviews',
                    'manage_promotions',
                    'manage_extras',
                    'view_analytics', 'export_reports',
                ],
            ],
            'reception' => [
                'name' => 'Reception Staff',
                'level' => 25,
                'description' => 'Front desk operations',
                'is_system' => true,
                'permissions' => [
                    'view_all_bookings',
                    'manage_bookings',
                    'view_guests',
                ],
            ],
            'housekeeping' => [
                'name' => 'Housekeeping',
                'level' => 10,
                'description' => 'Room maintenance',
                'is_system' => true,
                'permissions' => [
                    'manage_rooms',
                ],
            ],
        ];

        foreach ($roles as $slug => $data) {
            AdminRole::updateOrCreate(
                ['slug' => $slug],
                $data
            );
        }
    }

    public function getAllStaff(?array $filters = []): LengthAwarePaginator
    {
        $query = Staff::with(['property', 'adminRole']);

        if (! empty($filters['role'])) {
            $query->where('admin_role_id', $filters['role']);
        }
        if (! empty($filters['property'])) {
            $query->where('property_id', $filters['property']);
        }
        if (! empty($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true');
        }
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['search']}%")
                    ->orWhere('last_name', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate(20);
    }

    public function createStaff(array $data): Staff
    {
        $staff = Staff::create([
            'id' => Str::uuid()->toString(),
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'role' => $data['role'] ?? 'staff',
            'property_id' => $data['property_id'] ?? null,
            'admin_role_id' => $data['admin_role_id'] ?? null,
            'permissions' => $data['permissions'] ?? null,
            'assigned_properties' => $data['assigned_properties'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'two_factor_enabled' => $data['two_factor_enabled'] ?? false,
        ]);

        AuditLog::log('staff_created', 'staff', $staff->id, null, $staff->toArray());

        return $staff;
    }

    public function updateStaff(string $id, array $data): Staff
    {
        $staff = Staff::findOrFail($id);
        $oldData = $staff->toArray();

        $updateData = [];
        if (isset($data['first_name'])) {
            $updateData['first_name'] = $data['first_name'];
        }
        if (isset($data['last_name'])) {
            $updateData['last_name'] = $data['last_name'];
        }
        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }
        if (isset($data['password'])) {
            $updateData['password_hash'] = Hash::make($data['password']);
        }
        if (isset($data['role'])) {
            $updateData['role'] = $data['role'];
        }
        if (isset($data['property_id'])) {
            $updateData['property_id'] = $data['property_id'];
        }
        if (isset($data['admin_role_id'])) {
            $updateData['admin_role_id'] = $data['admin_role_id'];
        }
        if (isset($data['permissions'])) {
            $updateData['permissions'] = $data['permissions'];
        }
        if (isset($data['assigned_properties'])) {
            $updateData['assigned_properties'] = $data['assigned_properties'];
        }
        if (array_key_exists('is_active', $data)) {
            $updateData['is_active'] = $data['is_active'];
        }
        if (array_key_exists('two_factor_enabled', $data)) {
            $updateData['two_factor_enabled'] = $data['two_factor_enabled'];
        }

        $staff->update($updateData);
        $staff->refresh();

        AuditLog::log('staff_updated', 'staff', $staff->id, $oldData, $staff->toArray());

        return $staff;
    }

    public function deactivateStaff(string $id): Staff
    {
        return $this->updateStaff($id, ['is_active' => false]);
    }

    public function forceLogout(string $id): void
    {
        AuditLog::log('force_logout', 'staff', $id);
    }

    public function getStaffById(string $id): Staff
    {
        return Staff::with(['property', 'adminRole'])->findOrFail($id);
    }

    public function getAllProperties(?array $filters = []): LengthAwarePaginator
    {
        $query = Property::query();

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('location', 'like', "%{$filters['search']}%");
            });
        }
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true');
        }

        return $query->orderBy('name')->paginate(20);
    }

    public function createProperty(array $data): Property
    {
        $property = Property::create(array_merge([
            'id' => Str::uuid()->toString(),
        ], $data));

        AuditLog::log('property_created', 'property', $property->id, null, $property->toArray());

        return $property;
    }

    public function updateProperty(string $id, array $data): Property
    {
        $property = Property::findOrFail($id);
        $oldData = $property->toArray();

        $property->update($data);
        $property->refresh();

        AuditLog::log('property_updated', 'property', $property->id, $oldData, $property->toArray());

        return $property;
    }

    public function archiveProperty(string $id): Property
    {
        return $this->updateProperty($id, ['is_active' => false]);
    }

    public function getPropertyKpis(string $propertyId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = Booking::where('property_id', $propertyId);

        if ($startDate) {
            $query->where('check_in_date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('check_in_date', '<=', $endDate);
        }

        $totalBookings = $query->count();
        $confirmedBookings = $query->where('status', 'confirmed')->count();

        $property = Property::findOrFail($propertyId);
        $totalRooms = $property->rooms()->count();

        $nights = $query->sum(\DB::raw('DATEDIFF(check_out_date, check_in_date)'));
        $occupiedNights = $confirmedBookings * max(1, $nights / max(1, $totalBookings));

        $occupancyRate = $totalRooms > 0 ? ($occupiedNights / max(1, $nights)) * 100 : 0;

        $revenue = Payment::whereHas('booking', function ($q) use ($propertyId) {
            $q->where('property_id', $propertyId);
        })->where('status', 'success')->sum('amount');

        return [
            'occupancy_rate' => round($occupancyRate, 1),
            'total_bookings' => $totalBookings,
            'confirmed_bookings' => $confirmedBookings,
            'total_revenue' => $revenue,
            'adr' => $totalBookings > 0 ? round($revenue / $totalBookings, 2) : 0,
            'revpar' => $totalRooms > 0 ? round($revenue / $totalRooms, 2) : 0,
        ];
    }

    public function getAllBookings(?array $filters = []): LengthAwarePaginator
    {
        $query = Booking::with(['guest', 'property', 'roomType']);

        if (! empty($filters['property'])) {
            $query->where('property_id', $filters['property']);
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['date_from'])) {
            $query->where('check_in_date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->where('check_in_date', '<=', $filters['date_to']);
        }
        if (! empty($filters['search'])) {
            $query->whereHas('guest', function ($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['search']}%")
                    ->orWhere('last_name', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate(20);
    }

    public function updateBooking(string $id, array $data): Booking
    {
        $booking = Booking::findOrFail($id);
        $oldData = $booking->toArray();

        $booking->update($data);
        $booking->refresh();

        AuditLog::log('booking_updated', 'booking', $booking->id, $oldData, $booking->toArray());

        return $booking;
    }

    public function cancelBooking(string $id, ?string $reason = null): Booking
    {
        return $this->updateBooking($id, [
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);
    }

    public function processRefund(string $bookingId, ?float $amount = null, ?string $reason = null): Payment
    {
        $booking = Booking::findOrFail($bookingId);
        $payment = $booking->payments()->where('status', 'success')->firstOrFail();

        $refundAmount = $amount ?? $payment->amount;

        $refund = Payment::create([
            'id' => Str::uuid()->toString(),
            'booking_id' => $bookingId,
            'amount' => -$refundAmount,
            'payment_method' => $payment->payment_method,
            'status' => 'refunded',
            'stripe_payment_id' => 'refund_'.Str::uuid()->toString(),
        ]);

        AuditLog::log('refund_issued', 'payment', $refund->id, null, [
            'booking_id' => $bookingId,
            'amount' => $refundAmount,
            'reason' => $reason,
        ]);

        return $refund;
    }

    public function getAllGuests(?array $filters = []): LengthAwarePaginator
    {
        $query = Guest::query();

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('first_name', 'like', "%{$filters['search']}%")
                    ->orWhere('last_name', 'like', "%{$filters['search']}%")
                    ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }
        if (! empty($filters['is_loyalty_member'])) {
            $query->where('is_loyalty_member', $filters['is_loyalty_member'] === 'true');
        }
        if (! empty($filters['is_banned'])) {
            $query->where('is_banned', $filters['is_banned'] === 'true');
        }

        return $query->orderByDesc('created_at')->paginate(20);
    }

    public function updateGuest(string $id, array $data): Guest
    {
        $guest = Guest::findOrFail($id);
        $oldData = $guest->toArray();

        $guest->update(array_filter($data, fn ($v) => $v !== null));
        $guest->refresh();

        AuditLog::log('guest_updated', 'guest', $guest->id, $oldData, $guest->toArray());

        return $guest;
    }

    public function banGuest(string $id, ?string $reason = null): Guest
    {
        return $this->updateGuest($id, [
            'is_banned' => true,
            'ban_reason' => $reason,
        ]);
    }

    public function unbanGuest(string $id): Guest
    {
        return $this->updateGuest($id, [
            'is_banned' => false,
            'ban_reason' => null,
        ]);
    }

    public function mergeGuests(string $sourceId, string $targetId): Guest
    {
        $source = Guest::findOrFail($sourceId);
        $target = Guest::findOrFail($targetId);

        Booking::where('guest_id', $sourceId)->update(['guest_id' => $targetId]);
        Review::where('guest_id', $sourceId)->update(['guest_id' => $targetId]);

        AuditLog::log('guests_merged', 'guest', $targetId, [
            'source_id' => $sourceId,
            'target_id' => $targetId,
        ]);

        $source->delete();

        return $target;
    }

    public function exportGuestData(string $id): array
    {
        $guest = Guest::findOrFail($id);

        return [
            'profile' => $guest->toArray(),
            'bookings' => $guest->bookings()->get()->toArray(),
            'reviews' => $guest->reviews()->get()->toArray(),
            'payments' => $guest->payments()->get()->toArray(),
            'loyalty_points' => $guest->loyaltyPoints()->get()->toArray(),
            'exported_at' => now()->toIso8601String(),
        ];
    }

    public function deleteGuestData(string $id): void
    {
        $guest = Guest::findOrFail($id);

        AuditLog::log('gdpr_delete', 'guest', $id, null, [
            'deleted_at' => now()->toIso8601String(),
            'email' => $guest->email,
        ]);

        $guest->delete();
    }

    public function getAllPayments(?array $filters = []): LengthAwarePaginator
    {
        $query = Payment::with(['booking', 'booking.guest']);

        if (! empty($filters['property'])) {
            $query->whereHas('booking', fn ($q) => $q->where('property_id', $filters['property']));
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->orderByDesc('created_at')->paginate(20);
    }

    public function getRevenueDashboard(?string $propertyId = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = Payment::where('status', 'success');

        if ($propertyId) {
            $query->whereHas('booking', fn ($q) => $q->where('property_id', $propertyId));
        }
        if ($startDate) {
            $query->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('created_at', '<=', $endDate);
        }

        $dailyRevenue = Payment::selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->whereBetween('created_at', [$startDate ?? now()->startOfMonth(), $endDate ?? now()])
            ->groupBy('date')
            ->get();

        return [
            'total_revenue' => $query->sum('amount'),
            'daily_revenue' => $dailyRevenue,
            'transactions_count' => $query->count(),
            'average_transaction' => $query->avg('amount'),
        ];
    }

    public function getAuditLogs(?array $filters = []): LengthAwarePaginator
    {
        $query = AuditLog::with('staff');

        if (! empty($filters['staff_id'])) {
            $query->where('staff_id', $filters['staff_id']);
        }
        if (! empty($filters['action'])) {
            $query->where('action', 'like', "%{$filters['action']}%");
        }
        if (! empty($filters['entity_type'])) {
            $query->where('entity_type', $filters['entity_type']);
        }
        if (! empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('action', 'like', "%{$filters['search']}%")
                    ->orWhere('entity_type', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate(50);
    }

    public function getSystemConfig(?string $category = null): array
    {
        $query = SystemConfig::query();

        if ($category) {
            $query->where('category', $category);
        }

        return $query->get()->map(fn ($c) => [
            'key' => $c->key,
            'value' => $c->is_encrypted ? '********' : $c->value,
            'type' => $c->type,
            'category' => $c->category,
            'description' => $c->description,
            'is_encrypted' => $c->is_encrypted,
        ])->toArray();
    }

    public function setSystemConfig(string $key, mixed $value, string $type = 'string', string $category = 'general', ?string $description = null, bool $isEncrypted = false): SystemConfig
    {
        $oldConfig = SystemConfig::where('key', $key)->first();
        $oldValue = $oldConfig?->value;

        $config = SystemConfig::set($key, $value, $type, $category, $description, $isEncrypted);

        AuditLog::log('system_config_updated', 'system_config', $key, [
            'old_value' => $oldValue,
        ], [
            'new_value' => $isEncrypted ? '********' : $value,
        ]);

        return $config;
    }
}
