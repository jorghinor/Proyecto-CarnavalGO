<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Orden;
use App\Models\DetalleOrden;
use App\Models\Lugar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Barryvdh\DomPDF\Facade\Pdf; // Importar Pdf
use SimpleSoftwareIO\QrCode\Facades\QrCode; // Importar QrCode

class OrdenController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET'));
    }

    public function create(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:lugares,id',
            'items.*.cantidad' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $totalOrden = 0;
            $detalles = [];

            // 1. Validar Stock y Calcular Total
            foreach ($request->items as $item) {
                $lugar = Lugar::lockForUpdate()->find($item['id']); // Bloquear fila para evitar condiciones de carrera

                if (!$lugar) {
                    DB::rollBack();
                    return response()->json(['error' => "Lugar con ID {$item['id']} no encontrado."], 404);
                }
                if ($lugar->stock < $item['cantidad']) {
                    DB::rollBack();
                    return response()->json(['error' => "No hay suficiente stock para {$lugar->nombre}. Stock actual: {$lugar->stock}"], 400);
                }

                $subtotal = $lugar->precio * $item['cantidad'];
                $totalOrden += $subtotal;

                $detalles[] = [
                    'lugar_id' => $lugar->id,
                    'cantidad' => $item['cantidad'],
                    'precio_unitario' => $lugar->precio,
                    'subtotal' => $subtotal,
                ];
            }

            // 2. Crear Orden
            $orden = Orden::create([
                'cliente_id' => $request->user()->id,
                'monto_total' => $totalOrden,
                'estado_pago' => 'pendiente',
            ]);

            // 3. Crear Detalles
            foreach ($detalles as $detalle) {
                DetalleOrden::create([
                    'orden_id' => $orden->id,
                    'lugar_id' => $detalle['lugar_id'],
                    'cantidad' => $detalle['cantidad'],
                    'precio_unitario' => $detalle['precio_unitario'],
                    'subtotal' => $detalle['subtotal'],
                ]);
            }

            DB::commit();

            return response()->json(['orden_id' => $orden->id, 'message' => 'Orden creada exitosamente.'], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creando orden: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $orden = Orden::with(['detalles.lugar', 'cliente'])->find($id); // Cargar cliente también

        if (!$orden) {
            return response()->json(['error' => 'Orden no encontrada.'], 404);
        }

        return response()->json(['data' => $orden]);
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'orden_id' => 'required|exists:ordenes,id',
        ]);

        $orden = Orden::find($request->orden_id);

        if ($orden->estado_pago === 'pagado') {
            return response()->json(['error' => 'Esta orden ya ha sido pagada.'], 400);
        }

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($orden->monto_total * 100),
                'currency' => 'usd',
                'metadata' => ['orden_id' => $orden->id], // Usamos orden_id en lugar de reserva_id
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'ordenId' => $orden->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
            'orden_id' => 'required|exists:ordenes,id',
        ]);

        $orden = Orden::with('detalles.lugar')->find($request->orden_id);

        try {
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($paymentIntent->status === 'succeeded') {
                if ($orden->estado_pago !== 'pagado') {
                    $orden->stripe_payment_id = $paymentIntent->id;
                    $orden->estado_pago = 'pagado';
                    $orden->save();

                    // Descontar Stock de cada item
                    foreach ($orden->detalles as $detalle) {
                        $lugar = $detalle->lugar;
                        if ($lugar) { // Asegurarse de que el lugar existe
                            $lugar->stock = max(0, $lugar->stock - $detalle->cantidad);
                            $lugar->save();
                            Log::info("Stock actualizado para lugar {$lugar->id}. Nuevo stock: {$lugar->stock}");
                        }
                    }
                }

                return response()->json(['message' => 'Pago confirmado exitosamente.', 'orden' => $orden]);
            } else {
                return response()->json(['error' => 'El pago no se ha completado exitosamente.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateInvoice(Request $request, $ordenId)
    {
        $orden = Orden::with(['detalles.lugar', 'cliente'])->findOrFail($ordenId);

        if ($orden->estado_pago !== 'pagado') {
            return response()->json(['error' => 'La orden no ha sido pagada.'], 400);
        }

        // Generar QR Code
        $qrContent = "Orden: #{$orden->id}\nCliente: {$orden->cliente->nombre}\nMonto: Bs. {$orden->monto_total}\nFecha: {$orden->created_at->format('d/m/Y')}";
        $qrCode = base64_encode(QrCode::format('svg')->size(150)->generate($qrContent));

        $pdf = Pdf::loadView('invoice_orden', compact('orden', 'qrCode')); // Usar nueva vista invoice_orden

        return $pdf->download('factura_orden_' . $orden->id . '.pdf');
    }
}
