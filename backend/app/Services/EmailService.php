<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\Guest;
use Exception;
use Illuminate\Support\Facades\Log;
use SendGrid\Mail\Mail;

class EmailService
{
    private $sendGrid;

    private string $fromEmail;

    private string $fromName;

    public function __construct()
    {
        $apiKey = env('SENDGRID_API_KEY');
        if ($apiKey) {
            $this->sendGrid = new \SendGrid($apiKey);
        }
        $this->fromEmail = env('MAIL_FROM_ADDRESS', 'noreply@ao-hostels.com');
        $this->fromName = env('MAIL_FROM_NAME', 'A&O Hostels');
    }

    public function sendVerificationEmail(Guest $guest, string $token): void
    {
        $verificationUrl = env('APP_URL', 'http://localhost:3000').'/verify-email?token='.$token;

        $this->sendEmail(
            $guest->email,
            'Verify your A&O Hostels account',
            'emails.verification',
            [
                'guest' => $guest,
                'verification_url' => $verificationUrl,
            ]
        );
    }

    public function sendPasswordResetEmail(Guest $guest, string $token): void
    {
        $resetUrl = env('APP_URL', 'http://localhost:3000').'/reset-password?token='.$token;

        $this->sendEmail(
            $guest->email,
            'Reset your A&O Hostels password',
            'emails.password_reset',
            [
                'guest' => $guest,
                'reset_url' => $resetUrl,
            ]
        );
    }

    public function sendBookingConfirmation(Booking $booking): void
    {
        $this->sendEmail(
            $booking->guest->email,
            'Booking Confirmation - '.$booking->property->name,
            'emails.booking_confirmation',
            [
                'booking' => $booking,
                'property' => $booking->property,
                'guest' => $booking->guest,
            ]
        );
    }

    public function sendBookingModification(Booking $booking): void
    {
        $this->sendEmail(
            $booking->guest->email,
            'Booking Modified - '.$booking->property->name,
            'emails.booking_modification',
            [
                'booking' => $booking,
                'property' => $booking->property,
                'guest' => $booking->guest,
            ]
        );
    }

    public function sendCancellationConfirmation(Booking $booking, float $refundAmount): void
    {
        $this->sendEmail(
            $booking->guest->email,
            'Booking Cancelled - '.$booking->property->name,
            'emails.cancellation',
            [
                'booking' => $booking,
                'property' => $booking->property,
                'guest' => $booking->guest,
                'refund_amount' => $refundAmount,
            ]
        );
    }

    public function sendCheckInConfirmation(Booking $booking): void
    {
        $this->sendEmail(
            $booking->guest->email,
            'Check-in Confirmed - '.$booking->property->name,
            'emails.checkin_confirmation',
            [
                'booking' => $booking,
                'property' => $booking->property,
                'guest' => $booking->guest,
            ]
        );
    }

    public function sendCheckOutThankYou(Booking $booking): void
    {
        $this->sendEmail(
            $booking->guest->email,
            'Thank you for staying at '.$booking->property->name,
            'emails.checkout_thankyou',
            [
                'booking' => $booking,
                'property' => $booking->property,
                'guest' => $booking->guest,
            ]
        );
    }

    public function sendPaymentConfirmation(Booking $booking, $payment): void
    {
        $this->sendEmail(
            $booking->guest->email,
            'Payment Received - '.$booking->property->name,
            'emails.payment_confirmation',
            [
                'booking' => $booking,
                'property' => $booking->property,
                'guest' => $booking->guest,
                'payment' => $payment,
            ]
        );
    }

    public function sendRefundConfirmation(Booking $booking, float $refundAmount): void
    {
        $this->sendEmail(
            $booking->guest->email,
            'Refund Processed - '.$booking->property->name,
            'emails.refund_confirmation',
            [
                'booking' => $booking,
                'property' => $booking->property,
                'guest' => $booking->guest,
                'refund_amount' => $refundAmount,
            ]
        );
    }

    private function sendEmail(string $to, string $subject, string $template, array $data = []): void
    {
        if (! $this->sendGrid) {
            Log::info("Email (mock): {$subject} to {$to}");

            return;
        }

        try {
            $email = new Mail;
            $email->setFrom($this->fromEmail, $this->fromName);
            $email->setSubject($subject);
            $email->addTo($to);

            $htmlContent = view('emails.'.$template, $data)->render();
            $email->addContent('text/html', $htmlContent);

            $response = $this->sendGrid->send($email);

            Log::info("Email sent: {$subject} to {$to}, Status: ".$response->statusCode());
        } catch (Exception $e) {
            Log::error('Failed to send email: '.$e->getMessage());
        }
    }
}
