<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SmsSettingsRequest;
use App\Models\SmsLog;
use App\Models\SmsSetting;
use App\Models\SmsTemplate;
use App\Models\VoiceCallLog;
use App\Models\VoiceCallSetting;
use App\Models\VoiceCallTemplate;
use App\Services\Sms\SmsService;
use App\Services\VoiceCall\VoiceCallService;
use Illuminate\Http\Request;

class SmsSettingController extends Controller
{
    /** Unified Notification page: SMS (config/templates/logs/test) + Voice Call tabs. */
    public function edit(Request $request)
    {
        $tabs = ['api', 'templates', 'logs', 'test', 'voice', 'voice_templates', 'voice_logs', 'voice_test'];
        $tab = in_array($request->query('tab'), $tabs, true) ? $request->query('tab') : 'api';

        // Logs (filterable) for the Logs tab.
        $logs = SmsLog::query()
            ->when($request->filled('q'), fn ($q) => $q->where('recipient_number', 'like', '%'.$request->query('q').'%'))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->query('status')))
            ->when($request->filled('event'), fn ($q) => $q->where('event_type', $request->query('event')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->query('to')))
            ->latest()
            ->paginate(15, ['*'], 'sms_page')
            ->withQueryString();

        // Voice call logs (separate filter params so both log tabs coexist).
        $voiceLogs = VoiceCallLog::query()
            ->when($request->filled('vq'), fn ($q) => $q->where('recipient_number', 'like', '%'.$request->query('vq').'%'))
            ->when($request->filled('vstatus'), fn ($q) => $q->where('status', $request->query('vstatus')))
            ->when($request->filled('vappt'), fn ($q) => $q->where('appointment_id', $request->query('vappt')))
            ->when($request->filled('vfrom'), fn ($q) => $q->whereDate('created_at', '>=', $request->query('vfrom')))
            ->when($request->filled('vto'), fn ($q) => $q->whereDate('created_at', '<=', $request->query('vto')))
            ->latest()
            ->paginate(15, ['*'], 'voice_page')
            ->withQueryString();

        $statusOptions = ['' => 'All Status', 'pending' => 'Pending', 'sent' => 'Sent', 'failed' => 'Failed', 'skipped' => 'Skipped'];

        return view('admin.sms.settings', [
            'tab' => $tab,
            'settings' => SmsSetting::current(),
            'templates' => SmsTemplate::orderBy('event')->get(),
            'placeholders' => SmsService::PLACEHOLDERS,
            'logs' => $logs,
            'search' => (string) $request->query('q', ''),
            'status' => (string) $request->query('status', ''),
            'event' => (string) $request->query('event', ''),
            'from' => (string) $request->query('from', ''),
            'to' => (string) $request->query('to', ''),
            'statusOptions' => $statusOptions,
            'eventOptions' => ['' => 'All Events'] + SmsService::EVENTS + ['test' => 'Test SMS'],

            // Voice call
            'voiceSettings' => VoiceCallSetting::current(),
            'voiceTemplates' => VoiceCallTemplate::orderBy('event')->get(),
            'voicePlaceholders' => VoiceCallService::PLACEHOLDERS,
            'voiceLogs' => $voiceLogs,
            'vsearch' => (string) $request->query('vq', ''),
            'vstatus' => (string) $request->query('vstatus', ''),
            'vappt' => (string) $request->query('vappt', ''),
            'vfrom' => (string) $request->query('vfrom', ''),
            'vto' => (string) $request->query('vto', ''),
            'voiceStatusOptions' => $statusOptions,
        ]);
    }

    public function update(SmsSettingsRequest $request)
    {
        $data = $request->validated();

        // Only overwrite the API key when a new value is actually provided.
        if (blank($data['api_key'] ?? null)) {
            unset($data['api_key']);
        }

        SmsSetting::current()->update($data);

        return redirect()->route('admin.sms-settings.edit', ['tab' => 'api'])->with('success', 'SMS settings saved.');
    }

    public function test(Request $request, SmsService $sms)
    {
        $data = $request->validate([
            'test_number' => ['required', 'string', 'max:20'],
            'message' => ['required', 'string', 'max:600'],
        ]);

        $log = $sms->sendTest($data['test_number'], $data['message']);

        return redirect()->route('admin.sms-settings.edit', ['tab' => 'test'])->with(
            $log->status === 'sent' ? 'success' : 'error',
            $log->status === 'sent'
                ? 'Test SMS sent successfully.'
                : 'Test SMS '.$log->status.': '.($log->error_message ?: 'see SMS logs').'.'
        );
    }
}
