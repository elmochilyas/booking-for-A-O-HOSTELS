<?php

namespace App\Modules\Notifications\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Mail;

class EmailNotificationService
{
    public function sendBookingConfirmation(Booking $booking): void
    {
        $guest = $booking->guest;
        $property = $booking->property;
        $roomType = $booking->roomType;

        $data = [
            'guest_name' => $guest->first_name,
            'booking_id' => $booking->id,
            'property_name' => $property->name,
            'property_address' => $property->address,
            'room_type' => $roomType->name,
            'check_in' => $booking->check_in_date,
            'check_out' => $booking->check_out_date,
            'total_price' => $booking->total_price,
            'payment_status' => $booking->payment_status,
        ];

        $this->send(
            $guest->email,
            'Booking Confirmation - A&O Hostels',
            'emails.booking-confirmation',
            $data
        );
    }

    public function sendPreArrivalReminder(Booking $booking): void
    {
        $guest = $booking->guest;

        $data = [
            'guest_name' => $guest->first_name,
            'check_in' => $booking->check_in_date,
            'property_name' => $booking->property->name,
            'property_address' => $booking->property->address,
        ];

        $this->send(
            $guest->email,
            'Your Stay at A&O - Check-in Tomorrow!',
            'emails.pre-arrival',
            $data
        );
    }

    public function sendPostCheckoutReview(Booking $booking): void
    {
        $guest = $booking->guest;

        $data = [
            'guest_name' => $guest->first_name,
            'property_name' => $booking->property->name,
            'booking_id' => $booking->id,
            'review_url' => config('app.frontend_url').'/review/'.$booking->id,
        ];

        $this->send(
            $guest->email,
            'How was your stay at A&O?',
            'emails.review-request',
            $data
        );
    }

    public function sendBookingCancellation(Booking $booking): void
    {
        $guest = $booking->guest;

        $data = [
            'guest_name' => $guest->first_name,
            'booking_id' => $booking->id,
            'check_in' => $booking->check_in_date,
            'check_out' => $booking->check_out_date,
        ];

        $this->send(
            $guest->email,
            'Booking Cancelled - A&O Hostels',
            'emails.booking-cancelled',
            $data
        );
    }

    public function sendPaymentReceipt(Booking $booking, float $amount): void
    {
        $guest = $booking->guest;

        $data = [
            'guest_name' => $guest->first_name,
            'booking_id' => $booking->id,
            'amount' => $amount,
            'total_paid' => $booking->total_price,
            'remaining' => max(0, $booking->total_price - $amount),
        ];

        $this->send(
            $guest->email,
            'Payment Received - A&O Hostels',
            'emails.payment-receipt',
            $data
        );
    }

    private function send(string $to, string $subject, string $template, array $data): void
    {
        try {
            Mail::send($template, $data, function ($message) use ($to, $subject) {
                $message->to($to)
                    ->subject($subject)
                    ->from(
                        config('mail.from.address', 'noreply@ao-hostels.com'),
                        config('mail.from.name', 'A&O Hostels')
                    );
            });
        } catch (\Exception $e) {
            \Log::error("Email send failed: {$e->getMessage()}");
        }
    }
}
