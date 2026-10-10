<?php

namespace RustixDev\Announcements\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Location;
use Pterodactyl\Models\Node;
use RustixDev\Announcements\Models\Announcement;

class AdminAnnouncementController
{
    public function index(): JsonResponse
    {
        $items = Announcement::query()->orderByDesc('id')->get();

        return new JsonResponse(['data' => $items->map->toPayload()->values()]);
    }

    public function targets(): JsonResponse
    {
        return new JsonResponse([
            'nodes' => Node::query()->orderBy('name')->get(['id', 'name'])->map(fn (Node $n) => ['id' => $n->id, 'name' => $n->name])->values(),
            'locations' => Location::query()->orderBy('short')->get(['id', 'short', 'long'])->map(fn (Location $l) => ['id' => $l->id, 'name' => $l->long ? "{$l->short} ({$l->long})" : $l->short])->values(),
            'eggs' => Egg::query()->orderBy('name')->get(['id', 'name'])->map(fn (Egg $e) => ['id' => $e->id, 'name' => $e->name])->values(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $announcement = Announcement::query()->create($this->validated($request));

        return new JsonResponse(['data' => $announcement->toPayload()], 201);
    }

    public function update(Request $request, int $announcement): JsonResponse
    {
        $model = Announcement::query()->findOrFail($announcement);
        $model->update($this->validated($request));

        return new JsonResponse(['data' => $model->refresh()->toPayload()]);
    }

    public function destroy(int $announcement): Response
    {
        Announcement::query()->findOrFail($announcement)->delete();

        return new Response('', 204);
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'max:2000'],
            'level' => ['required', Rule::in(Announcement::LEVELS)],
            'target' => ['required', Rule::in(Announcement::TARGETS)],
            'target_ids' => ['array', 'max:200', Rule::requiredIf(fn () => $request->input('target') !== 'all')],
            'target_ids.*' => ['integer', 'min:1'],
            'dismissible' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
        ]);

        $data['target_ids'] = $data['target'] === 'all' ? null : array_values(array_unique(array_map('intval', $data['target_ids'] ?? [])));
        $data['dismissible'] = (bool) ($data['dismissible'] ?? true);

        return $data;
    }
}
