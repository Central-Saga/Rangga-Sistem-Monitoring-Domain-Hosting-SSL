<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Project::class);

        $projects = Project::query()
            ->with('client')
            ->withCount('assets')
            ->when($request->user()->isClient(), function (Builder $query) use ($request): void {
                $query->where('client_id', $request->user()->client_id);
            })
            ->when($request->integer('client_id'), function (Builder $query, int $clientId): void {
                $query->where('client_id', $clientId);
            })
            ->when($request->string('status')->trim()->isNotEmpty(), function (Builder $query) use ($request): void {
                $query->where('status', $request->string('status')->trim()->value());
            })
            ->when($request->string('search')->trim()->isNotEmpty(), function (Builder $query) use ($request): void {
                $query->where('name', 'ilike', '%'.$request->string('search')->trim()->value().'%');
            })
            ->latest()
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return ProjectResource::collection($projects);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request): ProjectResource
    {
        $project = Project::query()->create($request->validated());

        return new ProjectResource($project->load('client'));
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): ProjectResource
    {
        $this->authorize('view', $project);

        return new ProjectResource($project->load(['client', 'assets' => fn ($query) => $query->orderBy('expired_date')]));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $project->update($request->validated());

        return new ProjectResource($project->load('client'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): Response
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->noContent();
    }
}
