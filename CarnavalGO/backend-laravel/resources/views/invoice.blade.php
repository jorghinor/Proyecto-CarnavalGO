<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Factura de Reserva #{{ $reserva->id }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, .15);
            font-size: 16px;
            line-height: 24px;
            color: #555;
        }
        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
        }
        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }
        .invoice-box table tr td:nth-child(2) {
            text-align: right;
        }
        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }
        .invoice-box table tr.information table td {
            padding-bottom: 40px;
        }
        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }
        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.item td{
            border-bottom: 1px solid #eee;
        }
        .invoice-box table tr.item.last td {
            border-bottom: none;
        }
        .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }
        .badge-paid {
            background-color: #28a745;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            text-transform: uppercase;
        }
        .qr-container {
            text-align: center;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                CarnavalGO
                            </td>
                            <td>
                                Factura #: {{ $reserva->id }}<br>
                                Fecha: {{ $reserva->created_at->format('d/m/Y') }}<br>
                                Estado: <span class="badge-paid">{{ strtoupper($reserva->estado_pago) }}</span>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                Carnaval de Oruro 2026<br>
                                Oruro, Bolivia
                            </td>
                            <td>
                                Cliente ID: {{ $reserva->cliente_id ?? 'Consumidor Final' }}<br>
                                Transacción: {{ $reserva->stripe_payment_id }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr class="heading">
                <td>
                    Descripción
                </td>
                <td>
                    Precio
                </td>
            </tr>

            <tr class="item">
                <td>
                    {{ $reserva->lugar->nombre }} ({{ $reserva->cantidad_entradas }} entradas)
                </td>
                <td>
                    Bs. {{ number_format($reserva->monto_total, 2) }}
                </td>
            </tr>

            <tr class="total">
                <td></td>
                <td>
                   Total: Bs. {{ number_format($reserva->monto_total, 2) }}
                </td>
            </tr>
        </table>

        <div class="qr-container">
            <p>Escanea para validar:</p>
            <img src="data:image/svg+xml;base64,{{ $qrCode }}" alt="Código QR de Validación" width="150">
        </div>

        <div style="text-align: center; margin-top: 20px;">
            <p>¡Gracias por tu compra!</p>
            <p style="font-size: 12px; color: #999;">Este documento es un comprobante de reserva válido.</p>
        </div>
    </div>
</body>
</html>
