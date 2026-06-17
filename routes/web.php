<?php

use App\Http\Controllers\Admin\AdvertisementController;
use App\Http\Controllers\Admin\AppointmentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\DoctorController as AdminDoctorController;
use App\Http\Controllers\Admin\DoctorScheduleController;
use App\Http\Controllers\Admin\HeroSlideController;
use App\Http\Controllers\Admin\CorporateClientController;
use App\Http\Controllers\Admin\HealthcareServiceController;
use App\Http\Controllers\Admin\HospitalController;
use App\Http\Controllers\Admin\ServiceRequestController;
use App\Http\Controllers\Admin\SmsSettingController;
use App\Http\Controllers\Admin\SmsTemplateController;
use App\Http\Controllers\Admin\StatCounterController;
use App\Http\Controllers\AdClickController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AmbulanceController;
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
Route::get('/ads/{advertisement}/click', AdClickController::class)->name('ads.click');
Route::get('/ambulance', [AmbulanceController::class, 'index'])->name('ambulance');
Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
Route::get('/services/{homeService:slug}', [ServiceController::class, 'show'])->name('services.show');
Route::post('/services/{homeService:slug}/request', [ServiceController::class, 'storeRequest'])->name('services.request');

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

        Route::resource('healthcare-services', HealthcareServiceController::class)->parameters(['healthcare-services' => 'service']);
        Route::resource('corporate-clients', CorporateClientController::class)->parameters(['corporate-clients' => 'corporateClient']);
        Route::resource('stat-counters', StatCounterController::class)->parameters(['stat-counters' => 'statCounter']);
        Route::get('service-requests', [ServiceRequestController::class, 'index'])->name('service-requests.index');
        Route::patch('service-requests/{serviceRequest}/status', [ServiceRequestController::class, 'setStatus'])->name('service-requests.set-status');
        Route::delete('service-requests/{serviceRequest}', [ServiceRequestController::class, 'destroy'])->name('service-requests.destroy');

        // SMS module — one unified tabbed page
        Route::get('sms-settings', [SmsSettingController::class, 'edit'])->name('sms-settings.edit');
        Route::put('sms-settings', [SmsSettingController::class, 'update'])->name('sms-settings.update');
        Route::post('sms-settings/test', [SmsSettingController::class, 'test'])->name('sms-settings.test');
        Route::put('sms-templates/{smsTemplate}', [SmsTemplateController::class, 'update'])->name('sms-templates.update');

        // Backward-compatible redirects into the relevant tab.
        Route::get('sms-templates', fn () => redirect()->route('admin.sms-settings.edit', ['tab' => 'templates']))->name('sms-templates.index');
        Route::get('sms-logs', fn () => redirect()->route('admin.sms-settings.edit', ['tab' => 'logs']))->name('sms-logs.index');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
