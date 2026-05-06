<?php>

namespace App\Auth\Passkeys;

use App\Models\Guest;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| Passkey Verification
|--------------------------------------------------------------------------
|
| RULE PASS-01: Passkeys live in app/Auth/Passkeys/
| RULE PASS-02: Passkeys are stateless — no sessions created.
| RULE PASS-03: Always validate origin and challenge.
|
*/

class VerifyPasskey
{
    public function verify(array $data): ?Guest
    {
        // RULE PASS-03: Validate origin
        $origin = request()->header('Origin');
        if ($origin !== config('app.url', as: 'string')) {
            return null;
        }

        $result = Auth::guard('passkey')->verify($data);

        return $result ? Auth::guard('passkey')->user() : null;
    }
}
