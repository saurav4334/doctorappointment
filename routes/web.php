<?php

use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Admin\DoctorScheduleController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\Admin\HospitalController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\HospitalController as PublicHospitalController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// Public site
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/doctors', [DoctorController::class, 'index'])->name('doctors.index');
Route::get('/doctors/{doctor:slug}/slots', [BookingController::class, 'slots'])->name('booking.slots');
Route::post('/doctors/{doctor:slug}/book', [BookingController::class, 'store'])->name('booking.store');
Route::get('/doctors/{doctor:slug}', [DoctorController::class, 'show'])->name('doctors.show');
Route::get('/hospitals', [PublicHospitalController::class, 'index'])->name('hospitals.index');
Route::get('/hospitals/{hospital:slug}', [PublicHospitalController::class, 'show'])->name('hospitals.show');

// Authenticated users landing → admin
Route::get('/dashboard', fn () => redirect()->route('admin.dashboard'))
    ->middleware(['auth', 'verified'])->name('dashboard');

// Admin panel (super_admin + admin)
Route::middleware(['auth', 'role:super_admin|admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::post('doctors/{doctor}/schedules', [DoctorScheduleController::class, 'store'])->name('doctors.schedules.store');
        Route::delete('doctors/{doctor}/schedules/{schedule}', [DoctorScheduleController::class, 'destroy'])->name('doctors.schedules.destroy');

        Route::resource('doctors', AdminDoctorController::class);
        Route::resource('departments', DepartmentController::class);
        Route::resource('hospitals', HospitalController::class);
        Route::resource('advertisements', AdvertisementController::class);
        Route::resource('hero-slides', HeroSlideController::class)->parameters(['hero-slides' => 'heroSlide']);
        Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'setStatus'])->name('appointments.set-status');
        Route::resource('appointments', AppointmentController::class);
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
