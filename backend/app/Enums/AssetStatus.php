<?php

namespace App\Enums;

enum AssetStatus: string
{
    case Active = 'active';
    case Expired = 'expired';
    case Suspended = 'suspended';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Expired => 'Kedaluwarsa',
            self::Suspended => 'Ditangguhkan',
        };
    }
}
