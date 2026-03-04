<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Danza;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DanzaApiController extends Controller
{
    public function index(Request $request)
    {
        $query = Danza::query()->where('estado', 'activo');

        if ($request->has('search')) {
            $query->where('nombre', 'like', '%' . $request->search . '%');
        }

        $danzas = $query->get()->map(function ($danza) {
            if ($danza->imagen) {
                $danza->imagen_url = Storage::url($danza->imagen);
            } else {
                $danza->imagen_url = null;
            }
            return $danza;
        });

        return response()->json([
            'data' => $danzas,
        ]);
    }
}
