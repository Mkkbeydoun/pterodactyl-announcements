<?php

use Illuminate\Support\Facades\Route;
use RustixDev\Announcements\Http\Controllers\AdminAnnouncementController;

// Mounted at /api/admin/extensions/announcements (root admins only).
Route::get('/announcements', [AdminAnnouncementController::class, 'index'])->name('announcements.index');
Route::get('/targets', [AdminAnnouncementController::class, 'targets'])->name('targets');
Route::post('/announcements', [AdminAnnouncementController::class, 'store'])->name('announcements.store');
Route::patch('/announcements/{announcement}', [AdminAnnouncementController::class, 'update'])->whereNumber('announcement')->name('announcements.update');
Route::delete('/announcements/{announcement}', [AdminAnnouncementController::class, 'destroy'])->whereNumber('announcement')->name('announcements.destroy');
