<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * The application roles (Spatie Permission).
     */
    public const ROLES = [
        'super_admin',
        'admin',
        'doctor',
        'receptionist',
        'patient',
    ];

    public function run(): void
    {
        // Ensure the permission cache is fresh before seeding.
        Artisan::call('permission:cache-reset');

        foreach (self::ROLES as $role) {
            Role::findOrCreate($role, 'web');
        }
    }
}
