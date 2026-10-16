<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Active = 'active';
    case OnHold = 'on_hold';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::OnHold => 'Ditahan',
            self::Completed => 'Selesai',
        };
    }
}
