<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GuestController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $guest = $request->user();

        return response()->json([
            'guest' => $guest->makeHidden(['password_hash']),
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
            'guest' => $guest->makeHidden(['password_hash']),
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

        return response()->json([
            'is_member' => $guest->is_loyalty_member,
            'points' => $guest->loyalty_points,
            'points_value' => $guest->loyalty_points * 0.01,
            'tier' => $this->getLoyaltyTier($guest->loyalty_points),
            'points_to_next_tier' => $this->getPointsToNextTier($guest->loyalty_points),
            'available_rewards' => $this->getAvailableRewards($guest->loyalty_points),
        ]);
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
        ]);
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
