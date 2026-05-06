<?php

namespace App\Modules\Staff\Controllers;

use App\Actions\Staff\CreateStaff;
use App\Actions\Staff\DeleteStaff;
use App\Actions\Staff\GetStaffDashboard;
use App\Actions\Staff\ListStaff;
use App\Actions\Staff\ToggleActive;
use App\Actions\Staff\UpdateStaff;
use App\DTO\CreateStaffDTO;
use App\DTO\UpdateStaffDTO;
use App\Http\Requests\Modules\Staff\ByPropertyRequest;
use App\Http\Requests\Modules\Staff\CreateStaffRequest;
use App\Http\Requests\Modules\Staff\GetStaffRequest;
use App\Http\Requests\Modules\Staff\ToggleActiveRequest;
use App\Http\Requests\Modules\Staff\UpdateStaffRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class StaffController extends Controller
{
    public function index(GetStaffRequest $request, ListStaff $action): JsonResponse
    {
        $propertyId = $request->query('property_id');
        $staff = $action->handle($propertyId);

        return response()->json(['data' => $staff]);
    }

    public function store(CreateStaffRequest $request, CreateStaff $action): JsonResponse
    {
        $staff = $action->handle(CreateStaffDTO::fromRequest($request));

        return response()->json([
            'data' => $staff,
            'message' => 'Staff created successfully',
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $staff = app('App\Contracts\Repositories\StaffRepositoryInterface')->findOrFail($id);

        return response()->json(['data' => $staff]);
    }

    public function update(UpdateStaffRequest $request, string $id, UpdateStaff $action): JsonResponse
    {
        $staff = app('App\Contracts\Repositories\StaffRepositoryInterface')->findOrFail($id);
        $staff = $action->handle($staff, UpdateStaffDTO::fromRequest($request));

        return response()->json([
            'data' => $staff,
            'message' => 'Staff updated successfully',
        ]);
    }

    public function destroy(string $id, DeleteStaff $action): JsonResponse
    {
        $staff = app('App\Contracts\Repositories\StaffRepositoryInterface')->findOrFail($id);
        $action->handle($staff);

        return response()->json(['message' => 'Staff deleted successfully']);
    }

    public function toggleActive(string $id, ToggleActiveRequest $request, ToggleActive $action): JsonResponse
    {
        $staff = app('App\Contracts\Repositories\StaffRepositoryInterface')->findOrFail($id);
        $staff = $action->handle($staff);

        return response()->json([
            'data' => $staff,
            'message' => $staff->is_active ? 'Staff activated' : 'Staff deactivated',
        ]);
    }

    public function byProperty(ByPropertyRequest $request, ListStaff $action): JsonResponse
    {
        $propertyId = $request->validated('property_id');
        $staff = $action->handle($propertyId);

        return response()->json(['data' => $staff]);
    }

    public function dashboard(string $id, GetStaffDashboard $action): JsonResponse
    {
        $staff = app('App\Contracts\Repositories\StaffRepositoryInterface')->findOrFail($id);
        $dashboard = $action->handle($staff);

        return response()->json(['data' => $dashboard]);
    }
}
