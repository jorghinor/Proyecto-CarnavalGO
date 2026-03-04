<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReservaResource\Pages;
use App\Models\Reserva;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class ReservaResource extends Resource
{
    protected static ?string $model = Reserva::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';
    protected static ?string $navigationLabel = 'Ventas y Reservas';
    protected static ?string $navigationGroup = 'Ventas';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Detalles de la Reserva')
                    ->schema([
                        Forms\Components\Select::make('cliente_id')
                            ->relationship('cliente', 'nombre')
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                Forms\Components\TextInput::make('nombre')->required(),
                                Forms\Components\TextInput::make('ci_dni')->label('CI / DNI')->required(),
                                Forms\Components\TextInput::make('email')->email()->required(),
                                Forms\Components\TextInput::make('telefono'),
                            ])
                            ->required(),
                        Forms\Components\Select::make('lugar_id')
                            ->relationship('lugar', 'nombre')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->live()
                            ->afterStateUpdated(function ($state, Forms\Set $set) {
                                $lugar = \App\Models\Lugar::find($state);
                                if ($lugar) {
                                    $set('precio_unitario', $lugar->precio);
                                    $set('monto_total', $lugar->precio);
                                }
                            }),
                        Forms\Components\DatePicker::make('fecha_reserva')
                            ->required()
                            ->default(now()),
                        Forms\Components\TextInput::make('cantidad_entradas')
                            ->required()
                            ->numeric()
                            ->default(1)
                            ->minValue(1)
                            ->live()
                            ->afterStateUpdated(function ($state, Forms\Get $get, Forms\Set $set) {
                                $precio = $get('precio_unitario') ?? 0;
                                $set('monto_total', $state * $precio);
                            }),

                        Forms\Components\Hidden::make('precio_unitario'),

                        Forms\Components\TextInput::make('monto_total')
                            ->required()
                            ->numeric()
                            ->prefix('Bs.')
                            ->readOnly(),

                        Forms\Components\Select::make('estado_pago')
                            ->options([
                                'pendiente' => 'Pendiente',
                                'pagado' => 'Pagado',
                                'cancelado' => 'Cancelado',
                            ])
                            ->required()
                            ->default('pendiente')
                            ->native(false),
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
                Tables\Columns\TextColumn::make('lugar.nombre')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('fecha_reserva')
                    ->date('d/m/Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('cantidad_entradas')
                    ->numeric()
                    ->label('Cant.'),
                Tables\Columns\TextColumn::make('monto_total')
                    ->money('bob')
                    ->sortable(),
                Tables\Columns\TextColumn::make('estado_pago')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'pendiente' => 'warning',
                        'pagado' => 'success',
                        'cancelado' => 'danger',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado_pago')
                    ->options([
                        'pendiente' => 'Pendiente',
                        'pagado' => 'Pagado',
                        'cancelado' => 'Cancelado',
                    ]),
                Tables\Filters\Filter::make('fecha_reserva')
                    ->form([
                        Forms\Components\DatePicker::make('desde'),
                        Forms\Components\DatePicker::make('hasta'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['desde'],
                                fn (Builder $query, $date): Builder => $query->whereDate('fecha_reserva', '>=', $date),
                            )
                            ->when(
                                $data['hasta'],
                                fn (Builder $query, $date): Builder => $query->whereDate('fecha_reserva', '<=', $date),
                            );
                    })
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListReservas::route('/'),
            'create' => Pages\CreateReserva::route('/create'),
            'edit' => Pages\EditReserva::route('/{record}/edit'),
        ];
    }
}
