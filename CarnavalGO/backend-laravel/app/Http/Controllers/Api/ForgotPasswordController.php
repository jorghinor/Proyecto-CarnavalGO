<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Cliente;
use App\Notifications\ResetPasswordNotification;

class ForgotPasswordController extends Controller
{
    // Paso 1: Enviar el enlace de reseteo (Método Manual Corregido)
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $cliente = Cliente::where('email', $request->email)->first();

        if (!$cliente) {
            return response()->json(['message' => 'Si tu email está en nuestros registros, recibirás un enlace.'], 200);
        }

        // Crear el token
        $token = Str::random(60);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => $token, 'created_at' => now()] // Guardar el token en texto plano
        );

        // Enviar la notificación personalizada
        $cliente->notify(new ResetPasswordNotification($token));

        return response()->json(['message' => 'Enlace de reseteo enviado.']);
    }

    // Paso 2: Resetear la contraseña
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|confirmed|min:8',
        ]);

        // Verificar el token manualmente
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord || $request->token !== $resetRecord->token) {
            return response()->json(['email' => 'Token de reseteo inválido.'], 422);
        }

        // Actualizar la contraseña
        $cliente = Cliente::where('email', $request->email)->first();
        $cliente->forceFill([
            'password' => Hash::make($request->password)
        ])->save();

        // Eliminar el token de reseteo
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Contraseña actualizada exitosamente.']);
    }
}
