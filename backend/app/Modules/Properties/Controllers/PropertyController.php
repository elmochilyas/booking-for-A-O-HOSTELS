<?php

namespace App\Modules\Properties\Controllers;

use App\Models\Property;
use App\Modules\Properties\Services\PropertyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PropertyController
{
    private PropertyService $propertyService;

    public function __construct(PropertyService $propertyService)
    {
        $this->propertyService = $propertyService;
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['location']);
        $properties = $this->propertyService->getAllProperties($filters);

        return response()->json(['data' => $properties]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'check_in_time' => 'required',
            'check_out_time' => 'required',
            'total_rooms' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $property = $this->propertyService->createProperty($request->all());

        return response()->json(['data' => $property, 'message' => 'Property created successfully'], 201);
    }

    public function show(string $id): JsonResponse
    {
        $property = $this->propertyService->getPropertyById($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        return response()->json(['data' => $property]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'check_in_time' => 'sometimes',
            'check_out_time' => 'sometimes',
            'total_rooms' => 'sometimes|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $property = $this->propertyService->updateProperty($property, $request->all());

        return response()->json(['data' => $property, 'message' => 'Property updated successfully']);
    }

    public function destroy(string $id): JsonResponse
    {
        $property = Property::find($id);

        if (!$property) {
            return response()->json(['message' => 'Property not found'], 404);
        }

        $this->propertyService->deleteProperty($property);

        return response()->json(['message' => 'Property deleted successfully']);
    }

    public function roomTypes(string $propertyId): JsonResponse
    {
        $roomTypes = $this->propertyService->getRoomTypes($propertyId);

        return response()->json(['data' => $roomTypes]);
    }

    public function rooms(string $propertyId): JsonResponse
    {
        $rooms = $this->propertyService->getRooms($propertyId);

        return response()->json(['data' => $rooms]);
    }

    public function createRoomType(Request $request, string $propertyId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'base_price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $roomType = $this->propertyService->createRoomType($propertyId, $request->all());

        return response()->json(['data' => $roomType, 'message' => 'Room type created successfully'], 201);
    }
}