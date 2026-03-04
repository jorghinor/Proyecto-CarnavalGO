<?php

namespace App\Filament\Widgets;

use App\Models\Reserva;
use App\Models\Orden; // Importar Orden
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        // Calcular Total de Ingresos (Ordenes + Reservas antiguas)
        $ingresosOrdenes = Orden::where('estado_pago', 'pagado')->sum('monto_total');
        $ingresosReservas = Reserva::where('estado_pago', 'pagado')->sum('monto_total');
        $totalIngresos = $ingresosOrdenes + $ingresosReservas;

        // Calcular Total de Transacciones
        $totalTransacciones = Orden::count() + Reserva::count();

        // Calcular Transacciones Pagadas
        $pagadasOrdenes = Orden::where('estado_pago', 'pagado')->count();
        $pagadasReservas = Reserva::where('estado_pago', 'pagado')->count();
        $totalPagadas = $pagadasOrdenes + $pagadasReservas;

        return [
            Stat::make('Total Ingresos', 'Bs. ' . number_format($totalIngresos, 2))
                ->description('Ingresos netos confirmados')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success')
                ->chart([7, 2, 10, 3, 15, 4, 17]),

            Stat::make('Total Transacciones', $totalTransacciones)
                ->description('Órdenes y Reservas')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),

            Stat::make('Ventas Pagadas', $totalPagadas)
                ->description('Transacciones completadas')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),
        ];
    }
}
