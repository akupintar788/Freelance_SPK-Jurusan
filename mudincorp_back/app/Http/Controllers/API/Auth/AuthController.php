<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\User;

class AuthController extends Controller
{

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nip' => 'required|numeric',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (!Auth::attempt($request->only('nip', 'password'))) {
            // Determine whether the NIP exists to help debugging without logging passwords
            $user = User::where('nip', $request->input('nip'))->first();
            if (!$user) {
                Log::warning('Login failed: NIP not found', ['nip' => $request->input('nip')]);
                return response()->json(['message' => 'NIP not found'], 401);
            } else {
                Log::warning('Login failed: Incorrect password', ['nip' => $request->input('nip'), 'user_id' => $user->id]);
                return response()->json(['message' => 'Incorrect password'], 401);
            }
        }
        /** @var \App\Models\User $user */ //
        $user = Auth::user();
        $token = $user->createToken('API Token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
