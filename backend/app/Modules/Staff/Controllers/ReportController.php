<?php

declare(strict_types=1);

namespace App\Modules\Staff\Controllers;

use App\Http\Requests\Modules\Staff\DailyStatsRequest;
use App\Http\Requests\Modules\Staff\DashboardRequest;
use App\Http\Requests\Modules\Staff\ReportRequest;
use App\Queries\GetADRQuery;
use App\Queries\GetBookingStatsQuery;
use App\Queries\GetDailyStatsQuery;
use App\Queries\GetDashboardMetricsQuery;
use App\Queries\GetOccupancyQuery;
use App\Queries\GetRevenueQuery;
use App\Queries\GetRevPARQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class ReportController extends Controller
{
    public function getOccupancy(ReportRequest $request, GetOccupancyQuery $query): JsonResponse
    {
        $data = $query->handle(
            $request->validated('property_id'),
            $request->validated('start_date'),
            $request->validated('end_date')
        );

        return response()->json(['data' => $data]);
    }

    public function getRevenue(ReportRequest $request, GetRevenueQuery $query): JsonResponse
    {
        $data = $query->handle(
            $request->validated('property_id'),
            $request->validated('start_date'),
            $request->validated('end_date')
        );

        return response()->json(['data' => $data]);
    }

    public function getBookingStats(ReportRequest $request, GetBookingStatsQuery $query): JsonResponse
    {
        $data = $query->handle(
            $request->validated('property_id'),
            $request->validated('start_date'),
            $request->validated('end_date')
        );

        return response()->json(['data' => $data]);
    }

    public function getDailyStats(DailyStatsRequest $request, GetDailyStatsQuery $query): JsonResponse
    {
        $data = $query->handle(
            $request->validated('property_id'),
            $request->validated('date')
        );

        return response()->json(['data' => $data]);
    }

    public function getDashboard(DashboardRequest $request, GetDashboardMetricsQuery $query): JsonResponse
    {
        $data = $query->handle($request->validated('property_id'));

        return response()->json(['data' => $data]);
    }

    public function getADR(ReportRequest $request, GetADRQuery $query): JsonResponse
    {
        $adr = $query->handle(
            $request->validated('property_id'),
            $request->validated('start_date'),
            $request->validated('end_date')
        );

        return response()->json(['data' => ['adr' => $adr]]);
    }

    public function getRevPAR(ReportRequest $request, GetRevPARQuery $query): JsonResponse
    {
        $revpar = $query->handle(
            $request->validated('property_id'),
            $request->validated('start_date'),
            $request->validated('end_date')
        );

        return response()->json(['data' => ['revpar' => $revpar]]);
    }
}
