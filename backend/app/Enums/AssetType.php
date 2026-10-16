<?php

namespace App\Enums;

enum AssetType: string
{
    case Domain = 'domain';
    case Hosting = 'hosting';
    case Ssl = 'ssl';
    case Vps = 'vps';

    public function label(): string
    {
        return match ($this) {
            self::Domain => 'Domain',
            self::Hosting => 'Hosting',
            self::Ssl => 'SSL',
            self::Vps => 'VPS',
        };
    }
}
