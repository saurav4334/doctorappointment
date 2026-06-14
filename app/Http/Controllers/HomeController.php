<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Doctor;
use App\Models\HeroSlide;
use App\Models\Hospital;
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

        return view('home', compact(
            'heroSlides',
            'featuredDoctors',
            'departments',
            'hospitals',
            'testimonials',
        ));
    }
}
