<?php

namespace App\Http\Controllers\Api;

use App\Actions\Auth\ForgotPasswordAction;
use App\Actions\Auth\LoginGuestAction;
use App\Actions\Auth\LogoutGuestAction;
use App\Actions\Auth\RefreshTokenAction;
use App\Actions\Auth\RegisterGuestAction;
use App\Actions\Auth\ResetPasswordAction;
use App\Actions\Auth\VerifyEmailAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(RegisterRequest $request, RegisterGuestAction $action): JsonResponse
    {
        $dto = \App\DTO\CreateGuestDTO::fromRequest($request);
        $result = $action->handle($dto);

        return response()->json($result, 201);
    }

    public function login(LoginRequest $request, LoginGuestAction $action): JsonResponse
    {
        try {
            $result = $action->handle($request->validated('email'), $request->validated('password'));
            return response()->json($result);
        } catch (\App\Exceptions\InvalidCredentialsException $e) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        } catch (\App\Exceptions\EmailNotVerifiedException $e) {
            return response()->json(['error' => 'Email not verified'], 403);
        }
    }

    public function refresh(Request $request, RefreshTokenAction $action): JsonResponse
    {
        $refreshToken = $request->bearerToken();

        if (! $refreshToken) {
            return response()->json(['error' => 'Refresh token required'], 400);
        }

        try {
            $result = $action->handle($refreshToken);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid refresh token'], 401);
        }
    }

    public function logout(Request $request, LogoutGuestAction $action): JsonResponse
    {
        $token = $request->bearerToken();
        $result = $action->handle($token);

        return response()->json($result);
    }

    public function verifyEmail(Request $request, VerifyEmailAction $action): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        try {
            $result = $action->handle($request->validated('token'));
            return response()->json($result);
        } catch (\App\Exceptions\InvalidTokenException $e) {
            return response()->json(['error' => 'Invalid or expired verification token'], 400);
        }
    }

    public function forgotPassword(ForgotPasswordRequest $request, ForgotPasswordAction $action): JsonResponse
    {
        $result = $action->handle($request->validated('email'));
        return response()->json($result);
    }

    public function resetPassword(ResetPasswordRequest $request, ResetPasswordAction $action): JsonResponse
    {
        try {
            $result = $action->handle($request->validated('token'), $request->validated('password'));
            return response()->json($result);
        } catch (\App\Exceptions\InvalidTokenException $e) {
            return response()->json(['error' => 'Invalid or expired reset token'], 400);
        }
    }
}
