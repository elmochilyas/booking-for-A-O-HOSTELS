<?php

namespace App\Modules\Auth\Services;

use App\Models\Guest;
use Illuminate\Support\Facades\Mail;

class EmailVerificationService
{
    public function sendVerificationEmail(Guest $guest): void
    {
        $verificationUrl = config('app.frontend_url') . '/verify-email?token=' . $guest->verification_token;

        $this->sendEmail(
            $guest->email,
            'Verify Your Email - A&O Hostels',
            'emails.verification',
            [
                'name' => $guest->first_name,
                'verificationUrl' => $verificationUrl,
            ]
        );
    }

    public function sendWelcomeEmail(Guest $guest): void
    {
        $this->sendEmail(
            $guest->email,
            'Welcome to A&O Hostels!',
            'emails.welcome',
            [
                'name' => $guest->first_name,
                'loginUrl' => config('app.frontend_url') . '/login',
            ]
        );
    }

    private function sendEmail(string $to, string $subject, string $template, array $data): void
    {
        try {
            Mail::send($template, $data, function ($message) use ($to, $subject) {
                $message->to($to)
                    ->subject($subject)
                    ->from(config('mail.from.address', 'noreply@ao-hostels.com'), 'A&O Hostels');
            });
        } catch (\Exception $e) {
            \Log::error('Email sending failed: ' . $e->getMessage());
        }
    }
}