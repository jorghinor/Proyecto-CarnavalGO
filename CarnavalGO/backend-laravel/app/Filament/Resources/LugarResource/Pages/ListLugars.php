<?php

namespace App\Filament\Resources\LugarResource\Pages;

use App\Filament\Resources\LugarResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListLugars extends ListRecords
{
    protected static string $resource = LugarResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
