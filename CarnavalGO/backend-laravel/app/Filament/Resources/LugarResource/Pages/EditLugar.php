<?php

namespace App\Filament\Resources\LugarResource\Pages;

use App\Filament\Resources\LugarResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditLugar extends EditRecord
{
    protected static string $resource = LugarResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
