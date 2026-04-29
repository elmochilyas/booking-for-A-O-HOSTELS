<?php

namespace App\Modules\Staff\Controllers;

use App\Models\Staff;
use App\Modules\Staff\Services\StaffService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class StaffController
{
    private StaffService $staffService;

    public function __construct(StaffService $staffService)
    {
        $this->staffService = $staffService;
    }

    public function index(Request $request): JsonResponse
    {
        $propertyId = $request->query('property_id');
        $staff = $this->staffService->getAllStaff($propertyId);

        return response()->json(['data' => $staff]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:staff,email',
            'password' => 'required|string|min:8',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'role' => 'required|in:reception,manager,admin,superadmin',
            'property_id' => 'nullable|uuid|exists:properties,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $staff = $this->staffService->createStaff($request->all());

        return response()->json(['data' => $staff, 'message' => 'Staff created successfully'], 201);
    }

    public function show(string $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        return response()->json(['data' => $staff]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'sometimes|email|unique:staff,email,' . $id,
            'password' => 'sometimes|string|min:8',
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'role' => 'sometimes|in:reception,manager,admin,superadmin',
            'property_id' => 'nullable|uuid|exists:properties,id',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $staff = $this->staffService->updateStaff($staff, $request->all());

        return response()->json(['data' => $staff, 'message' => 'Staff updated successfully']);
    }

    public function destroy(string $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        $this->staffService->deleteStaff($staff);

        return response()->json(['message' => 'Staff deleted successfully']);
    }

    public function toggleActive(string $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (!$staff) {
            return response()->json(['message' => 'Staff not found'], 404);
        }

        $staff = $this->staffService->toggleActive($staff);

        return response()->json([
            'data' => $staff,
            'message' => $staff->is_active ? 'Staff activated' : 'Staff deactivated'
        ]);
    }

    public function byProperty(string $propertyId): JsonResponse
    {
        $staff = $this->staffService->getStaffByProperty($propertyId);

        return response()->json(['data' => $staff]);
    }
}