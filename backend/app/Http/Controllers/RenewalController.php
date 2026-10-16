<?php

namespace App\Http\Controllers;

use App\Enums\AssetStatus;
use App\Enums\RenewalStatus;
use App\Http\Requests\StoreRenewalRequest;
use App\Http\Requests\UpdateRenewalRequest;
use App\Http\Resources\RenewalResource;
use App\Models\Asset;
use App\Models\Renewal;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class RenewalController extends Controller
{
    /**
     * Riwayat perpanjangan milik satu aset.
     */
    public function index(Asset $asset): AnonymousResourceCollection
    {
        $this->authorize('view', $asset);

        $renewals = $asset->renewals()
            ->with('renewedBy')
            ->latest('renewal_date')
            ->get();

        return RenewalResource::collection($renewals);
    }

    /**
     * Catat perpanjangan baru sekaligus perbarui masa aktif aset.
     */
    public function store(StoreRenewalRequest $request, Asset $asset): RenewalResource
    {
        $renewal = DB::transaction(function () use ($request, $asset): Renewal {
            $validated = $request->validated();

            $renewal = $asset->renewals()->create([
                'renewed_by' => $request->user()->id,
                'renewal_date' => $validated['renewal_date'] ?? now()->toDateString(),
                'previous_expired_date' => $asset->expired_date,
                'new_expired_date' => $validated['new_expired_date'],
                'cost' => $validated['cost'] ?? $asset->renewal_cost,
                'invoice_number' => $validated['invoice_number'] ?? null,
                'payment_method' => $validated['payment_method'] ?? null,
                'status' => $validated['status'] ?? RenewalStatus::Paid->value,
                'notes' => $validated['notes'] ?? null,
            ]);

            $asset->update([
                'expired_date' => $validated['new_expired_date'],
                'status' => $asset->status === AssetStatus::Expired
                    ? AssetStatus::Active->value
                    : $asset->status->value,
            ]);

            return $renewal;
        });

        return new RenewalResource($renewal->load(['renewedBy', 'asset']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Renewal $renewal): RenewalResource
    {
        $this->authorize('view', $renewal);

        return new RenewalResource($renewal->load(['renewedBy', 'asset.project.client']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRenewalRequest $request, Renewal $renewal): RenewalResource
    {
        $renewal->update($request->validated());

        return new RenewalResource($renewal->load(['renewedBy', 'asset']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Renewal $renewal): Response
    {
        $this->authorize('delete', $renewal);

        $renewal->delete();

        return response()->noContent();
    }
}
