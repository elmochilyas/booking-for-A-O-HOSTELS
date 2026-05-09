<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Actions\Invoices\GenerateInvoiceHtml;
use App\Actions\Invoices\GenerateInvoicePdf;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('auth.jwt')]
#[Middleware('role:superadmin,regional_admin,property_admin,manager,reception')]
class InvoiceController extends Controller
{
    public function generate(string $bookingId, GenerateInvoiceHtml $action): JsonResponse
    {
        try {
            $result = $action->handle($bookingId);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json($result);
    }

    public function download(string $bookingId, GenerateInvoicePdf $action)
    {
        try {
            return $action->handle($bookingId);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Booking not found'], 404);
        }
    }
}
