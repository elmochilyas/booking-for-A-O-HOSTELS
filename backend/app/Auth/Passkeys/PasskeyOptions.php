<?php

declare(strict_types=1);

namespace App\Auth\Passkeys;

use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Passkey Options Generation
|--------------------------------------------------------------------------
|
| RULE PASS-01: Passkeys live in app/Auth/Passkeys/
| RULE PASS-02: Passkeys are stateless — no sessions created.
| RULE PASS-03: Always validate origin and challenge.
| RULE PASS-04: Store passkey data in a separate table.
| RULE PASS-05: Use Laravel's first-party Passkey support.
|
*/

class PasskeyOptions
{
    public function generate(): array
    {
        // RULE PASS-03: Always validate origin
        $origin = request()->header('Origin', config('app.url', as: 'string'));

        return Auth::guard('passkey')->options([
            'user' => Auth::user(),
            'origin' => $origin,
        ]);
    }
}
