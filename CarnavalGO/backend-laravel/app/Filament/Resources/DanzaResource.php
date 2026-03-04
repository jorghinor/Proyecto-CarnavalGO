<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DanzaResource\Pages;
use App\Models\Danza;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class DanzaResource extends Resource
{
    protected static ?string $model = Danza::class;

    protected static ?string $navigationIcon = 'heroicon-o-sparkles';
    protected static ?string $navigationLabel = 'Danzas Folklóricas';
    protected static ?string $navigationGroup = 'Gestión del Evento';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Información de la Danza')
                    ->schema([
                        Forms\Components\TextInput::make('nombre')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\RichEditor::make('descripcion')
                            ->columnSpanFull(),
                        Forms\Components\FileUpload::make('imagen')
                            ->image()
                            ->directory('danzas'),
                        Forms\Components\DatePicker::make('fecha_origen')
                            ->label('Fecha de Origen (Aproximada)')
                            ->native(true), // Forzar el uso del selector nativo del navegador
                        Forms\Components\Select::make('estado')
                            ->options([
                                'activo' => 'Activo',
                                'inactivo' => 'Inactivo',
                            ])
                            ->required()
                            ->default('activo')
                            ->native(false),
                    ])->columns(2)
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
                Tables\Columns\TextColumn::make('estado')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'activo' => 'success',
                        'inactivo' => 'danger',
                    }),
                Tables\Columns\TextColumn::make('fecha_origen')
                    ->date('d/m/Y')
                    ->sortable()
                    ->label('Origen'),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('estado')
                    ->options([
                        'activo' => 'Activo',
                        'inactivo' => 'Inactivo',
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
            'index' => Pages\ListDanzas::route('/'),
            'create' => Pages\CreateDanza::route('/create'),
            'edit' => Pages\EditDanza::route('/{record}/edit'),
        ];
    }
}
