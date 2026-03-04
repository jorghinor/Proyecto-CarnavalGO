<?php

namespace App\Filament\Resources\DanzaResource\Pages;

use App\Filament\Resources\DanzaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDanza extends EditRecord
{
    protected static string $resource = DanzaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
