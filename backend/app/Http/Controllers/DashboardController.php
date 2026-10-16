<?php

namespace App\Http\Controllers;

use App\Enums\AssetStatus;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /**
     * Ringkasan statistik + daftar countdown untuk dashboard.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        $scopedAssets = fn (): Builder => Asset::query()
            ->when($user->isClient(), function (Builder $query) use ($user): void {
                $query->whereHas('project', fn (Builder $query) => $query->where('client_id', $user->client_id));
            });

        $countsByType = Cache::remember('dashboard:asset-counts:'.$user->id, now()->addSeconds(30), fn (): array => $scopedAssets()
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type')
            ->all());

        $expiringAssets = fn (int $days): Builder => $scopedAssets()
            ->where('status', AssetStatus::Active->value)
            ->whereDate('expired_date', '>=', now()->toDateString())
            ->whereDate('expired_date', '<=', now()->addDays($days)->toDateString());

        $countdown = $scopedAssets()
            ->with('project.client')
            ->where('status', AssetStatus::Active->value)
            ->whereDate('expired_date', '<=', now()->addDays(30)->toDateString())
            ->orderBy('expired_date')
            ->limit(20)
            ->get();

        return response()->json([
            'summary' => [
                'clients' => $user->isClient() ? null : Client::query()->count(),
                'projects' => Project::query()
                    ->when($user->isClient(), fn (Builder $query) => $query->where('client_id', $user->client_id))
                    ->count(),
                'assets_total' => $scopedAssets()->count(),
                'assets_by_type' => $countsByType,
                'expiring_in_30_days' => $expiringAssets(30)->count(),
                'expiring_in_7_days' => $expiringAssets(7)->count(),
                'expired' => $scopedAssets()->where('status', AssetStatus::Expired->value)->count(),
                'unread_notifications' => $user->unreadNotifications()->count(),
            ],
            'countdown' => AssetResource::collection($countdown),
        ]);
    }
}
