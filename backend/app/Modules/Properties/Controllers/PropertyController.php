<?php

namespace App\Modules\Properties\Controllers;

use App\Actions\Properties\CreateProperty;
use App\Actions\Properties\CreateRoomType;
use App\Actions\Properties\DeleteProperty;
use App\Actions\Properties\UpdateProperty;
use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Contracts\Repositories\RoomTypeRepositoryInterface;
use App\DTO\CreatePropertyDTO;
use App\DTO\UpdatePropertyDTO;
use App\Http\Requests\Api\Property\CreateRoomTypeRequest;
use App\Http\Requests\Modules\Properties\CreatePropertyRequest;
use App\Http\Requests\Modules\Properties\GetPropertiesRequest;
use App\Http\Requests\Modules\Properties\UpdatePropertyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class PropertyController extends Controller
{
    public function __construct(
        private PropertyRepositoryInterface $propertyRepository,
        private RoomTypeRepositoryInterface $roomTypeRepository,
    ) {}

    public function index(GetPropertiesRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $properties = $this->propertyRepository->getPaginated($filters);

        return response()->json(['data' => $properties]);
    }

    public function store(CreatePropertyRequest $request, CreateProperty $action): JsonResponse
    {
        $property = $action->handle(CreatePropertyDTO::fromRequest($request));

        return response()->json([
            'data' => $property,
            'message' => 'Property created successfully',
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $property = $this->propertyRepository->findOrFail($id);

        return response()->json(['data' => $property]);
    }

    public function update(UpdatePropertyRequest $request, string $id, UpdateProperty $action): JsonResponse
    {
        $property = $this->propertyRepository->findOrFail($id);
        $property = $action->handle($property, UpdatePropertyDTO::fromRequest($request));

        return response()->json([
            'data' => $property,
            'message' => 'Property updated successfully',
        ]);
    }

    public function destroy(string $id, DeleteProperty $action): JsonResponse
    {
        $property = $this->propertyRepository->findOrFail($id);
        $action->handle($property);

        return response()->json(['message' => 'Property deleted successfully']);
    }

    public function roomTypes(string $propertyId): JsonResponse
    {
        $roomTypes = $this->roomTypeRepository->getByProperty($propertyId);

        return response()->json(['data' => $roomTypes]);
    }

    public function rooms(string $propertyId): JsonResponse
    {
        $property = $this->propertyRepository->findOrFail($propertyId);
        $rooms = $property->rooms()->with('roomType')->get();

        return response()->json(['data' => $rooms]);
    }

    public function createRoomType(
        CreateRoomTypeRequest $request,
        string $propertyId,
        CreateRoomType $action,
    ): JsonResponse {
        $roomType = $action->handle($propertyId, $request->validated());

        return response()->json([
            'data' => $roomType,
            'message' => 'Room type created successfully',
        ], 201);
    }
}
