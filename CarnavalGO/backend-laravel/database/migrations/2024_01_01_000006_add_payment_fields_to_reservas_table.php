<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->string('stripe_payment_id')->nullable()->after('estado_pago');
            $table->string('invoice_number')->unique()->nullable()->after('stripe_payment_id');
            $table->enum('payment_status', ['pending', 'succeeded', 'failed', 'refunded'])->default('pending')->after('invoice_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropColumn('stripe_payment_id');
            $table->dropColumn('invoice_number');
            $table->dropColumn('payment_status');
        });
    }
};
