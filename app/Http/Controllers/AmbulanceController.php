<?php

namespace App\Http\Controllers;

class AmbulanceController extends Controller
{
    public function index()
    {
        return view('ambulance.index', [
            'phone' => config('site.support.ambulance_phone'),
        ]);
    }
}
