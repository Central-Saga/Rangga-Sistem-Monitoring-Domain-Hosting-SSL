<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1f2937; }
        h1 { font-size: 18px; margin-bottom: 2px; }
        .meta { color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
        th { background: #f3f4f6; font-size: 10px; text-transform: uppercase; }
        .danger { color: #dc2626; font-weight: bold; }
        .warning { color: #d97706; font-weight: bold; }
        .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; background: #e5e7eb; font-size: 10px; }
    </style>
</head>
<body>
    <h1>Laporan Aset Akan Kedaluwarsa</h1>
    <p class="meta">
        Rentang: {{ $days }} hari ke depan &middot; Dibuat: {{ $generatedAt->format('d M Y H:i') }} &middot; Total: {{ $assets->count() }} aset
    </p>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Aset</th>
                <th>Tipe</th>
                <th>Proyek / Klien</th>
                <th>Provider</th>
                <th>Kedaluwarsa</th>
                <th>Sisa Hari</th>
                <th>Biaya Perpanjangan</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($assets as $asset)
                @php $daysLeft = $asset->daysUntilExpiry(); @endphp
                <tr>
                    <td>{{ $loop->iteration }}</td>
                    <td>{{ $asset->name }}</td>
                    <td><span class="badge">{{ $asset->type->label() }}</span></td>
                    <td>{{ $asset->project?->name }}<br><small>{{ $asset->project?->client?->company ?? $asset->project?->client?->name }}</small></td>
                    <td>{{ $asset->provider }}</td>
                    <td>{{ $asset->expired_date->format('d M Y') }}</td>
                    <td class="{{ $daysLeft <= 7 ? 'danger' : 'warning' }}">{{ $daysLeft }} hari</td>
                    <td>Rp {{ number_format((float) $asset->renewal_cost, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr><td colspan="8" style="text-align:center">Tidak ada aset yang akan kedaluwarsa.</td></tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
