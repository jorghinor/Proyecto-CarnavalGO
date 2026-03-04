<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabla de Órdenes (Cabecera)
        Schema::create('ordenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->decimal('monto_total', 10, 2);
            $table->enum('estado_pago', ['pendiente', 'pagado', 'fallido'])->default('pendiente');
            $table->string('stripe_payment_id')->nullable();
            $table->string('invoice_number')->nullable();
            $table->timestamps();
        });

        // Tabla de Detalles de Orden (Items)
        Schema::create('detalles_orden', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_id')->constrained('ordenes')->onDelete('cascade');
            $table->foreignId('lugar_id')->constrained('lugares');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalles_orden');
        Schema::dropIfExists('ordenes');
    }
};
