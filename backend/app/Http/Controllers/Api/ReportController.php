<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Repositories\PropertyRepositoryInterface;
use App\Handlers\Reports\GetAnalyticsHandler;
use App\Handlers\Reports\GetBookingsReportHandler;
use App\Handlers\Reports\GetGuestsReportHandler;
use App\Handlers\Reports\GetOccupancyReportHandler;
use App\Handlers\Reports\GetRevenueReportHandler;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ReportRequest;
use App\Queries\Reports\GetAnalyticsQuery;
use App\Queries\Reports\GetBookingsReportQuery;
use App\Queries\Reports\GetGuestsReportQuery;
use App\Queries\Reports\GetOccupancyReportQuery;
use App\Queries\Reports\GetRevenueReportQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
#[Middleware('role:superadmin,regional_admin,property_admin,manager')]
class ReportController extends Controller
{
    private PropertyRepositoryInterface $propertyRepository;

    public function __construct(
        PropertyRepositoryInterface $propertyRepository,
        private GetAnalyticsHandler $analyticsHandler,
        private GetOccupancyReportHandler $occupancyHandler,
        private GetRevenueReportHandler $revenueHandler,
        private GetBookingsReportHandler $bookingsHandler,
        private GetGuestsReportHandler $guestsHandler,
    ) {
        $this->propertyRepository = $propertyRepository;
    }

    public function analytics(ReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $propertyId = $validated['property_id'] ?? $this->propertyRepository->findFirst()?->id;

        if (! $propertyId) {
            return response()->json(['error' => 'No property found'], 404);
        }

        $startDate = $validated['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $validated['end_date'] ?? now()->endOfMonth()->toDateString();

        $result = $this->analyticsHandler->handle(new GetAnalyticsQuery(
            $propertyId,
            $startDate,
            $endDate
        ));

        return response()->json($result);
    }

    public function reports(ReportRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $propertyId = $validated['property_id'] ?? $this->propertyRepository->findFirst()?->id;

        if (! $propertyId) {
            return response()->json(['error' => 'No property found'], 404);
        }

        $type = $validated['type'] ?? 'occupancy';
        $startDate = $validated['start_date'] ?? now()->startOfMonth()->toDateString();
        $endDate = $validated['end_date'] ?? now()->endOfMonth()->toDateString();

        $data = match ($type) {
            'occupancy' => $this->occupancyHandler->handle(
                new GetOccupancyReportQuery($propertyId, $startDate, $endDate)
            ),
            'revenue' => $this->revenueHandler->handle(
                new GetRevenueReportQuery($propertyId, $startDate, $endDate)
            ),
            'bookings' => $this->bookingsHandler->handle(
                new GetBookingsReportQuery($propertyId, $startDate, $endDate)
            ),
            'guests' => $this->guestsHandler->handle(
                new GetGuestsReportQuery($propertyId, $startDate, $endDate)
            ),
            default => [],
        };

        return response()->json([
            'type' => $type,
            'property_id' => $propertyId,
            'period' => ['start' => $startDate, 'end' => $endDate],
            'data' => $data,
        ]);
    }
}
