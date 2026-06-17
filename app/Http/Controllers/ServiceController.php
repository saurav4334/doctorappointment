<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceBookingRequest;
use App\Models\HomeService;

class ServiceController extends Controller
{
    public function index()
    {
        $services = HomeService::active()->get();

        return view('services.index', compact('services'));
    }

    public function show(HomeService $homeService)
    {
        abort_unless($homeService->is_active, 404);

        return view('services.show', ['service' => $homeService]);
    }

    public function storeRequest(ServiceBookingRequest $request, HomeService $homeService)
    {
        abort_unless($homeService->is_active, 404);

        $homeService->requests()->create($request->validated() + ['status' => 'pending']);

        return back()->with('service_success', 'Your request has been received. Our team will contact you shortly.');
    }
}
