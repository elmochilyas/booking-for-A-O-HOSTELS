<?php

namespace App\Http\Controllers\Api;

use App\Handlers\Reports\GetAnalyticsHandler;
use App\Handlers\Reports\GetBookingsReportHandler;
use App\Handlers\Reports\GetGuestsReportHandler;
use App\Handlers\Reports\GetOccupancyReportHandler;
use App\Handlers\Reports\GetRevenueReportHandler;
use App\Http\Controllers\Controller;
use App\Models\Property;
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
    public function analytics(): JsonResponse
    {
        $propertyId = request()->get('property_id') ?? Property::first()?->id;

        if (! $propertyId) {
            return response()->json(['error' => 'No property found'], 404);
        }

        $startDate = request()->get('start_date') ?? now()->startOfMonth()->toDateString();
        $endDate = request()->get('end_date') ?? now()->endOfMonth()->toDateString();

        $handler = app(GetAnalyticsHandler::class);
        $result = $handler->handle(new GetAnalyticsQuery(
            $propertyId,
            $startDate,
            $endDate
        ));

        return response()->json($result);
    }

    public function reports(): JsonResponse
    {
        $propertyId = request()->get('property_id') ?? Property::first()?->id;

        if (! $propertyId) {
            return response()->json(['error' => 'No property found'], 404);
        }

        $type = request()->get('type') ?? 'occupancy';
        $startDate = request()->get('start_date') ?? now()->startOfMonth()->toDateString();
        $endDate = request()->get('end_date') ?? now()->endOfMonth()->toDateString();

        $data = match ($type) {
            'occupancy' => app(GetOccupancyReportHandler::class)->handle(
                new GetOccupancyReportQuery($propertyId, $startDate, $endDate)
            ),
            'revenue' => app(GetRevenueReportHandler::class)->handle(
                new GetRevenueReportQuery($propertyId, $startDate, $endDate)
            ),
            'bookings' => app(GetBookingsReportHandler::class)->handle(
                new GetBookingsReportQuery($propertyId, $startDate, $endDate)
            ),
            'guests' => app(GetGuestsReportHandler::class)->handle(
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
