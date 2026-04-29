<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\RoomType;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RoomController extends Controller
{
    public function propertyRooms(string $propertyId): JsonResponse
    {
        $rooms = Room::where('property_id', $propertyId)
            ->with(['roomType'])
            ->get();

        return response()->json([
            'rooms' => $rooms,
        ]);
    }

    public function propertyRoomTypes(string $propertyId): JsonResponse
    {
        $roomTypes = RoomType::where('property_id', $propertyId)
            ->with(['rooms'])
            ->get();

        return response()->json([
            'room_types' => $roomTypes,
        ]);
    }

    public function availability(Request $request, string $propertyId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $checkIn = $data['check_in'];
        $checkOut = $data['check_out'];
        $guests = $data['guests'] ?? 1;

        $bookedRoomTypeIds = Booking::where('property_id', $propertyId)
            ->whereIn('status', ['confirmed', 'pending', 'checked_in'])
            ->where(function ($query) use ($checkIn, $checkOut) {
                $query->whereBetween('check_in_date', [$checkIn, $checkOut])
                    ->orWhereBetween('check_out_date', [$checkIn, $checkOut])
                    ->orWhere(function ($q) use ($checkIn, $checkOut) {
                        $q->where('check_in_date', '<=', $checkIn)
                          ->where('check_out_date', '>=', $checkOut);
                    });
            })
            ->pluck('room_type_id')
            ->unique()
            ->toArray();

        $availableRoomTypes = RoomType::where('property_id', $propertyId)
            ->where('capacity', '>=', $guests)
            ->whereNotIn('id', $bookedRoomTypeIds)
            ->get()
            ->map(function ($roomType) use ($checkIn, $checkOut) {
                $availableRooms = Room::where('room_type_id', $roomType->id)
                    ->where('status', 'available')
                    ->count();
                
                $roomType->available_count = $availableRooms;
                $roomType->base_price = $this->calculatePrice($roomType->base_price, $checkIn, $checkOut);
                
                return $roomType;
            });

        return response()->json([
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'room_types' => $availableRoomTypes,
        ]);
    }

    private function calculatePrice(float $basePrice, string $checkIn, string $checkOut): float
    {
        $nights = (strtotime($checkOut) - strtotime($checkIn)) / (60 * 60 * 24);
        return $basePrice * $nights;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Room::with(['roomType', 'property']);

        if ($request->property_id) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $rooms = $query->get();

        return response()->json([
            'rooms' => $rooms,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $room = Room::with(['roomType', 'property'])->find($id);
        
        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        return response()->json([
            'room' => $room,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'room_type_id' => 'required|uuid|exists:room_types,id',
            'room_number' => 'required|string|max:20',
            'floor' => 'required|integer|min:0',
            'status' => 'nullable|in:available,booked,maintenance,cleaning',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['id'] = Str::uuid()->toString();
        $data['status'] = $data['status'] ?? 'available';

        $room = Room::create($data);

        return response()->json([
            'message' => 'Room created successfully',
            'room' => $room,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $room = Room::find($id);
        
        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'room_number' => 'sometimes|string|max:20',
            'floor' => 'sometimes|integer|min:0',
            'status' => 'sometimes|in:available,booked,maintenance,cleaning',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room->update($validator->validated());

        return response()->json([
            'message' => 'Room updated successfully',
            'room' => $room,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $room = Room::find($id);
        
        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        $room->delete();

        return response()->json(['message' => 'Room deleted successfully']);
    }
}