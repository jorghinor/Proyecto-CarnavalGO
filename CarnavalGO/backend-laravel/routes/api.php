<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\LugarApiController;
use App\Http\Controllers\Api\DanzaApiController;
use App\Http\Controllers\Api\VideoApiController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReservaApiController;
use App\Http\Controllers\Api\AuthClienteController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\OrdenController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Ruta de Login (Nombre 'login' requerido por el middleware auth)
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

// Webhook de Stripe (PÚBLICO)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);

// Rutas Públicas de Autenticación
Route::post('/register', [AuthClienteController::class, 'register']);
Route::post('/login', [AuthClienteController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [ForgotPasswordController::class, 'reset']);

// Rutas Públicas de Contenido
Route::get('/lugares', [LugarApiController::class, 'index']);
Route::get('/lugares/{lugar}', [LugarApiController::class, 'show']);
Route::get('/danzas', [DanzaApiController::class, 'index']);
Route::get('/videos', [VideoApiController::class, 'index']);

// Rutas Protegidas (Requieren Token de Cliente)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthClienteController::class, 'logout']);
    Route::get('/me', [AuthClienteController::class, 'me']);

    // Rutas de Ordenes
    Route::post('/ordenes', [OrdenController::class, 'create']);
    Route::get('/ordenes/{id}', [OrdenController::class, 'show']);
    Route::post('/ordenes/{id}/payment-intents', [OrdenController::class, 'createPaymentIntent']);
    Route::post('/ordenes/{id}/confirm-payment', [OrdenController::class, 'confirmPayment']);
    Route::get('/ordenes/{id}/invoice', [OrdenController::class, 'generateInvoice']); // Nueva ruta

    // Pagos y Reservas (DEPRECATED)
    Route::post('/payment-intents', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm-payment', [PaymentController::class, 'confirmPayment']);
    Route::post('/reservas', [PaymentController::class, 'createReserva']);
    Route::get('/reservas/{id}', [ReservaApiController::class, 'show']);
    Route::get('/reservas/{id}/invoice', [PaymentController::class, 'generateInvoice']);

    // Perfil de Usuario
    Route::get('/mis-reservas', [ReservaApiController::class, 'misReservas']);
});
