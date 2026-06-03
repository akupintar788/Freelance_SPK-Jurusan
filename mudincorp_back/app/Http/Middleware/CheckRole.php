<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Cek apakah user sudah login melalui Sanctum
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // 2. Cek apakah role user ada dalam parameter yang diizinkan
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden: Anda tidak memiliki akses ke halaman ini.'
            ], 403);
        }

        return $next($request);
    }
}
