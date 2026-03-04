<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrdenResource\Pages;
use App\Filament\Resources\OrdenResource\RelationManagers;
use App\Models\Orden;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class OrdenResource extends Resource
{
    protected static ?string $model = Orden::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationLabel = 'Órdenes de Compra';
    protected static ?string $navigationGroup = 'Ventas';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Resumen de la Orden')
                    ->schema([
                        Forms\Components\Select::make('cliente_id')
                            ->relationship('cliente', 'nombre')
                            ->disabled()
                            ->required(),
                        Forms\Components\TextInput::make('monto_total')
                            ->prefix('Bs.')
                            ->numeric()
                            ->disabled(),
                        Forms\Components\Select::make('estado_pago')
                            ->options([
                                'pendiente' => 'Pendiente',
                                'pagado' => 'Pagado',
                                'fallido' => 'Fallido',
                            ])
                            ->required(),
                        Forms\Components\TextInput::make('stripe_payment_id')
                            ->label('ID Transacción Stripe')
                            ->disabled(),
                        Forms\Components\TextInput::make('created_at')
                            ->label('Fecha de Compra')
                            ->disabled(),
                    ])->columns(2)
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->sortable()
                    ->label('ID'),
                Tables\Columns\TextColumn::make('cliente.nombre')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('monto_total')
                    ->money('bob')
                    ->sortable(),
                Tables\Columns\TextColumn::make('estado_pago')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pendiente' => 'warning',
                        'pagado' => 'success',
                        'fallido' => 'danger',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->label('Fecha'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado_pago')
                    ->options([
                        'pendiente' => 'Pendiente',
                        'pagado' => 'Pagado',
                        'fallido' => 'Fallido',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\DetallesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrdens::route('/'),
            'create' => Pages\CreateOrden::route('/create'),
            'edit' => Pages\EditOrden::route('/{record}/edit'),
        ];
    }
}
