<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Booking;
use App\Models\Property;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    public function __construct(
        private JwtService $jwtService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $staff = Staff::where('property_id', $request->property_id ?? null)->get();
        
        return response()->json(['staff' => $staff]);
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

        $data = $validator->validated();
        $data['id'] = Str::uuid()->toString();
        $data['password_hash'] = Hash::make($data['password']);
        unset($data['password']);

        $staff = Staff::create($data);

        return response()->json([
            'message' => 'Staff created successfully',
            'staff' => $staff,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $staff = Staff::find($id);
        
        if (!$staff) {
            return response()->json(['error' => 'Staff not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:100',
            'last_name' => 'sometimes|string|max:100',
            'role' => 'sometimes|in:reception,manager,admin,superadmin',
            'property_id' => 'nullable|uuid|exists:properties,id',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        if (isset($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
            unset($data['password']);
        }

        $staff->update($data);

        return response()->json([
            'message' => 'Staff updated successfully',
            'staff' => $staff,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $staff = Staff::find($id);
        
        if (!$staff) {
            return response()->json(['error' => 'Staff not found'], 404);
        }

        $staff->update(['is_active' => false]);

        return response()->json(['message' => 'Staff deactivated successfully']);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $staff = Staff::where('email', $request->email)->first();

        if (!$staff || !Hash::check($request->password, $staff->password_hash)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        if (!$staff->is_active) {
            return response()->json(['error' => 'Account is deactivated'], 403);
        }

        $token = $this->jwtService->generateStaffToken($staff);

        return response()->json([
            'message' => 'Login successful',
            'staff' => $staff->makeHidden(['password_hash']),
            'access_token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $staff = $request->user();
        
        $propertyId = $staff->property_id;
        $today = now()->toDateString();
        $tomorrow = now()->addDay()->toDateString();

        $checkInsToday = Booking::where('property_id', $propertyId)
            ->where('status', 'confirmed')
            ->where('check_in_date', $today)
            ->count();

        $checkOutsToday = Booking::where('property_id', $propertyId)
            ->where('status', 'checked_in')
            ->where('check_out_date', $today)
            ->count();

        $inHouse = Booking::where('property_id', $propertyId)
            ->where('status', 'checked_in')
            ->count();

        $pendingBookings = Booking::where('property_id', $propertyId)
            ->where('status', 'pending')
            ->count();

        $todaysRevenue = Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'checked_in', 'completed'])
            ->where('check_in_date', $today)
            ->sum('total_price');

        return response()->json([
            'check_ins_today' => $checkInsToday,
            'check_outs_today' => $checkOutsToday,
            'in_house' => $inHouse,
            'pending_bookings' => $pendingBookings,
            'todays_revenue' => $todaysRevenue,
        ]);
    }

    public function todayCheckIns(Request $request): JsonResponse
    {
        $staff = $request->user();
        $today = now()->toDateString();

        $checkIns = Booking::where('property_id', $staff->property_id)
            ->where('status', 'confirmed')
            ->where('check_in_date', $today)
            ->with(['guest'])
            ->get();

        return response()->json([
            'check_ins' => $checkIns,
            'count' => $checkIns->count(),
        ]);
    }

    public function todayCheckOuts(Request $request): JsonResponse
    {
        $staff = $request->user();
        $today = now()->toDateString();

        $checkOuts = Booking::where('property_id', $staff->property_id)
            ->where('status', 'checked_in')
            ->where('check_out_date', $today)
            ->with(['guest'])
            ->get();

        return response()->json([
            'check_outs' => $checkOuts,
            'count' => $checkOuts->count(),
        ]);
    }

    public function guestDetails(Request $request, string $id): JsonResponse
    {
        $booking = Booking::with(['guest', 'property', 'roomType', 'payments'])
            ->find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json([
            'booking' => $booking,
            'guest' => $booking->guest,
        ]);
    }
}