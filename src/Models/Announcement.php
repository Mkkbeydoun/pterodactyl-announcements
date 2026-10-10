<?php

namespace RustixDev\Announcements\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Pterodactyl\Models\Server;

/**
 * @property int $id
 * @property string $title
 * @property string $body
 * @property string $level
 * @property string $target
 * @property array<int, int>|null $target_ids
 * @property bool $dismissible
 * @property CarbonInterface|null $starts_at
 * @property CarbonInterface|null $ends_at
 * @property CarbonInterface $created_at
 * @property CarbonInterface $updated_at
 */
class Announcement extends Model
{
    public const LEVELS = ['info', 'success', 'warning', 'danger'];

    public const TARGETS = ['all', 'nodes', 'locations', 'eggs'];

    protected $table = 'ext_announcements';

    protected $fillable = ['title', 'body', 'level', 'target', 'target_ids', 'dismissible', 'starts_at', 'ends_at'];

    protected function casts(): array
    {
        return [
            'target_ids' => 'array',
            'dismissible' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    /** Announcements whose window includes the current time. */
    public function scopeActive(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where(fn (Builder $q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn (Builder $q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', $now));
    }

    /** Whether this announcement applies to the given server. */
    public function appliesTo(Server $server): bool
    {
        $ids = array_map('intval', $this->target_ids ?? []);

        return match ($this->target) {
            'all' => true,
            'nodes' => in_array($server->node_id, $ids, true),
            'locations' => in_array((int) $server->node?->location_id, $ids, true),
            'eggs' => in_array($server->egg_id, $ids, true),
            default => false,
        };
    }

    /** The shape returned to the panel's frontend. */
    public function toPayload(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'level' => $this->level,
            'target' => $this->target,
            'target_ids' => array_map('intval', $this->target_ids ?? []),
            'dismissible' => $this->dismissible,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
