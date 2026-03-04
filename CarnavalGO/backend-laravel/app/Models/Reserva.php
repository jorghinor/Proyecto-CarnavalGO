<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reserva extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id',
        'lugar_id',
        'fecha_reserva',
        'cantidad_entradas',
        'monto_total',
        'estado_pago',
        'qr_code',
    ];

    protected $casts = [
        'fecha_reserva' => 'date',
        'monto_total' => 'decimal:2',
    ];

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class);
    }

    public function lugar(): BelongsTo
    {
        return $this->belongsTo(Lugar::class);
    }
}
