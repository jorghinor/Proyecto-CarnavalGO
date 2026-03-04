<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reserva;
use App\Models\Lugar; // Importar modelo Lugar
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'reserva_id' => 'required|exists:reservas,id',
        ]);

        $reserva = Reserva::find($request->reserva_id);

        if (!$reserva) {
            return response()->json(['error' => 'Reserva no encontrada.'], 404);
        }

        if ($reserva->estado_pago === 'pagado') {
            return response()->json(['error' => 'Esta reserva ya ha sido pagada.'], 400);
        }

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($reserva->monto_total * 100),
                'currency' => 'usd',
                'metadata' => ['reserva_id' => $reserva->id],
            ]);

            $reserva->payment_status = 'pending';
            $reserva->save();

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'reservaId' => $reserva->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function createReserva(Request $request)
    {
        $request->validate([
            'lugar_id' => 'required|exists:lugares,id',
            'cantidad_entradas' => 'required|integer|min:1',
        ]);

        try {
            $lugar = Lugar::findOrFail($request->lugar_id);

            // 1. Validar Stock
            if ($lugar->stock < $request->cantidad_entradas) {
                return response()->json(['error' => 'No hay suficiente stock disponible para este lugar.'], 400);
            }

            $monto_total = $lugar->precio * $request->cantidad_entradas;

            $reserva = new Reserva();
            $reserva->lugar_id = $request->lugar_id;
            $reserva->cantidad_entradas = $request->cantidad_entradas;
            $reserva->monto_total = $monto_total;
            $reserva->estado_pago = 'pendiente';
            $reserva->payment_status = 'pending';
            $reserva->fecha_reserva = now();
            $reserva->cliente_id = $request->user()->id;
            $reserva->save();

            return response()->json(['reserva_id' => $reserva->id, 'message' => 'Reserva creada exitosamente.'], 201);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        Log::info('Iniciando confirmación de pago', $request->all());

        $request->validate([
            'payment_intent_id' => 'required|string',
            'reserva_id' => 'required|exists:reservas,id',
        ]);

        $reserva = Reserva::with('lugar')->find($request->reserva_id); // Cargar relación lugar

        if (!$reserva) {
            Log::error('Reserva no encontrada: ' . $request->reserva_id);
            return response()->json(['error' => 'Reserva no encontrada.'], 404);
        }

        try {
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            Log::info('Estado del PaymentIntent de Stripe: ' . $paymentIntent->status);

            if ($paymentIntent->status === 'succeeded') {
                // Verificar si ya estaba pagada para no descontar stock dos veces
                if ($reserva->estado_pago !== 'pagado') {
                    $reserva->stripe_payment_id = $paymentIntent->id;
                    $reserva->estado_pago = 'pagado';
                    $reserva->payment_status = 'succeeded';
                    $reserva->save();

                    // 2. Descontar Stock
                    $lugar = $reserva->lugar;
                    if ($lugar) {
                        $lugar->stock = max(0, $lugar->stock - $reserva->cantidad_entradas);
                        $lugar->save();
                        Log::info("Stock actualizado para lugar {$lugar->id}. Nuevo stock: {$lugar->stock}");
                    }
                }

                Log::info('Reserva actualizada a PAGADO: ' . $reserva->id);

                return response()->json(['message' => 'Pago confirmado exitosamente.', 'reserva' => $reserva]);
            } else {
                $reserva->payment_status = $paymentIntent->status;
                $reserva->save();
                Log::warning('Pago no completado. Estado: ' . $paymentIntent->status);
                return response()->json(['error' => 'El pago no se ha completado exitosamente. Estado: ' . $paymentIntent->status], 400);
            }
        } catch (\Exception $e) {
            Log::error('Error en confirmPayment: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateInvoice(Request $request, $reservaId)
    {
        $reserva = Reserva::findOrFail($reservaId);

        if ($reserva->estado_pago !== 'pagado') {
            return response()->json(['error' => 'La reserva no ha sido pagada.'], 400);
        }

        // Generar QR Code
        $qrContent = "Reserva: #{$reserva->id}\nCliente: {$reserva->cliente_id}\nMonto: Bs. {$reserva->monto_total}\nFecha: {$reserva->created_at->format('d/m/Y')}";
        $qrCode = base64_encode(QrCode::format('svg')->size(150)->generate($qrContent));

        $pdf = Pdf::loadView('invoice', compact('reserva', 'qrCode'));

        return $pdf->download('factura_reserva_' . $reserva->id . '.pdf');
    }
}
