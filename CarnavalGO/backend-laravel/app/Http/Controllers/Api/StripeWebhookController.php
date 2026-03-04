<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');

        try {
            $event = Webhook::constructEvent(
                $payload, $sig_header, $endpoint_secret
            );
        } catch(\UnexpectedValueException $e) {
            // Invalid payload
            Log::error('Webhook Error: Invalid payload');
            return response()->json(['error' => 'Invalid payload'], 400);
        } catch(SignatureVerificationException $e) {
            // Invalid signature
            Log::error('Webhook Error: Invalid signature');
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Manejar el evento
        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $this->handlePaymentSucceeded($paymentIntent);
                break;
            // ... handle other event types
            default:
                Log::info('Received unknown event type ' . $event->type);
        }

        return response()->json(['status' => 'success']);
    }

    protected function handlePaymentSucceeded($paymentIntent)
    {
        Log::info('Webhook: Payment Succeeded', ['id' => $paymentIntent->id]);

        // Buscar la reserva por el ID de Stripe o por metadata
        // Nota: En createPaymentIntent guardamos 'reserva_id' en metadata
        $reservaId = $paymentIntent->metadata->reserva_id ?? null;

        if (!$reservaId) {
            Log::error('Webhook Error: No reserva_id in metadata');
            return;
        }

        $reserva = Reserva::find($reservaId);

        if ($reserva && $reserva->estado_pago !== 'pagado') {
            $reserva->stripe_payment_id = $paymentIntent->id;
            $reserva->estado_pago = 'pagado';
            $reserva->payment_status = 'succeeded';
            $reserva->save();

            // Descontar Stock (Lógica duplicada de PaymentController, idealmente refactorizar a un Servicio)
            $lugar = $reserva->lugar;
            if ($lugar) {
                $lugar->stock = max(0, $lugar->stock - $reserva->cantidad_entradas);
                $lugar->save();
                Log::info("Webhook: Stock actualizado para lugar {$lugar->id}. Nuevo stock: {$lugar->stock}");
            }

            Log::info("Webhook: Reserva #{$reserva->id} confirmada exitosamente.");
        }
    }
}
