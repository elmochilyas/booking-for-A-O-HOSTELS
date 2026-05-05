<?php

namespace App\Http\Controllers\Api;

use App\Actions\Rooms\CheckRoomAvailability;
use App\Actions\Rooms\CreateRoom;
use App\Actions\Rooms\DeleteRoom;
use App\Actions\Rooms\GetPropertyRooms;
use App\Actions\Rooms\GetPropertyRoomTypes;
use App\Actions\Rooms\GetRoom;
use App\Actions\Rooms\GetRooms;
use App\Actions\Rooms\UpdateRoom;
use App\DTO\CreateRoomDTO;
use App\DTO\UpdateRoomDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Room\CreateRoomRequest;
use App\Http\Requests\Api\Room\UpdateRoomRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Authorize;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
class RoomController extends Controller
{
    public function __construct(
        private GetRooms $getRooms,
        private GetRoom $getRoom,
        private GetPropertyRooms $getPropertyRooms,
        private GetPropertyRoomTypes $getPropertyRoomTypes,
        private CheckRoomAvailability $checkRoomAvailability,
        private CreateRoom $createRoom,
        private UpdateRoom $updateRoom,
        private DeleteRoom $deleteRoom,
    ) {}

    public function propertyRooms(string $propertyId): JsonResponse
    {
        $rooms = $this->getPropertyRooms->handle($propertyId);

        return response()->json([
            'rooms' => $rooms,
        ]);
    }

    public function propertyRoomTypes(string $propertyId): JsonResponse
    {
        $roomTypes = $this->getPropertyRoomTypes->handle($propertyId);

        return response()->json([
            'room_types' => $roomTypes,
        ]);
    }

    public function availability(CreateRoomRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $roomTypes = $this->checkRoomAvailability->handle($request);

        return response()->json([
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'room_types' => $roomTypes,
        ]);
    }

    public function index(): JsonResponse
    {
        $rooms = $this->getRooms->handle(request()->all());

        return response()->json([
            'rooms' => $rooms->items(),
            'pagination' => [
                'total' => $rooms->total(),
                'per_page' => $rooms->perPage(),
                'current_page' => $rooms->currentPage(),
                'last_page' => $rooms->lastPage(),
            ],
        ]);
    }

    #[Authorize('view', 'room')]
    public function show(string $id): JsonResponse
    {
        $room = $this->getRoom->handle($id);

        return response()->json([
            'room' => $room,
        ]);
    }

    public function store(CreateRoomRequest $request): JsonResponse
    {
        $dto = CreateRoomDTO::fromRequest($request);
        $room = $this->createRoom->handle($dto);

        return response()->json([
            'message' => 'Room created successfully',
            'room' => $room,
        ], 201);
    }

    #[Authorize('update', 'room')]
    public function update(UpdateRoomRequest $request, string $id): JsonResponse
    {
        $room = $this->getRoom->handle($id);
        $dto = UpdateRoomDTO::fromRequest($request);
        $updatedRoom = $this->updateRoom->handle($room, $dto);

        return response()->json([
            'message' => 'Room updated successfully',
            'room' => $updatedRoom,
        ]);
    }

    #[Authorize('delete', 'room')]
    public function destroy(string $id): JsonResponse
    {
        $room = $this->getRoom->handle($id);
        $this->deleteRoom->handle($room);

        return response()->json([
            'message' => 'Room deleted successfully',
        ]);
    }
}
