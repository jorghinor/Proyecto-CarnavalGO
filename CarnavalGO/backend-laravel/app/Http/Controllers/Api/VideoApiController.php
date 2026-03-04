<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VideoApiController extends Controller
{
    public function index()
    {
        $videos = Video::where('estado', 'activo')
            ->orderBy('created_at', 'desc') // Ordenar por fecha de creación descendente
            ->get()
            ->map(function ($video) {
                if ($video->miniatura) {
                    $video->miniatura_url = Storage::url($video->miniatura);
                }
                return $video;
            });

        return response()->json(['data' => $videos]);
    }
}
