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
    public function index(Request $request): JsonResponse
    {
        $lightweight = $request->boolean('lightweight');

        if ($lightweight) {
            $query = Property::select(['id', 'name', 'location', 'latitude', 'longitude', 'rating', 'review_count']);
        } else {
            $query = Property::with(['roomTypes', 'amenities']);
        }

        if ($request->has('location') && $request->location) {
            $query->where('location', 'like', '%'.$request->location.'%');
        }

        if (! $lightweight) {
            if ($request->has('check_in') && $request->check_in && $request->has('check_out') && $request->check_out) {
                $query->whereHas('roomTypes', function ($q) use ($request) {
                    $q->whereHas('availabilities', function ($aq) use ($request) {
                        $aq->whereBetween('date', [$request->check_in, $request->check_out])
                            ->where('available', true);
                    });
                });
            }

            if ($request->has('guests') && $request->guests) {
                $query->whereHas('roomTypes', function ($q) use ($request) {
                    $q->where('capacity', '>=', (int) $request->guests);
                });
            }
        }

        // Return paginated response if per_page is specified, otherwise return all
        if ($request->has('per_page')) {
            $perPage = $request->get('per_page', 20);
            $properties = $query->paginate($perPage);

            return response()->json([
                'properties' => $properties->items(),
                'pagination' => [
                    'total' => $properties->total(),
                    'per_page' => $properties->perPage(),
                    'current_page' => $properties->currentPage(),
                    'last_page' => $properties->lastPage(),
                ],
            ]);
        }

        $properties = $query->get();

        return response()->json([
            'properties' => $properties,
        ]);
    }

    public function destinations(): JsonResponse
    {
        $destinations = Property::select('location')
            ->selectRaw('COUNT(*) as properties_count')
            ->selectRaw('AVG(rating) as avg_rating')
            ->selectRaw('SUM(review_count) as total_reviews')
            ->selectRaw('MIN(room_types.base_price) as lowest_price')
            ->leftJoin('room_types', 'properties.id', '=', 'room_types.property_id')
            ->groupBy('location')
            ->orderByDesc('properties_count')
            ->get();

        $destinationData = $destinations->map(function ($dest) {
            return [
                'city' => $dest->location,
                'country' => 'Germany',
                'properties' => $dest->properties_count,
                'priceFrom' => (int) ($dest->lowest_price ?? 0),
                'rating' => round($dest->avg_rating ?? 0, 1),
                'reviewCount' => (int) ($dest->total_reviews ?? 0),
            ];
        });

        return response()->json([
            'destinations' => $destinationData,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $property = Property::where('id', $id)
            ->orWhere('slug', $id)
            ->with(['roomTypes', 'amenities'])
            ->first();

        if (! $property) {
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

        if (! $property) {
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

        if (! $property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        $property->delete();

        return response()->json(['message' => 'Property deleted successfully']);
    }
}
