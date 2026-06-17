<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SmsTemplate;
use App\Services\Sms\SmsService;
use Illuminate\Http\Request;

class SmsTemplateController extends Controller
{
    public function index()
    {
        return view('admin.sms.templates.index', ['templates' => SmsTemplate::orderBy('event')->get()]);
    }

    public function edit(SmsTemplate $smsTemplate)
    {
        return view('admin.sms.templates.edit', [
            'template' => $smsTemplate,
            'placeholders' => SmsService::PLACEHOLDERS,
        ]);
    }

    public function update(Request $request, SmsTemplate $smsTemplate)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ]);
        $data['is_active'] = $request->boolean('is_active');

        $smsTemplate->update($data);

        return redirect()->route('admin.sms-settings.edit', ['tab' => 'templates'])->with('success', 'Template saved.');
    }
}
