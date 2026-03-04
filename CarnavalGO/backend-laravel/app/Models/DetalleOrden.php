<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleOrden extends Model
{
    use HasFactory;

    protected $table = 'detalles_orden';

    protected $fillable = [
        'orden_id',
        'lugar_id',
        'cantidad',
        'precio_unitario',
        'subtotal',
    ];

    public function orden(): BelongsTo
    {
        return $this->belongsTo(Orden::class);
    }

    public function lugar(): BelongsTo
    {
        return $this->belongsTo(Lugar::class);
    }
}
