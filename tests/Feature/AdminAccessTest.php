<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_super_admin_can_access_dashboard(): void
    {
        $admin = $this->userWithRole('super_admin');

        $this->actingAs($admin)->get('/admin')
            ->assertOk()
            ->assertSee('Dashboard');
    }

    public function test_admin_role_can_access_dashboard(): void
    {
        $admin = $this->userWithRole('admin');

        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    public function test_normal_user_cannot_access_admin(): void
    {
        $this->seed(\Database\Seeders\RoleSeeder::class);
        $user = User::factory()->create()->assignRole('patient');

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }
}
