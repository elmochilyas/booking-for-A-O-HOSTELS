<?php

namespace App\Actions\Staff;

use App\DTO\LoginStaffDTO;
use App\Models\Staff;
use App\Services\JwtService;
use Illuminate\Support\Facades\Hash;

readonly class LoginStaff
{
    public function __construct(
        private JwtService $jwtService,
    ) {}

    public function handle(LoginStaffDTO $dto): array
    {
        $staff = Staff::where('email', $dto->email)->first();

        if (! $staff || ! Hash::check($dto->password, $staff->password_hash)) {
            throw new \Exception('Invalid credentials');
        }

        if (! $staff->is_active) {
            throw new \Exception('Account is deactivated');
        }

        $token = $this->jwtService->generateStaffToken($staff);
        $staff->update(['last_login_at' => now()]);

        return [
            'staff' => $staff->makeHidden(['password_hash']),
            'access_token' => $token,
            'token_type' => 'bearer',
        ];
    }
}
