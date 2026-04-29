<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PropertyController extends Controller
{
    public function index(): JsonResponse
    {
        $properties = Property::with(['roomTypes', 'amenities'])->get();
        
        return response()->json([
            'properties' => $properties,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $property = Property::with(['roomTypes', 'amenities', 'reviews'])->find($id);
        
        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        return response()->json([
            'property' => $property,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'check_in_time' => 'required|date_format:H:i',
            'check_out_time' => 'required|date_format:H:i',
            'total_rooms' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['id'] = Str::uuid()->toString();

        $property = Property::create($data);

        return response()->json([
            'message' => 'Property created successfully',
            'property' => $property,
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $property = Property::find($id);
        
        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'address' => 'sometimes|string',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'check_in_time' => 'sometimes|date_format:H:i',
            'check_out_time' => 'sometimes|date_format:H:i',
            'total_rooms' => 'sometimes|integer|min:1',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $property->update($validator->validated());

        return response()->json([
            'message' => 'Property updated successfully',
            'property' => $property,
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $property = Property::find($id);
        
        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted successfully']);
    }
}