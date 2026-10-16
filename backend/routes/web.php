<?php

use App\Enums\AssetType;
use App\Enums\RenewalStatus;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/renewal-invoice', function () {
    $renewal = (object) [
        'id' => 1,
        'invoice_number' => 'INV-DEMO-001',
        'renewal_date' => now(),
        'previous_expired_date' => now()->subYear(),
        'new_expired_date' => now()->addYear(),
        'cost' => 250000,
        'payment_method' => 'transfer',
        'status' => RenewalStatus::Pending,
        'notes' => 'Contoh invoice perpanjangan untuk keperluan demo.',
        'asset' => (object) [
            'name' => 'contoh.id',
            'type' => AssetType::Domain,
            'provider' => 'Provider Demo',
            'project' => (object) [
                'name' => 'Website Klien Demo',
                'client' => (object) [
                    'company' => 'PT Klien Demo',
                    'name' => 'Klien Demo',
                ],
            ],
        ],
        'renewedBy' => (object) ['name' => 'Admin Demo'],
    ];

    return view('pdf.renewal-invoice', [
        'renewal' => $renewal,
        'generatedAt' => now(),
    ]);
});
