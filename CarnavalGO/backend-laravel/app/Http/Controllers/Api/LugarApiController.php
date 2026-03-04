<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lugar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LugarApiController extends Controller
{
    public function index()
    {
        $lugares = Lugar::all()->map(function ($lugar) {
            if ($lugar->imagen) {
                $lugar->imagen_url = Storage::url($lugar->imagen);
            } else {
                $lugar->imagen_url = null; // O una imagen por defecto
            }
            return $lugar;
        });

        return response()->json([
            'data' => $lugares,
            'message' => 'Lugares recuperados exitosamente.'
        ]);
    }

    public function show(Lugar $lugar)
    {
        if ($lugar->imagen) {
            $lugar->imagen_url = Storage::url($lugar->imagen);
        } else {
            $lugar->imagen_url = null;
        }

        return response()->json([
            'data' => $lugar,
            'message' => 'Lugar recuperado exitosamente.'
        ]);
    }
}
