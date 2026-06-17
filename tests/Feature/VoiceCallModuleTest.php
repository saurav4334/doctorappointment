<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\VoiceCallLog;
use App\Models\VoiceCallSetting;
use App\Services\VoiceCall\VoiceCallService;
use Database\Seeders\VoiceCallTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class VoiceCallModuleTest extends TestCase
{
    use RefreshDatabase;

    protected function configureVoice(bool $enabled = true): void
    {
        VoiceCallSetting::current()->update([
            'api_token' => 'protiddhoni-token-9999',
            'sender_number' => '09612254680',
            'enabled' => $enabled,
        ]);
    }

    protected function appointment(): Appointment
    {
        $doctor = Doctor::create(['full_name' => 'Kamal Uddin', 'slug' => 'kamal-uddin', 'is_active' => true]);

        return Appointment::create([
            'doctor_id' => $doctor->id, 'patient_name' => 'Karim',
            'patient_phone' => '01712345678', 'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00', 'status' => 'pending', 'payment_status' => 'unpaid',
        ]);
    }

    public function test_phone_is_formatted_to_local_bd(): void
    {
        $voice = app(VoiceCallService::class);
        $this->assertSame('01712345678', $voice->formatPhone('01712345678'));
        $this->assertSame('01712345678', $voice->formatPhone('+8801712345678'));
        $this->assertSame('01712345678', $voice->formatPhone('8801712345678'));
        $this->assertNull($voice->formatPhone('123'));
    }

    public function test_api_token_encrypted_at_rest(): void
    {
        VoiceCallSetting::current()->update(['api_token' => 'plain-token']);
        $this->assertNotSame('plain-token', DB::table('voice_call_settings')->value('api_token'));
        $this->assertSame('plain-token', VoiceCallSetting::current()->api_token);
    }

    public function test_approval_places_voice_call_when_enabled(): void
    {
        $this->seed(VoiceCallTemplateSeeder::class);
        $this->configureVoice(true);
        Http::fake(['dashboard.protiddhoni-bd.com/*' => Http::response(['success' => true], 200)]);

        app(VoiceCallService::class)->appointmentStatusChanged($this->appointment(), 'confirmed');

        Http::assertSent(fn ($req) => str_contains($req->url(), 'protiddhoni-bd.com')
            && $req->hasHeader('Authorization', 'Bearer protiddhoni-token-9999'));

        $log = VoiceCallLog::where('event_type', 'appointment_approved')->first();
        $this->assertNotNull($log);
        $this->assertSame('sent', $log->status);
        $this->assertSame('01712345678', $log->recipient_number);
        $this->assertStringContainsString('Karim', $log->payload['start_texts'][0]);
        $this->assertStringContainsString('Kamal Uddin', $log->payload['start_texts'][0]);
    }

    public function test_disabled_voice_is_skipped_without_http(): void
    {
        $this->seed(VoiceCallTemplateSeeder::class);
        $this->configureVoice(false);
        Http::fake();

        app(VoiceCallService::class)->appointmentStatusChanged($this->appointment(), 'confirmed');

        Http::assertNothingSent();
        $this->assertDatabaseHas('voice_call_logs', ['event_type' => 'appointment_approved', 'status' => 'skipped']);
    }

    public function test_provider_failure_is_logged_and_never_throws(): void
    {
        $this->seed(VoiceCallTemplateSeeder::class);
        $this->configureVoice(true);
        Http::fake(['dashboard.protiddhoni-bd.com/*' => Http::response('error', 500)]);

        app(VoiceCallService::class)->appointmentStatusChanged($this->appointment(), 'confirmed');

        $this->assertDatabaseHas('voice_call_logs', ['event_type' => 'appointment_approved', 'status' => 'failed']);
    }

    public function test_admin_approval_updates_status_and_places_call_even_if_api_fails(): void
    {
        $this->seed(VoiceCallTemplateSeeder::class);
        $this->actingAs($this->userWithRole('super_admin'));
        $this->configureVoice(true);
        Http::fake(['dashboard.protiddhoni-bd.com/*' => Http::response('boom', 500)]);

        $appointment = $this->appointment();

        $this->patch(route('admin.appointments.set-status', $appointment), ['status' => 'confirmed'])
            ->assertRedirect();

        // Appointment still approved despite the voice API failure.
        $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'confirmed']);
        $this->assertDatabaseHas('voice_call_logs', ['appointment_id' => $appointment->id, 'status' => 'failed']);
    }

    public function test_admin_can_save_voice_settings_keeping_token_when_blank(): void
    {
        $this->actingAs($this->userWithRole('super_admin'));
        VoiceCallSetting::current()->update(['api_token' => 'keep-token']);

        $this->put(route('admin.voice-settings.update'), [
            'api_endpoint' => 'https://dashboard.protiddhoni-bd.com/api/surveys/direct-tts',
            'api_token' => '', 'sender_number' => '09612254680', 'voice_type' => 'female',
            'language_code' => 'bn', 'enabled' => 1, 'dtmf_enabled' => 1,
        ])->assertRedirect(route('admin.sms-settings.edit', ['tab' => 'voice']));

        $this->assertSame('keep-token', VoiceCallSetting::current()->api_token);
        $this->assertTrue(VoiceCallSetting::current()->enabled);
    }

    public function test_admin_test_voice_endpoint(): void
    {
        $this->seed(VoiceCallTemplateSeeder::class);
        $this->actingAs($this->userWithRole('super_admin'));
        $this->configureVoice(true);
        Http::fake(['dashboard.protiddhoni-bd.com/*' => Http::response(['success' => true], 200)]);

        $this->post(route('admin.voice-settings.test'), [
            'test_number' => '01614023305', 'patient_name' => 'Karim', 'doctor_name' => 'Kamal',
            'appointment_date' => '25 Jun', 'appointment_time' => '10:00',
        ])->assertRedirect(route('admin.sms-settings.edit', ['tab' => 'voice_test']))->assertSessionHas('success');

        $this->assertDatabaseHas('voice_call_logs', ['status' => 'sent']);
    }

    public function test_admin_can_edit_voice_template(): void
    {
        $this->seed(VoiceCallTemplateSeeder::class);
        $this->actingAs($this->userWithRole('super_admin'));
        $template = \App\Models\VoiceCallTemplate::where('event', 'appointment_approved')->first();

        $this->put(route('admin.voice-templates.update', $template), [
            'title' => 'Approved', 'start_text' => 'Hello {patient_name}.', 'is_active' => 1,
        ])->assertRedirect(route('admin.sms-settings.edit', ['tab' => 'voice_templates']));

        $this->assertDatabaseHas('voice_call_templates', ['event' => 'appointment_approved', 'start_text' => 'Hello {patient_name}.']);
    }

    public function test_unified_page_shows_voice_tabs(): void
    {
        $this->actingAs($this->userWithRole('super_admin'));

        $this->get(route('admin.sms-settings.edit'))
            ->assertOk()
            ->assertSee('Voice Settings')
            ->assertSee('Voice Templates')
            ->assertSee('Voice Logs')
            ->assertSee('Test Voice');
    }
}
