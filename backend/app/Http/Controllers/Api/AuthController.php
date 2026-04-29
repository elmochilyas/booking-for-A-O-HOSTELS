<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Services\JwtService;
use App\Services\EmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(
        private JwtService $jwtService,
        private EmailService $emailService
    ) {}

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:guests,email',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'date_of_birth' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        
        $guest = Guest::create([
            'id' => Str::uuid()->toString(),
            'email' => $data['email'],
            'password_hash' => Hash::make($data['password']),
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'] ?? null,
            'country' => $data['country'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'email_verified_at' => null,
            'is_loyalty_member' => false,
            'loyalty_points' => 0,
        ]);

        $verificationToken = $this->jwtService->generateEmailVerificationToken($guest);
        $this->emailService->sendVerificationEmail($guest, $verificationToken);

        $token = $this->jwtService->generateToken($guest);

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'guest' => $guest->makeHidden(['password_hash']),
            'access_token' => $token,
            'token_type' => 'bearer',
        ], 201);
    }

    public function login(Request $request): JsonResponse
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
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $token = $this->jwtService->generateToken($guest);

        return response()->json([
            'message' => 'Login successful',
            'guest' => $guest->makeHidden(['password_hash']),
            'access_token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $refreshToken = $request->bearerToken();
        
        if (!$refreshToken) {
            return response()->json(['error' => 'Refresh token required'], 400);
        }

        try {
            $decoded = $this->jwtService->verifyToken($refreshToken);
            $guest = Guest::find($decoded->sub);
            
            if (!$guest) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $newToken = $this->jwtService->generateToken($guest);
            $newRefreshToken = $this->jwtService->generateRefreshToken($guest);

            return response()->json([
                'access_token' => $newToken,
                'refresh_token' => $newRefreshToken,
                'token_type' => 'bearer',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $decoded = $this->jwtService->verifyEmailToken($request->token);
            $guest = Guest::find($decoded->sub);
            
            if (!$guest) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $guest->update(['email_verified_at' => now()]);

            return response()->json(['message' => 'Email verified successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid or expired verification token'], 400);
        }
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guest = Guest::where('email', $request->email)->first();
        
        if ($guest) {
            $resetToken = $this->jwtService->generatePasswordResetToken($guest);
            $this->emailService->sendPasswordResetEmail($guest, $resetToken);
        }

        return response()->json([
            'message' => 'If the email exists, a password reset link has been sent.'
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $decoded = $this->jwtService->verifyPasswordResetToken($request->token);
            $guest = Guest::find($decoded->sub);
            
            if (!$guest) {
                return response()->json(['error' => 'User not found'], 404);
            }

            $guest->update(['password_hash' => Hash::make($request->password)]);

            return response()->json(['message' => 'Password reset successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid or expired reset token'], 400);
        }
    }
}