<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'ci_dni' => 'required|string|max:255|unique:clientes',
            'email' => 'required|string|email|max:255|unique:clientes',
            'password' => 'required|string|min:8|confirmed',
            'telefono' => 'nullable|string|max:255',
        ]);

        $cliente = Cliente::create([
            'nombre' => $request->nombre,
            'ci_dni' => $request->ci_dni,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telefono' => $request->telefono,
        ]);

        $token = $cliente->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registro exitoso',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'cliente' => $cliente,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $cliente = Cliente::where('email', $request->email)->first();

        if (! $cliente || ! Hash::check($request->password, $cliente->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        $token = $cliente->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'cliente' => $cliente,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
