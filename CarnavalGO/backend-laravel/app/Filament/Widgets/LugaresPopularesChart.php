<?php

namespace App\Filament\Widgets;

use App\Models\DetalleOrden;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class LugaresPopularesChart extends ChartWidget
{
    protected static ?string $heading = 'Lugares Más Vendidos (Órdenes)';
    protected static ?int $sort = 3;

    protected function getData(): array
    {
        // Contar la cantidad total vendida por lugar en órdenes pagadas
        $data = DetalleOrden::select('lugar_id', DB::raw('sum(cantidad) as total'))
            ->whereHas('orden', function ($query) {
                $query->where('estado_pago', 'pagado');
            })
            ->groupBy('lugar_id')
            ->with('lugar')
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Entradas Vendidas',
                    'data' => $data->pluck('total')->toArray(),
                    'backgroundColor' => [
                        '#f87171', // Red
                        '#fbbf24', // Amber
                        '#34d399', // Green
                        '#60a5fa', // Blue
                        '#818cf8', // Indigo
                    ],
                ],
            ],
            'labels' => $data->pluck('lugar.nombre')->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
