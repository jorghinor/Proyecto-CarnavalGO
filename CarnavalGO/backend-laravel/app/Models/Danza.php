<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Danza extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'descripcion',
        'imagen',
        'fecha_origen',
        'estado',
    ];

    protected $casts = [
        'fecha_origen' => 'date',
    ];
}
