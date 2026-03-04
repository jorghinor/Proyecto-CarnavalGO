<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lugar extends Model
{
    use HasFactory;

    protected $table = 'lugares';

    protected $fillable = [
        'nombre',
        'ubicacion',
        'capacidad',
        'precio',
        'stock', // <-- Añadido el campo stock
        'estado',
        'imagen',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}
