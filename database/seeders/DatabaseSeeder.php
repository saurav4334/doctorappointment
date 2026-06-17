<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        // Default super admin account.
        $admin = User::updateOrCreate(
            ['email' => 'admin@doctorappointment.test'],
            [
                'name' => 'Super Admin',
                'phone' => '01700000000',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (! $admin->hasRole('super_admin')) {
            $admin->assignRole('super_admin');
        }

        $this->call(NotificationTemplateSeeder::class);
        $this->call(SmsTemplateSeeder::class);
        $this->call(DemoContentSeeder::class);
        $this->call(MarketplaceBlocksSeeder::class);
    }
}
