<?php

namespace App\Http\Controllers\Api;

use App\Actions\Guests\ChangeGuestPassword;
use App\Actions\Guests\DeleteGuestAccount;
use App\Actions\Guests\GetGuestBookings;
use App\Actions\Guests\GetGuestProfile;
use App\Actions\Guests\GetLoyaltyStatus;
use App\Actions\Guests\JoinLoyaltyProgram;
use App\Actions\Guests\RedeemLoyaltyPoints;
use App\Actions\Guests\UpdateGuestProfile;
use App\Actions\Guests\UpdateNotificationPreferences;
use App\DTO\ChangePasswordDTO;
use App\DTO\RedeemLoyaltyPointsDTO;
use App\DTO\UpdateGuestProfileDTO;
use App\DTO\UpdateNotificationsDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Guest\ChangePasswordRequest;
use App\Http\Requests\Api\Guest\DeleteAccountRequest;
use App\Http\Requests\Api\Guest\RedeemLoyaltyPointsRequest;
use App\Http\Requests\Api\Guest\UpdateNotificationsRequest;
use App\Http\Requests\Api\Guest\UpdateProfileRequest;
use App\Http\Resources\GuestResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
class GuestController extends Controller
{
    public function __construct(
        private GetGuestProfile $getGuestProfile,
        private UpdateGuestProfile $updateGuestProfile,
        private GetGuestBookings $getGuestBookings,
        private GetLoyaltyStatus $getLoyaltyStatus,
        private JoinLoyaltyProgram $joinLoyaltyProgram,
        private ChangeGuestPassword $changeGuestPassword,
        private UpdateNotificationPreferences $updateNotificationPreferences,
        private RedeemLoyaltyPoints $redeemLoyaltyPoints,
        private DeleteGuestAccount $deleteGuestAccount,
    ) {}

    public function profile(): JsonResponse
    {
        $guest = $this->getGuestProfile->handle(request()->user());

        return response()->json([
            'guest' => new GuestResource($guest),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $guest = request()->user();
        $dto = UpdateGuestProfileDTO::fromRequest($request);
        $updatedGuest = $this->updateGuestProfile->handle($guest, $dto);

        return response()->json([
            'message' => 'Profile updated successfully',
            'guest' => new GuestResource($updatedGuest),
        ]);
    }

    public function bookings(): JsonResponse
    {
        $guest = request()->user();
        $bookings = $this->getGuestBookings->handle(
            $guest->id,
            request()->all()
        );

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

    public function loyalty(): JsonResponse
    {
        $guest = request()->user();
        $status = $this->getLoyaltyStatus->handle($guest);

        return response()->json($status);
    }

    public function joinLoyalty(): JsonResponse
    {
        $guest = request()->user();

        try {
            $updatedGuest = $this->joinLoyaltyProgram->handle($guest);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        return response()->json([
            'message' => 'Welcome to A&O Club! You now get 25% off all bookings.',
            'is_member' => true,
            'discount' => '25%',
            'guest' => new GuestResource($updatedGuest),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $guest = request()->user();

        try {
            $this->changeGuestPassword->handle(
                $guest,
                ChangePasswordDTO::fromRequest($request)
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function updateNotifications(UpdateNotificationsRequest $request): JsonResponse
    {
        $guest = request()->user();
        $dto = UpdateNotificationsDTO::fromRequest($request);
        $updatedGuest = $this->updateNotificationPreferences->handle($guest, $dto);

        return response()->json([
            'message' => 'Notification preferences updated',
            'notifications' => [
                'notification_email' => $updatedGuest->notification_email,
                'notification_sms' => $updatedGuest->notification_sms,
            ],
        ]);
    }

    public function redeemLoyaltyPoints(RedeemLoyaltyPointsRequest $request): JsonResponse
    {
        $guest = request()->user();

        try {
            $result = $this->redeemLoyaltyPoints->handle(
                $guest,
                RedeemLoyaltyPointsDTO::fromRequest($request)
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }

        return response()->json([
            'message' => 'Points redeemed successfully',
            'reward' => $result['reward'],
            'remaining_points' => $result['remaining_points'],
        ]);
    }

    public function deleteAccount(DeleteAccountRequest $request): JsonResponse
    {
        $guest = request()->user();

        try {
            $this->deleteGuestAccount->handle(
                $guest,
                $request->validated('password')
            );
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }

        return response()->json(['message' => 'Account deleted successfully']);
    }
}
