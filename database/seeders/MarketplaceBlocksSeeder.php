<?php

namespace Database\Seeders;

use App\Models\CorporateClient;
use App\Models\HomeService;
use App\Models\StatCounter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MarketplaceBlocksSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            ['Doctor Appointment', '🩺', 'Book verified specialist doctors near you.'],
            ['Diagnostic Test', '🧪', 'Find diagnostic centers and book lab tests.'],
            ['Ambulance Service', '🚑', '24/7 emergency ambulance support.'],
            ['Physiotherapist at Home', '🦵', 'Professional physiotherapy at your doorstep.'],
            ['Blood Sample Collection', '💉', 'Home blood sample collection by trained staff.'],
            ['Nurse / PCA at Home', '👩‍⚕️', 'Trained nurses and patient care attendants at home.'],
            ['Home Doctor Visit', '🏠', 'Get a qualified doctor to visit your home.'],
            ['Medical Equipment Rental', '🛏️', 'Rent oxygen, beds and essential equipment.'],
        ];
        foreach ($services as $i => [$title, $icon, $desc]) {
            HomeService::updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'title' => $title,
                    'icon' => $icon,
                    'description' => $desc,
                    'benefits' => "Verified providers\nTransparent pricing\nFast response",
                    'contact_phone' => '09611 530 530',
                    'sort_order' => $i,
                    'is_active' => true,
                ]
            );
        }

        $counters = [
            ['Registered Doctors', 500, '+', '🩺'],
            ['Partner Hospitals', 40, '+', '🏥'],
            ['Ambulance Served', 1200, '+', '🚑'],
            ['Successful Appointments', 25000, '+', '✅'],
        ];
        foreach ($counters as $i => [$title, $value, $suffix, $icon]) {
            StatCounter::updateOrCreate(
                ['title' => $title],
                ['value' => $value, 'suffix' => $suffix, 'icon' => $icon, 'sort_order' => $i, 'is_active' => true]
            );
        }

        $clients = ['Square Group', 'BRAC', 'Grameenphone', 'City Bank', 'Pran-RFL', 'Robi Axiata'];
        foreach ($clients as $i => $name) {
            CorporateClient::updateOrCreate(
                ['name' => $name],
                ['website_url' => null, 'sort_order' => $i, 'is_active' => true]
            );
        }
    }
}
