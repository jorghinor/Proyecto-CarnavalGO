<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;

class ReservaApiController extends Controller
{
    public function show($id)
    {
        $reserva = Reserva::with('lugar')->find($id);

        if (!$reserva) {
            return response()->json(['error' => 'Reserva no encontrada.'], 404);
        }

        return response()->json(['data' => $reserva]);
    }

    // Nuevo método: Obtener reservas del usuario autenticado
    public function misReservas(Request $request)
    {
        $cliente = $request->user(); // Obtener el cliente desde el token

        $reservas = Reserva::with('lugar')
            ->where('cliente_id', $cliente->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $reservas]);
    }
}
