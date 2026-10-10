<?php

use Illuminate\Support\Facades\Route;
use RustixDev\Announcements\Http\Controllers\ActiveAnnouncementController;

// Mounted at /api/client/servers/{server}/extensions/announcements.
// Anyone who can see the server may read the announcements that apply to it.
Route::get('/active', [ActiveAnnouncementController::class, 'server'])->name('active');
