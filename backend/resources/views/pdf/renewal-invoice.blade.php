<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1f2937; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
        h1 { font-size: 22px; margin: 0; color: #2563eb; }
        .invoice-number { color: #6b7280; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #d1d5db; padding: 8px 10px; text-align: left; }
        th { background: #f3f4f6; width: 35%; }
        .total { font-size: 16px; font-weight: bold; color: #2563eb; }
        .footer { margin-top: 32px; color: #6b7280; font-size: 10px; text-align: center; }
        .status { display: inline-block; padding: 2px 10px; border-radius: 4px; background: #dcfce7; color: #166534; font-weight: bold; }
        .status.pending { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>INVOICE PERPANJANGAN</h1>
        <div class="invoice-number">
            No: {{ $renewal->invoice_number ?? 'RNL-'.$renewal->id }} &middot; Tanggal: {{ $renewal->renewal_date->format('d M Y') }}
        </div>
    </div>

    <table>
        <tr>
            <th>Klien</th>
            <td>{{ $renewal->asset->project?->client?->company ?? $renewal->asset->project?->client?->name }}</td>
        </tr>
        <tr>
            <th>Proyek</th>
            <td>{{ $renewal->asset->project?->name }}</td>
        </tr>
        <tr>
            <th>Aset</th>
            <td>{{ $renewal->asset->name }} ({{ $renewal->asset->type->label() }})</td>
        </tr>
        <tr>
            <th>Provider</th>
            <td>{{ $renewal->asset->provider ?? '-' }}</td>
        </tr>
        <tr>
            <th>Masa Aktif Lama</th>
            <td>s.d. {{ $renewal->previous_expired_date->format('d M Y') }}</td>
        </tr>
        <tr>
            <th>Masa Aktif Baru</th>
            <td>s.d. {{ $renewal->new_expired_date->format('d M Y') }}</td>
        </tr>
        <tr>
            <th>Metode Pembayaran</th>
            <td>{{ ucfirst($renewal->payment_method ?? '-') }}</td>
        </tr>
        <tr>
            <th>Status</th>
            <td><span class="status {{ $renewal->status->value === 'pending' ? 'pending' : '' }}">{{ $renewal->status->label() }}</span></td>
        </tr>
        <tr>
            <th>Biaya</th>
            <td class="total">Rp {{ number_format((float) $renewal->cost, 0, ',', '.') }}</td>
        </tr>
    </table>

    @if ($renewal->notes)
        <p><strong>Catatan:</strong> {{ $renewal->notes }}</p>
    @endif

    <p>Dicatat oleh: {{ $renewal->renewedBy?->name ?? '-' }}</p>

    <div class="footer">
        Dokumen ini dibuat otomatis oleh Sistem Monitoring Domain, Hosting &amp; SSL &middot; {{ $generatedAt->format('d M Y H:i') }}
    </div>
</body>
</html>
