<?php

namespace Tests\Feature;

use App\Models\CorporateClient;
use App\Models\HomeService;
use App\Models\StatCounter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MarketplaceBlocksTest extends TestCase
{
    use RefreshDatabase;

    protected function service(array $o = []): HomeService
    {
        return HomeService::create(array_merge([
            'title' => 'Home Physiotherapy', 'slug' => 'home-physiotherapy',
            'description' => 'Physio at home.', 'benefits' => "Fast\nVerified",
            'is_active' => true, 'sort_order' => 0,
        ], $o));
    }

    public function test_homepage_renders_marketplace_blocks(): void
    {
        $this->service(['title' => 'Ambulance Service', 'slug' => 'ambulance-service']);
        StatCounter::create(['title' => 'Registered Doctors', 'value' => 500, 'suffix' => '+', 'is_active' => true]);
        CorporateClient::create(['name' => 'Square Group', 'is_active' => true]);

        $this->get('/')
            ->assertOk()
            ->assertSee('Healthcare Services Around You')
            ->assertSee('Ambulance Service')
            ->assertSee('Registered Doctors')
            ->assertSee('Trusted by leading organizations')
            ->assertSee('Square Group');
    }

    public function test_services_index_and_detail_render(): void
    {
        $service = $this->service();

        $this->get(route('services.index'))->assertOk()->assertSee('Home Physiotherapy');

        $this->get(route('services.show', $service->slug))
            ->assertOk()
            ->assertSee('Home Physiotherapy')
            ->assertSee('Request This Service')
            ->assertSee('Verified'); // benefit line
    }

    public function test_service_booking_creates_request(): void
    {
        $service = $this->service();

        $this->post(route('services.request', $service->slug), [
            'patient_name' => 'John Patient',
            'phone' => '+8801700000000',
            'address' => '123 Road',
            'preferred_date' => now()->addDay()->toDateString(),
            'notes' => 'Morning preferred',
        ])->assertRedirect()->assertSessionHas('service_success');

        $this->assertDatabaseHas('service_requests', [
            'home_service_id' => $service->id,
            'patient_name' => 'John Patient',
            'status' => 'pending',
        ]);
    }

    public function test_booking_validates_input(): void
    {
        $service = $this->service();

        $this->post(route('services.request', $service->slug), ['patient_name' => '123', 'phone' => 'abc'])
            ->assertSessionHasErrors(['patient_name', 'phone']);
    }

    public function test_admin_can_create_each_block(): void
    {
        $this->actingAs($this->userWithRole('super_admin'));
        Storage::fake('public');

        $this->post(route('admin.healthcare-services.store'), [
            'title' => 'Nursing Care', 'icon' => '👩‍⚕️', 'is_active' => 1, 'sort_order' => 1,
        ])->assertRedirect(route('admin.healthcare-services.index'))->assertSessionHasNoErrors();
        $this->assertDatabaseHas('home_services', ['title' => 'Nursing Care', 'slug' => 'nursing-care']);

        $this->post(route('admin.corporate-clients.store'), [
            'name' => 'BRAC', 'website_url' => 'https://brac.net', 'logo' => UploadedFile::fake()->image('logo.png'),
            'is_active' => 1, 'sort_order' => 0,
        ])->assertRedirect(route('admin.corporate-clients.index'))->assertSessionHasNoErrors();
        $this->assertDatabaseHas('corporate_clients', ['name' => 'BRAC']);

        $this->post(route('admin.stat-counters.store'), [
            'title' => 'Partner Hospitals', 'value' => 40, 'suffix' => '+', 'is_active' => 1, 'sort_order' => 0,
        ])->assertRedirect(route('admin.stat-counters.index'))->assertSessionHasNoErrors();
        $this->assertDatabaseHas('stat_counters', ['title' => 'Partner Hospitals', 'value' => 40]);
    }
}
