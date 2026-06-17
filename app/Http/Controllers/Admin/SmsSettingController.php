<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SmsSettingsRequest;
use App\Models\SmsSetting;
use App\Services\Sms\SmsService;
use Illuminate\Http\Request;

class SmsSettingController extends Controller
{
    public function edit()
    {
        return view('admin.sms.settings', ['settings' => SmsSetting::current()]);
    }

    public function update(SmsSettingsRequest $request)
    {
        $data = $request->validated();

        // Only overwrite the API key when a new value is actually provided.
        if (blank($data['api_key'] ?? null)) {
            unset($data['api_key']);
        }

        SmsSetting::current()->update($data);

        return redirect()->route('admin.sms-settings.edit')->with('success', 'SMS settings saved.');
    }

    public function test(Request $request, SmsService $sms)
    {
        $data = $request->validate([
            'test_number' => ['required', 'string', 'max:20'],
            'message' => ['required', 'string', 'max:600'],
        ]);

        $log = $sms->sendTest($data['test_number'], $data['message']);

        return back()->with(
            $log->status === 'sent' ? 'success' : 'error',
            $log->status === 'sent'
                ? 'Test SMS sent successfully.'
                : 'Test SMS '.$log->status.': '.($log->error_message ?: 'see SMS logs').'.'
        );
    }
}
