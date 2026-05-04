<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Booking Confirmation',
                'slug' => 'booking_confirmation',
                'subject' => 'Your reservation at {{property_name}} is confirmed',
                'body' => "Dear {{guest_name}},\n\nYour reservation at {{property_name}} has been confirmed.\n\nBooking Details:\n- Check-in: {{check_in_date}}\n- Check-out: {{check_out_date}}\n- Room Type: {{room_type}}\n- Confirmation Code: {{booking_code}}\n\nWe look forward to welcoming you!",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Booking Cancellation',
                'slug' => 'booking_cancellation',
                'subject' => 'Your reservation at {{property_name}} has been cancelled',
                'body' => "Dear {{guest_name}},\n\nYour reservation at {{property_name}} (Confirmation Code: {{booking_code}}) has been cancelled.\n\nIf you have any questions, please contact us.",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Check-in Reminder',
                'slug' => 'checkin_reminder',
                'subject' => 'Check-in reminder for {{property_name}}',
                'body' => "Dear {{guest_name}},\n\nThis is a reminder that your check-in at {{property_name}} is tomorrow ({{check_in_date}}).\n\nPlease ensure you have:\n- Valid ID/passport\n- Booking confirmation\n\nSee you soon!",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Checkout Summary',
                'slug' => 'checkout_summary',
                'subject' => 'Your checkout summary from {{property_name}}',
                'body' => "Dear {{guest_name}},\n\nThank you for staying at {{property_name}}!\n\nHere is your checkout summary:\n- Total: €{{total_price}}\n- Nights: {{nights}}\n\nWe hope to see you again soon!",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Password Reset',
                'slug' => 'password_reset',
                'subject' => 'Reset your A&O password',
                'body' => "Dear {{guest_name}},\n\nClick the link below to reset your password:\n{{reset_link}}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($templates as $template) {
            DB::table('email_templates')->updateOrInsert(
                ['slug' => $template['slug']],
                $template
            );
        }
    }
}
