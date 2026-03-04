<?php

namespace App\Filament\Widgets;

use App\Models\Orden;
use Filament\Widgets\ChartWidget;

class IngresosChart extends ChartWidget
{
    protected static ?string $heading = 'Ingresos por Mes (Órdenes)';
    protected static ?int $sort = 2;

    protected function getData(): array
    {
        $data = Orden::selectRaw("to_char(created_at, 'YYYY-MM') as month, sum(monto_total) as total")
            ->where('estado_pago', 'pagado')
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Ingresos (Bs)',
                    'data' => $data->pluck('total')->toArray(),
                    'backgroundColor' => '#9333ea', // Purple-600
                    'borderColor' => '#7e22ce',
                    'borderWidth' => 1,
                ],
            ],
            'labels' => $data->pluck('month')->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
