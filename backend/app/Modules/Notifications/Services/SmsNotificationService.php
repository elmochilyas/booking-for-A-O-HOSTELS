<?php

namespace App\Modules\Notifications\Services;

use App\Models\Booking;
use Twilio\Rest\Client;

class SmsNotificationService
{
    private ?Client $client = null;

    public function __construct()
    {
        if (config('services.twilio.sid') && config('services.twilio.token')) {
            $this->client = new Client(
                config('services.twilio.sid'),
                config('services.twilio.token')
            );
        }
    }

    public function sendBookingConfirmation(Booking $booking): bool
    {
        $message = sprintf(
            "A&O Hostels: Your booking #%s is confirmed! %s to %s. See you soon!",
            substr($booking->id, 0, 8),
            $booking->check_in_date,
            $booking->check_out_date
        );

        return $this->send($booking->guest->phone, $message);
    }

    public function sendCheckInReminder(Booking $booking): bool
    {
        $message = sprintf(
            "A&O Hostels: Reminder - Your check-in is tomorrow (%s) at %s. See you soon!",
            $booking->check_in_date,
            $booking->property->check_in_time ?? '15:00'
        );

        return $this->send($booking->guest->phone, $message);
    }

    public function sendCheckOutReminder(Booking $booking): bool
    {
        $message = sprintf(
            "A&O Hostels: Reminder - Check-out today at %s. Thanks for staying with us!",
            $booking->property->check_out_time ?? '10:00'
        );

        return $this->send($booking->guest->phone, $message);
    }

    public function sendPaymentReceived(Booking $booking, float $amount): bool
    {
        $message = sprintf(
            "A&O Hostels: Payment of €%.2f received for booking #%s. Thank you!",
            $amount,
            substr($booking->id, 0, 8)
        );

        return $this->send($booking->guest->phone, $message);
    }

    public function sendCustom(string $phone, string $message): bool
    {
        return $this->send($phone, $message);
    }

    private function send(string $phone, string $message): bool
    {
        if (!$this->client) {
            \Log::warning('Twilio not configured, SMS not sent');
            return false;
        }

        try {
            $this->client->messages->create($phone, [
                'from' => config('services.twilio.from'),
                'body' => $message,
            ]);
            return true;
        } catch (\Exception $e) {
            \Log::error("SMS send failed: {$e->getMessage()}");
            return false;
        }
    }
}