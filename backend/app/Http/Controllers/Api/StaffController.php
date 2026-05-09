<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Staff\CreateStaff;
use App\Actions\Staff\DeleteStaff;
use App\Actions\Staff\GetGuestDetails;
use App\Actions\Staff\GetStaffDashboard;
use App\Actions\Staff\GetTodayCheckIns;
use App\Actions\Staff\GetTodayCheckOuts;
use App\Actions\Staff\ListStaff;
use App\Actions\Staff\LoginStaff;
use App\Actions\Staff\LogoutStaff;
use App\Actions\Staff\UpdateStaff;
use App\DTO\CreateStaffDTO;
use App\DTO\LoginStaffDTO;
use App\DTO\UpdateStaffDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Staff\CreateStaffRequest;
use App\Http\Requests\Api\Staff\ListStaffRequest;
use App\Http\Requests\Api\Staff\LoginStaffRequest;
use App\Http\Requests\Api\Staff\UpdateStaffRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
class StaffController extends Controller
{
    public function __construct(
        private ListStaff $listStaff,
        private CreateStaff $createStaff,
        private UpdateStaff $updateStaff,
        private DeleteStaff $deleteStaff,
        private LoginStaff $loginStaff,
        private LogoutStaff $logoutStaff,
        private GetStaffDashboard $getStaffDashboard,
        private GetTodayCheckIns $getTodayCheckIns,
        private GetTodayCheckOuts $getTodayCheckOuts,
        private GetGuestDetails $getGuestDetails,
    ) {}

    public function index(ListStaffRequest $request): JsonResponse
    {
        $staff = $this->listStaff->handle($request->validated());

        return response()->json(['staff' => $staff]);
    }

    public function store(CreateStaffRequest $request): JsonResponse
    {
        $dto = CreateStaffDTO::fromRequest($request);
        $staff = $this->createStaff->handle($dto);

        return response()->json([
            'message' => 'Staff created successfully',
            'staff' => $staff,
        ], 201);
    }

    #[Middleware('role:superadmin,admin,property_admin')]
    public function update(UpdateStaffRequest $request, string $id): JsonResponse
    {
        $dto = UpdateStaffDTO::fromRequest($request);
        $updatedStaff = $this->updateStaff->handle($id, $dto);

        return response()->json([
            'message' => 'Staff updated successfully',
            'staff' => $updatedStaff,
        ]);
    }

    #[Middleware('role:superadmin,admin,property_admin')]
    public function destroy(string $id): JsonResponse
    {
        $this->deleteStaff->handle($id);

        return response()->json(['message' => 'Staff deactivated successfully']);
    }

    public function login(LoginStaffRequest $request): JsonResponse
    {
        try {
            $dto = LoginStaffDTO::fromRequest($request);
            $result = $this->loginStaff->handle($dto);

            return response()->json([
                'message' => 'Login successful',
                'staff' => $result['staff'],
                'access_token' => $result['access_token'],
                'token_type' => $result['token_type'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 401);
        }
    }

    public function logout(): JsonResponse
    {
        $this->logoutStaff->handle(request()->bearerToken());

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function dashboard(): JsonResponse
    {
        $staff = request()->user();
        $dashboard = $this->getStaffDashboard->handle($staff);

        return response()->json($dashboard);
    }

    public function todayCheckIns(): JsonResponse
    {
        $staff = request()->user();
        $result = $this->getTodayCheckIns->handle($staff);

        return response()->json($result);
    }

    public function todayCheckOuts(): JsonResponse
    {
        $staff = request()->user();
        $result = $this->getTodayCheckOuts->handle($staff);

        return response()->json($result);
    }

    public function guestDetails(string $id): JsonResponse
    {
        try {
            $result = $this->getGuestDetails->handle($id);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json($result);
    }
}
