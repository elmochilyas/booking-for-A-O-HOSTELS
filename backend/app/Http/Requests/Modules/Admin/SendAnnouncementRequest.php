<?php

namespace App\Http\Requests\Modules\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SendAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:email,sms,push'],
            'recipients' => ['required', 'in:all_guests,all_staff,specific_property'],
            'property_id' => ['nullable', 'uuid', 'exists:properties,id'],
            'subject' => ['required_if:type,email', 'max:255'],
            'message' => ['required', 'string'],
        ];
    }
}
