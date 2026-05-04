<?php

namespace App\Modules\Staff\Controllers;

use App\Modules\Staff\Services\ReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController
{
    private ReportingService $reportingService;

    public function __construct(ReportingService $reportingService)
    {
        $this->reportingService = $reportingService;
    }

    public function getOccupancy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $this->reportingService->getOccupancyRate(
            $request->property_id,
            $request->start_date,
            $request->end_date
        );

        return response()->json(['data' => $data]);
    }

    public function getRevenue(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $this->reportingService->getRevenueReport(
            $request->property_id,
            $request->start_date,
            $request->end_date
        );

        return response()->json(['data' => $data]);
    }

    public function getBookingStats(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $this->reportingService->getBookingStats(
            $request->property_id,
            $request->start_date,
            $request->end_date
        );

        return response()->json(['data' => $data]);
    }

    public function getDailyStats(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $this->reportingService->getDailyStats(
            $request->property_id,
            $request->date
        );

        return response()->json(['data' => $data]);
    }

    public function getDashboard(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $this->reportingService->getDashboardMetrics($request->property_id);

        return response()->json(['data' => $data]);
    }

    public function getADR(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $adr = $this->reportingService->getADR(
            $request->property_id,
            $request->start_date,
            $request->end_date
        );

        return response()->json(['data' => ['adr' => round($adr, 2)]]);
    }

    public function getRevPAR(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'property_id' => 'required|uuid|exists:properties,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $revpar = $this->reportingService->getRevPAR(
            $request->property_id,
            $request->start_date,
            $request->end_date
        );

        return response()->json(['data' => ['revpar' => round($revpar, 2)]]);
    }
}
