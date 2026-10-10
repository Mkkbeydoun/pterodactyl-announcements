<?php

use Illuminate\Support\Facades\Route;
use RustixDev\Announcements\Http\Controllers\ActiveAnnouncementController;

// Mounted at /api/client/extensions/announcements.
Route::get('/active', [ActiveAnnouncementController::class, 'global'])->name('active');
