<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SmsSettingsRequest;
use App\Models\SmsLog;
use App\Models\SmsSetting;
use App\Models\SmsTemplate;
use App\Services\Sms\SmsService;
use Illuminate\Http\Request;

class SmsSettingController extends Controller
{
    /** Unified SMS page: API config + Templates + Logs + Test, as tabs. */
    public function edit(Request $request)
    {
        $tab = in_array($request->query('tab'), ['api', 'templates', 'logs', 'test'], true)
            ? $request->query('tab')
            : 'api';

        // Logs (filterable) for the Logs tab.
        $logs = SmsLog::query()
            ->when($request->filled('q'), fn ($q) => $q->where('recipient_number', 'like', '%'.$request->query('q').'%'))
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->query('status')))
            ->when($request->filled('event'), fn ($q) => $q->where('event_type', $request->query('event')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->query('to')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

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
            'statusOptions' => ['' => 'All Status', 'pending' => 'Pending', 'sent' => 'Sent', 'failed' => 'Failed', 'skipped' => 'Skipped'],
            'eventOptions' => ['' => 'All Events'] + SmsService::EVENTS + ['test' => 'Test SMS'],
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
