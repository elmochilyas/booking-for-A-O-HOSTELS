<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPaymentWebhook;
use Illuminate\Http\Response;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('stripe.webhook')]
class PaymentWebhookController extends Controller
{
    public function handle(): Response
    {
        $payload = request()->getContent();
        $sigHeader = request()->header('stripe-signature');

        ProcessPaymentWebhook::dispatch($payload, $sigHeader);

        return response()->json(['received' => true]);
    }
}
