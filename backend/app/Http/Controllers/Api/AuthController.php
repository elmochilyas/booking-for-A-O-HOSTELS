<?php

namespace App\Http\Controllers\Api;

use App\Actions\Auth\ForgotPasswordAction;
use App\Actions\Auth\LoginGuestAction;
use App\Actions\Auth\LogoutGuestAction;
use App\Actions\Auth\RefreshTokenAction;
use App\Actions\Auth\RegisterGuestAction;
use App\Actions\Auth\ResetPasswordAction;
use App\Actions\Auth\VerifyEmailAction;
use App\DTO\CreateGuestDTO;
use App\Exceptions\EmailNotVerifiedException;
use App\Exceptions\InvalidCredentialsException;
use App\Exceptions\InvalidTokenException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Requests\Api\Auth\ResetPasswordRequest;
use App\Http\Requests\Api\Auth\VerifyEmailRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Attributes\Middleware;

#[Middleware('guest')]
class AuthController extends Controller
{
    public function register(RegisterRequest $request, RegisterGuestAction $action): JsonResponse
    {
        $dto = CreateGuestDTO::fromRequest($request);
        $result = $action->handle($dto);

        return response()->json($result, 201);
    }

    public function login(LoginRequest $request, LoginGuestAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->handle($validated['email'], $validated['password']);

            return response()->json($result);
        } catch (InvalidCredentialsException $e) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        } catch (EmailNotVerifiedException $e) {
            return response()->json(['error' => 'Email not verified'], 403);
        }
    }

    #[Middleware('auth.jwt')]
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

    #[Middleware('auth.jwt')]
    public function logout(Request $request, LogoutGuestAction $action): JsonResponse
    {
        $token = $request->bearerToken();
        $result = $action->handle($token);

        return response()->json($result);
    }

    #[Middleware('auth.jwt')]
    public function verifyEmail(VerifyEmailRequest $request, VerifyEmailAction $action): JsonResponse
    {
        try {
            $result = $action->handle($request->input('token'));

            return response()->json($result);
        } catch (InvalidTokenException $e) {
            return response()->json(['error' => 'Invalid or expired verification token'], 400);
        }
    }

    public function forgotPassword(ForgotPasswordRequest $request, ForgotPasswordAction $action): JsonResponse
    {
        $result = $action->handle($request->validated()['email']);

        return response()->json($result);
    }

    public function resetPassword(ResetPasswordRequest $request, ResetPasswordAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $result = $action->handle($validated['token'], $validated['password']);

            return response()->json($result);
        } catch (InvalidTokenException $e) {
            return response()->json(['error' => 'Invalid or expired reset token'], 400);
        }
    }
}
