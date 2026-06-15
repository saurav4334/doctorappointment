<?php

namespace Tests;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Create a user with the given Spatie role (seeds roles on first use).
     */
    protected function userWithRole(string $role): User
    {
        $this->seed(RoleSeeder::class);

        return User::factory()->create()->assignRole($role);
    }
}
