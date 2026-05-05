<?php

namespace App\Http\Controllers\Api;

use App\Actions\Properties\CreateProperty;
use App\Actions\Properties\DeleteProperty;
use App\Actions\Properties\GetDestinations;
use App\Actions\Properties\GetProperties;
use App\Actions\Properties\GetProperty;
use App\Actions\Properties\UpdateProperty;
use App\DTO\CreatePropertyDTO;
use App\DTO\UpdatePropertyDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Property\CreatePropertyRequest;
use App\Http\Requests\Api\Property\UpdatePropertyRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Authorize;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
class PropertyController extends Controller
{
    public function __construct(
        private GetProperties $getProperties,
        private GetProperty $getProperty,
        private GetDestinations $getDestinations,
        private CreateProperty $createProperty,
        private UpdateProperty $updateProperty,
        private DeleteProperty $deleteProperty,
    ) {}

    public function index(): JsonResponse
    {
        $query = $this->getProperties->handle(request()->all());

        return response()->json([
            'properties' => $query->items(),
            'pagination' => [
                'total' => $query->total(),
                'per_page' => $query->perPage(),
                'current_page' => $query->currentPage(),
                'last_page' => $query->lastPage(),
            ],
        ]);
    }

    public function destinations(): JsonResponse
    {
        $destinations = $this->getDestinations->handle();

        return response()->json([
            'destinations' => $destinations,
        ]);
    }

    #[Authorize('view', 'property')]
    public function show(string $id): JsonResponse
    {
        $property = $this->getProperty->handle($id);

        return response()->json([
            'property' => $property,
        ]);
    }

    public function store(CreatePropertyRequest $request): JsonResponse
    {
        $dto = CreatePropertyDTO::fromRequest($request);
        $property = $this->createProperty->handle($dto);

        return response()->json([
            'message' => 'Property created successfully',
            'property' => $property,
        ], 201);
    }

    #[Authorize('update', 'property')]
    public function update(UpdatePropertyRequest $request, string $id): JsonResponse
    {
        $property = $this->getProperty->handle($id);
        $dto = UpdatePropertyDTO::fromRequest($request);
        $updatedProperty = $this->updateProperty->handle($property, $dto);

        return response()->json([
            'message' => 'Property updated successfully',
            'property' => $updatedProperty,
        ]);
    }

    #[Authorize('delete', 'property')]
    public function destroy(string $id): JsonResponse
    {
        $property = $this->getProperty->handle($id);
        $this->deleteProperty->handle($property);

        return response()->json([
            'message' => 'Property deleted successfully',
        ]);
    }
}
