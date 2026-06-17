<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\VoiceSettingsRequest;
use App\Models\VoiceCallSetting;
use App\Models\VoiceCallTemplate;
use App\Services\VoiceCall\VoiceCallService;
use Illuminate\Http\Request;

class VoiceCallController extends Controller
{
    public function update(VoiceSettingsRequest $request)
    {
        $data = $request->validated();
        if (blank($data['api_token'] ?? null)) {
            unset($data['api_token']); // keep existing token when left blank
        }

        VoiceCallSetting::current()->update($data);

        return redirect()->route('admin.sms-settings.edit', ['tab' => 'voice'])->with('success', 'Voice call settings saved.');
    }

    public function updateTemplate(Request $request, VoiceCallTemplate $voiceCallTemplate)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'start_text' => ['required', 'string', 'max:1000'],
            'question_text' => ['nullable', 'string', 'max:1000'],
            'end_text' => ['nullable', 'string', 'max:1000'],
            'dtmf1_text' => ['nullable', 'string', 'max:1000'],
            'dtmf2_text' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $data['is_active'] = $request->boolean('is_active');

        $voiceCallTemplate->update($data);

        return redirect()->route('admin.sms-settings.edit', ['tab' => 'voice_templates'])->with('success', 'Voice template saved.');
    }

    public function test(Request $request, VoiceCallService $voice)
    {
        $data = $request->validate([
            'test_number' => ['required', 'string', 'max:20'],
            'patient_name' => ['nullable', 'string', 'max:255'],
            'doctor_name' => ['nullable', 'string', 'max:255'],
            'appointment_date' => ['nullable', 'string', 'max:50'],
            'appointment_time' => ['nullable', 'string', 'max:50'],
        ]);

        $log = $voice->sendTest($data['test_number'], [
            'patient_name' => $data['patient_name'] ?? 'Patient',
            'doctor_name' => $data['doctor_name'] ?? '',
            'appointment_date' => $data['appointment_date'] ?? '',
            'appointment_time' => $data['appointment_time'] ?? '',
            'booking_id' => 'TEST',
        ]);

        $status = $log?->status ?? 'skipped';

        return redirect()->route('admin.sms-settings.edit', ['tab' => 'voice_test'])->with(
            $status === 'sent' ? 'success' : 'error',
            $status === 'sent'
                ? 'Test voice call placed successfully.'
                : 'Test voice call '.$status.': '.($log?->error_message ?: 'see Voice Call Logs').'.'
        );
    }
}
