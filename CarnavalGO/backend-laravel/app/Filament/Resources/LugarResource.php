<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LugarResource\Pages;
use App\Models\Lugar;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class LugarResource extends Resource
{
    protected static ?string $model = Lugar::class;

    protected static ?string $navigationIcon = 'heroicon-o-map-pin';
    protected static ?string $navigationLabel = 'Palcos y Graderías';
    protected static ?string $modelLabel = 'Lugar';
    protected static ?string $navigationGroup = 'Gestión del Evento';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información del Lugar')
                    ->description('Detalles sobre la ubicación y capacidad.')
                    ->schema([
                        Forms\Components\TextInput::make('nombre')
                            ->required()
                            ->maxLength(255)
                            ->placeholder('Ej: Gradería Norte - Bloque A'),
                        Forms\Components\TextInput::make('ubicacion')
                            ->maxLength(255)
                            ->placeholder('Ej: Av. 6 de Agosto esq. Bolívar'),
                        Forms\Components\Grid::make(2)
                            ->schema([
                                Forms\Components\TextInput::make('capacidad')
                                    ->required()
                                    ->numeric()
                                    ->minValue(1)
                                    ->suffix('personas'),
                                Forms\Components\TextInput::make('precio')
                                    ->required()
                                    ->numeric()
                                    ->prefix('Bs.')
                                    ->minValue(0),
                                Forms\Components\TextInput::make('stock') // <-- Añadido el campo stock al formulario
                                    ->required()
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->suffix('entradas'),
                            ]),
                        Forms\Components\Select::make('estado')
                            ->options([
                                'disponible' => 'Disponible',
                                'ocupado' => 'Ocupado',
                                'mantenimiento' => 'Mantenimiento',
                            ])
                            ->required()
                            ->default('disponible')
                            ->native(false),
                        Forms\Components\FileUpload::make('imagen')
                            ->image()
                            ->directory('lugares')
                            ->columnSpanFull(),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('imagen')
                    ->circular(),
                Tables\Columns\TextColumn::make('nombre')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('ubicacion')
                    ->searchable()
                    ->icon('heroicon-m-map-pin')
                    ->limit(30),
                Tables\Columns\TextColumn::make('capacidad')
                    ->numeric()
                    ->sortable()
                    ->suffix(' pers.'),
                Tables\Columns\TextColumn::make('stock') // <-- Añadido el campo stock a la tabla
                    ->numeric()
                    ->sortable()
                    ->suffix(' entradas'),
                Tables\Columns\TextColumn::make('precio')
                    ->money('bob')
                    ->sortable(),
                Tables\Columns\TextColumn::make('estado')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'disponible' => 'success',
                        'ocupado' => 'danger',
                        'mantenimiento' => 'warning',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->options([
                        'disponible' => 'Disponible',
                        'ocupado' => 'Ocupado',
                        'mantenimiento' => 'Mantenimiento',
                    ]),
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
            'index' => Pages\ListLugars::route('/'),
            'create' => Pages\CreateLugar::route('/create'),
            'edit' => Pages\EditLugar::route('/{record}/edit'),
        ];
    }
}
