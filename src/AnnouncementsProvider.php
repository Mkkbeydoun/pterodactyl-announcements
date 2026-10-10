<?php

namespace RustixDev\Announcements;

use Pterodactyl\Extensions\ExtensionProvider;

class AnnouncementsProvider extends ExtensionProvider
{
    public function boot(): void
    {
        // routes/client.php, routes/server.php and routes/admin.php.
        $this->registerApiRoutes();
    }
}
