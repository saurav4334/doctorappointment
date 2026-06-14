<?php

namespace Database\Seeders;

use App\Models\Advertisement;
use App\Models\Department;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\HeroSlide;
use App\Models\Hospital;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        // Departments
        $departments = [
            ['name' => 'Cardiology', 'icon' => '❤️', 'description' => 'Heart and cardiovascular care.'],
            ['name' => 'Neurology', 'icon' => '🧠', 'description' => 'Brain, spine and nervous system.'],
            ['name' => 'Orthopedics', 'icon' => '🦴', 'description' => 'Bones, joints and muscles.'],
            ['name' => 'Pediatrics', 'icon' => '👶', 'description' => 'Child and newborn health.'],
            ['name' => 'Dermatology', 'icon' => '🩺', 'description' => 'Skin, hair and nails.'],
            ['name' => 'Gynecology', 'icon' => '🌸', 'description' => "Women's health and maternity."],
            ['name' => 'Medicine', 'icon' => '💊', 'description' => 'General internal medicine.'],
            ['name' => 'ENT', 'icon' => '👂', 'description' => 'Ear, nose and throat.'],
        ];
        $deptModels = [];
        foreach ($departments as $i => $d) {
            $deptModels[] = Department::updateOrCreate(
                ['slug' => Str::slug($d['name'])],
                $d + ['sort_order' => $i, 'is_active' => true]
            );
        }

        // Hospitals
        $hospitals = [
            ['name' => 'Square Hospital', 'city' => 'Dhaka', 'image' => 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&q=80', 'description' => 'Leading tertiary care hospital in Dhaka.', 'contact_number' => '+880 2 8159457'],
            ['name' => 'United Hospital', 'city' => 'Dhaka', 'image' => 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80', 'description' => 'Modern multi-disciplinary medical center.', 'contact_number' => '+880 2 8836000'],
            ['name' => 'Evercare Hospital', 'city' => 'Chittagong', 'image' => 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80', 'description' => 'Internationally accredited healthcare.', 'contact_number' => '+880 9 6678444'],
            ['name' => 'Popular Diagnostic', 'city' => 'Dhaka', 'image' => 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800&q=80', 'description' => 'Trusted diagnostics and consultation chambers.', 'contact_number' => '+880 9 6134444'],
        ];
        $hospModels = [];
        foreach ($hospitals as $h) {
            $hospModels[] = Hospital::updateOrCreate(['slug' => Str::slug($h['name'])], $h + ['is_active' => true]);
        }

        // Doctors
        $photos = [
            'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80',
            'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
            'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&q=80',
            'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&q=80',
        ];
        $doctors = [
            ['name' => 'Dr. Ayesha Rahman', 'spec' => ['Cardiology', 'Internal Medicine'], 'dept' => 0, 'exp' => 15, 'fee' => 1200, 'rating' => 4.9, 'reviews' => 240, 'featured' => 12],
            ['name' => 'Dr. Imran Hossain', 'spec' => ['Neurology'], 'dept' => 1, 'exp' => 12, 'fee' => 1500, 'rating' => 4.8, 'reviews' => 180, 'featured' => 10],
            ['name' => 'Dr. Nusrat Jahan', 'spec' => ['Pediatrics'], 'dept' => 3, 'exp' => 10, 'fee' => 800, 'rating' => 4.9, 'reviews' => 320, 'featured' => 9],
            ['name' => 'Dr. Kamal Uddin', 'spec' => ['Orthopedics'], 'dept' => 2, 'exp' => 18, 'fee' => 1000, 'rating' => 4.7, 'reviews' => 150, 'featured' => 8],
            ['name' => 'Dr. Farzana Akter', 'spec' => ['Dermatology'], 'dept' => 4, 'exp' => 8, 'fee' => 900, 'rating' => 4.6, 'reviews' => 110, 'featured' => 0],
            ['name' => 'Dr. Tanvir Ahmed', 'spec' => ['Gynecology'], 'dept' => 5, 'exp' => 14, 'fee' => 1100, 'rating' => 4.8, 'reviews' => 205, 'featured' => 0],
            ['name' => 'Dr. Sadia Islam', 'spec' => ['Medicine'], 'dept' => 6, 'exp' => 9, 'fee' => 700, 'rating' => 4.5, 'reviews' => 95, 'featured' => 0],
            ['name' => 'Dr. Rifat Chowdhury', 'spec' => ['ENT'], 'dept' => 7, 'exp' => 11, 'fee' => 850, 'rating' => 4.7, 'reviews' => 130, 'featured' => 0],
        ];

        foreach ($doctors as $i => $d) {
            $hospital = $hospModels[$i % count($hospModels)];
            $doctor = Doctor::updateOrCreate(
                ['slug' => Str::slug($d['name'])],
                [
                    'full_name' => $d['name'],
                    'title' => 'MBBS, FCPS',
                    'specializations' => $d['spec'],
                    'qualifications' => ['MBBS', 'FCPS ('.$d['spec'][0].')', 'MD'],
                    'gender' => $i % 2 === 0 ? 'female' : 'male',
                    'hospital_name' => $hospital->name.', '.$hospital->city,
                    'hospital_id' => $hospital->id,
                    'department_id' => $deptModels[$d['dept']]->id,
                    'experience_years' => $d['exp'],
                    'consultation_fee' => $d['fee'],
                    'photo' => $photos[$i % count($photos)],
                    'rating' => $d['rating'],
                    'total_reviews' => $d['reviews'],
                    'bio' => $d['name'].' is a highly experienced '.$d['spec'][0].' specialist with '.$d['exp'].' years of clinical practice, dedicated to compassionate, evidence-based patient care.',
                    'is_featured' => $d['featured'] > 0,
                    'featured_priority' => $d['featured'],
                    'is_active' => true,
                ]
            );

            // Schedule: Sat/Mon/Wed evenings
            $doctor->schedules()->delete();
            foreach ([6, 1, 3] as $day) {
                DoctorSchedule::create([
                    'doctor_id' => $doctor->id,
                    'hospital_id' => $hospital->id,
                    'day_of_week' => $day,
                    'start_time' => '18:00',
                    'end_time' => '21:00',
                    'slot_duration' => 30,
                    'is_active' => true,
                ]);
            }
        }

        // Hero slides
        $slides = [
            ['title' => 'Healthcare Anytime, Anywhere', 'subtitle' => 'Book trusted specialist doctors near you in minutes.', 'image' => 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80', 'button_text' => 'Find a Doctor', 'button_url' => '/doctors', 'sort_order' => 0],
            ['title' => 'Expert Care You Can Trust', 'subtitle' => 'Top-rated doctors across leading hospitals.', 'image' => 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80', 'button_text' => 'Explore Doctors', 'button_url' => '/doctors', 'sort_order' => 1],
        ];
        foreach ($slides as $s) {
            HeroSlide::updateOrCreate(['title' => $s['title']], $s + ['is_active' => true]);
        }

        // Testimonials
        $testimonials = [
            ['patient_name' => 'Rahim Mia', 'review' => 'Booking was effortless and the doctor was incredibly attentive. Highly recommend!', 'rating' => 5, 'sort_order' => 0],
            ['patient_name' => 'Sumaiya Haque', 'review' => 'Found a great specialist near me within minutes. The whole experience was smooth.', 'rating' => 5, 'sort_order' => 1],
            ['patient_name' => 'Jahangir Alam', 'review' => 'Transparent fees and excellent care. This platform made everything simple.', 'rating' => 4, 'sort_order' => 2],
        ];
        foreach ($testimonials as $t) {
            Testimonial::updateOrCreate(['patient_name' => $t['patient_name']], $t + ['is_active' => true]);
        }

        // Advertisements
        $ads = [
            ['title' => 'Annual Health Checkup Offer', 'sponsor_name' => 'Popular Diagnostic', 'image' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80', 'redirect_url' => '/doctors', 'placement' => 'hero_bottom', 'sort_order' => 0],
            ['title' => 'Pharmacy Home Delivery', 'sponsor_name' => 'MediMart', 'image' => 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&q=80', 'redirect_url' => 'https://example.com', 'placement' => 'mid_homepage', 'sort_order' => 0],
            ['title' => 'Book Lab Tests Online', 'sponsor_name' => 'LabOne', 'image' => 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1200&q=80', 'redirect_url' => '/doctors', 'placement' => 'footer_banner', 'sort_order' => 0],
        ];
        foreach ($ads as $a) {
            Advertisement::updateOrCreate(
                ['title' => $a['title']],
                $a + ['is_active' => true, 'start_date' => null, 'end_date' => null]
            );
        }
    }
}
