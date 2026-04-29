<?php

namespace App\Modules\Auth\Controllers;

use App\Models\Guest;
use App\Models\Staff;
use App\Modules\Auth\Services\JwtService;
use App\Modules\Auth\Services\EmailVerificationService;
use App\Modules\Auth\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController
{
    private JwtService $jwtService;
    private EmailVerificationService $emailService;
    private TwoFactorService $twoFactorService;

    public function __construct(JwtService $jwtService, EmailVerificationService $emailService, TwoFactorService $twoFactorService)
    {
        $this->jwtService = $jwtService;
        $this->emailService = $emailService;
        $this->twoFactorService = $twoFactorService;
    }

    public function guestLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest = Guest::where('email', $request->email)->first();

        if (!$guest || !Hash::check($request->password, $guest->password_hash)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$guest->email_verified_at) {
            return response()->json(['message' => 'Please verify your email first'], 403);
        }

        $tokens = [
            'access_token' => $this->jwtService->generateToken($guest, 'guest'),
            'refresh_token' => $this->jwtService->generateRefreshToken($guest, 'guest'),
            'token_type' => 'Bearer',
            'expires_in' => config('app.jwt_ttl', 15) * 60,
        ];

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $guest->id,
                'email' => $guest->email,
                'first_name' => $guest->first_name,
                'last_name' => $guest->last_name,
                'is_loyalty_member' => $guest->is_loyalty_member,
                'loyalty_points' => $guest->loyalty_points,
            ],
            ...$tokens,
        ]);
    }

    public function staffLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $staff = Staff::where('email', $request->email)->first();

        if (!$staff || !Hash::check($request->password, $staff->password_hash)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$staff->is_active) {
            return response()->json(['message' => 'Account is deactivated'], 403);
        }

        if ($staff->two_factor_enabled) {
            if (!$request->two_factor_code) {
                return response()->json([
                    'requires_2fa' => true,
                    'message' => 'Please provide your 2FA code',
                ], 200);
            }

            if (!$this->twoFactorService->verifyCode($staff->two_factor_secret, $request->two_factor_code)) {
                return response()->json(['message' => 'Invalid 2FA code'], 401);
            }
        }

        $staff->update(['last_login' => now()]);

        $tokens = [
            'access_token' => $this->jwtService->generateToken($staff, 'staff'),
            'refresh_token' => $this->jwtService->generateRefreshToken($staff, 'staff'),
            'token_type' => 'Bearer',
            'expires_in' => config('app.jwt_ttl', 15) * 60,
        ];

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $staff->id,
                'email' => $staff->email,
                'first_name' => $staff->first_name,
                'last_name' => $staff->last_name,
                'role' => $staff->role,
                'property_id' => $staff->property_id,
            ],
            ...$tokens,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:guests,email',
            'password' => 'required|string|min:8|confirmed',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest = Guest::create([
            'email' => $request->email,
            'password_hash' => $request->password,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'country' => $request->country,
            'date_of_birth' => $request->date_of_birth,
            'verification_token' => Str::random(64),
        ]);

        $this->emailService->sendVerificationEmail($guest);

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
            'user' => [
                'id' => $guest->id,
                'email' => $guest->email,
                'first_name' => $guest->first_name,
                'last_name' => $guest->last_name,
            ],
        ], 201);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest = Guest::where('verification_token', $request->token)->first();

        if (!$guest) {
            return response()->json(['message' => 'Invalid verification token'], 404);
        }

        $guest->update([
            'email_verified_at' => now(),
            'verification_token' => null,
        ]);

        $this->emailService->sendWelcomeEmail($guest);

        return response()->json(['message' => 'Email verified successfully']);
    }

    public function refresh(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'refresh_token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tokens = $this->jwtService->refreshTokens($request->refresh_token);

        if (!$tokens) {
            return response()->json(['message' => 'Invalid or expired refresh token'], 401);
        }

        return response()->json($tokens);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken();
        
        if ($token) {
            $this->jwtService->blacklistToken($token);
        }

        return response()->json(['message' => 'Logged out successfully']);
    }
}