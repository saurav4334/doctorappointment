<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\SmsLog;
use App\Models\SmsSetting;
use App\Services\Sms\SmsService;
use Database\Seeders\SmsTemplateSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SmsModuleTest extends TestCase
{
    use RefreshDatabase;

    protected function configureSms(bool $enabled = true): void
    {
        SmsSetting::current()->update([
            'api_key' => 'secret-key-1234',
            'sender_id' => 'DocBD',
            'enabled' => $enabled,
            'admin_phone' => '01710000000',
        ]);
    }

    protected function appointment(): Appointment
    {
        $doctor = Doctor::create(['full_name' => 'Dr. Sms', 'slug' => 'dr-sms', 'is_active' => true]);

        return Appointment::create([
            'doctor_id' => $doctor->id, 'patient_name' => 'Karim',
            'patient_phone' => '01712345678', 'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '18:00', 'status' => 'pending', 'payment_status' => 'unpaid',
        ]);
    }

    // ---- Unit-ish ----

    public function test_phone_normalization(): void
    {
        $sms = app(SmsService::class);
        $this->assertSame('8801712345678', $sms->normalizePhone('01712345678'));
        $this->assertSame('8801712345678', $sms->normalizePhone('+8801712345678'));
        $this->assertSame('8801712345678', $sms->normalizePhone('8801712345678'));
        $this->assertSame('8801712345678', $sms->normalizePhone('017-1234 5678'));
        $this->assertNull($sms->normalizePhone('12345'));
        $this->assertNull($sms->normalizePhone('hello'));
    }

    public function test_api_key_is_encrypted_at_rest(): void
    {
        SmsSetting::current()->update(['api_key' => 'plain-secret']);

        $raw = DB::table('sms_settings')->value('api_key');
        $this->assertNotSame('plain-secret', $raw);              // ciphertext in DB
        $this->assertSame('plain-secret', SmsSetting::current()->api_key); // decrypted via model
    }

    // ---- Sending ----

    public function test_appointment_request_sends_sms_when_enabled(): void
    {
        $this->seed(SmsTemplateSeeder::class);
        $this->configureSms(true);
        Http::fake(['portal.notifybd.com/*' => Http::response(['error' => false, 'msg' => 'ok'], 200)]);

        app(SmsService::class)->appointmentRequested($this->appointment());

        Http::assertSent(fn ($req) => str_contains($req->url(), 'notifybd.com'));
        $this->assertDatabaseHas('sms_logs', [
            'event_type' => 'appointment_requested', 'recipient_number' => '8801712345678', 'status' => 'sent',
        ]);
        // Admin alert also fired.
        $this->assertDatabaseHas('sms_logs', ['event_type' => 'admin_new_appointment', 'status' => 'sent']);
    }

    public function test_disabled_sms_is_skipped_and_no_http_call(): void
    {
        $this->seed(SmsTemplateSeeder::class);
        $this->configureSms(false);
        Http::fake();

        app(SmsService::class)->appointmentRequested($this->appointment());

        Http::assertNothingSent();
        $this->assertDatabaseHas('sms_logs', ['event_type' => 'appointment_requested', 'status' => 'skipped']);
    }

    public function test_invalid_phone_is_skipped(): void
    {
        $this->seed(SmsTemplateSeeder::class);
        $this->configureSms(true);
        Http::fake();

        app(SmsService::class)->sendForEvent('appointment_reminder', 'not-a-number', ['patient_name' => 'X']);

        Http::assertNothingSent();
        $this->assertDatabaseHas('sms_logs', ['status' => 'skipped', 'error_message' => 'Invalid phone number']);
    }

    public function test_provider_failure_is_logged_and_never_throws(): void
    {
        $this->seed(SmsTemplateSeeder::class);
        $this->configureSms(true);
        Http::fake(['portal.notifybd.com/*' => Http::response('gateway error', 500)]);

        // Must not throw.
        app(SmsService::class)->appointmentRequested($this->appointment());

        $this->assertDatabaseHas('sms_logs', ['event_type' => 'appointment_requested', 'status' => 'failed']);
    }

    public function test_rendered_message_contains_resolved_placeholders(): void
    {
        $this->seed(SmsTemplateSeeder::class);
        $this->configureSms(true);
        Http::fake(['portal.notifybd.com/*' => Http::response(['error' => false], 200)]);

        app(SmsService::class)->appointmentRequested($this->appointment());

        $log = SmsLog::where('event_type', 'appointment_requested')->first();
        $this->assertStringContainsString('Karim', $log->message);
        $this->assertStringContainsString('Dr. Sms', $log->message);
        $this->assertStringNotContainsString('{patient_name}', $log->message);
    }

    // ---- Admin ----

    public function test_admin_can_view_and_save_settings_keeping_key_when_blank(): void
    {
        $this->actingAs($this->userWithRole('super_admin'));
        SmsSetting::current()->update(['api_key' => 'keep-me', 'sender_id' => 'Old']);

        $this->get(route('admin.sms-settings.edit'))->assertOk()->assertDontSee('keep-me');

        $this->put(route('admin.sms-settings.update'), [
            'api_base_url' => 'https://portal.notifybd.com/api/v1/sms/send',
            'api_key' => '', // blank → keep existing
            'sender_id' => 'NewSender', 'sms_type' => 'text', 'default_country_code' => '880', 'enabled' => 1,
        ])->assertRedirect(route('admin.sms-settings.edit'));

        $settings = SmsSetting::current();
        $this->assertSame('keep-me', $settings->api_key);
        $this->assertSame('NewSender', $settings->sender_id);
        $this->assertTrue($settings->enabled);
    }

    public function test_admin_test_sms_endpoint(): void
    {
        $this->actingAs($this->userWithRole('super_admin'));
        $this->configureSms(true);
        Http::fake(['portal.notifybd.com/*' => Http::response(['error' => false], 200)]);

        $this->post(route('admin.sms-settings.test'), ['test_number' => '01712345678', 'message' => 'Hi'])
            ->assertRedirect()->assertSessionHas('success');

        $this->assertDatabaseHas('sms_logs', ['event_type' => 'test', 'status' => 'sent']);
    }

    public function test_admin_can_edit_template(): void
    {
        $this->seed(SmsTemplateSeeder::class);
        $this->actingAs($this->userWithRole('super_admin'));
        $template = \App\Models\SmsTemplate::where('event', 'appointment_approved')->first();

        $this->put(route('admin.sms-templates.update', $template), [
            'title' => 'Approved', 'body' => 'Hi {patient_name}, approved.', 'is_active' => 1,
        ])->assertRedirect(route('admin.sms-templates.index'));

        $this->assertDatabaseHas('sms_templates', ['event' => 'appointment_approved', 'body' => 'Hi {patient_name}, approved.']);
    }
}
