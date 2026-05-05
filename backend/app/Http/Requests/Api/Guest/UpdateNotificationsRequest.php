<?php

namespace App\Http\Requests\Api\Guest;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'notification_email' => ['sometimes', 'boolean'],
            'notification_sms' => ['sometimes', 'boolean'],
        ];
    }
}
