# Announcements

Show scheduled announcements to everyone, or only to servers on chosen nodes, locations or eggs.

## Features

- **Panel-wide banners** on the dashboard, shown to every user.
- **Targeted banners** on the server console page, only for servers on chosen nodes, locations or eggs.
- **Scheduling**: optional start and end times. Announcements appear and disappear on their own.
- **Four levels**: Information, Good news, Warning and Urgent, styled with the panel's own alert colours so they match any theme.
- **Dismissible or not**: users can hide an announcement in their browser. Editing it shows it again. Turn dismissing off for anything people must read.
- **Admin page** at **Admin → Announcements** to create, edit and delete announcements.

## API

| Method | Path | Who |
|---|---|---|
| GET | `/api/client/extensions/announcements/active` | Any signed-in user (panel-wide announcements) |
| GET | `/api/client/servers/{server}/extensions/announcements/active` | Anyone who can see the server |
| GET, POST | `/api/admin/extensions/announcements/announcements` | Root admins |
| PATCH, DELETE | `/api/admin/extensions/announcements/announcements/{id}` | Root admins |

## Requirements

- Pterodactyl Panel 2.0 (2.0-develop or later)
- PHP 8.3+

## Install

From a release archive (`announcements-1.0.0.pteroext`):

```sh
php artisan p:extension:install /path/to/announcements-1.0.0.pteroext --enable
```

Or upload the archive under **Admin → Extensions**. Reload the panel afterwards.

## Build from source

```sh
npm install
npm run typecheck
npm test
npm run build
php artisan p:extension:doctor /path/to/announcements
php artisan p:extension:pack /path/to/announcements
```

## Uninstall

```sh
php artisan p:extension:remove announcements
```
