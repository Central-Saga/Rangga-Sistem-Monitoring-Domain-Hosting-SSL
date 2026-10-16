<?php

namespace App\Enums;

enum RenewalStatus: string
{
    case Paid = 'paid';
    case Pending = 'pending';

    public function label(): string
    {
        return match ($this) {
            self::Paid => 'Lunas',
            self::Pending => 'Menunggu Pembayaran',
        };
    }
}
