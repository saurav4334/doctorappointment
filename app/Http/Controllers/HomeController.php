<?php

namespace App\Http\Controllers;

use App\Models\CorporateClient;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\HeroSlide;
use App\Models\HomeService;
use App\Models\Hospital;
use App\Models\StatCounter;
use App\Models\Testimonial;

class HomeController extends Controller
{
    public function index()
    {
        $heroSlides = HeroSlide::active()->get();

        $featuredDoctors = Doctor::active()
            ->featured()
            ->with('hospital:id,name')
            ->limit(8)
            ->get();

        $departments = Department::active()->orderBy('sort_order')->orderBy('name')->get();

        $hospitals = Hospital::active()->latest()->limit(6)->get();

        $testimonials = Testimonial::active()->orderBy('sort_order')->limit(6)->get();

        // For the hero appointment-search city dropdown.
        $cities = Hospital::active()->whereNotNull('city')->where('city', '!=', '')
            ->distinct()->orderBy('city')->pluck('city');

        $healthcareServices = HomeService::active()->limit(9)->get();
        $statCounters = StatCounter::active()->get();
        $corporateClients = CorporateClient::active()->get();

        return view('home', compact(
            'heroSlides',
            'featuredDoctors',
            'departments',
            'hospitals',
            'testimonials',
            'cities',
            'healthcareServices',
            'statCounters',
            'corporateClients',
        ));
    }
}
