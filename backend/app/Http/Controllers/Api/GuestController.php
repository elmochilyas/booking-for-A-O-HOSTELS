<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GuestResource;
use App\Models\AuditLog;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class GuestController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $guest = $request->user();

        return response()->json([
            'guest' => new GuestResource($guest),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $guest = $request->user();

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest->update($validator->validated());

        return response()->json([
            'message' => 'Profile updated successfully',
            'guest' => new GuestResource($guest),
        ]);
    }

    public function bookings(Request $request): JsonResponse
    {
        $guest = $request->user();

        $query = $booking = Booking::where('guest_id', $guest->id)
            ->with(['property', 'roomType']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('check_in_date', 'desc')->get();

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function loyalty(Request $request): JsonResponse
    {
        $guest = $request->user();

        if (! $guest->is_loyalty_member) {
            return response()->json([
                'is_member' => false,
                'points' => 0,
                'tier' => 'bronze',
                'tierName' => 'Bronze',
                'pointsToNextTier' => 2000,
                'lifetimePoints' => 0,
                'memberSince' => null,
                'benefits' => [],
                'history' => [],
                'available_rewards' => [],
            ]);
        }

        $tier = $this->getLoyaltyTier($guest->loyalty_points);
        $tierName = $tier;
        $benefits = $this->getLoyaltyBenefits($tier);

        return response()->json([
            'is_member' => true,
            'points' => $guest->loyalty_points,
            'tier' => strtolower($tier),
            'tierName' => $tierName,
            'pointsToNextTier' => $this->getPointsToNextTier($guest->loyalty_points),
            'lifetimePoints' => $guest->loyalty_points,
            'memberSince' => $guest->created_at?->toDateString(),
            'benefits' => $benefits,
            'history' => [],
            'available_rewards' => $this->getAvailableRewards($guest->loyalty_points),
        ]);
    }

    private function getLoyaltyBenefits(string $tier): array
    {
        $allBenefits = [
            [
                'id' => 'bronze_1',
                'name' => '5% off all bookings',
                'description' => 'Get 5% discount on every booking',
                'requiredTier' => 'bronze',
                'discount' => 5,
                'active' => true,
            ],
            [
                'id' => 'bronze_2',
                'name' => 'Member-only deals',
                'description' => 'Access to exclusive member pricing',
                'requiredTier' => 'bronze',
                'active' => true,
            ],
            [
                'id' => 'silver_1',
                'name' => '10% off all bookings',
                'description' => 'Get 10% discount on every booking',
                'requiredTier' => 'silver',
                'discount' => 10,
                'active' => true,
            ],
            [
                'id' => 'silver_2',
                'name' => 'Early check-in',
                'description' => 'Request early check-in (subject to availability)',
                'requiredTier' => 'silver',
                'active' => true,
            ],
            [
                'id' => 'gold_1',
                'name' => '15% off all bookings',
                'description' => 'Get 15% discount on every booking',
                'requiredTier' => 'gold',
                'discount' => 15,
                'active' => true,
            ],
            [
                'id' => 'gold_2',
                'name' => 'Free room upgrades',
                'description' => 'Subject to availability',
                'requiredTier' => 'gold',
                'active' => true,
            ],
        ];

        $tierOrder = ['bronze' => 0, 'silver' => 1, 'gold' => 2];
        $userTierIndex = $tierOrder[strtolower($tier)] ?? 0;

        return array_filter($allBenefits, function ($benefit) use ($userTierIndex, $tierOrder) {
            $benefitTierIndex = $tierOrder[$benefit['requiredTier']] ?? 0;

            return $benefitTierIndex <= $userTierIndex;
        });
    }

    public function joinLoyalty(Request $request): JsonResponse
    {
        $guest = $request->user();

        if ($guest->is_loyalty_member) {
            return response()->json(['error' => 'Already a member'], 400);
        }

        $guest->update(['is_loyalty_member' => true]);

        return response()->json([
            'message' => 'Welcome to A&O Club! You now get 25% off all bookings.',
            'is_member' => true,
            'discount' => '25%',
            'guest' => new GuestResource($guest->fresh()),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $guest = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (! Hash::check($request->current_password, $guest->password_hash)) {
            return response()->json(['error' => 'Current password is incorrect'], 401);
        }

        $guest->update(['password_hash' => Hash::make($request->new_password)]);

        AuditLog::log('password_changed', 'guest', $guest->id, null, null);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function updateNotifications(Request $request): JsonResponse
    {
        $guest = $request->user();

        $validator = Validator::make($request->all(), [
            'notification_email' => 'sometimes|boolean',
            'notification_sms' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest->update($validator->validated());

        return response()->json([
            'message' => 'Notification preferences updated',
            'notifications' => [
                'notification_email' => $guest->notification_email,
                'notification_sms' => $guest->notification_sms,
            ],
        ]);
    }

    public function redeemLoyaltyPoints(Request $request): JsonResponse
    {
        $guest = $request->user();

        if (! $guest->is_loyalty_member) {
            return response()->json(['error' => 'Not a loyalty member'], 400);
        }

        $validator = Validator::make($request->all(), [
            'points' => 'required|integer|min:100',
            'description' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $points = $request->points;

        if ($points > $guest->loyalty_points) {
            return response()->json(['error' => 'Insufficient points'], 400);
        }

        $validRedemptions = [
            1000 => ['type' => 'discount', 'amount' => 10, 'name' => '€10 discount'],
            2500 => ['type' => 'discount', 'amount' => 25, 'name' => '€25 discount'],
            5000 => ['type' => 'free_night', 'name' => 'Free night (base)'],
        ];

        if (! isset($validRedemptions[$points])) {
            return response()->json(['error' => 'Invalid redemption amount'], 400);
        }

        $guest->decrement('loyalty_points', $points);
        $reward = $validRedemptions[$points];

        AuditLog::log('loyalty_redeemed', 'guest', $guest->id, null, [
            'points_redeemed' => $points,
            'reward' => $reward,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Points redeemed successfully',
            'reward' => $reward,
            'remaining_points' => $guest->fresh()->loyalty_points,
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $guest = $request->user();

        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (! Hash::check($request->password, $guest->password_hash)) {
            return response()->json(['error' => 'Password is incorrect'], 401);
        }

        AuditLog::log('account_deleted', 'guest', $guest->id, null, [
            'email' => $guest->email,
            'deleted_at' => now()->toIso8601String(),
        ]);

        $guest->bookings()->delete();
        $guest->reviews()->delete();
        $guest->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }

    private function getLoyaltyTier(int $points): string
    {
        if ($points >= 5000) {
            return 'Gold';
        }
        if ($points >= 2000) {
            return 'Silver';
        }

        return 'Bronze';
    }

    private function getPointsToNextTier(int $points): ?int
    {
        if ($points < 2000) {
            return 2000 - $points;
        }
        if ($points < 5000) {
            return 5000 - $points;
        }

        return null;
    }

    private function getAvailableRewards(int $points): array
    {
        $rewards = [
            ['id' => 1, 'name' => '€10 discount', 'points' => 1000, 'discount' => 10],
            ['id' => 2, 'name' => '€25 discount', 'points' => 2500, 'discount' => 25],
            ['id' => 3, 'name' => 'Free night (base)', 'points' => 5000, 'discount' => 'full'],
        ];

        return array_filter($rewards, fn ($r) => $points >= $r['points']);
    }
}
