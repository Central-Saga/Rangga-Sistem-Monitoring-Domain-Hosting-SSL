<?php

namespace App\Http\Controllers;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\Renewal;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ReportController extends Controller
{
    /**
     * Laporan PDF aset yang akan kedaluwarsa dalam N hari.
     */
    public function expiringAssets(Request $request): Response
    {
        abort_if($request->user()->isClient(), 403, 'Hanya admin/staff yang dapat mengunduh laporan.');

        $days = min($request->integer('days', 30), 365);

        $assets = Asset::query()
            ->with('project.client')
            ->where('status', AssetStatus::Active->value)
            ->whereDate('expired_date', '>=', now()->toDateString())
            ->whereDate('expired_date', '<=', now()->addDays($days)->toDateString())
            ->orderBy('expired_date')
            ->get();

        $pdf = Pdf::loadView('pdf.expiring-assets', [
            'assets' => $assets,
            'days' => $days,
            'generatedAt' => now(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download("laporan-aset-kedaluwarsa-{$days}-hari.pdf");
    }

    /**
     * Invoice PDF untuk satu transaksi perpanjangan.
     */
    public function renewalInvoice(Request $request, Renewal $renewal): Response
    {
        $this->authorize('view', $renewal);

        $pdf = Pdf::loadView('pdf.renewal-invoice', [
            'renewal' => $renewal->load(['asset.project.client', 'renewedBy']),
            'generatedAt' => now(),
        ])->setPaper('a4');

        $number = $renewal->invoice_number ?? $renewal->id;

        return $pdf->download("invoice-perpanjangan-{$number}.pdf");
    }
}
