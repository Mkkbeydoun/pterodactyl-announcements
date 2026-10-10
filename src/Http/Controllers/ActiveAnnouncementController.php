<?php

namespace RustixDev\Announcements\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Server;
use RustixDev\Announcements\Models\Announcement;

class ActiveAnnouncementController
{
    /** Announcements for everyone, shown on the dashboard. */
    public function global(): JsonResponse
    {
        $items = Announcement::query()->active()->where('target', 'all')->orderByDesc('id')->get();

        return new JsonResponse(['data' => $items->map->toPayload()->values()]);
    }

    /** Announcements that apply to one server: global ones plus those targeting its node, location or egg. */
    public function server(Server $server): JsonResponse
    {
        $server->loadMissing('node');

        $items = Announcement::query()->active()->orderByDesc('id')->get()
            ->filter(fn (Announcement $a) => $a->appliesTo($server));

        return new JsonResponse(['data' => $items->map->toPayload()->values()]);
    }
}
